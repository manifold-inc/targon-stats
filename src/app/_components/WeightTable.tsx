"use client";

import BlockSelector from "@/app/_components/BlockSelector";
import Search from "@/app/_components/Search";
import { copyToClipboard } from "@/utils/utils";
import {
  RiArrowDownLine,
  RiArrowUpDownLine,
  RiArrowUpLine,
  RiFileCopyFill,
  RiFileCopyLine,
} from "@remixicon/react";
import { useState } from "react";

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

const WeightTable = ({
  weights,
  hotkeyToUid,
  isLoading,
  error,
  title = "Miner Weights",
  block,
  latestBlock,
  onBlockChange,
  onSearchChange,
  onSearchClear,
  searchTerm,
}: {
  weights?: { uids: number[]; incentives: number[] };
  hotkeyToUid: Record<string, string>;
  searchTerm: string;
  isLoading: boolean;
  error: Error | null;
  title?: string;
  block?: number;
  latestBlock?: number;
  onBlockChange?: (block: number) => void;
  onSearchChange?: (term: string) => void;
  onSearchClear?: () => void;
}) => {
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

  const uids = weights?.uids ?? [];
  const incentive = weights?.incentives ?? [];

  const filteredUids = searchTerm
    ? uids.filter((uid) => String(uid).includes(searchTerm))
    : uids;

  const getIncentiveForUid = (uid: number) => {
    const originalIdx = uids.indexOf(uid);
    return incentive[originalIdx] ?? 0;
  };

  const sortedUids = (() => {
    if (field === SortField.NULL || direction === SortDirection.NULL) {
      return filteredUids;
    }

    return [...filteredUids].sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case SortField.UID:
          comparison = Number(a) - Number(b);
          break;
        case SortField.HOTKEY:
          const hotkeyA = hotkeyToUid[String(a)] || "";
          const hotkeyB = hotkeyToUid[String(b)] || "";
          comparison = hotkeyA.localeCompare(hotkeyB);
          break;
        case SortField.WEIGHT:
          comparison = getIncentiveForUid(a) - getIncentiveForUid(b);
          break;
      }

      return direction === SortDirection.ASC ? comparison : -comparison;
    });
  })();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-4">
        <div className="flex items-center px-3 mb-4">
          {title && <h2 className="flex-1">{title}</h2>}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-10 w-full bg-mf-night-300 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-4">
      <div className="flex items-center px-3">
        {title && <h2 className="flex-1">{title}</h2>}
        {onSearchChange && (
          <div className="flex-1 flex justify-center">
            <div className="max-w-xs w-full">
              <Search
                value={searchTerm}
                onChange={onSearchChange}
                onClear={onSearchClear || (() => onSearchChange(""))}
              />
            </div>
          </div>
        )}
        {block !== undefined && latestBlock !== undefined && onBlockChange && (
          <div className="flex-1 flex justify-end">
            <div className="max-w-xs flex-1 sm:max-w-none sm:flex-initial">
              <BlockSelector
                block={block}
                latestBlock={latestBlock}
                isLoading={isLoading}
                onBlockChange={onBlockChange}
                searchTerm={searchTerm}
              />
            </div>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-mf-border-600">
              <th
                onClick={() => handleSort(SortField.UID)}
                className="group text-left py-3 px-4 text-sm font-semibold cursor-pointer hover:text-mf-edge-300 transition-colors"
              >
                <div className="flex items-center gap-1">
                  UUID
                  {getIcon(SortField.UID)}
                </div>
              </th>
              <th
                onClick={() => handleSort(SortField.HOTKEY)}
                className="group text-left py-3 px-4 text-sm font-semibold cursor-pointer hover:text-mf-edge-300 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Hotkey
                  {getIcon(SortField.HOTKEY)}
                </div>
              </th>
              <th
                onClick={() => handleSort(SortField.WEIGHT)}
                className="group text-left py-3 px-4 text-sm font-semibold cursor-pointer hover:text-mf-edge-300 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Weight
                  {getIcon(SortField.WEIGHT)}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr className="border-b border-mf-border-600">
                <td
                  colSpan={3}
                  className="py-3 px-4 text-sm text-red-400 text-center"
                >
                  Error loading nodes: {error.message}
                </td>
              </tr>
            ) : searchTerm && filteredUids.length === 0 ? (
              <tr className="border-b border-mf-border-600">
                <td
                  colSpan={3}
                  className="py-3 px-4 text-sm text-mf-edge-700 text-center"
                >
                  No nodes found matching {searchTerm}
                </td>
              </tr>
            ) : filteredUids.length === 0 ? (
              <tr className="border-b border-mf-border-600">
                <td
                  colSpan={3}
                  className="py-3 px-4 text-sm text-mf-edge-700 text-center"
                >
                  No nodes found
                </td>
              </tr>
            ) : (
              sortedUids.map((uid, _idx: number) => (
                <tr
                  key={uid}
                  className="border-b border-mf-border-600 transition-colors animate-fade-in-row"
                  style={{
                    animationDelay: `${_idx * 0.05}s`,
                    opacity: 0,
                  }}
                >
                  <td className="py-3 px-4 text-sm text-mf-milk-500">{uid}</td>
                  <td className="py-3 px-4 text-sm text-mf-milk-500">
                    <div className="flex items-center gap-2 transition-opacity hover:opacity-80">
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
                              2000
                            );
                          }}
                          className="transition-colors"
                          title="Copy hotkey"
                        >
                          {copiedHotkey === String(uid) ? (
                            <RiFileCopyFill className="h-4 w-4 text-mf-sally-500" />
                          ) : (
                            <RiFileCopyLine className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-mf-sally-500">
                    {(getIncentiveForUid(uid) * 100).toFixed(2)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeightTable;
