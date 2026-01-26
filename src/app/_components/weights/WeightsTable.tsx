"use client";

import Table, {
  type SortDirection,
  type TableColumn,
} from "@/app/_components/Table";
import { copyToClipboard } from "@/utils/utils";
import {
  RiArrowDownSFill,
  RiArrowUpSFill,
  RiExpandUpDownFill,
  RiFileCopyFill,
  RiFileCopyLine,
} from "@remixicon/react";
import { useMemo, useState } from "react";

enum SortField {
  UID = "uid",
  HOTKEY = "hotkey",
  WEIGHT = "weight",
}

const WeightsTable = ({
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
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [copiedHotkey, setCopiedHotkey] = useState<string | null>(null);

  const uids = weights?.uids ?? [];
  const incentive = weights?.incentives ?? [];

  const filteredUids = useMemo(() => {
    return searchTerm
      ? uids.filter((uid) => String(uid).includes(searchTerm))
      : uids;
  }, [uids, searchTerm]);

  const getIncentiveForUid = (uid: number) => {
    const originalIdx = uids.indexOf(uid);
    return incentive[originalIdx] ?? 0;
  };

  const handleSort = (field: string) => {
    const sortFieldEnum = field as SortField;
    if (sortField === sortFieldEnum) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(sortFieldEnum);
      setSortDirection("asc");
    }
  };

  const sortedUids = useMemo(() => {
    if (!sortField || !sortDirection) {
      return filteredUids;
    }

    return [...filteredUids].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
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

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredUids, sortField, sortDirection, hotkeyToUid]);

  const SortIcon = ({
    isSorted,
    sortDirection,
  }: {
    isSorted: boolean;
    sortDirection: SortDirection;
  }) => {
    if (!isSorted) {
      return (
        <RiExpandUpDownFill className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
      );
    }

    return sortDirection === "asc" ? (
      <RiArrowUpSFill className="h-4 w-4 text-mf-sybil-500" />
    ) : (
      <RiArrowDownSFill className="h-4 w-4 text-mf-sybil-500" />
    );
  };

  const columns: TableColumn<number>[] = [
    {
      key: SortField.UID,
      label: "UUID",
      renderCell: (uid) => <span className="text-mf-milk-500">{uid}</span>,
    },
    {
      key: SortField.HOTKEY,
      label: "Hotkey",
      renderCell: (uid) => (
        <div className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <span className="font-mono text-mf-milk-500">
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
      ),
    },
    {
      key: SortField.WEIGHT,
      label: "Weight",
      renderCell: (uid) => (
        <span className="text-mf-sally-500">
          {(getIncentiveForUid(uid) * 100).toFixed(2)}%
        </span>
      ),
    },
  ];

  return (
    <Table<number>
      data={sortedUids}
      columns={columns}
      isLoading={isLoading}
      error={error}
      title={title}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      onSearchClear={onSearchClear}
      block={block}
      latestBlock={latestBlock}
      onBlockChange={onBlockChange}
      emptyMessage="No nodes found"
      emptySearchMessage={(term) => `No nodes found matching ${term}`}
      getRowKey={(uid) => uid}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={handleSort}
    />
  );
};

export default WeightsTable;
