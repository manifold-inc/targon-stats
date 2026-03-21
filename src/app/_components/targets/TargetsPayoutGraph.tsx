"use client";

import BarChart from "@/app/_components/BarChart";
import { reactClient } from "@/trpc/react";
import { buildTargetsStackedPayoutData } from "@/utils/buildTargetsStackedPayoutData";
import { RiRefreshLine } from "@remixicon/react";
import { useMemo, useRef, useState } from "react";

export default function TargetsPayoutGraph() {
  const { data: historicalData, isLoading: isLoadingHistorical } =
    reactClient.chain.getHistoricalPayoutDataByComputeType.useQuery({
      days: 30,
    });

  const { data: auction, refetch: refetchAuction } =
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

  const stackedData = useMemo(
    () =>
      buildTargetsStackedPayoutData(historicalData, auction?.auction_results),
    [historicalData, auction?.auction_results]
  );

  return (
    <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-4 md:p-6 md:pb-4 pb-2">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base">Payout</h2>
        {!isLoadingHistorical && stackedData.length === 0 ? (
          <div className="text-sm text-mf-edge-300">No Data</div>
        ) : !isLoadingHistorical && stackedData.length > 0 ? (
          <div className="flex items-center gap-2 group">
            <button
              onClick={handleRefetch}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <RiRefreshLine className="h-3 w-3 text-mf-milk-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-xs text-mf-milk-700 flex items-center gap-1.5">
                Live
                <div
                  className={`w-1 h-1 rounded-full animate-pulse ${showPulse ? "bg-mf-sybil-300" : "bg-mf-sally-500"}`}
                />
              </span>
            </button>
          </div>
        ) : null}
      </div>

      <BarChart
        data={stackedData}
        gradientId="targets-payout-gradient"
        isLoading={isLoadingHistorical}
        formatValue={(value) => `$${value.toFixed(2)}`}
        formatLabel={(key: string) => {
          if (key === "live") return "Live";
          const [month, day] = key.substring(5).split("-");
          return `${Number(month)}.${Number(day)}`;
        }}
        overlapSegments={true}
      />
    </div>
  );
}
