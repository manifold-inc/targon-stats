"use client";

import BarChart from "@/app/_components/BarChart";
import { type MinerNodes } from "@/types";
import { getDisplayName } from "@/utils/utils";
import { useMemo } from "react";

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

  return (
    <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-4 md:p-6 md:pb-4 pb-2 my-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="whitespace-nowrap sm:text-base text-xs">
          Miner Compute
        </h2>
        {!isLoading && chartData.length === 0 ? (
          <div className="text-sm text-mf-edge-300">No Data</div>
        ) : null}
      </div>

      <BarChart
        data={chartData}
        gradientId="miner-compute-bar-gradient"
        isLoading={isLoading}
        formatValue={(value) => `${value} Card${value !== 1 ? "s" : ""}`}
        formatLabel={(key: string) => `UUID ${key}`}
      />
    </div>
  );
}
