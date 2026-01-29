"use client";

import Table, {
  type SortDirection,
  type TableColumn,
} from "@/app/_components/Table";
import { type MinerNodes } from "@/types";
import { useClickOutside } from "@/utils/useClickOutside";
import { filterByUidSearch } from "@/utils/utils";
import {
  RiArrowDownSFill,
  RiArrowUpSFill,
  RiExpandUpDownFill,
  RiFilterFill,
} from "@remixicon/react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

type SortField = "uid" | "payout" | "cards" | "compute_type" | "weight";
type ComputeTypeFilter = string;
type UidFilter = string;

export default function MinersTable({
  nodes,
  isLoading,
  error,
  searchTerm,
  title = "Miner Nodes",
  block,
  latestBlock,
  onBlockChange,
  onSearchChange,
  onSearchClear,
  onSearchEnter,
  weights,
}: {
  nodes: MinerNodes[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  title?: string;
  block?: number;
  latestBlock?: number;
  onBlockChange?: (block: number) => void;
  onSearchChange?: (term: string) => void;
  onSearchClear?: () => void;
  onSearchEnter?: (uid: string) => void;
  weights?: { uids: number[]; incentives: number[] };
}) {
  const [sortField, setSortField] = useState<SortField | null>("weight");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [computeTypeFilter, setComputeTypeFilter] =
    useState<ComputeTypeFilter>("all");
  const [uidFilter, setUidFilter] = useState<UidFilter>("all");
  const [showComputeTypeFilter, setShowComputeTypeFilter] = useState(false);
  const [showUidFilter, setShowUidFilter] = useState(false);
  const computeTypeFilterRef = useRef<HTMLDivElement>(null);
  const uidFilterRef = useRef<HTMLDivElement>(null);

  useClickOutside([computeTypeFilterRef, uidFilterRef], () => {
    setShowComputeTypeFilter(false);
    setShowUidFilter(false);
  });

  const availableComputeTypes = useMemo(() => {
    const types = new Set(nodes.map((node) => node.compute_type));
    return Array.from(types).sort();
  }, [nodes]);

  const availableUids = useMemo(() => {
    const uids = new Set(nodes.map((node) => node.uid));
    return Array.from(uids).sort((a, b) => Number(a) - Number(b));
  }, [nodes]);

  const handleSort = (field: string) => {
    const sortFieldEnum = field as SortField;
    if (sortField === sortFieldEnum) {
      if (sortDirection === "desc") {
        setSortDirection("asc");
      } else {
        setSortField(null);
        setSortDirection("desc");
      }
    } else {
      setSortField(sortFieldEnum);
      setSortDirection("desc");
    }
  };

  const filtered = useMemo(() => {
    let result = filterByUidSearch(nodes, searchTerm);

    if (uidFilter !== "all") {
      result = result.filter((node) => node.uid === uidFilter);
    }

    if (computeTypeFilter !== "all") {
      result = result.filter((node) => node.compute_type === computeTypeFilter);
    }

    return result;
  }, [nodes, searchTerm, uidFilter, computeTypeFilter]);

  const getWeightForUid = useMemo(() => {
    if (!weights?.uids || !weights?.incentives) {
      return () => 0;
    }
    const weightMap = new Map<number, number>();
    weights.uids.forEach((uid, index) => {
      weightMap.set(uid, weights.incentives[index] ?? 0);
    });
    return (uid: string) => weightMap.get(Number(uid)) ?? 0;
  }, [weights]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "uid":
          comparison = Number(a.uid) - Number(b.uid);
          break;
        case "payout":
          comparison = a.payout / a.cards - b.payout / b.cards;
          break;
        case "cards":
          comparison = a.cards - b.cards;
          break;
        case "compute_type":
          comparison =
            a.compute_type < b.compute_type
              ? -1
              : a.compute_type > b.compute_type
                ? 1
                : 0;
          break;
        case "weight":
          comparison = getWeightForUid(a.uid) - getWeightForUid(b.uid);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filtered, sortField, sortDirection, getWeightForUid]);

  const columns: TableColumn<MinerNodes>[] = [
    {
      key: "uid",
      label: "UUID",
      width: "25%",
      renderHeader: ({ sortDirection, onSort, isSorted }) => (
        <div className="flex items-center group">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSort();
            }}
            className="group flex items-center gap-1 hover:text-mf-edge-300 transition-colors"
          >
            UUID
            {isSorted ? (
              sortDirection === "asc" ? (
                <RiArrowUpSFill className="h-4 w-4 text-mf-sybil-500" />
              ) : (
                <RiArrowDownSFill className="h-4 w-4 text-mf-sybil-500" />
              )
            ) : (
              <RiExpandUpDownFill className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
            )}
          </button>
          <div ref={uidFilterRef} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowUidFilter(!showUidFilter);
              }}
              className={`p-1 rounded opacity-0 group-hover:opacity-80 transition-opacity ${
                uidFilter !== "all" ? "text-mf-sally-500" : "text-mf-ash-300"
              }`}
            >
              <RiFilterFill className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity" />
            </button>

            {showUidFilter && (
              <div className="absolute top-full left-0 mt-1 bg-mf-night-500 border border-mf-border-600 rounded-md shadow-lg z-50 min-w-[200px] max-h-[300px] overflow-y-auto font-normal">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUidFilter("all");
                    setShowUidFilter(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-mf-ash-500 transition-colors text-sm ${
                    uidFilter === "all" ? "text-mf-sally-500" : ""
                  }`}
                >
                  All
                </button>
                {availableUids.map((uid) => (
                  <button
                    key={uid}
                    onClick={(e) => {
                      e.stopPropagation();
                      setUidFilter(uid);
                      setShowUidFilter(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-mf-ash-500 transition-colors text-sm ${
                      uidFilter === uid ? "text-mf-sally-500" : ""
                    }`}
                  >
                    {uid}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
      renderCell: (node) => (
        <Link
          href={`/miners/${node.uid}`}
          className="text-mf-milk-500 hover:text-mf-edge-300 transition-colors cursor-pointer"
        >
          {node.uid}
        </Link>
      ),
    },
    {
      key: "payout",
      label: "Payout",
      width: "30%",
      renderCell: (node) => (
        <span className="text-mf-sybil-300">
          ${(node.payout / node.cards).toFixed(2)} per hour
        </span>
      ),
    },
    {
      key: "cards",
      label: (
        <>
          <span className="hidden md:inline">Number of </span>
          <span className="md:hidden">#</span> Cards
        </>
      ),
      width: "25%",
      renderCell: (node) => (
        <span className="text-mf-sally-500">
          {node.cards} Card{node.cards > 1 ? "s" : ""}
        </span>
      ),
    },
    {
      key: "compute_type",
      label: "Compute Type",
      width: "20%",
      renderHeader: ({ sortDirection, onSort, isSorted }) => (
        <div className="flex items-center group">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSort();
            }}
            className="group flex items-center gap-1 hover:text-mf-edge-300 transition-colors"
          >
            <span className="md:hidden">Compute</span>
            <span className="hidden md:inline">Compute Type</span>
            {isSorted ? (
              sortDirection === "asc" ? (
                <RiArrowUpSFill className="h-4 w-4 text-mf-sybil-500" />
              ) : (
                <RiArrowDownSFill className="h-4 w-4 text-mf-sybil-500" />
              )
            ) : (
              <RiExpandUpDownFill className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
            )}
          </button>
          <div ref={computeTypeFilterRef} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComputeTypeFilter(!showComputeTypeFilter);
              }}
              className={`p-1 rounded opacity-0 group-hover:opacity-80 transition-opacity ${
                computeTypeFilter !== "all"
                  ? "text-mf-sally-500"
                  : "text-mf-ash-300"
              }`}
            >
              <RiFilterFill className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity" />
            </button>

            {showComputeTypeFilter && (
              <div className="absolute top-full left-0 mt-1 bg-mf-night-500 border border-mf-border-600 rounded-md shadow-lg z-50 min-w-[250px] font-normal">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setComputeTypeFilter("all");
                    setShowComputeTypeFilter(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-mf-ash-500 transition-colors text-sm ${
                    computeTypeFilter === "all" ? "text-mf-sally-500" : ""
                  }`}
                >
                  All
                </button>
                {availableComputeTypes.map((type) => (
                  <button
                    key={type}
                    onClick={(e) => {
                      e.stopPropagation();
                      setComputeTypeFilter(type);
                      setShowComputeTypeFilter(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-mf-ash-500 transition-colors text-sm ${
                      computeTypeFilter === type ? "text-mf-sally-500" : ""
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
      renderCell: (node) => (
        <span className="text-mf-sally-300">{node.compute_type}</span>
      ),
    },
  ];

  return (
    <Table<MinerNodes>
      data={sorted}
      columns={columns}
      isLoading={isLoading}
      error={error}
      title={title}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      onSearchClear={onSearchClear}
      onSearchEnter={onSearchEnter}
      block={block}
      latestBlock={latestBlock}
      onBlockChange={onBlockChange}
      emptyMessage="No miners found"
      emptySearchMessage={(term) => `No miners found matching ${term}`}
      getRowKey={(node, idx) => idx}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={handleSort}
    />
  );
}
