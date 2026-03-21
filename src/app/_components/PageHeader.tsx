"use client";

import Box from "@/app/_components/Box";
import { reactClient } from "@/trpc/react";
import {
  buildComputeTypesFromAuction,
  type ComputeTypeInfo,
  headerBadgeCaption,
  headerBadgeFullLabel,
} from "@/utils/computeTypes";
import useCountUp from "@/utils/useCountUp";
import { RiToolsFill } from "@remixicon/react";
import Link from "next/link";
import React, { type ReactNode, useMemo } from "react";

function PageHeaderMinerBadge({
  uid,
  incentive,
  isReady,
}: {
  uid: string;
  incentive: number;
  isReady: boolean;
}) {
  const percentRounded = Math.round(incentive * 100);
  const value = useCountUp({
    end: percentRounded,
    duration: 1000,
    decimals: 0,
    isReady,
  });

  const title = `${percentRounded}% UUID ${uid}`;

  return (
    <Link href={`/miners/${uid}`} title={title}>
      <Box
        icon={<RiToolsFill className="h-4 w-4 text-mf-sally-500" />}
        value={
          <>
            <span className="pr-0.5 text-mf-sally-500">{value}%</span>{" "}
            <span className="min-w-0 max-w-36 shrink truncate text-mf-milk-600">
              UUID {uid}
            </span>
          </>
        }
        valueClassName="animate-flip-up min-w-0 max-w-[14rem]"
      />
    </Link>
  );
}

function PageHeaderBadge({
  computeType,
  isReady,
}: {
  computeType: ComputeTypeInfo;
  isReady: boolean;
}) {
  const value = useCountUp({
    end: computeType.totalCards,
    duration: 1000,
    decimals: 0,
    isReady,
  });

  const icon = React.isValidElement(computeType.icon)
    ? React.cloneElement(computeType.icon as React.ReactElement, {
        className: "h-4 w-4 text-mf-sally-500",
      })
    : computeType.icon;

  return (
    <Link href="/targets" title={headerBadgeFullLabel(computeType)}>
      <Box
        icon={icon}
        value={
          <>
            <span className="pr-0.5 text-mf-sally-500">{value}</span>{" "}
            <span className="min-w-0 max-w-30 shrink truncate text-mf-milk-600">
              {headerBadgeCaption(computeType)}
            </span>
          </>
        }
        valueClassName="animate-flip-up min-w-0 max-w-[11rem]"
      />
    </Link>
  );
}

export default function PageHeader({
  title,
  icon,
  headerBadges = "computeTypes",
}: {
  title: string;
  icon: ReactNode;
  /** Stats home: one badge per miner with weight % and UUID. */
  headerBadges?: "computeTypes" | "minerWeights";
}) {
  const { data: auctionState, isLoading } =
    reactClient.chain.getAuctionState.useQuery(undefined);

  const computeTypes = useMemo(() => {
    if (!auctionState?.auctions || !auctionState?.auction_results) return [];
    return buildComputeTypesFromAuction(
      auctionState.auctions,
      auctionState.auction_results
    );
  }, [auctionState]);

  const minerWeightRows = useMemo(() => {
    if (!auctionState?.weights) return [];
    const { uids, incentives } = auctionState.weights;
    if (!uids?.length || !incentives || uids.length !== incentives.length) {
      return [];
    }
    return uids
      .map((uid, index) => ({
        uid: String(uid),
        incentive: incentives[index] ?? 0,
      }))
      .sort((a, b) => b.incentive - a.incentive);
  }, [auctionState]);

  const isReady = !isLoading && auctionState !== undefined;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <div className="text-mf-sally-500">{icon}</div>
        <h1 className="text-[1.75rem] font-saira text-mf-milk-400">{title}</h1>
      </div>

      <div className="hidden items-center gap-3 lg:flex lg:flex-wrap lg:justify-end">
        {headerBadges === "minerWeights"
          ? minerWeightRows.map((row) => (
              <PageHeaderMinerBadge
                key={row.uid}
                uid={row.uid}
                incentive={row.incentive}
                isReady={isReady}
              />
            ))
          : computeTypes.map((ct) => (
              <PageHeaderBadge
                key={ct.name}
                computeType={ct}
                isReady={isReady}
              />
            ))}
      </div>
    </div>
  );
}
