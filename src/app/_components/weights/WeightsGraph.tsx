"use client";

import BarChart from "@/app/_components/BarChart";
import { reactClient } from "@/trpc/react";
import { type BarData } from "@/types";
import useCountUp from "@/utils/useCountUp";
import { useIsLgOrLarger } from "@/utils/useIsLgOrLarger";
import { RiRefreshLine } from "@remixicon/react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function WeightsGraph({
  isHalfSize = true,
}: { isHalfSize?: boolean } = {}) {
  const {
    data: auction,
    isLoading,
    refetch: refetchAuction,
  } = reactClient.chain.getAuctionState.useQuery(undefined);
  const isLgOrLarger = useIsLgOrLarger();
  const [showPulse, setShowPulse] = useState(false);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    pulseTimeoutRef.current = setTimeout(() => {
      setShowPulse(false);
    }, 10000);

    return () => {
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, []);

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
