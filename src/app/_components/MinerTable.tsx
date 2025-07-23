"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import MinerDetails from "@/app/_components/MinerDetails";
import PaymentStatusIcon from "@/app/_components/PaymentStatusIcon";
import { type MinerNode } from "@/app/api/bids/route";
import { type Miner } from "@/app/api/miners/route";
import { filterByUidSearch } from "@/utils/utils";

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
}

export default function MinerTable({
  miners,
  nodes,
  isLoading,
  error,
  searchTerm,
}: MinerTableProps) {
  const [field, setField] = useState<SortField>(SortField.NULL);
  const [direction, setDirection] = useState<SortDirection>(SortDirection.NULL);
  const [expandedMiners, setExpandedMiners] = useState<string[]>([searchTerm]);

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

  const filtered = useMemo(
    () => filterByUidSearch(miners, searchTerm),
    [miners, searchTerm],
  );
  const sorted = sortMiners(filtered);

  const selectedMinerUids = new Set(expandedMiners);

  const handleMinerClick = (uid: string) => {
    if (expandedMiners.includes(uid)) {
      setExpandedMiners(expandedMiners.filter((u) => u !== uid));
    } else {
      setExpandedMiners([...expandedMiners, uid]);
    }
  };

  const getNodesForMiner = (uid: string): MinerNode[] => {
    return nodes.filter((node) => node.uid === uid);
  };

  const searchTermRef = useRef(searchTerm);
  if (searchTermRef.current !== searchTerm) {
    if (!searchTerm.trim()) {
      setExpandedMiners([]);
    } else {
      setExpandedMiners(filtered.map((miner) => miner.uid));
    }
    searchTermRef.current = searchTerm;
  }

  if (isLoading) {
    return (
      <div className="space-y-1">
        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="min-w-full md:w-full">
            <thead className="rounded-lg bg-mf-sally-500/15 outline outline-2 outline-offset-[0px] outline-mf-ash-300/25">
              <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
                <th className="font-poppins cursor-pointer px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
                  <div className="flex items-center gap-1">UUID</div>
                </th>
                <th className="font-poppins cursor-pointer px-2 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    <span className="md:hidden">Avg Bid</span>
                    <span className="hidden md:inline">Average Bid</span>
                  </div>
                </th>
                <th className="font-poppins cursor-pointer px-2 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    <span className="md:hidden">Avg Payout</span>
                    <span className="hidden md:inline">Average Payout</span>
                  </div>
                </th>
                <th className="font-poppins cursor-pointer px-2 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
                  <div className="flex items-center justify-end gap-1">
                    <span className="hidden md:inline">Number of </span>
                    <span className="md:hidden">#</span> Nodes
                  </div>
                </th>
                <th className="font-poppins cursor-pointer px-2 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
                  <div className="flex items-center justify-end gap-1">
                    Payment <span className="hidden md:inline">Status</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-mf-ash-500/15">
              <tr className="cursor-pointer rounded-lg bg-mf-ash-500/15 outline outline-2 outline-offset-[-1px] outline-mf-ash-300/25 hover:bg-mf-ash-500/30 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
                <td
                  colSpan={5}
                  className="font-poppins whitespace-nowrap px-2 py-4 text-center text-sm text-mf-edge-700 md:px-6"
                >
                  Loading miners...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-1">
        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="min-w-full md:w-full">
            <thead className="rounded-lg bg-mf-sally-500/15 outline outline-2 outline-offset-[0px] outline-mf-ash-300/25">
              <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
                <th className="font-poppins cursor-pointer px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
                  <div className="flex items-center gap-1">UUID</div>
                </th>
                <th className="font-poppins cursor-pointer px-2 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    <span className="md:hidden">Avg Bid</span>
                    <span className="hidden md:inline">Average Bid</span>
                  </div>
                </th>
                <th className="font-poppins cursor-pointer px-2 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    <span className="md:hidden">Avg Payout</span>
                    <span className="hidden md:inline">Average Payout</span>
                  </div>
                </th>
                <th className="font-poppins cursor-pointer px-2 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
                  <div className="flex items-center justify-end gap-1">
                    <span className="hidden md:inline">Number of </span>
                    <span className="md:hidden">#</span> Nodes
                  </div>
                </th>
                <th className="font-poppins cursor-pointer px-2 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
                  <div className="flex items-center justify-end gap-1">
                    Payment <span className="hidden md:inline">Status</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-mf-ash-500/15">
              <tr className="cursor-pointer rounded-lg bg-mf-ash-500/15 outline outline-2 outline-offset-[-1px] outline-mf-ash-300/25 hover:bg-mf-ash-500/30 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
                <td
                  colSpan={5}
                  className="font-poppins whitespace-nowrap px-2 py-4 text-center text-sm text-red-400 md:px-6"
                >
                  Error loading miners: {error.message}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (searchTerm && filtered.length === 0) {
    return (
      <div className="space-y-1">
        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="min-w-full md:w-full">
            <thead className="rounded-lg bg-mf-sally-500/15 outline outline-2 outline-offset-[0px] outline-mf-ash-300/25">
              <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
                <th className="font-poppins cursor-pointer px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
                  <div className="flex items-center gap-1">UUID</div>
                </th>
                <th className="font-poppins cursor-pointer px-2 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    <span className="md:hidden">Avg Bid</span>
                    <span className="hidden md:inline">Average Bid</span>
                  </div>
                </th>
                <th className="font-poppins cursor-pointer px-2 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
                  <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                    <span className="md:hidden">Avg Payout</span>
                    <span className="hidden md:inline">Average Payout</span>
                  </div>
                </th>
                <th className="font-poppins cursor-pointer px-2 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
                  <div className="flex items-center justify-end gap-1">
                    <span className="hidden md:inline">Number of </span>
                    <span className="md:hidden">#</span> Nodes
                  </div>
                </th>
                <th className="font-poppins cursor-pointer px-2 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
                  <div className="flex items-center justify-end gap-1">
                    Payment <span className="hidden md:inline">Status</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-mf-ash-500/15">
              <tr className="cursor-pointer rounded-lg bg-mf-ash-500/15 outline outline-2 outline-offset-[-1px] outline-mf-ash-300/25 hover:bg-mf-ash-500/30 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
                <td
                  colSpan={5}
                  className="font-poppins whitespace-nowrap px-2 py-4 text-center text-sm text-mf-edge-700 md:px-6"
                >
                  No miners found matching {searchTerm}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <table className="min-w-full md:w-full">
          <thead className="rounded-lg bg-mf-sally-500/15 outline outline-2 outline-offset-[0px] outline-mf-ash-300/25">
            <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
              <th
                className="font-poppins cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700"
                onClick={() => handleSort(SortField.UID)}
              >
                <div className="flex items-center gap-1">
                  UUID
                  {getIcon(SortField.UID)}
                </div>
              </th>
              <th
                className="font-poppins cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700"
                onClick={() => handleSort(SortField.AVERAGE_PRICE)}
              >
                <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                  <span className="md:hidden">Avg Bid</span>
                  <span className="hidden md:inline">Average Bid</span>
                  {getIcon(SortField.AVERAGE_PRICE)}
                </div>
              </th>
              <th
                className="font-poppins cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700"
                onClick={() => handleSort(SortField.AVERAGE_PAYOUT)}
              >
                <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                  <span className="md:hidden">Avg Payout</span>
                  <span className="hidden md:inline">Average Payout</span>
                  {getIcon(SortField.AVERAGE_PAYOUT)}
                </div>
              </th>
              <th
                className="font-poppins cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700"
                onClick={() => handleSort(SortField.NODES)}
              >
                <div className="flex items-center justify-end gap-1">
                  <span className="hidden md:inline">Number of </span>
                  <span className="md:hidden">#</span> Nodes
                  {getIcon(SortField.NODES)}
                </div>
              </th>
              <th
                className="font-poppins cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700"
                onClick={() => handleSort(SortField.PAYMENT_STATUS)}
              >
                <div className="flex items-center justify-end gap-1">
                  Payment <span className="hidden md:inline">Status</span>
                  {getIcon(SortField.PAYMENT_STATUS)}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-mf-ash-500/15">
            {sorted.map((miner) => (
              <>
                <tr
                  key={miner.uid}
                  className="cursor-pointer rounded-lg bg-mf-ash-500/15 outline outline-2 outline-offset-[-1px] outline-mf-ash-300/25 hover:bg-mf-ash-500/30 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg"
                  onClick={() => handleMinerClick(miner.uid)}
                >
                  <td
                    className={`font-poppins flex items-center gap-2 whitespace-nowrap px-2 py-4 text-sm md:px-6 ${
                      selectedMinerUids.has(miner.uid)
                        ? "text-mf-edge-300"
                        : "text-mf-edge-700"
                    }`}
                  >
                    {miner.uid}
                    {selectedMinerUids.has(miner.uid) && (
                      <Image
                        src="/down-arrow.svg"
                        alt="Down Arrow"
                        width={16}
                        height={16}
                        className="h-4 w-4"
                      />
                    )}
                  </td>
                  <td className="font-poppins whitespace-nowrap px-2 py-4 text-end text-xs text-mf-sybil-500 md:px-6 md:text-sm">
                    ${(miner.average_price / 100).toFixed(2)}/h
                  </td>
                  {/* TODO: Remove division once payout is calculated correctly */}
                  <td className="font-poppins whitespace-nowrap px-2 py-4 text-end text-xs text-mf-sybil-500 md:px-6 md:text-sm">
                    ${(miner.average_payout / 8).toFixed(2)}/h
                  </td>
                  <td className="font-poppins whitespace-nowrap px-2 py-4 text-end text-sm text-mf-edge-700 md:px-6">
                    {miner.nodes}
                  </td>
                  <td className="whitespace-nowrap px-2 py-4 text-end text-sm last:rounded-r-lg md:px-6">
                    <span className="px-2">
                      <PaymentStatusIcon miner={miner} />
                    </span>
                  </td>
                </tr>
                {expandedMiners?.includes(miner.uid) && (
                  <MinerDetails
                    nodes={getNodesForMiner(miner.uid)}
                    isLoading={false}
                    error={null}
                  />
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
