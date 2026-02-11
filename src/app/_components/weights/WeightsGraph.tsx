"use client";

import BarChart from "@/app/_components/BarChart";
import { reactClient } from "@/trpc/react";
import useCountUp from "@/utils/useCountUp";
import { RiRefreshLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function WeightsGraph({
  isHalfSize = true,
}: { isHalfSize?: boolean } = {}) {
  const router = useRouter();
  const {
    data: auction,
    isLoading,
    refetch: refetchAuction,
  } = reactClient.chain.getAuctionState.useQuery(undefined);
  const [showPulse, setShowPulse] = useState(false);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleBarClick = (uid: string) => {
    router.push(`/miners/${uid}`);
  };

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

  const weightsData = !auction?.weights
    ? []
    : (() => {
        const { uids, incentives } = auction.weights;
        if (!uids || !incentives || uids.length !== incentives.length)
          return [];

        return uids
          .map((uid, index) => ({
            key: uid.toString(),
            value: incentives[index] ?? 0,
          }))
          .sort((a, b) => a.value - b.value);
      })();

  const highestData =
    weightsData.length > 0
      ? weightsData.reduce(
          (max, d) => (d.value > max.value ? d : max),
          weightsData[0]!
        )
      : null;

  const highestPercentCountUp = useCountUp({
    end: highestData ? highestData.value * 100 : 0,
    duration: 1000,
    decimals: 2,
    isReady: !isLoading && highestData !== null,
  });

  return (
    <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-4 md:p-6 md:pb-4 pb-2">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="whitespace-nowrap text-sm sm:text-base">
          Miner Weights
        </h2>

        {!isLoading && weightsData.length === 0 ? (
          <div className="text-sm text-mf-edge-300">No Data</div>
        ) : !isLoading && highestData ? (
          <div className="flex items-center gap-2 group">
            <button
              onClick={handleRefetch}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <RiRefreshLine className="h-3 w-3 text-mf-milk-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-[0.8rem] text-mf-milk-500 transition-colors">
                Top
              </span>
              <div
                className={`w-1 h-1 rounded-full animate-pulse ${showPulse ? "bg-mf-sybil-300" : "bg-mf-sally-500"}`}
              />
            </button>
            <div className="rounded-sm border border-mf-border-600 px-3 w-28 text-xs text-mf-sally-500 py-0.5 text-center">
              {highestData.key} - {highestPercentCountUp}%
            </div>
          </div>
        ) : null}
      </div>

      <BarChart
        data={weightsData}
        gradientId="weights-bar-gradient"
        isHalfSize={isHalfSize}
        isLoading={isLoading}
        formatValue={(value) => `${(value * 100).toFixed(2)}%`}
        onBarClick={handleBarClick}
      />
    </div>
  );
}
