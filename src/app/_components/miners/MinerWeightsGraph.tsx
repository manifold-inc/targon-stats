"use client";

import BarChart from "@/app/_components/BarChart";
import { reactClient } from "@/trpc/react";
import useCountUp from "@/utils/useCountUp";
import { useMemo } from "react";

export default function MinerWeightsGraph({ uid }: { uid: string }) {
  const { data: historicalWeights, isLoading } =
    reactClient.chain.getHistoricalWeightsForMiner.useQuery({
      uid,
      days: 30,
    });

  const { data: auction, isLoading: isLoadingCurrent } =
    reactClient.chain.getAuctionState.useQuery(undefined);

  const currentWeight = useMemo(() => {
    if (!auction?.weights) return 0;
    const { uids, incentives } = auction.weights;
    const uidIndex = uids.indexOf(Number(uid));
    return uidIndex !== -1 ? (incentives[uidIndex] ?? 0) : 0;
  }, [auction?.weights, uid]);

  const weightsData = useMemo(() => {
    const historical = historicalWeights
      ? historicalWeights.map((item) => ({
          key: new Date(item.date).toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
          }),
          value: item.weight,
        }))
      : [];
    return [...historical, { key: "live", value: currentWeight }];
  }, [historicalWeights, currentWeight]);

  const latestWeightCountUp = useCountUp({
    end: currentWeight * 100,
    duration: 1000,
    decimals: 2,
    isReady: !isLoadingCurrent && auction !== undefined,
  });

  return (
    <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-4 md:p-6 md:pb-4 pb-2">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="whitespace-nowrap sm:text-base text-xs"> Weights</h2>
        </div>

        {!isLoading && !isLoadingCurrent && (
          <div className="text-sm text-mf-sally-500">
            Latest {latestWeightCountUp}%
          </div>
        )}
      </div>

      <BarChart
        data={weightsData}
        gradientId={`miner-weights-bar-gradient-${uid}`}
        isLoading={isLoading || isLoadingCurrent}
        formatValue={(value) => `${(value * 100).toFixed(2)}%`}
        formatLabel={(key: string) => {
          if (key === "live") return "Live";
          return key;
        }}
      />
    </div>
  );
}
