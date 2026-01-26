"use client";

import BarChart from "@/app/_components/BarChart";
import { reactClient } from "@/trpc/react";
import { type BarData } from "@/types";
import useCountUp from "@/utils/useCountUp";
import { useIsLgOrLarger } from "@/utils/useIsLgOrLarger";
import { useMemo } from "react";

export default function WeightsGraph({
  isHalfSize = true,
}: { isHalfSize?: boolean } = {}) {
  const { data: auction, isLoading } =
    reactClient.chain.getAuctionState.useQuery(undefined);
  const isLgOrLarger = useIsLgOrLarger();

  const weightsData = useMemo(() => {
    if (!auction?.weights) return [];

    const { uids, incentives } = auction.weights;
    if (!uids || !incentives || uids.length !== incentives.length) return [];

    const data = uids
      .map((uid, index) => ({
        uid: uid.toString(),
        percent: incentives[index] ?? 0,
        index,
      }))
      .sort((a, b) => a.percent - b.percent);

    return data;
  }, [auction]);

  const maxPercent = Math.max(...weightsData.map((d) => d.percent), 0);
  const highestData =
    weightsData.length > 0
      ? weightsData.reduce(
          (max, d) => (d.percent > max.percent ? d : max),
          weightsData[0]!
        )
      : null;

  const chartHeight = 200;

  const barData: BarData[] = weightsData.map((d) => ({
    uid: d.uid,
    value: d.percent,
    index: d.index,
  }));

  const showSkeleton = isLoading || weightsData.length === 0;
  const showNoData = !isLoading && weightsData.length === 0;

  const highestPercentCountUp = useCountUp({
    end: highestData ? highestData.percent * 100 : 0,
    duration: 1000,
    decimals: 2,
    isReady: !showSkeleton && highestData !== null,
  });

  const content = (
    <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-4 md:p-6 md:pb-4 pb-2">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="whitespace-nowrap sm:text-base text-xs">
          Miner Weights
        </h2>

        {showNoData ? (
          <div className="text-sm text-mf-edge-300">No Data</div>
        ) : !showSkeleton && highestData ? (
          <div className="flex items-center gap-2">
            <span className="text-[0.8rem] text-mf-milk-500">Highest</span>
            <div className="rounded-sm border border-mf-border-600 px-3 w-26 text-xs text-mf-sally-500 py-0.5 text-center">
              {highestData.uid} - {highestPercentCountUp}%
            </div>
          </div>
        ) : null}
      </div>

      <BarChart
        data={barData}
        maxValue={maxPercent}
        gradientId="weights-bar-gradient"
        isHalfSize={isHalfSize}
        isLoading={showSkeleton}
        isLgOrLarger={isLgOrLarger}
        formatValue={(value) => `${(value * 100).toFixed(2)}%`}
        chartHeight={chartHeight}
      />
    </div>
  );

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1325px] py-4">{content}</div>
    </div>
  );
}
