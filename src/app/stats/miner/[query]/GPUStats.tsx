"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { copyToClipboard } from "@/utils/utils";

interface GPUStatsProps {
  gpuStats: {
    avg: { h100: number; h200: number };
    validators: Array<{
      name: string;
      gpus: { h100: number; h200: number };
      models: string[];
      weight: number;
    }>;
  };
}

const GPUStats: React.FC<GPUStatsProps> = ({ gpuStats }) => {
  if (gpuStats.validators.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded border border-gray-200 shadow">
        <p className="text-sm text-gray-500 dark:text-gray-300">
          No GPU stats found
        </p>
      </div>
    );
  }

  const handleCopyClipboard = (copy: string) => {
    void copyToClipboard(copy);
    toast.success("Copied to clipboard!");
  };

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-50">
            GPU Stats by Validator
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
            A list of GPU counts and supported models reported by each validator
            for this miner.
          </p>
        </div>
      </div>
      <div className="mt-8">
        <div className="rounded-lg border border-gray-200 bg-gray-50 shadow dark:bg-neutral-900">
          <div className="flex items-center justify-between p-6">
            <pre className="flex-1 overflow-x-auto font-mono text-sm text-gray-900 dark:text-gray-200">
              {JSON.stringify(gpuStats)}
            </pre>
            <button
              className="ml-4 cursor-pointer"
              onClick={() =>
                handleCopyClipboard(JSON.stringify(gpuStats, null, 1))
              }
            >
              <Copy className="h-4 w-4 text-gray-500 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GPUStats;
