"use client";

import { reactClient } from "@/trpc/react";
import { type Auction, type AuctionResults } from "@/types";
import { buildTargetsStackedPayoutData } from "@/utils/buildTargetsStackedPayoutData";
import {
  buildComputeTypesFromAuction,
  type ComputeTypeInfo,
} from "@/utils/computeTypes";
import { buildLabelColorMapFromStackedData } from "@/utils/stackedBarChartColors";
import useCountUp from "@/utils/useCountUp";
import { getDisplayName } from "@/utils/utils";
import { RiLockLine } from "@remixicon/react";
import { motion } from "framer-motion";
import React, { useMemo, useState } from "react";

interface TargetCardsProps {
  auctionResults?: AuctionResults;
  auction?: Record<string, Auction>;
  isLoading: boolean;
  error: Error | null;
  showServerCountRow?: boolean;
  showDetailCards?: boolean;
}

const FLIP_S = 0.4;
const FLIP_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

function formatCurrentPayoutPerHour(
  computeTypeName: string,
  auctionResults: AuctionResults | undefined
): string {
  const rows = auctionResults?.[computeTypeName];
  if (!rows?.length) return "0.00";
  const totalPayout = rows.reduce((s, n) => s + n.payout, 0);
  const totalCount = rows.reduce((s, n) => s + n.count, 0);
  return (totalPayout / Math.max(1, totalCount)).toFixed(2);
}

function TargetServerCountSummaryCard({
  title,
  icon,
  totalCards,
  isReady,
  accentHex,
  currentPayoutUsdPerHour,
}: {
  title: string;
  icon: React.ReactNode;
  totalCards: number;
  isReady: boolean;
  accentHex?: string;
  currentPayoutUsdPerHour: string;
}) {
  const countUpValue = useCountUp({
    end: totalCards,
    duration: 1000,
    decimals: 0,
    isReady,
  });

  const accentStyle =
    totalCards !== 0 && accentHex ? { color: accentHex } : undefined;
  const accentClass =
    totalCards === 0
      ? "text-mf-night-200"
      : accentHex
        ? ""
        : "text-mf-sally-500";

  const payoutNum = Number.parseFloat(currentPayoutUsdPerHour);
  const payoutAccentClass =
    !Number.isFinite(payoutNum) || payoutNum === 0
      ? "text-mf-night-200"
      : accentHex
        ? ""
        : "text-mf-sybil-300";
  const payoutAccentStyle =
    Number.isFinite(payoutNum) && payoutNum !== 0 && accentHex
      ? { color: accentHex }
      : undefined;

  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative w-full min-h-40"
      style={{ perspective: "1400px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
        animate={{ rotateX: hovered ? 180 : 0 }}
        transition={{ duration: FLIP_S, ease: FLIP_EASE }}
      >
        <div
          className="absolute inset-0 rounded-lg border border-mf-border-600 bg-mf-night-450 p-6 text-center backface-hidden"
          style={{ transform: "rotateX(0deg)" }}
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            {icon}
            <h3 className="text-xs">{title}</h3>
          </div>
          <div
            className={`mb-1 font-saira text-5xl font-medium opacity-80 ${accentClass}`}
            style={accentStyle}
          >
            {totalCards === 0 ? "00" : countUpValue}
          </div>
          <div className="text-xs text-mf-milk-600">Total Cards</div>
        </div>
        <div
          className="absolute inset-0 rounded-lg border border-mf-border-600 bg-mf-night-450 p-6 text-center backface-hidden"
          style={{ transform: "rotateX(180deg)" }}
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            {icon}
            <h3 className="text-xs">{title}</h3>
          </div>
          <div
            className={`mb-1 font-saira text-5xl font-medium opacity-80 ${payoutAccentClass}`}
            style={payoutAccentStyle}
          >
            ${currentPayoutUsdPerHour}
          </div>
          <div className="text-xs text-mf-milk-600">Per Hour</div>
        </div>
      </motion.div>
    </div>
  );
}

export function TargetServerCountSummary({
  computeTypes,
  isLoading,
  auction,
  error,
  auctionResults,
}: {
  computeTypes: ComputeTypeInfo[];
  isLoading: boolean;
  auction: Record<string, Auction> | undefined;
  error: Error | null;
  auctionResults: AuctionResults | undefined;
}) {
  const { data: historicalData } =
    reactClient.chain.getHistoricalPayoutDataByComputeType.useQuery({
      days: 30,
    });

  const labelColorMap = useMemo(() => {
    const stacked = buildTargetsStackedPayoutData(
      historicalData,
      auctionResults
    );
    return buildLabelColorMapFromStackedData(stacked);
  }, [historicalData, auctionResults]);

  const isReady =
    !isLoading &&
    auction !== undefined &&
    !error &&
    auctionResults !== undefined;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
      {computeTypes.map((t) => {
        const accentHex = labelColorMap.get(getDisplayName(t.name));
        return (
          <TargetServerCountSummaryCard
            key={t.name}
            title={t.displayName}
            icon={
              React.isValidElement(t.icon)
                ? React.cloneElement(t.icon as React.ReactElement, {
                    className: accentHex
                      ? "h-4 w-4"
                      : "h-4 w-4 text-mf-sally-500",
                    ...(accentHex ? { style: { color: accentHex } } : {}),
                  })
                : t.icon
            }
            totalCards={t.totalCards}
            isReady={isReady}
            accentHex={accentHex}
            currentPayoutUsdPerHour={formatCurrentPayoutPerHour(
              t.name,
              auctionResults
            )}
          />
        );
      })}
    </div>
  );
}

