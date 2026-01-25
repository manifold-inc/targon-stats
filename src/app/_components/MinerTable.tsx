"use client";

import { useMemo, useRef, useState } from "react";
import {
  RiArrowDownLine,
  RiArrowUpDownLine,
  RiArrowUpLine,
} from "@remixicon/react";

import { filterByUidSearch } from "@/utils/utils";

export type MinerNodes = {
  uid: string;
  payout: number;
  compute_type: string;
  cards: number;
};

export type MinerNode = {
  ip: string;
  uid: string;
  payout: number;
  count: number;
};

export type MinerNodesWithIP = {
  ip: string;
  uid: string;
  payout: number;
  count: number;
};

enum SortField {
  UID = "uid",
  PRICE = "payout",
  CARDS = "cards",
  TYPE = "compute_type",
  NULL = 0,
}

enum SortDirection {
  ASC = "asc",
  DESC = "desc",
  NULL = 0,
}

interface MinerTableProps {
  nodes: MinerNodes[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
}

export default function MinerTable({
  nodes,
  isLoading,
  error,
  searchTerm,
}: MinerTableProps) {
  const [field, setField] = useState<SortField>(SortField.UID);
  const [direction, setDirection] = useState<SortDirection>(SortDirection.ASC);

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
    if (field !== selectedField)
      return <RiArrowUpDownLine className="h-4 w-4" />;

    switch (direction) {
      case SortDirection.ASC:
        return <RiArrowUpLine className="h-4 w-4" />;
      case SortDirection.DESC:
        return <RiArrowDownLine className="h-4 w-4" />;
      default:
        return <RiArrowUpDownLine className="h-4 w-4" />;
    }
  };

  const sortMiners = (miners: MinerNodes[]) => {
    if (field === SortField.NULL || direction === SortDirection.NULL)
      return miners;

    return [...miners].sort((a, b) => {
      switch (field) {
        case SortField.UID:
          return direction === SortDirection.ASC
            ? Number(a.uid) - Number(b.uid)
            : Number(b.uid) - Number(a.uid);
        case SortField.PRICE:
          return direction === SortDirection.ASC
            ? Number(a.payout) - Number(b.payout)
            : Number(b.payout) - Number(a.payout);
        case SortField.CARDS:
          return direction === SortDirection.ASC
            ? Number(a.cards) - Number(b.cards)
            : Number(b.cards) - Number(a.cards);
        case SortField.TYPE:
          return direction === SortDirection.ASC
            ? a.compute_type < b.compute_type
              ? -1
              : 1
            : a.compute_type >= b.compute_type
              ? -1
              : 1;
        default:
          return 0;
      }
    });
  };

  const filtered = useMemo(
    () => filterByUidSearch(nodes, searchTerm),
    [nodes, searchTerm],
  );
  const sorted = sortMiners(filtered);

  const searchTermRef = useRef(searchTerm);
  if (searchTermRef.current !== searchTerm) {
    searchTermRef.current = searchTerm;
  }

  const header = (
    <>
      <thead className="rounded-lg bg-mf-sally-500/15 outline outline-2 outline-offset-[0px] outline-mf-ash-300/25">
        <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
          <th
            className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700"
            onClick={() => handleSort(SortField.UID)}
          >
            <div className="flex items-center gap-1">
              UUID
              {getIcon(SortField.UID)}
            </div>
          </th>
          <th
            className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700"
            onClick={() => handleSort(SortField.PRICE)}
          >
            <div className="flex items-center justify-end gap-1 whitespace-nowrap">
              <span className="md:hidden">Payout</span>
              <span className="hidden md:inline">Payout</span>
              {getIcon(SortField.PRICE)}
            </div>
          </th>
          <th
            className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700"
            onClick={() => handleSort(SortField.CARDS)}
          >
            <div className="flex items-center justify-end gap-1">
              <span className="hidden md:inline">Number of </span>
              <span className="md:hidden">#</span> Cards
              {getIcon(SortField.CARDS)}
            </div>
          </th>
          <th
            className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700"
            onClick={() => handleSort(SortField.TYPE)}
          >
            <div className="flex items-center justify-end gap-1 whitespace-nowrap">
              <span className="md:hidden">Compute</span>
              <span className="hidden md:inline">Compute</span>
              {getIcon(SortField.TYPE)}
            </div>
          </th>
        </tr>
      </thead>
    </>
  );

  if (isLoading) {
    return (
      <div className="space-y-1">
        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="min-w-full md:w-full">
            {header}
            <tbody className="bg-mf-ash-500/15">
              <tr className="cursor-pointer rounded-lg bg-mf-ash-500/15 outline outline-2 outline-offset-[-1px] outline-mf-ash-300/25 hover:bg-mf-ash-500/30 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
                <td
                  colSpan={5}
                  className="whitespace-nowrap px-2 py-4 text-center text-sm text-mf-edge-700 md:px-6"
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
            {header}
            <tbody className="bg-mf-ash-500/15">
              <tr className="cursor-pointer rounded-lg bg-mf-ash-500/15 outline outline-2 outline-offset-[-1px] outline-mf-ash-300/25 hover:bg-mf-ash-500/30 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
                <td
                  colSpan={5}
                  className="whitespace-nowrap px-2 py-4 text-center text-sm text-red-400 md:px-6"
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
            {header}
            <tbody className="bg-mf-ash-500/15">
              <tr className="cursor-pointer rounded-lg bg-mf-ash-500/15 outline outline-2 outline-offset-[-1px] outline-mf-ash-300/25 hover:bg-mf-ash-500/30 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
                <td
                  colSpan={5}
                  className="whitespace-nowrap px-2 py-4 text-center text-sm text-mf-edge-700 md:px-6"
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
          {header}
          <tbody className="bg-mf-ash-500/15">
            {sorted.map((node, idx) => (
              <tr
                key={idx}
                className="rounded-lg bg-mf-ash-500/15 outline outline-2 outline-offset-[-1px] outline-mf-ash-300/25 hover:bg-mf-ash-500/30 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg"
              >
                <td
                  className={`flex items-center gap-2 whitespace-nowrap px-2 py-4 text-sm text-mf-edge-300 md:px-6`}
                >
                  {node.uid}
                </td>
                <td className="whitespace-nowrap px-2 py-4 text-end text-xs text-mf-sybil-500 md:px-6 md:text-sm">
                  ${(node.payout / node.cards).toFixed(2)}/h
                </td>
                <td className="whitespace-nowrap px-2 py-4 text-end text-sm text-mf-edge-700 md:px-6">
                  {node.cards}
                </td>
                <td className="whitespace-nowrap px-2 py-4 text-end text-xs md:px-6 md:text-sm">
                  {node.compute_type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
