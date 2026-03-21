"use client";

import PageHeader from "@/app/_components/PageHeader";
import TargetCards from "@/app/_components/targets/TargetCards";
import TargetsPayoutGraph from "@/app/_components/targets/TargetsPayoutGraph";
import { reactClient } from "@/trpc/react";
import { RiBarChartFill } from "@remixicon/react";

export default function HomePage() {
  const {
    data: auction,
    isLoading,
    error,
  } = reactClient.chain.getAuctionState.useQuery(undefined);

  return (
    <div className="w-full">
      <PageHeader
        title="Stats"
        icon={<RiBarChartFill className="h-7 w-7" />}
        headerBadges="minerWeights"
      />
      <div className="mt-5 flex flex-col gap-8 pb-20">
        <TargetsPayoutGraph />
        <TargetCards
          auctionResults={auction?.auction_results}
          auction={auction?.auctions}
          isLoading={isLoading}
          error={error ? new Error(error.message) : null}
          showServerCountRow
          showDetailCards={false}
        />
      </div>
    </div>
  );
}
