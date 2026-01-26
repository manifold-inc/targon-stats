"use client";

import { reactClient } from "@/trpc/react";
import { getNodes } from "@/utils/utils";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { RiArrowDownSFill } from "@remixicon/react";
import { useEffect, useMemo, useState } from "react";

import { useCountUp } from "./header/useCountUp";

function useIsLgOrLarger() {
  const [isLgOrLarger, setIsLgOrLarger] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkSize = () => {
      setIsLgOrLarger(window.innerWidth >= 1024);
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  if (!mounted) {
    return false;
  }

  return isLgOrLarger;
}

function getDisplayName(computeType: string): string {
  if (computeType.includes("H200")) return "NVIDIA H200";
  if (computeType.includes("H100")) return "NVIDIA H100";
  if (computeType.includes("V4")) return "AMD V4 CPU";
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
  const [hoveredData, setHoveredData] = useState<{
    uid: string;
    payout: number;
  } | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

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

  const [selectedComputeType, setSelectedComputeType] = useState<string>("");

  useEffect(() => {
    if (fixedComputeType) {
      if (selectedComputeType !== fixedComputeType) {
        setSelectedComputeType(fixedComputeType);
      }
    } else if (defaultComputeType && !selectedComputeType) {
      setSelectedComputeType(defaultComputeType);
    }
  }, [defaultComputeType, selectedComputeType, fixedComputeType]);

  useEffect(() => {
    if (!fixedComputeType && selectedComputeType && onComputeTypeChange) {
      onComputeTypeChange(selectedComputeType);
    }
  }, [selectedComputeType, fixedComputeType, onComputeTypeChange]);

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
  const latestPayout =
    payoutData.length > 0
      ? (payoutData[payoutData.length - 1]?.payoutPerCard ?? 0)
      : 0;

  const chartHeight = 200;
  const barGap = aggregateByUid ? 285 : 18;

  const showSkeleton =
    fixedComputeType !== undefined
      ? isLoading || !auction || !selectedComputeType || payoutData.length === 0
      : isLoading || !selectedComputeType || payoutData.length === 0;

  const latestPayoutCountUp = useCountUp({
    end: latestPayout,
    duration: 1000,
    decimals: 2,
    isReady: !showSkeleton && latestPayout > 0,
  });

  const showNoData = Boolean(
    fixedComputeType === undefined &&
      !isLoading &&
      !!selectedComputeType &&
      payoutData.length === 0
  );

  const renderSkeletonChart = () => {
    const skeletonBars = isHalfSize ? 15 : 30;
    const skeletonBarGap = aggregateByUid ? 34 : 18;
    const skeletonPadding = 10;
    const skeletonTotalPadding = skeletonPadding * 2;
    const skeletonTotalGapWidth = (skeletonBars - 1) * skeletonBarGap;
    const skeletonAvailableWidth =
      1000 - skeletonTotalPadding - skeletonTotalGapWidth;
    const skeletonBarWidth =
      skeletonBars > 0 ? skeletonAvailableWidth / skeletonBars : 0;

    const getDeterministicHeight = (index: number) => {
      const hash1 = ((index * 17 + 23) % 97) / 97;
      const hash2 = ((index * 31 + 41) % 89) / 89;
      const hash3 = ((index * 13 + 7) % 83) / 83;
      const combined = hash1 * 0.5 + hash2 * 0.3 + hash3 * 0.2;
      const wave = Math.sin(index * 0.7) * 0.1 + Math.cos(index * 0.3) * 0.05;
      const normalized = Math.max(0, Math.min(1, combined + wave));
      return normalized * chartHeight * 0.6 + chartHeight * 0.2;
    };

    return (
      <div className="w-full relative">
        <svg
          viewBox={`0 0 1000 ${chartHeight + 40}`}
          preserveAspectRatio="none"
          className="w-full h-[240px] [&_text]:!text-[8px]"
        >
          {Array.from({ length: skeletonBars }).map((_, index) => {
            const barHeight = getDeterministicHeight(index);
            const x =
              skeletonPadding + index * (skeletonBarWidth + skeletonBarGap);
            const y = chartHeight - barHeight;

            return (
              <g key={`skeleton-${index}`}>
                <rect
                  x={x}
                  y={y}
                  width={skeletonBarWidth}
                  height={barHeight}
                  fill="#374151"
                  opacity={0.3}
                  rx={2}
                  className={isLoading ? "animate-pulse" : ""}
                />
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderChart = () => {
    return (
      <div className="w-full relative">
        <svg
          viewBox={`0 0 1000 ${chartHeight + 40}`}
          preserveAspectRatio="none"
          className="w-full h-[240px] [&_text]:!text-[8px]"
          onMouseMove={(e) => {
            if (hoveredData) {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoverPosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            } else {
              setHoverPosition(null);
            }
          }}
          onMouseLeave={() => {
            setHoveredData(null);
            setHoverPosition(null);
          }}
        >
          <defs>
            <linearGradient id="bar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7CC0FF" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#52abff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0f2334" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {payoutData.map((data, index) => {
            const barHeight =
              maxPayout > 0
                ? (data.payoutPerCard / maxPayout) * chartHeight
                : 0;

            const totalBars = payoutData.length;
            const padding = 10;
            const totalPadding = padding * 2;
            const totalGapWidth = (totalBars - 1) * barGap;
            const availableWidth = 1000 - totalPadding - totalGapWidth;
            const barWidth = totalBars > 0 ? availableWidth / totalBars : 0;
            const x = padding + index * (barWidth + barGap);
            const y = chartHeight - barHeight;

            const labelWidth = Math.min(
              44,
              Math.max(barWidth + barGap - 2, 30)
            );
            const labelX = x + barWidth / 2 - labelWidth / 2;

            return (
              <g key={`${data.uid}-${data.index}`}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#bar-gradient)"
                  rx={2}
                  className="animate-grow-up"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() =>
                    setHoveredData({
                      uid: data.uid,
                      payout: data.payoutPerCard,
                    })
                  }
                  onMouseMove={(e) => {
                    const svg = e.currentTarget.ownerSVGElement;
                    if (svg) {
                      const svgRect = svg.getBoundingClientRect();
                      setHoverPosition({
                        x: e.clientX - svgRect.left,
                        y: e.clientY - svgRect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredData(null);
                    setHoverPosition(null);
                  }}
                />

                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={3}
                  fill="#52abff"
                  opacity={0.9}
                  className="animate-grow-up"
                />

                {isLgOrLarger && (
                  <g>
                    <rect
                      x={labelX}
                      y={chartHeight + 10}
                      width={labelWidth}
                      height={16}
                      fill="#02080f"
                      stroke="#0b1018"
                      strokeWidth={1}
                      rx={2}
                    />
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + 21}
                      textAnchor="middle"
                      fill="#a2b6d6"
                      fontSize="8"
                      fontFamily="inherit"
                      textLength={Math.min(labelWidth - 4, data.uid.length * 5)}
                      lengthAdjust="spacing"
                      style={{ fontSize: "8px", letterSpacing: "0.5px" }}
                    >
                      {data.uid}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {hoveredData && hoverPosition && (
          <div
            className="absolute pointer-events-none z-10 rounded bg-mf-night-500 border border-mf-border-600 px-2 py-1 text-xs text-mf-edge-300"
            style={{
              left: `${hoverPosition.x}px`,
              top: `${hoverPosition.y - 45}px`,
              transform: "translateX(-50%)",
            }}
          >
            <div>{hoveredData.uid}</div>
            <div className="text-mf-sally-500">
              ${hoveredData.payout.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const content = (
    <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-4 md:p-6 md:pb-4 pb-2">
      <div className="mb-6 flex items-center justify-between">
        {fixedComputeType ? (
          <h2 className="whitespace-nowrap sm:text-base text-xs">
            {getDisplayName(selectedComputeType)} Payouts{" "}
            {aggregateByUid ? "by UUID" : ""}
          </h2>
        ) : (
          <Menu as="div" className="relative">
            {({ open }) => (
              <>
                <MenuButton className="flex items-center gap-2 focus:outline-none hover:opacity-80">
                  <h2 className="whitespace-nowrap sm:text-base text-xs">
                    {getDisplayName(selectedComputeType)} Payouts
                  </h2>
                  <RiArrowDownSFill
                    className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </MenuButton>

                <MenuItems className="absolute -left-2 z-10 mt-2 w-56 origin-top-left rounded-lg border-2 border-mf-border-600 bg-mf-night-500 shadow-lg focus:outline-none">
                  <div className="py-1">
                    {availableComputeTypes.map((computeType) => (
                      <MenuItem key={computeType}>
                        {({ focus }) => (
                          <button
                            onClick={() => setSelectedComputeType(computeType)}
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
        )}

        {showNoData ? (
          <div className="text-sm text-mf-edge-300">No Data</div>
        ) : !showSkeleton ? (
          <div className="flex items-center gap-2">
            <span className="text-[0.8rem] text-mf-milk-500 sm:block hidden">
              Average
            </span>
            <div className="rounded-sm border border-mf-border-600 px-3 ">
              <span className="text-xs text-mf-sally-500">
                ${latestPayoutCountUp}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {showSkeleton ? renderSkeletonChart() : renderChart()}
    </div>
  );
  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1325px] py-4">{content}</div>
    </div>
  );
}
