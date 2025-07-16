"use client";

import { Fragment, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import MinerDetails from "@/app/_components/MinerDetails";
import PaymentStatusIcon from "@/app/_components/PaymentStatusIcon";
import { type MinerNode } from "@/app/api/bids/route";
import { type Miner } from "@/app/api/miners/route";

enum SortField {
  UID = "uid",
  AVERAGE_PRICE = "average_price",
  AVERAGE_PAYOUT = "average_payout",
  NODES = "nodes",
  PAYMENT_STATUS = "payment_status",
  NULL = 0,
}

enum SortDirection {
  ASC = "asc",
  DESC = "desc",
  NULL = 0,
}

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
  const [field, setField] = useState<SortField>(SortField.NULL);
  const [direction, setDirection] = useState<SortDirection>(SortDirection.NULL);
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

  const handleSort = (selectedField: SortField) => {
    if (field === selectedField) {
      switch (direction) {
        case SortDirection.ASC:
          setDirection(SortDirection.DESC);
          break;
        case SortDirection.DESC:
          setField(SortField.NULL);
          setDirection(SortDirection.NULL);
          break;
        default:
          break;
      }
    } else {
      setField(selectedField);
      setDirection(SortDirection.ASC);
    }
  };

  const getIcon = (selectedField: SortField) => {
    if (field !== selectedField) return <ArrowUpDown className="h-4 w-4" />;

    switch (direction) {
      case SortDirection.ASC:
        return <ArrowUp className="h-4 w-4" />;
      case SortDirection.DESC:
        return <ArrowDown className="h-4 w-4" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  const sortMiners = (miners: Miner[]) => {
    if (field === SortField.NULL || direction === SortDirection.NULL)
      return miners;

    return [...miners].sort((a, b) => {
      switch (field) {
        case SortField.UID:
          return direction === SortDirection.ASC
            ? Number(a.uid) - Number(b.uid)
            : Number(b.uid) - Number(a.uid);
        case SortField.AVERAGE_PRICE:
          return direction === SortDirection.ASC
            ? a.average_price - b.average_price
            : b.average_price - a.average_price;
        case SortField.AVERAGE_PAYOUT:
          return direction === SortDirection.ASC
            ? a.average_payout - b.average_payout
            : b.average_payout - a.average_payout;
        case SortField.NODES:
          return direction === SortDirection.ASC
            ? a.nodes - b.nodes
            : b.nodes - a.nodes;
        case SortField.PAYMENT_STATUS:
          return direction === SortDirection.ASC
            ? a.diluted
              ? 1
              : -1
            : b.diluted
              ? 1
              : -1;
        default:
          return 0;
      }
    });
  };

  const filtered =
    miners?.filter((miner) =>
      miner.uid.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];
  const sorted = sortMiners(filtered);

  if (isLoading) {
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
            <tr>
              <td
                colSpan={5}
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
            <tr>
              <td
                colSpan={5}
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

  if (searchTerm && filtered.length === 0) {
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
            <tr>
              <td
                colSpan={5}
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
            <th
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              onClick={() => handleSort(SortField.UID)}
            >
              <div className="flex items-center gap-1">
                UUID
                {getIcon(SortField.UID)}
              </div>
            </th>
            <th
              className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              onClick={() => handleSort(SortField.AVERAGE_PRICE)}
            >
              <div className="flex items-center justify-end gap-1">
                Average Bid
                {getIcon(SortField.AVERAGE_PRICE)}
              </div>
            </th>
            <th
              className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              onClick={() => handleSort(SortField.AVERAGE_PAYOUT)}
            >
              <div className="flex items-center justify-end gap-1">
                Average Payout
                {getIcon(SortField.AVERAGE_PAYOUT)}
              </div>
            </th>
            <th
              className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              onClick={() => handleSort(SortField.NODES)}
            >
              <div className="flex items-center justify-end gap-1">
                Number of Nodes
                {getIcon(SortField.NODES)}
              </div>
            </th>
            <th
              className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              onClick={() => handleSort(SortField.PAYMENT_STATUS)}
            >
              <div className="flex items-center justify-end gap-1">
                Payment Status
                {getIcon(SortField.PAYMENT_STATUS)}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {sorted.map((miner) => (
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
                {/* TODO: Remove division once payout is calculated correctly */}
                <td className="whitespace-nowrap px-6 py-4 text-end text-sm text-gray-900 dark:text-gray-100">
                  ${(miner.average_payout / 8).toFixed(2)}/h
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
