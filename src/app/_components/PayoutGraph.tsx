"use client";

import BarChart from "@/app/_components/BarChart";
import { reactClient } from "@/trpc/react";
import useCountUp from "@/utils/useCountUp";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { RiArrowDownSFill, RiRefreshLine } from "@remixicon/react";
import { useRef, useState } from "react";

function getDisplayName(computeType: string): string {
  if (computeType.includes("H200")) return "NVIDIA H200";
  if (computeType.includes("H100")) return "NVIDIA H100";
  if (computeType.includes("V4")) return "AMD V4 CPU";
  return computeType;
}

export default function PayoutGraph({
  defaultComputeType,
  isHalfSize = false,
}: {
  defaultComputeType?: string;
  isHalfSize?: boolean;
} = {}) {
  const [selectedComputeType, setSelectedComputeType] = useState<string>(
    defaultComputeType || "TDX-NVCC-NVIDIA-H200"
  );
  const [showPulse, setShowPulse] = useState(false);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: historicalData, isLoading: isLoadingHistorical } =
    reactClient.chain.getHistoricalPayoutData.useQuery({
      days: isHalfSize ? 15 : 30,
      computeType: selectedComputeType || undefined,
    });

  const { data: auction, refetch: refetchAuction } =
    reactClient.chain.getAuctionState.useQuery(undefined);

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

  const nodes = auction?.auction_results?.[selectedComputeType];
  const totalPayout = nodes?.reduce((sum, node) => sum + node.payout, 0) ?? 0;
  const totalCards = nodes?.reduce((sum, node) => sum + node.count, 0) ?? 0;
  const liveAveragePayout = totalCards > 0 ? totalPayout / totalCards : null;

  const payoutData = [
    ...(historicalData || []),
    { date: "live", payout: liveAveragePayout ?? 0 },
  ];

  const livePayoutCountUp = useCountUp({
    end: liveAveragePayout ?? 0,
    duration: 1000,
    decimals: 2,
    isReady:
      !isLoadingHistorical &&
      liveAveragePayout !== null &&
      liveAveragePayout > 0,
  });

  return (
    <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-4 md:p-6 md:pb-4 pb-2 my-4">
      <div className="mb-6 flex items-center justify-between">
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
                  {auction?.auction_results &&
                    Object.keys(auction.auction_results)
                      .sort()
                      .map((type) => (
                        <MenuItem key={type}>
                          {({ focus }) => (
                            <button
                              onClick={() => setSelectedComputeType(type)}
                              className={`${
                                focus
                                  ? "bg-mf-night-500 text-mf-milk-500"
                                  : "text-mf-milk-700"
                              } ${
                                selectedComputeType === type
                                  ? "bg-mf-night-500/50"
                                  : ""
                              } block w-full px-4 py-2 text-left text-sm transition-colors`}
                            >
                              {getDisplayName(type)}
                            </button>
                          )}
                        </MenuItem>
                      ))}
                </div>
              </MenuItems>
            </>
          )}
        </Menu>

        {!isLoadingHistorical && payoutData.length === 0 ? (
          <div className="text-sm text-mf-edge-300">No Data</div>
        ) : !isLoadingHistorical && liveAveragePayout !== null ? (
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
        data={payoutData}
        gradientId="bar-gradient"
        isHalfSize={isHalfSize}
        isLoading={isLoadingHistorical}
        formatValue={(value) => `$${value.toFixed(2)}`}
        formatLabel={(uid: string) => {
          if (uid === "live") return "Live";
          const [month, day] = uid.substring(5).split("-");
          return `${Number(month)}.${Number(day)}`;
        }}
      />
    </div>
  );
}
