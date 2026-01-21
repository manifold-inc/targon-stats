"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Copy } from "lucide-react";

import { copyToClipboard } from "@/utils/utils";

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
  weights?: { uids: number[]; incentives: number[] };
  hotkeyToUid: Record<string, string>;
  searchTerm: string;
  onNavigateToMiner: (uid: string) => void;
  isLoading: boolean;
  error: Error | null;
}

const WeightTable = ({
  weights,
  hotkeyToUid,
  onNavigateToMiner,
  isLoading,
  error,
}: WeightTableProps) => {
  const [field, setField] = useState<SortField>(SortField.NULL);
  const [direction, setDirection] = useState<SortDirection>(SortDirection.NULL);
  const [copiedHotkey, setCopiedHotkey] = useState<string | null>(null);

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

  const uids = weights?.uids ?? [];
  const incentive = weights?.incentives ?? [];

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
                <th className="font-poppins cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                  <div className="flex items-center gap-1">Hotkey</div>
                </th>
                <th className="font-poppins cursor-pointer px-2 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
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
                  className="font-poppins whitespace-nowrap px-2 py-4 text-center text-sm text-mf-edge-700 md:px-6"
                >
                  Loading nodes...
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
                <th className="font-poppins cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700">
                  <div className="flex items-center gap-1">Hotkey</div>
                </th>
                <th className="font-poppins cursor-pointer px-2 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6">
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
                  className="font-poppins whitespace-nowrap px-2 py-4 text-center text-sm text-red-400 md:px-6"
                >
                  Error loading nodes: {error.message}
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
                style={{ width: "30%" }}
                className="font-poppins cursor-pointer px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6"
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
                className="font-poppins cursor-pointer px-2 py-3 text-end text-xs font-medium uppercase tracking-wider text-mf-sally-500 hover:bg-gray-700 md:px-6"
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
            {uids.map((uid, idx: number) => (
              <tr
                key={uid}
                onClick={() => onNavigateToMiner(String(uid))}
                className="cursor-pointer rounded-lg bg-mf-ash-500/15 outline outline-2 outline-offset-[-1px] outline-mf-ash-300/25 hover:bg-mf-ash-500/30 [&>td:first-child]:rounded-l-lg [&>td:last-child]:rounded-r-lg"
              >
                <td
                  style={{ width: "30%" }}
                  className="font-poppins whitespace-nowrap px-2 py-4 text-xs text-mf-edge-700 md:px-6 md:text-sm"
                >
                  {uid}
                </td>
                <td
                  style={{ width: "40%" }}
                  className="font-poppins whitespace-nowrap px-6 py-4 text-sm text-mf-sally-300"
                >
                  <div className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80">
                    <span className="font-mono">
                      {hotkeyToUid[String(uid)] || "N/A"}
                    </span>
                    {hotkeyToUid[String(uid)] && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void copyToClipboard(
                            hotkeyToUid[String(uid)] ?? "",
                            String(uid),
                            setCopiedHotkey,
                            2000,
                          );
                        }}
                        className="text-mf-sally-300 transition-colors"
                        title="Copy hotkey"
                      >
                        {copiedHotkey === String(uid) ? (
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
                  className="font-poppins whitespace-nowrap px-2 py-4 text-end text-xs text-mf-sybil-500 md:px-6 md:text-sm"
                >
                  {((incentive[idx] ?? 0) * 100).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeightTable;
