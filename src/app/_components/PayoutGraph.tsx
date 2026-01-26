"use client";

import BarChart from "@/app/_components/BarChart";
import { reactClient } from "@/trpc/react";
import { type BarData } from "@/types";
import useCountUp from "@/utils/useCountUp";
import { useIsLgOrLarger } from "@/utils/useIsLgOrLarger";
import { getNodes } from "@/utils/utils";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { RiArrowDownSFill, RiRefreshLine } from "@remixicon/react";
import { useEffect, useMemo, useRef, useState } from "react";

// historical data for before Jan 17 schema change in mongo db
const hardcodedHistoricalData = [
  {
    date: "2025-12-27",
    dayIndex: 0,
    averagePayoutPerCard: 1.93952439,
    totalPayout: 12723.28,
    totalCards: 6560,
  },
  {
    date: "2025-12-28",
    dayIndex: 1,
    averagePayoutPerCard: 2.04128535,
    totalPayout: 12704.96,
    totalCards: 6224,
  },
  {
    date: "2025-12-29",
    dayIndex: 2,
    averagePayoutPerCard: 1.89979751,
    totalPayout: 12196.7,
    totalCards: 6420,
  },
  {
    date: "2025-12-30",
    dayIndex: 3,
    averagePayoutPerCard: 1.49061527,
    totalPayout: 8140.25,
    totalCards: 5461,
  },
  {
    date: "2025-12-31",
    dayIndex: 4,
    averagePayoutPerCard: 1.79688492,
    totalPayout: 9852.32,
    totalCards: 5483,
  },
  {
    date: "2026-01-01",
    dayIndex: 5,
    averagePayoutPerCard: 2.27965738,
    totalPayout: 12353.46,
    totalCards: 5419,
  },
  {
    date: "2026-01-02",
    dayIndex: 6,
    averagePayoutPerCard: 2.23256143,
    totalPayout: 10903.83,
    totalCards: 4884,
  },
  {
    date: "2026-01-03",
    dayIndex: 7,
    averagePayoutPerCard: 2.23742603,
    totalPayout: 10813.48,
    totalCards: 4833,
  },
  {
    date: "2026-01-04",
    dayIndex: 8,
    averagePayoutPerCard: 2.3123769,
    totalPayout: 12491.46,
    totalCards: 5402,
  },
  {
    date: "2026-01-05",
    dayIndex: 9,
    averagePayoutPerCard: 2.3997626,
    totalPayout: 14758.54,
    totalCards: 6150,
  },
  {
    date: "2026-01-06",
    dayIndex: 10,
    averagePayoutPerCard: 2.50530321,
    totalPayout: 21788.62,
    totalCards: 8697,
  },
  {
    date: "2026-01-07",
    dayIndex: 11,
    averagePayoutPerCard: 2.26139581,
    totalPayout: 22464.71,
    totalCards: 9934,
  },
  {
    date: "2026-01-08",
    dayIndex: 12,
    averagePayoutPerCard: 1.83913873,
    totalPayout: 21521.6,
    totalCards: 11702,
  },
  {
    date: "2026-01-09",
    dayIndex: 13,
    averagePayoutPerCard: 1.81059926,
    totalPayout: 22728.45,
    totalCards: 12553,
  },
  {
    date: "2026-01-10",
    dayIndex: 14,
    averagePayoutPerCard: 1.85593097,
    totalPayout: 21666.14,
    totalCards: 11674,
  },
  {
    date: "2026-01-11",
    dayIndex: 15,
    averagePayoutPerCard: 1.84747779,
    totalPayout: 22275.04,
    totalCards: 12057,
  },
  {
    date: "2026-01-12",
    dayIndex: 16,
    averagePayoutPerCard: 1.86884591,
    totalPayout: 22487.82,
    totalCards: 12033,
  },
  {
    date: "2026-01-13",
    dayIndex: 17,
    averagePayoutPerCard: 1.73826737,
    totalPayout: 20972.2,
    totalCards: 12065,
  },
  {
    date: "2026-01-14",
    dayIndex: 18,
    averagePayoutPerCard: 1.66851367,
    totalPayout: 20325.83,
    totalCards: 12182,
  },
  {
    date: "2026-01-15",
    dayIndex: 19,
    averagePayoutPerCard: 1.62076415,
    totalPayout: 19591.8,
    totalCards: 12088,
  },
  {
    date: "2026-01-16",
    dayIndex: 20,
    averagePayoutPerCard: 1.48291805,
    totalPayout: 18027.83,
    totalCards: 12157,
  },
  {
    date: "2026-01-17",
    dayIndex: 21,
    averagePayoutPerCard: 1.45914231,
    totalPayout: 8852.62,
    totalCards: 6067,
  },
];