const TargetCards = ({
  auctionResults,
  auction,
  isLoading,
  error,
  showServerCountRow = false,
  showDetailCards = true,
}: TargetCardsProps) => {
  const computeTypes = useMemo<ComputeTypeInfo[]>(() => {
    if (!auction || !auctionResults) return [];
    return buildComputeTypesFromAuction(auction, auctionResults);
  }, [auction, auctionResults]);

  if (isLoading || error || !auction || !auctionResults) {
    if (isLoading) {
      const skeletonSlots = Math.max(
        1,
        auction ? Object.keys(auction).length : 0,
        4
      );
      return (
        <div className="space-y-8">
          {showServerCountRow && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: skeletonSlots }, (_, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-6 text-center"
                >
                  <div className="mx-auto mb-4 h-6 w-32 rounded bg-mf-night-100 opacity-30 animate-skeleton-pulse-opacity" />
                  <div className="h-16 w-full rounded bg-mf-night-100 opacity-30 animate-skeleton-pulse-opacity" />
                </div>
              ))}
            </div>
          )}
          {showDetailCards && (
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
              {Array.from({ length: skeletonSlots }, (_, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-6"
                >
                  <div className="mb-4 h-6 w-32 rounded bg-mf-night-100 opacity-30 animate-skeleton-pulse-opacity" />
                  <div className="h-16 w-full rounded bg-mf-night-100 opacity-30 animate-skeleton-pulse-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return <></>;
  }

  return (
    <div className="space-y-8">
      {showServerCountRow && (
        <TargetServerCountSummary
          computeTypes={computeTypes}
          isLoading={isLoading}
          auction={auction}
          error={error}
          auctionResults={auctionResults}
        />
      )}
      {showDetailCards && (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          {computeTypes.map((computeType) => (
            <div
              key={computeType.name}
              className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-6"
            >
              <div className="mb-4 flex items-center gap-2 group">
                <div className="flex items-center gap-2">
                  {computeType.icon}
                  <h3 className="text-sm">{computeType.displayName}</h3>
                </div>
                {computeType.badge && (
                  <span className="inline-flex max-w-full shrink-0 items-center justify-center gap-0.5 rounded-full bg-mf-sally-800 px-1.5 py-0.5 transition-colors group-hover:bg-mf-sally-700">
                    <RiLockLine className="size-2 shrink-0 text-mf-sally-500" />
                    <span className="truncate text-[0.45rem] font-light text-mf-milk-600">
                      {computeType.badge}
                    </span>
                  </span>
                )}
              </div>

              <div className="border-t border-mf-border-600 pt-4">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-mf-border-600 bg-mf-night-400 px-3 py-2">
                        <div className="text-sm text-mf-sally-500">
                          {computeType.targetCards.toString().padStart(2, "0")}
                        </div>
                      </div>
                      <div className="whitespace-nowrap text-xs text-mf-milk-600">
                        Target Cards
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-mf-border-600 bg-mf-night-400 px-3 py-2">
                        <div className="text-sm text-mf-sally-500">
                          {(computeType.minClusterSize || 1)
                            .toString()
                            .padStart(2, "0")}
                        </div>
                      </div>
                      <div className="whitespace-nowrap text-xs text-mf-milk-600">
                        Min Cards Per Cluster
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-mf-border-600 bg-mf-night-400 px-3 py-2">
                        <div className="text-sm text-mf-sybil-300">
                          ${(computeType.targetPrice / 100).toFixed(2)}
                        </div>
                      </div>
                      <div className="whitespace-nowrap text-xs text-mf-milk-600">
                        Target Price
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-mf-border-600 bg-mf-night-400 px-3 py-2">
                        <div className="text-sm text-mf-sybil-300">
                          ${(computeType.maxPrice / 100).toFixed(2)}
                        </div>
                      </div>
                      <div className="whitespace-nowrap text-xs text-mf-milk-600">
                        Max Price
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-mf-border-600 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-mf-milk-600">
                    Current Payout
                  </span>
                  <span className="text-xs font-medium text-mf-sybil-300">
                    $
                    {auctionResults?.[computeType.name]
                      ? (
                          auctionResults[computeType.name]!.reduce(
                            (sum, n) => sum + n.payout,
                            0
                          ) /
                          Math.max(
                            1,
                            auctionResults[computeType.name]!.reduce(
                              (sum, n) => sum + n.count,
                              0
                            )
                          )
                        ).toFixed(2)
                      : "0.00"}{" "}
                    per hour
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TargetCards;
