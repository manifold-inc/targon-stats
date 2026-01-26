"use client";

import { reactClient } from "@/trpc/react";
import { useEffect, useMemo, useState } from "react";

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

export default function WeightsGraph({
  isHalfSize = true,
}: { isHalfSize?: boolean } = {}) {
  const { data: auction, isLoading } =
    reactClient.chain.getAuctionState.useQuery(undefined);
  const isLgOrLarger = useIsLgOrLarger();
  const [hoveredData, setHoveredData] = useState<{
    uid: string;
    percent: number;
  } | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const weightsData = useMemo(() => {
    if (!auction?.weights) return [];

    const { uids, incentives } = auction.weights;
    if (!uids || !incentives || uids.length !== incentives.length) return [];

    const data = uids
      .map((uid, index) => ({
        uid: uid.toString(),
        percent: incentives[index] ?? 0,
        index,
      }))
      .sort((a, b) => a.percent - b.percent);

    return data;
  }, [auction]);

  const maxPercent = Math.max(...weightsData.map((d) => d.percent), 0);
  const highestData =
    weightsData.length > 0
      ? weightsData.reduce(
          (max, d) => (d.percent > max.percent ? d : max),
          weightsData[0]!
        )
      : null;

  const chartHeight = 200;
  const barGap = 75;

  const showSkeleton = isLoading || weightsData.length === 0;
  const showNoData = !isLoading && weightsData.length === 0;

  const renderSkeletonChart = () => {
    const skeletonBars = isHalfSize ? 15 : 30;
    const skeletonBarGap = isHalfSize ? 34 : 18;
    const skeletonPadding = 10;
    const skeletonTotalPadding = skeletonPadding * 2;
    const skeletonTotalGapWidth = (skeletonBars - 1) * skeletonBarGap;
    const skeletonAvailableWidth =
      1000 - skeletonTotalPadding - skeletonTotalGapWidth;
    const skeletonBarWidth =
      skeletonBars > 0 ? skeletonAvailableWidth / skeletonBars : 0;

    const getDeterministicHeight = (index: number) => {
      const seed = (index * 17 + 23) % 100;
      return (seed / 100) * chartHeight * 0.6 + chartHeight * 0.2;
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
            <linearGradient
              id="weights-bar-gradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#7CC0FF" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#52abff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0f2334" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {weightsData.map((data, index) => {
            const barHeight =
              maxPercent > 0 ? (data.percent / maxPercent) * chartHeight : 0;

            const totalBars = weightsData.length;
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
                  fill="url(#weights-bar-gradient)"
                  rx={2}
                  onMouseEnter={() =>
                    setHoveredData({ uid: data.uid, percent: data.percent })
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
                  style={{ cursor: "pointer" }}
                />

                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={3}
                  fill="#52abff"
                  opacity={0.9}
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
              {(hoveredData.percent * 100).toFixed(2)}%
            </div>
          </div>
        )}
      </div>
    );
  };

  const content = (
    <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-4 md:p-6 md:pb-4 pb-2">
      <div className="mb-6 flex items-center justify-between">
        <h2>Miner Weights</h2>

        {showNoData ? (
          <div className="text-sm text-mf-edge-300">No Data</div>
        ) : !showSkeleton && highestData ? (
          <div className="flex items-center gap-2">
            <span className="text-[0.8rem] text-mf-milk-500">Highest</span>
            <div className="rounded-sm border border-mf-border-600 px-3 ">
              <span className="text-xs text-mf-sally-500">
                {highestData.uid} - {(highestData.percent * 100).toFixed(2)}%
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
