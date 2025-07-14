"use client";

import React, { useState } from "react";
import { CircleCheck, CircleMinus } from "lucide-react";

import MinerDetails from "@/app/_components/MinerDetails";
import { type Miner } from "@/server/api/routers/miners";
import { reactClient } from "@/trpc/react";

interface MinerTableProps {
  searchTerm: string;
}

function MinerPaymentStatus(miner: Miner) {
  switch (true) {
    case !miner.diluted:
      return <CircleCheck className="h-4 w-4 text-green-500" />;
    case miner.diluted:
      return <CircleMinus className="h-4 w-4 text-yellow-500" />;
  }
}

export default function MinerTable({ searchTerm }: MinerTableProps) {
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

  const filteredMiners =
    miners?.filter((miner) =>
      miner.uid.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  if (isLoading) {
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
            <tr>
              <td
                colSpan={4}
                className="text-center text-gray-600 dark:text-gray-400"
              >
                Loading miners...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
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
            <tr>
              <td
                colSpan={4}
                className="text-center text-red-600 dark:text-red-400"
              >
                Error loading miners: {error.message}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (searchTerm && filteredMiners.length === 0) {
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
            <tr>
              <td
                colSpan={4}
                className="text-center text-gray-600 dark:text-gray-400"
              >
                No miners found matching {searchTerm}
              </td>
            </tr>
          </tbody>
        </table>
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
          {filteredMiners.map((miner) => (
            <React.Fragment key={miner.uid}>
              <tr
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
                <MinerDetails
                  minerNodes={minerNodes || []}
                  isLoading={isMinerNodesLoading}
                  error={minerNodesError as Error | null}
                />
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
