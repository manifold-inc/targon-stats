"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { copyToClipboard } from "@/utils/utils";
import { type TargonDoc } from "./MinerChart";

interface ThroughputStatsProps {
  throughputStats: TargonDoc | null;
}

const ThroughputStats: React.FC<ThroughputStatsProps> = ({
  throughputStats,
}) => {
  if (!throughputStats) {
    return (
      <div className="flex h-96 items-center justify-center rounded border border-gray-200 shadow">
        <p className="text-sm text-gray-500 dark:text-gray-300">
          No throughput stats found
        </p>
      </div>
    );
  }

  const handleCopyClipboard = (copy: string) => {
    void copyToClipboard(copy);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="w-full max-w-full">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-50">
            Organic Throughput Stats
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
            A list of organic throughput stats for this miner.
          </p>
        </div>
      </div>
      <div className="w-full pt-8">
        <div className="rounded-lg border border-gray-200 bg-gray-50 shadow dark:bg-neutral-900">
          <div className="flex p-3">
            <pre className="overflow-y-auto text-left font-mono text-sm text-gray-900 dark:text-gray-200">
              {JSON.stringify(throughputStats, null, 2)}
            </pre>
            <button
              className="ml-4 cursor-pointer text-right"
              onClick={() =>
                handleCopyClipboard(JSON.stringify(throughputStats, null, 2))
              }
            >
              <Copy className="h-4 w-4 text-gray-500 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThroughputStats;
