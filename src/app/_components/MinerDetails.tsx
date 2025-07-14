import { CircleCheck, CircleMinus } from "lucide-react";

import { type MinerNode } from "@/server/api/routers/miners";

interface MinerDetailsProps {
  minerNodes: MinerNode[];
  isLoading: boolean;
  error: Error | null;
}

function InstancePaymentStatus(miner: MinerNode) {
  switch (true) {
    case !miner.diluted:
      return <CircleCheck className="h-4 w-4 text-green-500" />;
    case miner.diluted:
      return <CircleMinus className="h-4 w-4 text-yellow-500" />;
  }
}

export default function MinerDetails({
  minerNodes,
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

  if (!minerNodes || minerNodes.length === 0) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        No details found for this miner.
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
        {minerNodes.map((node, index) => (
          <tr key={index}>
            <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-900 dark:text-gray-100">
              {node.uid}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
              ${(node.price / 100).toFixed(2)}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
              {node.gpus}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm">
              <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5">
                {InstancePaymentStatus(node)}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
