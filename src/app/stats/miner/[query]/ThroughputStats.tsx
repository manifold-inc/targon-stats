"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { copyToClipboard } from "@/utils/utils";
import { type TargonDoc } from "./MinerChart";

interface ThroughputStatsProps {
  throughputStats: TargonDoc | null;
}

// Function to format time difference in a human-readable format
const getTimeSince = (timestamp: number | string): string => {
  const date =
    typeof timestamp === "number" ? new Date(timestamp) : new Date(timestamp);

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Convert to seconds, minutes, hours, days
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else if (diffHrs > 0) {
    return `${diffHrs} hour${diffHrs !== 1 ? "s" : ""} ago`;
  } else if (diffMin > 0) {
    return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  } else {
    return `${diffSec} second${diffSec !== 1 ? "s" : ""} ago`;
  }
};

// Function to format the stats with time since information
const formatStatsWithTimeSince = (
  stats: TargonDoc,
): Record<string, unknown> => {
  // Create a deep copy to avoid modifying the original
  const formattedStats = JSON.parse(JSON.stringify(stats)) as Record<
    string,
    unknown
  >;

  // Add time since last_updated
  if (typeof formattedStats.last_updated === "number") {
    const originalTime = formattedStats.last_updated;
    formattedStats.last_updated = `${originalTime} (${getTimeSince(originalTime)})`;
  }

  // Add time since lastReset for api data if it exists
  Object.keys(formattedStats).forEach((key) => {
    const value = formattedStats[key];
    if (
      typeof value === "object" &&
      value !== null &&
      "api" in value &&
      typeof value.api === "object" &&
      value.api !== null &&
      "lastReset" in value.api &&
      typeof value.api.lastReset === "string"
    ) {
      const originalReset = value.api.lastReset;
      (value.api as Record<string, unknown>).lastReset =
        `${originalReset} (${getTimeSince(originalReset)})`;
    }
  });

  return formattedStats;
};

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

  // Format the stats with time since information
  const formattedStats = formatStatsWithTimeSince(throughputStats);

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
              {JSON.stringify(formattedStats, null, 2)}
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
