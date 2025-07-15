import { CircleCheck, CircleMinus } from "lucide-react";

import { type MinerNode } from "@/server/api/routers/bids";

interface MinerDetailsProps {
  minerNodes: MinerNode[];
  isLoading: boolean;
  error: Error | null;
}

export function NodePaymentStatus(miner: MinerNode) {
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
      <tr>
        <td
          colSpan={5}
          className="py-4 text-center text-gray-600 dark:text-gray-400"
        >
          Loading miner details...
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td
          colSpan={5}
          className="py-4 text-center text-red-600 dark:text-red-400"
        >
          Error loading miner details: {error.message}
        </td>
      </tr>
    );
  }

  if (!minerNodes || minerNodes.length === 0) {
    return (
      <tr>
        <td
          colSpan={5}
          className="py-4 text-center text-gray-600 dark:text-gray-400"
        >
          No details found for this miner.
        </td>
      </tr>
    );
  }

  return (
    <>
      {minerNodes.map((node, index) => (
        <tr
          key={index}
          className="divide-y divide-gray-200 border-none bg-gray-50 dark:divide-gray-700 dark:bg-gray-800/50"
        >
          <td className="whitespace-nowrap px-6 py-4 dark:bg-gray-900"></td>
          <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-900 dark:border-gray-700 dark:text-gray-100">
            ${(node.price / 100).toFixed(2)}/h
          </td>
          <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-900 dark:border-gray-700 dark:text-gray-100">
            ${node.payout.toFixed(2)}/h
          </td>
          <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-900 dark:border-gray-700 dark:text-gray-100">
            {node.gpus}
          </td>
          <td className="whitespace-nowrap px-6 py-4 text-end text-sm dark:border-gray-700">
            <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5">
              {NodePaymentStatus(node)}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}
