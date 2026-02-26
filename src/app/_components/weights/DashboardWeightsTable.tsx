"use client";

import Table, {
  type SortDirection,
  type TableColumn,
} from "@/app/_components/Table";
import { copyToClipboard } from "@/utils/utils";
import {
  RiCheckboxBlankLine,
  RiCheckboxLine,
  RiCheckboxMultipleBlankLine,
  RiCheckboxMultipleLine,
} from "@remixicon/react";
import { useMemo, useState } from "react";

enum SortField {
  UID = "uid",
  HOTKEY = "hotkey",
  SELECT = "select",
}

export default function DashboardWeightsTable({
  weights,
  hotkeyToUid,
  isLoading,
  error,
  title,
  selectedUid,
  onSelectedUidChange,
}: {
  weights?: { uids: number[]; incentives: number[] };
  hotkeyToUid: Record<string, string>;
  isLoading: boolean;
  error: Error | null;
  title?: string;
  selectedUid?: number | null;
  onSelectedUidChange?: (uid: number | null) => void;
}) {
  const [sortField, setSortField] = useState<SortField | null>(SortField.UID);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [copiedHotkey, setCopiedHotkey] = useState<string | null>(null);
  const [internalSelectedUid, setInternalSelectedUid] = useState<number | null>(
    null
  );
  const selectedUidValue =
    selectedUid !== undefined ? selectedUid : internalSelectedUid;
  const setSelectedUidValue = onSelectedUidChange ?? setInternalSelectedUid;

  const uids = useMemo(() => weights?.uids ?? [], [weights?.uids]);

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
      return uids;
    }

    return [...uids].sort((a, b) => {
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
        case SortField.SELECT:
          comparison =
            (selectedUidValue === a ? 1 : 0) - (selectedUidValue === b ? 1 : 0);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [uids, sortField, sortDirection, hotkeyToUid, selectedUidValue]);

  const handleRowClick = (uid: number) => {
    setSelectedUidValue(selectedUidValue === uid ? null : uid);
  };

  const columns: TableColumn<number>[] = [
    {
      key: SortField.UID,
      label: "UUID",
      width: "30%",
      renderCell: (uid) => (
        <div className="text-mf-milk-500 hover:text-mf-edge-300 transition-colors cursor-pointer">
          {uid}
        </div>
      ),
    },
    {
      key: SortField.HOTKEY,
      label: "Hotkey",
      width: "60%",
      renderCell: (uid) => (
        <div
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-mono text-mf-milk-500 hover:text-mf-edge-300 transition-colors cursor-pointer">
            {hotkeyToUid[String(uid)] || "N/A"}
          </div>
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
                <RiCheckboxMultipleLine className="h-4 w-4 text-mf-sally-500" />
              ) : (
                <RiCheckboxMultipleBlankLine className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      ),
    },
    {
      key: SortField.SELECT,
      label: "",
      width: "10%",
      sortable: false,
      renderCell: (uid) => (
        <div className="flex items-center justify-center">
          {selectedUidValue === uid ? (
            <RiCheckboxLine className="h-5 w-5 text-mf-sally-500" />
          ) : (
            <RiCheckboxBlankLine className="h-5 w-5 text-mf-milk-600" />
          )}
        </div>
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
      emptyMessage="No nodes found"
      getRowKey={(uid) => uid}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={handleSort}
      onRowClick={handleRowClick}
      selectedRowKey={selectedUidValue}
    />
  );
}
