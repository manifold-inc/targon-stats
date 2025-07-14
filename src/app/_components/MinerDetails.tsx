import { CircleCheck, CircleMinus, CircleX } from "lucide-react";

import { type MinerNode } from "@/server/api/routers/miners";

interface MinerDetailsProps {
  minerNodes: MinerNode[];
  isLoading: boolean;
  error: Error | null;
}

function InstancePaymentStatus(miner: MinerNode) {
  switch (true) {
    case miner.payout >= miner.price:
      return <CircleCheck className="h-4 w-4 text-green-500" />;
    case miner.payout > 0 && miner.payout < miner.price:
      return <CircleMinus className="h-4 w-4 text-yellow-500" />;
    default:
      return <CircleX className="h-4 w-4 text-red-500" />;
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
    <table className="min-w-full">
      <tbody>
        {minerNodes.map((node, index) => (
          <tr key={index} className="bg-white dark:bg-gray-900">
            <td className="whitespace-nowrap px-6 py-2 font-mono text-sm text-gray-900 dark:text-gray-100">
              {node.uid}
            </td>
            <td className="whitespace-nowrap px-6 py-2 text-sm text-gray-900 dark:text-gray-100">
              ${(node.price / 100).toFixed(2)}
            </td>
            <td className="whitespace-nowrap px-6 py-2 text-sm text-gray-900 dark:text-gray-100">
              {minerNodes.length}
            </td>
            <td className="whitespace-nowrap px-6 py-2 text-sm text-gray-900 dark:text-gray-100">
              {InstancePaymentStatus(node)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
