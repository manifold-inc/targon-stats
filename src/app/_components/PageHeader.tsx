"use client";

import Button from "@/app/_components/Button";
import { reactClient } from "@/trpc/react";
import { getNodes } from "@/utils/utils";
import { RiCpuLine, RiHardDrive3Fill } from "@remixicon/react";
import { type ReactNode, useMemo } from "react";

export default function PageHeader({
  title,
  icon,
}: {
  title: string;
  icon: ReactNode;
}) {
  const { data: auction } =
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

  const badges = [
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
  ];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <div className="text-mf-sally-500">{icon}</div>
        <h1 className="text-[1.75rem] font-saira text-mf-milk-400">{title}</h1>
      </div>

      <div className="lg:flex hidden items-center gap-3">
        {badges.map((badge, index) => (
          <Button
            key={index}
            icon={badge.icon}
            value={
              <>
                <span className="text-mf-sally-500 pr-0.5">{badge.value}</span>{" "}
                <span className="text-mf-milk-600">{badge.text}</span>
              </>
            }
            valueClassName="animate-flip-up"
          />
        ))}
      </div>
    </div>
  );
}
