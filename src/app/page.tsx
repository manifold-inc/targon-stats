"use client";

import PageHeader from "@/app/_components/PageHeader";
import PayoutGraph from "@/app/_components/PayoutGraph";
import WeightsGraph from "@/app/_components/WeightsGraph";
import { reactClient } from "@/trpc/react";
import { getNodes } from "@/utils/utils";
import { RiBarChartFill, RiCpuLine, RiHardDrive3Fill } from "@remixicon/react";
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

  const computeTypeCounts = useMemo(() => {
    if (!auction?.auction_results) {
      return { h200: 0, h100: 0, v4: 0 };
    }

    const nodes = getNodes(auction.auction_results);

    const h200Count = nodes
      .filter((node) => node.compute_type.includes("H200"))
      .reduce((sum, node) => sum + node.cards, 0);

    const h100Count = nodes
      .filter((node) => node.compute_type.includes("H100"))
      .reduce((sum, node) => sum + node.cards, 0);

    const v4Count = nodes
      .filter((node) => node.compute_type.includes("V4"))
      .reduce((sum, node) => sum + node.cards, 0);

    return { h200: h200Count, h100: h100Count, v4: v4Count };
  }, [auction]);

  return (
    <div className="w-full px-10">
      <PageHeader
        title="Stats"
        icon={<RiBarChartFill className="h-7 w-7" />}
        badges={[
          {
            icon: <RiHardDrive3Fill className="h-4 w-4 text-mf-sally-500" />,
            value: computeTypeCounts.h200.toString(),
            text: "H200 GPUs",
          },
          {
            icon: <RiHardDrive3Fill className="h-4 w-4 text-mf-sally-500" />,
            value: computeTypeCounts.h100.toString(),
            text: "H100 GPUs",
          },
          {
            icon: <RiCpuLine className="h-4 w-4 text-mf-sally-500" />,
            value: computeTypeCounts.v4.toString(),
            text: "V4 CPUs",
          },
        ]}
      />
      <PayoutGraph onComputeTypeChange={setTopSelectedComputeType} />

      <div className="w-full">
        <div className="mx-auto max-w-[1325px] py-4">
          <div className="grid grid-cols-1 gap-14 md:grid-cols-2">
            <PayoutGraph
              fixedComputeType={bottomComputeType}
              aggregateByUid={true}
              isHalfSize={true}
            />

            <WeightsGraph isHalfSize={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
