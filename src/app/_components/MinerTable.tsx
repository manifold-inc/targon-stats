"use client";

import { Fragment, useState } from "react";

import MinerDetails from "@/app/_components/MinerDetails";
import PaymentStatusIcon from "@/app/_components/PaymentStatusIcon";
import { type MinerNode } from "@/app/api/bids/route";
import { type Miner } from "@/app/api/miners/route";

interface MinerTableProps {
  miners: Miner[];
  nodes: MinerNode[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  selectedMinerUid: string | null;
  onSelectedMinerChange: (uid: string | null) => void;
}

export default function MinerTable({
  miners,
  nodes,
  isLoading,
  error,
  searchTerm,
  selectedMinerUid,
  onSelectedMinerChange,
}: MinerTableProps) {
  const [selectedMinerUids, setSelectedMinerUids] = useState<Set<string>>(
    selectedMinerUid ? new Set([selectedMinerUid]) : new Set(),
  );

  const handleRowClick = (uid: string) => {
    const filteredMinerUids = selectedMinerUids.has(uid)
      ? new Set([...selectedMinerUids].filter((id) => id !== uid))
      : new Set([...selectedMinerUids, uid]);
    setSelectedMinerUids(filteredMinerUids);

    const selectedMinerUid = Array.from(filteredMinerUids)[0];
    if (!selectedMinerUid) return;
    onSelectedMinerChange(selectedMinerUid);
  };

  const filteredMiners =
    miners?.filter((miner) =>
      miner.uid.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700">
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
      <div className="rounded-lg border border-gray-200 dark:border-gray-700">
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
      <div className="rounded-lg border border-gray-200 dark:border-gray-700">
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
    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              UUID
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Average Bid
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Average Payout
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Number of Nodes
            </th>
            <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Payment Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {filteredMiners.map((miner) => (
            <Fragment key={miner.uid}>
              <tr
                className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedMinerUids.has(miner.uid)
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : ""
                }`}
                onClick={() => handleRowClick(miner.uid)}
              >
                <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-900 dark:text-gray-100">
                  {miner.uid}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-900 dark:text-gray-100">
                  ${(miner.average_price / 100).toFixed(2)}/h
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-900 dark:text-gray-100">
                  ${miner.average_payout.toFixed(2)}/h
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-900 dark:text-gray-100">
                  {miner.nodes}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-end text-sm">
                  <span className="px-2">
                    <PaymentStatusIcon miner={miner} />
                  </span>
                </td>
              </tr>

              {selectedMinerUids.has(miner.uid) && (
                <MinerDetails
                  nodes={nodes.filter(
                    (node: MinerNode) => node.uid === miner.uid,
                  )}
                  isLoading={false}
                  error={null}
                />
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
