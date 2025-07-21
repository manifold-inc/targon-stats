"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { type MinerNode } from "@/app/api/bids/route";

enum SortField {
  RANK = "rank",
  UID = "uid",
  WEIGHT = "weight",
  NULL = 0,
}

enum SortDirection {
  ASC = "asc",
  DESC = "desc",
  NULL = 0,
}

interface WeightTableProps {
  weights: Record<string, number[]>;
  searchTerm: string;
  onNavigateToMiner: (uid: string) => void;
  nodes: MinerNode[];
  isLoading: boolean;
  error: Error | null;
}

const WeightTable = ({
  weights,
  searchTerm,
  onNavigateToMiner,
  nodes,
  isLoading,
  error,
}: WeightTableProps) => {
  const [field, setField] = useState<SortField>(SortField.NULL);
  const [direction, setDirection] = useState<SortDirection>(SortDirection.NULL);

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

  const uids = weights.uids;
  const incentive = weights.incentives;
  const weightMap = new Map(
    uids?.map((uid, index) => [String(uid), incentive?.[index]]),
  );

  const filteredNodes = nodes.filter((node: MinerNode) =>
    node.uid.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedNodes = [...filteredNodes].sort((a, b) => {
    return a.price - b.price;
  });

  const uniqueNodes = Array.from(
    new Map(sortedNodes.map((node) => [node.uid, node])).values(),
  );

  // Create nodes with ranks based on weight (highest weight = rank 1)
  const nodesWithRanks = uniqueNodes
    .sort((a, b) => {
      const weightA = weightMap.get(a.uid) ?? 0;
      const weightB = weightMap.get(b.uid) ?? 0;
      return weightB - weightA; // Descending order for ranking
    })
    .map((node, index) => ({
      ...node,
      rank: index + 1,
    }));

  const sortNodes = (nodes: typeof nodesWithRanks) => {
    if (field === SortField.NULL || direction === SortDirection.NULL)
      return nodes;

    return [...nodes].sort((a, b) => {
      switch (field) {
        case SortField.RANK:
          return direction === SortDirection.ASC
            ? a.rank - b.rank
            : b.rank - a.rank;
        case SortField.UID:
          return direction === SortDirection.ASC
            ? Number(a.uid) - Number(b.uid)
            : Number(b.uid) - Number(a.uid);
        case SortField.WEIGHT:
          const weightA = weightMap.get(a.uid) ?? 0;
          const weightB = weightMap.get(b.uid) ?? 0;
          return direction === SortDirection.ASC
            ? weightA - weightB
            : weightB - weightA;
        default:
          return 0;
      }
    });
  };

  const sorted = sortNodes(nodesWithRanks);

  if (isLoading) {
    return (
      <div className="space-y-1">
        <table className="min-w-full">
          <thead className="bg-mf-sally-500/15 rounded-lg">
            <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
              <th className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center gap-1">
                  Rank
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center gap-1">
                  UUID
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center justify-end gap-1">
                  Weight
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-mf-ash-500/15">
            <tr className="cursor-pointer hover:bg-mf-ash-500/30 outline outline-2 outline-mf-ash-300 outline-offset-[-1px] rounded-lg bg-mf-ash-500/15 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
              <td colSpan={3} className="whitespace-nowrap px-6 py-4 text-center text-sm text-mf-edge-700 font-poppins">
                Loading nodes...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-1">
        <table className="min-w-full">
          <thead className="bg-mf-sally-500/15 rounded-lg">
            <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
              <th className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center gap-1">
                  Rank
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center gap-1">
                  UUID
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center justify-end gap-1">
                  Weight
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-mf-ash-500/15">
            <tr className="cursor-pointer hover:bg-mf-ash-500/30 outline outline-2 outline-mf-ash-300 outline-offset-[-1px] rounded-lg bg-mf-ash-500/15 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
              <td colSpan={3} className="whitespace-nowrap px-6 py-4 text-center text-sm text-red-400 font-poppins">
                Error loading nodes: {error.message}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (searchTerm && filteredNodes.length === 0) {
    return (
      <div className="space-y-1">
        <table className="min-w-full">
          <thead className="bg-mf-sally-500/15 rounded-lg">
            <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
              <th className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center gap-1">
                  Rank
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center gap-1">
                  UUID
                </div>
              </th>
              <th className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins">
                <div className="flex items-center justify-end gap-1">
                  Weight
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-mf-ash-500/15">
            <tr className="cursor-pointer hover:bg-mf-ash-500/30 outline outline-2 outline-mf-ash-300 outline-offset-[-1px] rounded-lg bg-mf-ash-500/15 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
              <td colSpan={3} className="whitespace-nowrap px-6 py-4 text-center text-sm text-mf-edge-700 font-poppins">
                No nodes found matching {searchTerm}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <table className="min-w-full">
        <thead className="bg-mf-sally-500/15 rounded-lg">
          <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
            <th 
              style={{ width: '33%' }}
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins"
              onClick={() => handleSort(SortField.RANK)}
            >
              <div className="flex items-center gap-1">
                Rank
                {getIcon(SortField.RANK)}
              </div>
            </th>
            <th 
              style={{ width: '20%' }}
              className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins"
              onClick={() => handleSort(SortField.UID)}
            >
              <div className="flex items-center gap-1">
                UUID
                {getIcon(SortField.UID)}
              </div>
            </th>
            <th 
              style={{ width: '30%' }}
              className="cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 font-poppins"
              onClick={() => handleSort(SortField.WEIGHT)}
            >
              <div className="flex items-center justify-end gap-1">
                Weight
                {getIcon(SortField.WEIGHT)}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-mf-ash-500/15">
          {sorted.map((node, idx: number) => (
            <tr
              key={idx}
              onClick={() => onNavigateToMiner(node.uid)}
              className="cursor-pointer hover:bg-mf-ash-500/30 bg-mf-ash-500/15 outline outline-2 outline-mf-ash-300 outline-offset-[-1px] rounded-lg [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg"
            >
              <td style={{ width: '33%' }} className="whitespace-nowrap px-6 py-4 text-left text-sm text-mf-edge-700 font-poppins">
                {node.rank}
              </td>
              <td style={{ width: '20%' }} className="whitespace-nowrap px-6 py-4 font-poppins text-sm text-mf-sally-300">
                {node.uid}
              </td>
              <td style={{ width: '30%' }} className="whitespace-nowrap px-6 py-4 text-end text-sm font-poppins text-mf-sybil-500">
                {((weightMap.get(node.uid) ?? 0) * 100).toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeightTable;
