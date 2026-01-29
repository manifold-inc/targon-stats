"use client";

import BarChart, { type StackedDataItem } from "@/app/_components/BarChart";
import { reactClient } from "@/trpc/react";
import { getDisplayName } from "@/utils/utils";
import { useMemo } from "react";

export default function TargetsPayoutGraph() {
  const { data: historicalData, isLoading: isLoadingHistorical } =
    reactClient.chain.getHistoricalPayoutDataByComputeType.useQuery({
      days: 30,
    });

  const { data: auction } =
    reactClient.chain.getAuctionState.useQuery(undefined);

  const stackedData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) {
      return [];
    }

    const allComputeTypes = new Set<string>();
    historicalData.forEach((day) => {
      Object.keys(day.payouts).forEach((ct) => allComputeTypes.add(ct));
    });

    if (auction?.auction_results) {
      Object.keys(auction.auction_results).forEach((ct) =>
        allComputeTypes.add(ct)
      );
    }

    const sortedComputeTypes = Array.from(allComputeTypes).sort();

    const transformedData: StackedDataItem[] = historicalData.map((day) => {
      const segments = sortedComputeTypes
        .map((computeType) => {
          const payout = day.payouts[computeType];
          if (payout && payout > 0) {
            return {
              value: payout,
              label: getDisplayName(computeType),
            };
          }
          return null;
        })
        .filter((seg): seg is { value: number; label: string } => seg !== null);

      return {
        key: day.date,
        segments,
      };
    });

    if (auction?.auction_results) {
      const liveSegments = sortedComputeTypes
        .map((computeType) => {
          const nodes = auction.auction_results[computeType];
          if (!nodes || nodes.length === 0) return null;

          const totalPayout = nodes.reduce((sum, node) => sum + node.payout, 0);
          const totalCards = nodes.reduce((sum, node) => sum + node.count, 0);
          const averagePayout = totalCards > 0 ? totalPayout / totalCards : 0;

          if (averagePayout > 0) {
            return {
              value: averagePayout,
              label: getDisplayName(computeType),
            };
          }
          return null;
        })
        .filter((seg): seg is { value: number; label: string } => seg !== null);

      if (liveSegments.length > 0) {
        transformedData.push({
          key: "live",
          segments: liveSegments,
        });
      }
    }

    return transformedData;
  }, [historicalData, auction]);

  return (
    <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-4 md:p-6 md:pb-4 pb-2">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base">Payout</h2>
        {!isLoadingHistorical && stackedData.length === 0 && (
          <div className="text-sm text-mf-edge-300">No Data</div>
        )}
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
