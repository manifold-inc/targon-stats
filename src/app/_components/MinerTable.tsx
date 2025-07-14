"use client";

import { useState } from "react";
import { CircleCheck, CircleMinus, CircleX } from "lucide-react";

import MinerDetails from "@/app/_components/MinerDetails";
import { type Miner } from "@/server/api/routers/miners";
import { reactClient } from "@/trpc/react";

function MinerPaymentStatus(miner: Miner) {
  switch (true) {
    case miner.average_payout >= miner.average_price:
      return <CircleCheck className="h-4 w-4 text-green-500" />;
    case miner.average_payout > 0 && miner.average_payout < miner.average_price:
      return <CircleMinus className="h-4 w-4 text-yellow-500" />;
    default:
      return <CircleX className="h-4 w-4 text-red-500" />;
  }
}

export default function MinerTable() {
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  const {
    data: miners,
    isLoading,
    error,
  } = reactClient.miners.getAllMiners.useQuery();

  const {
    data: minerNodes,
    isLoading: isMinerNodesLoading,
    error: minerNodesError,
  } = reactClient.miners.getMiner.useQuery(selectedUid!, {
    enabled: !!selectedUid,
  });

  const handleRowClick = (uid: string) => {
    setSelectedUid(selectedUid === uid ? null : uid);
  };

  if (isLoading) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        Loading miners...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400">
        Error loading miners: {error.message}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              UUID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Average Bid
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Number of Nodes
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Payment Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {miners?.map((miner) => (
            <>
              <tr
                key={miner.uid}
                className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedUid === miner.uid
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : ""
                }`}
                onClick={() => handleRowClick(miner.uid)}
              >
                <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-900 dark:text-gray-100">
                  {miner.uid}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {`$${(miner.average_price / 100).toFixed(2)}`}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {miner.nodes}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5">
                    {MinerPaymentStatus(miner)}
                  </span>
                </td>
              </tr>

              {selectedUid === miner.uid && (
                <tr>
                  <td colSpan={4}>
                    <MinerDetails
                      minerNodes={minerNodes || []}
                      isLoading={isMinerNodesLoading}
                      error={minerNodesError as Error | null}
                    />
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
