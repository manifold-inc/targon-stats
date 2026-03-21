import type { AuctionResults } from "@/types";
import type { StackedDataItem } from "@/utils/stackedBarChartColors";
import { getDisplayName } from "@/utils/utils";

type DailyPayoutRow = { date: string; payouts: Record<string, number> };

export function buildTargetsStackedPayoutData(
  historicalData: DailyPayoutRow[] | undefined,
  auctionResults: AuctionResults | undefined
): StackedDataItem[] {
  if (!historicalData || historicalData.length === 0) {
    return [];
  }

  const allComputeTypes = new Set<string>();
  historicalData.forEach((day) => {
    Object.keys(day.payouts).forEach((ct) => allComputeTypes.add(ct));
  });

  if (auctionResults) {
    Object.keys(auctionResults).forEach((ct) => allComputeTypes.add(ct));
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

  if (auctionResults) {
    const liveSegments = sortedComputeTypes
      .map((computeType) => {
        const nodes = auctionResults[computeType];
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
}
