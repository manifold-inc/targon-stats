"use client";

import BarChart from "@/app/_components/BarChart";
import { reactClient } from "@/trpc/react";
import { type BarData } from "@/types";
import useCountUp from "@/utils/useCountUp";
import { useIsLgOrLarger } from "@/utils/useIsLgOrLarger";
import { getNodes } from "@/utils/utils";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { RiArrowDownSFill } from "@remixicon/react";
import { useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";

function getDisplayName(computeType: string, shortName?: boolean): string {
  if (computeType.includes("H200")) return shortName ? "H200" : "NVIDIA H200";
  if (computeType.includes("H100")) return shortName ? "H100" : "NVIDIA H100";
  if (computeType.includes("V4")) return shortName ? "CPU" : "AMD V4 CPU";
  return computeType;
}

export default function PayoutGraph({
  fixedComputeType,
  onComputeTypeChange,
  aggregateByUid = false,
  isHalfSize = false,
}: {
  fixedComputeType?: string;
  onComputeTypeChange?: (computeType: string) => void;
  aggregateByUid?: boolean;
  isHalfSize?: boolean;
} = {}) {
  const { data: auction, isLoading } =
    reactClient.chain.getAuctionState.useQuery(undefined);
  const isLgOrLarger = useIsLgOrLarger();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const availableComputeTypes = useMemo(() => {
    if (!auction?.auction_results) return [];
    return Object.keys(auction.auction_results).sort();
  }, [auction]);

  const defaultComputeType = useMemo(() => {
    if (fixedComputeType) return fixedComputeType;
    const h200 = availableComputeTypes.find((type) => type.includes("H200"));
    const h100 = availableComputeTypes.find((type) => type.includes("H100"));
    const nonV4 = availableComputeTypes.find((type) => !type.includes("V4"));
    return h200 || h100 || nonV4 || availableComputeTypes[0] || "";
  }, [availableComputeTypes, fixedComputeType]);

  const [selectedComputeType, setSelectedComputeType] = useState<string>(
    fixedComputeType || ""
  );

  useEffect(() => {
    if (fixedComputeType && selectedComputeType !== fixedComputeType) {
      setSelectedComputeType(fixedComputeType);
    }
  }, [fixedComputeType, selectedComputeType]);

  useEffect(() => {
    if (!fixedComputeType && defaultComputeType && !selectedComputeType) {
      setSelectedComputeType(defaultComputeType);
    }
  }, [defaultComputeType, fixedComputeType, selectedComputeType]);

  const handleComputeTypeChange = (computeType: string) => {
    setSelectedComputeType(computeType);
    if (!fixedComputeType && onComputeTypeChange) {
      onComputeTypeChange(computeType);
    }
  };

  const payoutData = useMemo(() => {
    if (!auction?.auction_results || !selectedComputeType) return [];

    const nodes = getNodes(auction.auction_results);

    const filteredNodes = nodes.filter(
      (node) => node.compute_type === selectedComputeType
    );

    if (aggregateByUid) {
      const aggregatedByUid = new Map<
        string,
        { uid: string; totalPayout: number; totalCards: number }
      >();

      for (const node of filteredNodes) {
        const existing = aggregatedByUid.get(node.uid);
        if (existing) {
          aggregatedByUid.set(node.uid, {
            uid: node.uid,
            totalPayout: existing.totalPayout + node.payout,
            totalCards: existing.totalCards + node.cards,
          });
        } else {
          aggregatedByUid.set(node.uid, {
            uid: node.uid,
            totalPayout: node.payout,
            totalCards: node.cards,
          });
        }
      }

      const data = Array.from(aggregatedByUid.values())
        .map((item, index) => ({
          uid: item.uid,
          payoutPerCard: item.totalPayout / item.totalCards,
          totalPayout: item.totalPayout,
          cards: item.totalCards,
          index,
        }))
        .sort((a, b) => a.payoutPerCard - b.payoutPerCard);

      return data;
    } else {
      const data = filteredNodes
        .map((node, index) => ({
          uid: node.uid,
          payoutPerCard: node.payout / node.cards,
          totalPayout: node.payout,
          cards: node.cards,
          index,
        }))
        .sort((a, b) => a.payoutPerCard - b.payoutPerCard);

      return data;
    }
  }, [auction, selectedComputeType, aggregateByUid]);

  const maxPayout = Math.max(...payoutData.map((d) => d.payoutPerCard), 0);
  const averagePayout =
    payoutData.length > 0
      ? payoutData.reduce((sum, d) => sum + d.payoutPerCard, 0) /
        payoutData.length
      : 0;

  const chartHeight = 200;

  const showSkeleton =
    fixedComputeType !== undefined
      ? isLoading || !auction || !selectedComputeType || payoutData.length === 0
      : isLoading || !selectedComputeType || payoutData.length === 0;

  const barData: BarData[] = payoutData.map((d) => ({
    uid: d.uid,
    value: d.payoutPerCard,
    index: d.index,
  }));

  const averagePayoutCountUp = useCountUp({
    end: averagePayout,
    duration: 1000,
    decimals: 2,
    isReady: !showSkeleton && averagePayout > 0,
  });

  const showNoData = Boolean(
    fixedComputeType === undefined &&
      !isLoading &&
      !!selectedComputeType &&
      payoutData.length === 0
  );

  const content = (
    <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-4 md:p-6 md:pb-4 pb-2">
      <div className="mb-6 flex items-center justify-between">
        {fixedComputeType ? (
          <h2 className="whitespace-nowrap sm:text-base text-xs">
            {getDisplayName(selectedComputeType, isHalfSize)} Payouts{" "}
            {aggregateByUid ? "by UUID" : ""}
          </h2>
        ) : mounted ? (
          <Menu as="div" className="relative">
            {({ open }) => (
              <>
                <MenuButton className="flex items-center gap-2 focus:outline-none hover:opacity-80">
                  <h2 className="whitespace-nowrap sm:text-base text-xs">
                    {getDisplayName(selectedComputeType)} Payouts
                  </h2>
                  <RiArrowDownSFill
                    className={`h-4 w-4 transition-transform text-mf-sally-500 ${open ? "rotate-180" : ""}`}
                  />
                </MenuButton>

                <MenuItems className="absolute -left-2 z-10 mt-2 w-56 origin-top-left rounded-lg border-2 border-mf-border-600 bg-mf-night-500 shadow-lg focus:outline-none">
                  <div className="py-1">
                    {availableComputeTypes.map((computeType) => (
                      <MenuItem key={computeType}>
                        {({ focus }) => (
                          <button
                            onClick={() => handleComputeTypeChange(computeType)}
                            className={`${
                              focus
                                ? "bg-mf-night-500 text-mf-milk-500"
                                : "text-mf-milk-700"
                            } ${
                              selectedComputeType === computeType
                                ? "bg-mf-night-500/50"
                                : ""
                            } block w-full px-4 py-2 text-left text-sm transition-colors`}
                          >
                            {getDisplayName(computeType)}
                          </button>
                        )}
                      </MenuItem>
                    ))}
                  </div>
                </MenuItems>
              </>
            )}
          </Menu>
        ) : (
          <h2 className="whitespace-nowrap sm:text-base text-xs">
            {getDisplayName(selectedComputeType)} Payouts
          </h2>
        )}

        {showNoData ? (
          <div className="text-sm text-mf-edge-300">No Data</div>
        ) : !showSkeleton ? (
          <div className="flex items-center gap-2">
            <span className="text-[0.8rem] text-mf-milk-500 sm:block hidden">
              Average
            </span>
            <div className="rounded-sm border border-mf-border-600 w-16 text-xs text-mf-sally-500 py-0.5 text-center">
              ${averagePayoutCountUp}
            </div>
          </div>
        ) : null}
      </div>

      <BarChart
        data={barData}
        maxValue={maxPayout}
        gradientId="bar-gradient"
        isHalfSize={isHalfSize}
        isLoading={showSkeleton}
        isLgOrLarger={isLgOrLarger}
        formatValue={(value) => `$${value.toFixed(2)}`}
        chartHeight={chartHeight}
      />
    </div>
  );
  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1325px] py-4">{content}</div>
    </div>
  );
}
