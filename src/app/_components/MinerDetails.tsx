import { type MinerInstance } from "@/server/api/routers/miners";

interface MinerDetailsProps {
  minerInstances: MinerInstance[];
  isLoading: boolean;
  error: Error | null;
}

export default function MinerDetails({
  minerInstances,
  isLoading,
  error,
}: MinerDetailsProps) {
  if (isLoading) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        Loading miner details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400">
        Error loading miner details: {error.message}
      </div>
    );
  }

  if (!minerInstances || minerInstances.length === 0) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        No details found for this miner.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {minerInstances.map((instance, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-700"
        >
          <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
            {instance.uid}
          </div>
          <div className="text-sm text-gray-900 dark:text-gray-100">
            ${(instance.price / 100).toFixed(2)}
          </div>
          <div className="text-sm text-gray-900 dark:text-gray-100">
            ${(instance.payout / 100).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}
