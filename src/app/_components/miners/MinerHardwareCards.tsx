"use client";

import { TargetServerCountSummary } from "@/app/_components/targets/TargetCards";
import { type Auction, type AuctionResults } from "@/types";
import { buildComputeTypesFromAuction } from "@/utils/computeTypes";
import { useMemo } from "react";

function sumMinerCardsForType(
  uid: string,
  computeTypeName: string,
  auctionResults: AuctionResults
): number {
  const rows = auctionResults[computeTypeName];
  if (!rows?.length) return 0;
  return rows
    .filter((n) => String(n.uid) === String(uid))
    .reduce((s, n) => s + (n.count ?? 0), 0);
}

export default function MinerHardwareCards({
  uid,
  auction,
  auctionResults,
  isLoading,
  error,
}: {
  uid: string;
  auction: Record<string, Auction> | undefined;
  auctionResults?: AuctionResults;
  isLoading: boolean;
  error: Error | null;
}) {
  const computeTypes = useMemo(() => {
    if (!auction || !auctionResults) return [];
    const base = buildComputeTypesFromAuction(auction, auctionResults);
    return base.map((t) => ({
      ...t,
      totalCards: sumMinerCardsForType(uid, t.name, auctionResults),
    }));
  }, [auction, auctionResults, uid]);

  if (isLoading && (!auction || !auctionResults)) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-6 text-center"
          >
            <div className="mx-auto mb-4 h-6 w-32 rounded bg-mf-night-100 opacity-30 animate-skeleton-pulse-opacity" />
            <div className="h-16 w-full rounded bg-mf-night-100 opacity-30 animate-skeleton-pulse-opacity" />
          </div>
        ))}
      </div>
    );
  }

  if (!auction || !auctionResults) {
    return null;
  }

  return (
    <TargetServerCountSummary
      computeTypes={computeTypes}
      isLoading={isLoading}
      auction={auction}
      error={error}
      auctionResults={auctionResults}
    />
  );
}
