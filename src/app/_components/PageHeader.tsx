"use client";

import Box from "@/app/_components/Box";
import { reactClient } from "@/trpc/react";
import useCountUp from "@/utils/useCountUp";
import { getNodes } from "@/utils/utils";
import { RiCpuLine, RiHardDrive3Fill } from "@remixicon/react";
import Link from "next/link";
import { type ReactNode, useMemo } from "react";

export default function PageHeader({
  title,
  icon,
}: {
  title: string;
  icon: ReactNode;
}) {
  const { data: auction, isLoading } =
    reactClient.chain.getAuctionState.useQuery(undefined);

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

  const h200CountUp = useCountUp({
    end: computeTypeCounts.h200,
    duration: 1000,
    decimals: 0,
    isReady: !isLoading && auction !== undefined,
  });

  const h100CountUp = useCountUp({
    end: computeTypeCounts.h100,
    duration: 1000,
    decimals: 0,
    isReady: !isLoading && auction !== undefined,
  });

  const v4CountUp = useCountUp({
    end: computeTypeCounts.v4,
    duration: 1000,
    decimals: 0,
    isReady: !isLoading && auction !== undefined,
  });

  const badges = [
    {
      icon: <RiHardDrive3Fill className="h-4 w-4 text-mf-sally-500" />,
      value: h200CountUp,
      text: "H200 GPUs",
    },
    {
      icon: <RiHardDrive3Fill className="h-4 w-4 text-mf-sally-500" />,
      value: h100CountUp,
      text: "H100 GPUs",
    },
    {
      icon: <RiCpuLine className="h-4 w-4 text-mf-sally-500" />,
      value: v4CountUp,
      text: "V4 CPUs",
    },
  ];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <div className="text-mf-sally-500">{icon}</div>
        <h1 className="text-[1.75rem] font-saira text-mf-milk-400">{title}</h1>
      </div>

      <div className="lg:flex hidden items-center gap-3">
        {badges.map((badge, index) => (
          <Link key={index} href="/targets">
            <Box
              icon={badge.icon}
              value={
                <>
                  <span className="text-mf-sally-500 pr-0.5">
                    {badge.value}
                  </span>{" "}
                  <span className="text-mf-milk-600">{badge.text}</span>
                </>
              }
              valueClassName="animate-flip-up w-30"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