function getDisplayName(computeType: string, shortName?: boolean): string {
  if (computeType.includes("H200")) return shortName ? "H200" : "NVIDIA H200";
  if (computeType.includes("H100")) return shortName ? "H100" : "NVIDIA H100";
  if (computeType.includes("V4")) return shortName ? "CPU" : "AMD V4 CPU";
  return computeType;
}

export default function PayoutGraph({
  fixedComputeType,
  onComputeTypeChange,
  aggregateByUid: _aggregateByUid = false,
  isHalfSize = false,
}: {
  fixedComputeType?: string;
  onComputeTypeChange?: (computeType: string) => void;
  aggregateByUid?: boolean;
  isHalfSize?: boolean;
} = {}) {
  const { data: auction, refetch: refetchAuction } =
    reactClient.chain.getAuctionState.useQuery(undefined);
  const isLgOrLarger = useIsLgOrLarger();
  const [mounted, setMounted] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    pulseTimeoutRef.current = setTimeout(() => {
      setShowPulse(false);
    }, 10000);

    return () => {
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, []);

  const handleRefetch = () => {
    void refetchAuction();
    setShowPulse(true);
    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current);
    }
    pulseTimeoutRef.current = setTimeout(() => {
      setShowPulse(false);
    }, 10000);
  };

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

  const { data: historicalData, isLoading: isLoadingHistorical } =
    reactClient.chain.getHistoricalPayoutData.useQuery({
      days: isHalfSize ? 20 : 30, // Request more days to ensure we get enough data
      computeType: selectedComputeType || undefined,
    });

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

  const liveAveragePayout = useMemo(() => {
    if (!auction?.auction_results || !selectedComputeType) return null;

    const nodes = getNodes(auction.auction_results);
    const filteredNodes = nodes.filter(
      (node) => node.compute_type === selectedComputeType
    );

    if (filteredNodes.length === 0) return null;

    const totalPayout = filteredNodes.reduce(
      (sum, node) => sum + node.payout,
      0
    );
    const totalCards = filteredNodes.reduce((sum, node) => sum + node.cards, 0);

    return totalCards > 0 ? totalPayout / totalCards : 0;
  }, [auction, selectedComputeType]);

  const payoutData = useMemo(() => {
    if (!selectedComputeType) return [];

    const today = new Date();
    const todayStr = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    )
      .toISOString()
      .split("T")[0]!;

    const allHistoricalData: Array<{
      date: string;
      dayIndex: number;
      averagePayoutPerCard: number;
      totalPayout: number;
      totalCards: number;
    }> = [];

    const hardcodedFiltered = hardcodedHistoricalData.filter(
      (day) => day.date !== todayStr
    );
    allHistoricalData.push(...hardcodedFiltered);

    if (historicalData && historicalData.length > 0) {
      const hardcodedDates = new Set(
        hardcodedHistoricalData.map((d) => d.date)
      );
      const apiDataFiltered = historicalData.filter(
        (day) => !hardcodedDates.has(day.date) && day.date !== todayStr
      );

      const apiDataWithAdjustedIndex = apiDataFiltered.map((day, idx) => ({
        ...day,
        dayIndex: hardcodedFiltered.length + idx,
      }));

      allHistoricalData.push(...apiDataWithAdjustedIndex);
    }

    let data = allHistoricalData
      .sort((a, b) => a.date.localeCompare(b.date)) // Sort by date to ensure chronological order
      .map((day) => ({
        uid: day.date,
        date: day.date,
        dayIndex: day.dayIndex,
        payoutPerCard: day.averagePayoutPerCard,
        totalPayout: day.totalPayout,
        cards: day.totalCards,
        index: day.dayIndex,
        isLive: false,
      }));

    if (isHalfSize) {
      data = data.slice(-15); // Get the last 15 days
      data = data.map((day, idx) => ({
        ...day,
        dayIndex: idx,
        index: idx,
      }));
    }

    if (liveAveragePayout !== null) {
      data.push({
        uid: "live",
        date: "live",
        dayIndex: data.length,
        payoutPerCard: liveAveragePayout,
        totalPayout: 0,
        cards: 0,
        index: data.length,
        isLive: true,
      });
    }

    return data;
  }, [historicalData, selectedComputeType, liveAveragePayout, isHalfSize]);

  const maxPayout = Math.max(
    ...payoutData.map((d) => d.payoutPerCard),
    liveAveragePayout ?? 0,
    0
  );

  const chartHeight = 200;

  const showSkeleton =
    fixedComputeType !== undefined
      ? isLoadingHistorical ||
        !historicalData ||
        !selectedComputeType ||
        payoutData.length === 0
      : isLoadingHistorical || !selectedComputeType || payoutData.length === 0;

  const barData: BarData[] = payoutData.map((d) => ({
    uid: d.date, // Use date as identifier
    value: d.payoutPerCard,
    index: d.dayIndex,
  }));

  const livePayoutCountUp = useCountUp({
    end: liveAveragePayout ?? 0,
    duration: 1000,
    decimals: 2,
    isReady:
      !showSkeleton && liveAveragePayout !== null && liveAveragePayout > 0,
  });

  const showNoData = Boolean(
    fixedComputeType === undefined &&
      !isLoadingHistorical &&
      !!selectedComputeType &&
      payoutData.length === 0
  );

  const content = (
    <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-4 md:p-6 md:pb-4 pb-2">
      <div className="mb-6 flex items-center justify-between">
        {fixedComputeType ? (
          <h2 className="whitespace-nowrap sm:text-base text-xs">
            {getDisplayName(selectedComputeType)} Payout
          </h2>
        ) : mounted ? (
          <Menu as="div" className="relative">
            {({ open }) => (
              <>
                <MenuButton className="flex items-center gap-2 focus:outline-none hover:opacity-80">
                  <h2 className="whitespace-nowrap sm:text-base text-xs">
                    {getDisplayName(selectedComputeType)} Payout
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
            {getDisplayName(selectedComputeType)} Average Payout
          </h2>
        )}

        {showNoData ? (
          <div className="text-sm text-mf-edge-300">No Data</div>
        ) : !showSkeleton && liveAveragePayout !== null ? (
          <div className="flex items-center gap-2 group">
            <button
              onClick={handleRefetch}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <RiRefreshLine className="h-3 w-3 text-mf-milk-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-[0.8rem] text-mf-milk-500 sm:block hidden transition-colors">
                Live
              </span>
              <div
                className={`w-1 h-1 rounded-full animate-pulse ${showPulse ? "bg-mf-sybil-300" : "bg-mf-sally-500"}`}
              />
            </button>
            <div className="rounded-sm border border-mf-border-600 w-16 text-xs text-mf-sally-500 py-0.5 text-center">
              ${livePayoutCountUp}
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
        formatLabel={(uid: string) => {
          if (uid === "live") {
            return "Live";
          }
          const parts = uid.split("-");
          if (parts.length !== 3) return uid;

          const yearStr = parts[0];
          const monthStr = parts[1];
          const dayStr = parts[2];

          if (!yearStr || !monthStr || !dayStr) return uid;

          const year = parseInt(yearStr, 10);
          const month = parseInt(monthStr, 10);
          const day = parseInt(dayStr, 10);

          if (isNaN(year) || isNaN(month) || isNaN(day)) return uid;

          return `${month}.${day}`;
        }}
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
