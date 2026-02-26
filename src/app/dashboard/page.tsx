"use client";

import PageHeader from "@/app/_components/PageHeader";
import { useAuth } from "@/app/_components/Providers";
import DashboardWeightsTable from "@/app/_components/weights/DashboardWeightsTable";
import { reactClient } from "@/trpc/react";
import { RiLayoutGridFill, RiSendPlaneFill } from "@remixicon/react";
import { useState } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedUid, setSelectedUid] = useState<number | null>(null);
  const {
    data: auction,
    isLoading,
    error,
  } = reactClient.chain.getAuctionState.useQuery(undefined);
  const trackMinerMutation = reactClient.trackedMiner.trackMiner.useMutation({
    onSuccess: () => {
      toast.success("Miner tracked successfully");
      setSelectedUid(null);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const hotkeyToUid = auction?.hotkey_to_uid ?? {};
  const selectedHotkey = selectedUid
    ? (hotkeyToUid[String(selectedUid)] ?? null)
    : null;

  const handleSubmit = () => {
    if (!selectedHotkey) return;
    trackMinerMutation.mutate({ hotkey: selectedHotkey });
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Dashboard"
        icon={<RiLayoutGridFill className="h-7 w-7" />}
      />
      <div className="mt-5 pb-20 flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <DashboardWeightsTable
            weights={auction?.weights}
            hotkeyToUid={hotkeyToUid}
            isLoading={isLoading}
            error={error as Error | null}
            title="Track Miner Hotkey"
            selectedUid={selectedUid}
            onSelectedUidChange={setSelectedUid}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                !selectedHotkey || !user || trackMinerMutation.isPending
              }
              className="flex items-center gap-2 rounded-lg border border-mf-border-600 bg-mf-sally-500 px-4 py-2 text-sm font-medium text-mf-night-500 transition-colors hover:bg-mf-sally-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RiSendPlaneFill className="h-4 w-4" />
              {trackMinerMutation.isPending ? "Submitting..." : "Track Miner"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
