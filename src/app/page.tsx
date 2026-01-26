"use client";

import PageHeader from "@/app/_components/PageHeader";
import PayoutGraph from "@/app/_components/PayoutGraph";
import WeightsGraph from "@/app/_components/weights/WeightsGraph";
import { reactClient } from "@/trpc/react";
import { RiBarChartFill } from "@remixicon/react";
import { useMemo, useState } from "react";

export default function HomePage() {
  const { data: auction } =
    reactClient.chain.getAuctionState.useQuery(undefined);

  const availableComputeTypes = useMemo(() => {
    if (!auction?.auction_results) return [];
    return Object.keys(auction.auction_results).sort();
  }, [auction]);

  const [topSelectedComputeType, setTopSelectedComputeType] =
    useState<string>("");

  const bottomComputeType = useMemo(() => {
    if (!topSelectedComputeType || availableComputeTypes.length === 0) {
      const v4 = availableComputeTypes.find((type) => type.includes("V4"));
      return v4 || availableComputeTypes[0] || "";
    }

    const differentType = availableComputeTypes.find(
      (type) => type !== topSelectedComputeType
    );
    return differentType || availableComputeTypes[0] || "";
  }, [topSelectedComputeType, availableComputeTypes]);

  return (
    <div className="w-full">
      <PageHeader title="Stats" icon={<RiBarChartFill className="h-7 w-7" />} />
      <PayoutGraph onComputeTypeChange={setTopSelectedComputeType} />

      <div className="grid grid-cols-1 gap-14 md:grid-cols-2">
        <PayoutGraph
          fixedComputeType={bottomComputeType}
          aggregateByUid={true}
          isHalfSize={true}
        />

        <WeightsGraph isHalfSize={true} />
      </div>
    </div>
  );
}
