"use client";

import { useIsLgOrLarger } from "@/utils/useIsLgOrLarger";
import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_COLORS = [
  "#52ABFF",
  "#58E8B5",
  "#FFC45B",
  "#FF815B",
  "#A78BFA",
  "#F472B6",
  "#34D399",
  "#FBBF24",
];

export type StackedDataItem = {
  key: string;
  segments: Array<{ value: number; label?: string }>;
};

export type SimpleDataItem = {
  key: string;
  value: number;
};

export type DataItem = StackedDataItem | SimpleDataItem;

function isStackedItem(item: DataItem): item is StackedDataItem {
  return "segments" in item && Array.isArray(item.segments);
}

export default function BarChart({
  data,
  gradientId,
  isHalfSize = false,
  isLoading = false,
  formatValue,
  formatLabel,
  chartHeight = 200,
  onBarClick,
  overlapSegments = false,
}: {
  data: DataItem[];
  gradientId: string;
  isHalfSize?: boolean;
  isLoading?: boolean;
  formatValue: (value: number) => string;
  formatLabel?: (label: string) => string;
  chartHeight?: number;
  onBarClick?: (key: string) => void;
  overlapSegments?: boolean;
}) {
  const maxValue = Math.max(
    ...data.map((d) => {
      if (isStackedItem(d)) {
        if (overlapSegments) {
          return Math.max(...d.segments.map((seg) => seg.value), 0);
        }
        return d.segments.reduce((sum, seg) => sum + seg.value, 0);
      }
      return d.value;
    }),
    0
  );

  const labelColorMap = useMemo(() => {
    const uniqueLabels: string[] = [];
    data.forEach((item) => {
      if (isStackedItem(item)) {
        item.segments.forEach((seg) => {
          if (seg.label && !uniqueLabels.includes(seg.label)) {
            uniqueLabels.push(seg.label);
          }
        });
      }
    });
    const map = new Map<string, string>();
    uniqueLabels.forEach((label, index) => {
      map.set(label, DEFAULT_COLORS[index % DEFAULT_COLORS.length]!);
    });
    return map;
  }, [data]);

  const [hoveredData, setHoveredData] = useState<{
    uid: string;
    value: number;
    label?: string;
  } | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgWidth, setSvgWidth] = useState(1000);
  const isLgOrLarger = useIsLgOrLarger();

  useEffect(() => {
    const updateWidth = () => {
      if (svgRef.current) {
        setSvgWidth(svgRef.current.getBoundingClientRect().width);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [data.length]);

  const labelPositions = useMemo(() => {
    if (!isLgOrLarger || data.length === 0) return [];

    const totalBars = data.length;
    const padding = 10;
    const totalPadding = padding * 2;
    const fixedBarWidth = 16 * (isHalfSize ? 2 : 1);
    const availableWidth = 1000 - totalPadding;
    const totalBarsWidth = totalBars * fixedBarWidth;
    const calculatedGap =
      totalBars > 1 ? (availableWidth - totalBarsWidth) / (totalBars - 1) : 0;
    const scaleFactor = svgWidth / 1000;

    return data.map((item, index) => {
      const x = padding + index * (fixedBarWidth + calculatedGap);
      const centerX = (x + fixedBarWidth / 2) * scaleFactor;
      const labelWidth = 30 * (isHalfSize ? 2 : 1);

      return {
        key: item.key,
        x: centerX,
        width: labelWidth * scaleFactor,
      };
    });
  }, [data, isLgOrLarger, svgWidth, isHalfSize]);

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
          className="w-full h-[240px]"
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
                  className={isLoading ? "animate-skeleton-pulse-opacity" : ""}
                />
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  if (isLoading || data.length === 0) {
    return renderSkeletonChart();
  }

  const totalBars = data.length;
  const padding = 10;
  const totalPadding = padding * 2;
  const fixedBarWidth = 16 * (isHalfSize ? 2 : 1);
  const availableWidth = 1000 - totalPadding;
  const totalBarsWidth = totalBars * fixedBarWidth;
  const calculatedGap =
    totalBars > 1 ? (availableWidth - totalBarsWidth) / (totalBars - 1) : 0;

  return (
    <div className="w-full relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 1000 ${chartHeight + 40}`}
        preserveAspectRatio="none"
        className="w-full h-[240px]"
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
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7CC0FF" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#52abff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0f2334" stopOpacity="0.5" />
          </linearGradient>
          {Array.from(labelColorMap.entries()).map(([label, color]) => {
            const hex = color.replace("#", "");
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);

            const safeId = `segment-gradient-${Array.from(labelColorMap.keys()).indexOf(label)}`;
            const opacity = "0.5";
            const isBlue = color === "#69C3FF";

            let lightColor: string;
            let darkColor: string;

            if (isBlue) {
              lightColor = "#3E6286";
              darkColor = "#0B1825";
            } else {
              const lightMultiplier = 0.2;
              const darkMultiplier = 0.7;

              const lightR = Math.min(
                255,
                Math.round(r + (255 - r) * lightMultiplier)
              );
              const lightG = Math.min(
                255,
                Math.round(g + (255 - g) * lightMultiplier)
              );
              const lightB = Math.min(
                255,
                Math.round(b + (255 - b) * lightMultiplier)
              );

              const darkR = Math.max(0, Math.round(r * darkMultiplier));
              const darkG = Math.max(0, Math.round(g * darkMultiplier));
              const darkB = Math.max(0, Math.round(b * darkMultiplier));

              lightColor = `rgb(${lightR}, ${lightG}, ${lightB})`;
              darkColor = `rgb(${darkR}, ${darkG}, ${darkB})`;
            }

            return (
              <linearGradient
                key={safeId}
                id={safeId}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={lightColor}
                  stopOpacity={opacity}
                />
                {!isBlue && (
                  <stop offset="50%" stopColor={color} stopOpacity={opacity} />
                )}
                <stop
                  offset="100%"
                  stopColor={darkColor}
                  stopOpacity={opacity}
                />
              </linearGradient>
            );
          })}
        </defs>

        {data.map((item, index) => {
          const x = padding + index * (fixedBarWidth + calculatedGap);

          if (isStackedItem(item)) {
            const sortedSegments = overlapSegments
              ? [...item.segments].sort((a, b) => b.value - a.value)
              : item.segments;

            if (overlapSegments) {
              const backgroundColor = "#03090F";

              return (
                <g key={`${item.key}-${index}`} className="animate-grow-up">
                  {sortedSegments.map((segment, segIndex) => {
                    const segmentHeight =
                      maxValue > 0
                        ? (segment.value / maxValue) * chartHeight
                        : 0;
                    const segmentY = chartHeight - segmentHeight;

                    const labelIndex = segment.label
                      ? Array.from(labelColorMap.keys()).indexOf(segment.label)
                      : -1;
                    const segmentGradientId =
                      labelIndex >= 0
                        ? `segment-gradient-${labelIndex}`
                        : gradientId;
                    const fillColor = `url(#${segmentGradientId})`;
                    const segmentColor =
                      segment.label && labelColorMap.has(segment.label)
                        ? labelColorMap.get(segment.label)!
                        : "#52abff";

                    return (
                      <g key={`${item.key}-${index}-${segIndex}`}>
                        {segIndex > 0 && (
                          <rect
                            x={x}
                            y={segmentY}
                            width={fixedBarWidth}
                            height={chartHeight - segmentY}
                            fill={backgroundColor}
                            rx={2}
                          />
                        )}
                        <rect
                          x={x}
                          y={segmentY}
                          width={fixedBarWidth}
                          height={segmentHeight}
                          fill={fillColor}
                          rx={2}
                          style={{
                            cursor: onBarClick ? "pointer" : "default",
                          }}
                          onClick={() => {
                            if (onBarClick) {
                              onBarClick(item.key);
                            }
                          }}
                          onMouseEnter={() =>
                            setHoveredData({
                              uid: item.key,
                              value: segment.value,
                              label: segment.label,
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
                          y={segmentY}
                          width={fixedBarWidth}
                          height={3}
                          fill={segmentColor}
                          opacity={0.9}
                        />
                      </g>
                    );
                  })}
                </g>
              );
            } else {
              const totalValue = item.segments.reduce(
                (sum, seg) => sum + seg.value,
                0
              );
              const totalBarHeight =
                maxValue > 0 ? (totalValue / maxValue) * chartHeight : 0;
              let currentY = chartHeight - totalBarHeight;

              return (
                <g key={`${item.key}-${index}`} className="animate-grow-up">
                  {sortedSegments.map((segment, segIndex) => {
                    const segmentHeight =
                      maxValue > 0
                        ? (segment.value / maxValue) * chartHeight
                        : 0;
                    const segmentY = currentY;

                    const labelIndex = segment.label
                      ? Array.from(labelColorMap.keys()).indexOf(segment.label)
                      : -1;
                    const segmentGradientId =
                      labelIndex >= 0
                        ? `segment-gradient-${labelIndex}`
                        : gradientId;
                    const fillColor = `url(#${segmentGradientId})`;
                    const segmentColor =
                      segment.label && labelColorMap.has(segment.label)
                        ? labelColorMap.get(segment.label)!
                        : "#52abff";

                    currentY += segmentHeight;

                    return (
                      <g
                        key={`${item.key}-${index}-${segIndex}`}
                        style={{ isolation: "isolate" }}
                      >
                        <rect
                          x={x}
                          y={segmentY}
                          width={fixedBarWidth}
                          height={segmentHeight}
                          fill={fillColor}
                          rx={2}
                          style={{
                            cursor: onBarClick ? "pointer" : "default",
                          }}
                          onClick={() => {
                            if (onBarClick) {
                              onBarClick(item.key);
                            }
                          }}
                          onMouseEnter={() =>
                            setHoveredData({
                              uid: item.key,
                              value: segment.value,
                              label: segment.label,
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
                          y={segmentY}
                          width={fixedBarWidth}
                          height={3}
                          fill={segmentColor}
                          opacity={0.9}
                        />
                      </g>
                    );
                  })}
                </g>
              );
            }
          }

          const value = item.value;
          const barHeight = maxValue > 0 ? (value / maxValue) * chartHeight : 0;
          const y = chartHeight - barHeight;

          return (
            <g key={`${item.key}-${index}`}>
              <g className="animate-grow-up">
                <rect
                  x={x}
                  y={y}
                  width={fixedBarWidth}
                  height={barHeight}
                  fill={`url(#${gradientId})`}
                  rx={2}
                  style={{ cursor: onBarClick ? "pointer" : "default" }}
                  onClick={() => {
                    if (onBarClick) {
                      onBarClick(item.key);
                    }
                  }}
                  onMouseEnter={() =>
                    setHoveredData({
                      uid: item.key,
                      value,
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
                  width={fixedBarWidth}
                  height={3}
                  fill="#52abff"
                  opacity={0.9}
                />
              </g>
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
          <div className="whitespace-nowrap">
            {formatLabel ? formatLabel(hoveredData.uid) : hoveredData.uid}
          </div>
          <div
            className="whitespace-nowrap"
            style={{
              color:
                hoveredData.label && labelColorMap.has(hoveredData.label)
                  ? labelColorMap.get(hoveredData.label)
                  : undefined,
            }}
          >
            {hoveredData.label && (
              <div className="text-mf-edge-300">{hoveredData.label}</div>
            )}
            {formatValue(hoveredData.value)}
          </div>
        </div>
      )}

      {isLgOrLarger && (
        <div className="absolute top-[210px] left-0 w-full h-[26px] pointer-events-none overflow-hidden">
          {labelPositions.map((label, index) => (
            <div
              key={`label-${label.key}-${index}`}
              className="absolute flex items-center justify-center"
              style={{
                left: `${label.x - label.width / 2}px`,
                width: `${label.width}px`,
              }}
            >
              <div className="rounded border border-mf-border-600 bg-mf-night-450 px-1.5 py-0.5 text-[8px] text-mf-milk-700 leading-tight whitespace-nowrap">
                {formatLabel ? formatLabel(label.key) : label.key}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
