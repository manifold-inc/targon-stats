"use client";

import { type AuctionResults } from "@/types";
import useCountUp from "@/utils/useCountUp";
import { getNodes } from "@/utils/utils";
import { getDisplayName } from "@/utils/utils";
import { RiCpuLine, RiHardDrive3Fill } from "@remixicon/react";
import { useMemo } from "react";

export default function MinerHardwareCards({
  uid,
  auctionResults,
  isLoading,
}: {
  uid: string;
  auctionResults?: AuctionResults;
  isLoading: boolean;
}) {
  const minerNodes = useMemo(() => {
    if (!auctionResults) return [];
    const allNodes = getNodes(auctionResults);
    return allNodes.filter((node) => node.uid === uid);
  }, [auctionResults, uid]);

  const hardwareCards = useMemo(() => {
    const cardsByType = new Map<string, number>();

    minerNodes.forEach((node) => {
      const current = cardsByType.get(node.compute_type) ?? 0;
      cardsByType.set(node.compute_type, current + node.cards);
    });

    return Array.from(cardsByType.entries()).map(([computeType, cards]) => {
      const isV4 = computeType.includes("V4");

      const displayName = getDisplayName(computeType);
      const icon = isV4 ? (
        <RiCpuLine className="h-4 w-4 text-mf-sally-500" />
      ) : (
        <RiHardDrive3Fill className="h-4 w-4 text-mf-sally-500" />
      );

      return {
        computeType,
        displayName,
        cards,
        icon,
      };
    });
  }, [minerNodes]);

  const h200Cards = useMemo(() => {
    return (
      hardwareCards.find((c) => c.computeType.includes("H200"))?.cards ?? 0
    );
  }, [hardwareCards]);

  const h100Cards = useMemo(() => {
    return (
      hardwareCards.find((c) => c.computeType.includes("H100"))?.cards ?? 0
    );
  }, [hardwareCards]);

  const v4Cards = useMemo(() => {
    return hardwareCards.find((c) => c.computeType.includes("V4"))?.cards ?? 0;
  }, [hardwareCards]);

  const h200CountUp = useCountUp({
    end: h200Cards,
    duration: 1000,
    decimals: 0,
    isReady: !isLoading,
  });

  const h100CountUp = useCountUp({
    end: h100Cards,
    duration: 1000,
    decimals: 0,
    isReady: !isLoading,
  });

  const v4CountUp = useCountUp({
    end: v4Cards,
    duration: 1000,
    decimals: 0,
    isReady: !isLoading,
  });

  const displayCards = [
    {
      displayName: "INTEL NVIDIA H200",
      cards: h200Cards,
      icon: <RiHardDrive3Fill className="h-4 w-4 text-mf-sally-500" />,
      countUpValue: h200CountUp,
    },
    {
      displayName: "INTEL NVIDIA H100",
      cards: h100Cards,
      icon: <RiHardDrive3Fill className="h-4 w-4 text-mf-sally-500" />,
      countUpValue: h100CountUp,
    },
    {
      displayName: "AMD CPU V4",
      cards: v4Cards,
      icon: <RiCpuLine className="h-4 w-4 text-mf-sally-500" />,
      countUpValue: v4CountUp,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-4">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-6 text-center"
          >
            <div className="h-6 w-32 mb-4 mx-auto rounded bg-mf-night-100 opacity-30 animate-skeleton-pulse-opacity" />
            <div className="h-16 w-full rounded bg-mf-night-100 opacity-30 animate-skeleton-pulse-opacity" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mb-4">
      {displayCards.map((card, index) => (
        <div
          key={index}
          className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            {card.icon}
            <h3 className="text-xs">{card.displayName}</h3>
          </div>
          <div
            className={`text-5xl font-saira font-medium mb-1 ${
              card.cards === 0 ? "text-mf-night-200" : "text-mf-sally-500"
            }`}
          >
            {card.cards === 0 ? "00" : card.countUpValue}
          </div>
          <div className="text-xs text-mf-milk-600">Total Cards</div>
        </div>
      ))}
    </div>
  );
}
