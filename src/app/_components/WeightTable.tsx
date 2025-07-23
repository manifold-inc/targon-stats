"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Copy, Check } from "lucide-react";

import { type MinerNode } from "@/app/api/bids/route";
import { filterByUidSearch } from "@/utils/utils";

enum SortField {
  UID = "uid",
  HOTKEY = "hotkey",
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
  hotkeyToUid: Record<string, string>;
  searchTerm: string;
  onNavigateToMiner: (uid: string) => void;
  nodes: MinerNode[];
  isLoading: boolean;
  error: Error | null;
}

const WeightTable = ({
  weights,
  hotkeyToUid,
  searchTerm,
  onNavigateToMiner,
  nodes,
  isLoading,
  error,
}: WeightTableProps) => {
  const [field, setField] = useState<SortField>(SortField.NULL);
  const [direction, setDirection] = useState<SortDirection>(SortDirection.NULL);
  const [copiedHotkey, setCopiedHotkey] = useState<string | null>(null);

  const copyToClipboard = async (hotkey: string, uid: string) => {
    try {
      await navigator.clipboard.writeText(hotkey);
      setCopiedHotkey(uid);
      setTimeout(() => setCopiedHotkey(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
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
        case SortField.UID:
          return direction === SortDirection.ASC
            ? Number(a.uid) - Number(b.uid)
            : Number(b.uid) - Number(a.uid);
        case SortField.HOTKEY:
          const hotkeyA = hotkeyToUid[a.uid] ?? "";
          const hotkeyB = hotkeyToUid[b.uid] ?? "";
          return direction === SortDirection.ASC
            ? hotkeyA.localeCompare(hotkeyB)
            : hotkeyB.localeCompare(hotkeyA);
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
          <thead className="rounded-lg bg-mf-sally-500/15 outline outline-2 outline-mf-ash-300/25">
            <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
              <th className="font-poppins cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center gap-1">UUID</div>
              </th>
              <th className="font-poppins cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center gap-1">Hotkey</div>
              </th>
              <th className="font-poppins cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center justify-end gap-1">
                  Weight
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-mf-ash-500/15">
            <tr className="cursor-pointer rounded-lg bg-mf-ash-500/15 outline outline-2 outline-offset-[-1px] outline-mf-ash-300/25 hover:bg-mf-ash-500/30 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
              <td
                colSpan={3}
                className="font-poppins whitespace-nowrap px-6 py-4 text-center text-sm text-mf-edge-700"
              >
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
          <thead className="rounded-lg bg-mf-sally-500/15 outline outline-2 outline-offset-[0px] outline-mf-ash-300/25">
            <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
              <th className="font-poppins cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center gap-1">UUID</div>
              </th>
              <th className="font-poppins cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center gap-1">Hotkey</div>
              </th>
              <th className="font-poppins cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center justify-end gap-1">
                  Weight
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-mf-ash-500/15">
            <tr className="cursor-pointer rounded-lg bg-mf-ash-500/15 outline outline-2 outline-offset-[-1px] outline-mf-ash-300/25 hover:bg-mf-ash-500/30 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
              <td
                colSpan={3}
                className="font-poppins whitespace-nowrap px-6 py-4 text-center text-sm text-red-400"
              >
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
          <thead className="rounded-lg bg-mf-sally-500/15 outline outline-2 outline-offset-[0px] outline-mf-ash-300/25">
            <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
              <th className="font-poppins cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center gap-1">UUID</div>
              </th>
              <th className="font-poppins cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center gap-1">Hotkey</div>
              </th>
              <th className="font-poppins cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                <div className="flex items-center justify-end gap-1">
                  Weight
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-mf-ash-500/15">
            <tr className="cursor-pointer rounded-lg bg-mf-ash-500/15 outline outline-2 outline-offset-[-1px] outline-mf-ash-300/25 hover:bg-mf-ash-500/30 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg">
              <td
                colSpan={3}
                className="font-poppins whitespace-nowrap px-6 py-4 text-center text-sm text-mf-edge-700"
              >
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
        <thead className="rounded-lg bg-mf-sally-500/15 outline outline-2 outline-offset-[0px] outline-mf-ash-300/25">
          <tr className="[&>th:first-child]:rounded-l-lg [&>th:last-child]:rounded-r-lg">
            <th
              style={{ width: "30%" }}
              className="font-poppins cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700"
              onClick={() => handleSort(SortField.UID)}
            >
              <div className="flex items-center gap-1">
                UUID
                {getIcon(SortField.UID)}
              </div>
            </th>
            <th
              style={{ width: "40%" }}
              className="font-poppins cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700"
              onClick={() => handleSort(SortField.HOTKEY)}
            >
              <div className="flex items-center gap-1">
                Hotkey
                {getIcon(SortField.HOTKEY)}
              </div>
            </th>
            <th
              style={{ width: "30%" }}
              className="font-poppins cursor-pointer px-6 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700"
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
              className="cursor-pointer rounded-lg bg-mf-ash-500/15 outline outline-2 outline-offset-[-1px] outline-mf-ash-300/25 hover:bg-mf-ash-500/30 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg"
            >
              <td
                style={{ width: "30%" }}
                className="font-poppins whitespace-nowrap px-6 py-4 text-sm text-mf-edge-700"
              >
                {node.uid}
              </td>
              <td
                style={{ width: "40%" }}
                className="font-poppins whitespace-nowrap px-6 py-4 text-sm text-mf-sally-300"
              >
                <div className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                  <span className="font-mono">{hotkeyToUid[node.uid] || "N/A"}</span>
                  {hotkeyToUid[node.uid] && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(hotkeyToUid[node.uid] ?? "", node.uid);
                      }}
                      className="text-mf-sally-300 transition-colors"
                      title="Copy hotkey"
                    >
                      {copiedHotkey === node.uid ? (
                        <Check className="h-4 w-4 text-mf-sally-300" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </td>
              <td
                style={{ width: "30%" }}
                className="font-poppins whitespace-nowrap px-6 py-4 text-end text-sm text-mf-sybil-500"
              >
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
