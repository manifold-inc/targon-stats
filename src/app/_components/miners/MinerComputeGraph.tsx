"use client";

import BarChart from "@/app/_components/BarChart";
import LiveIndicator from "@/app/_components/LiveIndicator";
import { reactClient } from "@/trpc/react";
import { type MinerNodes } from "@/types";
import { getDisplayName } from "@/utils/utils";
import { RiRefreshLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

function isCPU(computeType: string): boolean {
  return computeType.includes("V4") || computeType.includes("CPU");
}

export default function MinerComputeGraph({
  nodes,
  isLoading,
}: {
  nodes: MinerNodes[];
  isLoading: boolean;
}) {
  const router = useRouter();
  const { refetch: refetchAuction } =
    reactClient.chain.getAuctionState.useQuery(undefined);
  const [showPulse, setShowPulse] = useState(false);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleRefetch = () => {
    void refetchAuction();
    setShowPulse(true);
    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current);
    }
    pulseTimeoutRef.current = setTimeout(() => {
      setShowPulse(false);
    }, 10000);
  };

  const handleBarClick = (uid: string) => {
    router.push(`/miners/${uid}`);
  };
  const { chartData } = useMemo<{
    chartData: Array<{
      key: string;
      segments: Array<{ value: number; label: string }>;
    }>;
  }>(() => {
    const byUid = nodes.reduce(
      (acc, node) => {
        if (!acc[node.uid]) {
          acc[node.uid] = {};
        }
        const computeTypes = acc[node.uid]!;
        const currentValue = computeTypes[node.compute_type] ?? 0;
        computeTypes[node.compute_type] = currentValue + node.cards;
        return acc;
      },
      {} as Record<string, Record<string, number>>
    );

    const allComputeTypes = Array.from(
      new Set(nodes.map((node) => node.compute_type))
    ).sort();

    const chartDataResult = Object.entries(byUid)
      .map(([uid, computeTypes]) => {
        const segments = Object.entries(computeTypes)
          .map(([computeType, cards]) => ({
            computeType,
            value: cards,
            label: getDisplayName(computeType),
          }))
          .sort((a, b) => {
            const aIsCPU = isCPU(a.computeType);
            const bIsCPU = isCPU(b.computeType);

            if (aIsCPU && !bIsCPU) return -1;
            if (!aIsCPU && bIsCPU) return 1;

            const aIndex = allComputeTypes.indexOf(a.computeType);
            const bIndex = allComputeTypes.indexOf(b.computeType);
            return aIndex - bIndex;
          })
          .map(({ computeType: _computeType, ...rest }) => rest);

        return {
          key: uid,
          segments,
        };
      })
      .sort((a, b) => Number(a.key) - Number(b.key));

    return { chartData: chartDataResult, allComputeTypes };
  }, [nodes]);

  const totalCards = useMemo(() => {
    return nodes.reduce((sum, node) => sum + node.cards, 0);
  }, [nodes]);

  return (
    <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-4 md:p-6 md:pb-4 pb-2">
      <div className="mb-6 flex items-center justify-between relative">
        <h2 className="whitespace-nowrap text-sm sm:text-base">
          Miner Compute
        </h2>
        <div className="flex items-center gap-2">
          {!isLoading && chartData.length === 0 ? (
            <div className="text-sm text-mf-edge-300">No Data</div>
          ) : !isLoading && totalCards > 0 ? (
            <div className="flex items-center gap-2 group">
              <button
                onClick={handleRefetch}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <RiRefreshLine className="h-3 w-3 text-mf-milk-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-xs text-mf-milk-700 flex items-center gap-1.5">
                  Total
                  <div
                    className={`w-1 h-1 rounded-full animate-pulse ${showPulse ? "bg-mf-sybil-300" : "bg-mf-sally-500"}`}
                  />
                </span>
              </button>
              <LiveIndicator value={totalCards.toString()} />
            </div>
          ) : null}
        </div>
      </div>

      <BarChart
        data={chartData}
        gradientId="miner-compute-bar-gradient"
        isLoading={isLoading}
        formatValue={(value) => `${value} Card${value !== 1 ? "s" : ""}`}
        formatLabel={(key: string) => `UUID ${key}`}
        onBarClick={handleBarClick}
      />
    </div>
  );
}
