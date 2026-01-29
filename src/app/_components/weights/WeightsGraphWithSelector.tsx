"use client";

import BarChart from "@/app/_components/BarChart";
import LiveIndicator from "@/app/_components/LiveIndicator";
import { reactClient } from "@/trpc/react";
import useCountUp from "@/utils/useCountUp";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { RiArrowDownSFill, RiRefreshLine } from "@remixicon/react";
import { useMemo, useRef, useState } from "react";

interface WeightsGraphWithSelectorProps {
  weights?: { uids: number[]; incentives: number[] };
  isLoading: boolean;
}

export default function WeightsGraphWithSelector({
  weights,
  isLoading: isLoadingWeights,
}: WeightsGraphWithSelectorProps) {
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const { refetch: refetchAuction } =
    reactClient.chain.getAuctionState.useQuery(undefined);
  const [showPulse, setShowPulse] = useState(false);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const uidWeights = useMemo(() => {
    if (!weights?.uids || !weights?.incentives) return [];
    return weights.uids
      .map((uid, index) => ({
        uid: uid.toString(),
        weight: weights.incentives[index] ?? 0,
      }))
      .sort((a, b) => b.weight - a.weight);
  }, [weights]);

  const defaultUid = useMemo(() => {
    if (uidWeights.length > 0 && !selectedUid) {
      return uidWeights[0]!.uid;
    }
    return selectedUid;
  }, [uidWeights, selectedUid]);

  const currentUid = selectedUid ?? defaultUid;

  const { data: historicalWeights, isLoading: isLoadingHistorical } =
    reactClient.chain.getHistoricalWeightsForMiner.useQuery(
      {
        uid: currentUid ?? "",
        days: 30,
      },
      {
        enabled: !!currentUid,
      }
    );

  const currentWeight = useMemo(() => {
    if (!weights || !currentUid) return 0;
    const { uids, incentives } = weights;
    const uidIndex = uids.indexOf(Number(currentUid));
    return uidIndex !== -1 ? (incentives[uidIndex] ?? 0) : 0;
  }, [weights, currentUid]);

  const weightsData = useMemo(() => {
    const historical = historicalWeights
      ? historicalWeights.map((item) => ({
          key: new Date(item.date).toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
          }),
          value: item.weight,
        }))
      : [];
    return [...historical, { key: "live", value: currentWeight }];
  }, [historicalWeights, currentWeight]);

  const latestWeightCountUp = useCountUp({
    end: currentWeight * 100,
    duration: 1000,
    decimals: 2,
    isReady: !isLoadingWeights && currentWeight > 0,
  });

  return (
    <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-4 md:p-6 md:pb-4 pb-2">
      <div className="mb-6 flex items-center justify-between">
        <Menu as="div" className="relative">
          {({ open }) => (
            <>
              <MenuButton
                className="flex items-center gap-2 focus:outline-none hover:opacity-80"
                disabled={isLoadingWeights || uidWeights.length === 0}
              >
                <h2 className="whitespace-nowrap sm:text-base text-xs">
                  {isLoadingWeights
                    ? "Weights"
                    : currentUid
                      ? `UUID ${currentUid} Weights`
                      : "Historical Weights"}
                </h2>
                <RiArrowDownSFill
                  className={`h-4 w-4 transition-transform text-mf-sally-500 ${open ? "rotate-180" : ""}`}
                />
              </MenuButton>

              <MenuItems className="absolute -left-2 z-10 mt-2 w-42 origin-top-left rounded-lg border-2 border-mf-border-600 bg-mf-night-500 shadow-lg focus:outline-none">
                <div className="py-1 max-h-60 overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {uidWeights.map(({ uid, weight }) => (
                    <MenuItem key={uid}>
                      {({ focus }) => (
                        <button
                          onClick={() => setSelectedUid(uid)}
                          className={`${
                            focus
                              ? "bg-mf-night-500 text-mf-milk-500"
                              : "text-mf-milk-700"
                          } ${
                            currentUid === uid ? "bg-mf-night-500/50" : ""
                          } block w-full px-4 py-2 text-left text-sm transition-colors`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{uid}</span>
                            <span className="text-xs">
                              {(weight * 100).toFixed(2)}%
                            </span>
                          </div>
                        </button>
                      )}
                    </MenuItem>
                  ))}
                </div>
              </MenuItems>
            </>
          )}
        </Menu>

        {!isLoadingWeights &&
        !isLoadingHistorical &&
        currentUid &&
        currentWeight > 0 ? (
          <div className="flex items-center gap-2 group">
            <button
              onClick={handleRefetch}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <RiRefreshLine className="h-3 w-3 text-mf-milk-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-xs text-mf-milk-700 flex items-center gap-1.5">
                Live
                <div
                  className={`w-1 h-1 rounded-full animate-pulse ${showPulse ? "bg-mf-sybil-300" : "bg-mf-sally-500"}`}
                />
              </span>
            </button>
            <LiveIndicator value={`${latestWeightCountUp}%`} />
          </div>
        ) : null}
      </div>

      <BarChart
        data={weightsData}
        gradientId={`weights-historical-bar-gradient-${currentUid}`}
        isLoading={isLoadingWeights || isLoadingHistorical}
        formatValue={(value) => `${(value * 100).toFixed(2)}%`}
        formatLabel={(key: string) => {
          if (key === "live") return "Live";
          return key;
        }}
      />
    </div>
  );
}
