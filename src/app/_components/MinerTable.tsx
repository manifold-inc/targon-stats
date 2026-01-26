"use client";

import BlockSelector from "@/app/_components/BlockSelector";
import Search from "@/app/_components/Search";
import { filterByUidSearch } from "@/utils/utils";
import {
  RiArrowDownLine,
  RiArrowUpDownLine,
  RiArrowUpLine,
  RiFilterLine,
} from "@remixicon/react";
import { useEffect, useMemo, useRef, useState } from "react";

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

type SortField = "uid" | "payout" | "cards" | "compute_type";
type SortOrder = "asc" | "desc";
type ComputeTypeFilter = string;
type UidFilter = string;

export default function MinerTable({
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
}) {
  const [sortBy, setSortBy] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [computeTypeFilter, setComputeTypeFilter] =
    useState<ComputeTypeFilter>("all");
  const [uidFilter, setUidFilter] = useState<UidFilter>("all");
  const [showComputeTypeFilter, setShowComputeTypeFilter] = useState(false);
  const [showUidFilter, setShowUidFilter] = useState(false);
  const computeTypeFilterRef = useRef<HTMLDivElement>(null);
  const uidFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        computeTypeFilterRef.current &&
        !computeTypeFilterRef.current.contains(event.target as Node)
      ) {
        setShowComputeTypeFilter(false);
      }
      if (
        uidFilterRef.current &&
        !uidFilterRef.current.contains(event.target as Node)
      ) {
        setShowUidFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableComputeTypes = useMemo(() => {
    const types = new Set(nodes.map((node) => node.compute_type));
    return Array.from(types).sort();
  }, [nodes]);

  const availableUids = useMemo(() => {
    const uids = new Set(nodes.map((node) => node.uid));
    return Array.from(uids).sort((a, b) => Number(a) - Number(b));
  }, [nodes]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      if (sortOrder === "desc") {
        setSortOrder("asc");
      } else {
        setSortBy(null);
        setSortOrder("desc");
      }
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) {
      return (
        <RiArrowUpDownLine className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
      );
    }
    return sortOrder === "asc" ? (
      <RiArrowUpLine className="h-4 w-4 text-mf-sybil-500" />
    ) : (
      <RiArrowDownLine className="h-4 w-4 text-mf-sybil-500" />
    );
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

  const sorted = useMemo(() => {
    if (!sortBy) return filtered;

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
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
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filtered, sortBy, sortOrder]);

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
              <th className="text-left py-3 px-4 text-sm font-semibold relative">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSort("uid")}
                    className="group flex items-center gap-1 hover:text-mf-edge-300 transition-colors"
                  >
                    UUID
                    <SortIcon field="uid" />
                  </button>
                  <div ref={uidFilterRef} className="relative">
                    <button
                      onClick={() => setShowUidFilter(!showUidFilter)}
                      className={`p-1 rounded hover:bg-mf-ash-500 transition-colors opacity-80 hover:opacity-100 ${
                        uidFilter !== "all"
                          ? "text-mf-sally-500"
                          : "text-mf-ash-300"
                      }`}
                    >
                      <RiFilterLine className="h-4 w-4" />
                    </button>

                    {showUidFilter && (
                      <div className="absolute top-full left-0 mt-1 bg-mf-night-500 border border-mf-border-600 rounded-md shadow-lg z-50 min-w-[200px] max-h-[300px] overflow-y-auto font-normal">
                        <button
                          onClick={() => {
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
                            onClick={() => {
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
              </th>
              <th
                onClick={() => handleSort("payout")}
                className="group text-left py-3 px-4 text-sm font-semibold cursor-pointer hover:text-mf-edge-300 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Payout
                  <SortIcon field="payout" />
                </div>
              </th>
              <th
                onClick={() => handleSort("cards")}
                className="group text-left py-3 px-4 text-sm font-semibold cursor-pointer hover:text-mf-edge-300 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span className="hidden md:inline">Number of </span>
                  <span className="md:hidden">#</span> Cards
                  <SortIcon field="cards" />
                </div>
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold relative">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSort("compute_type")}
                    className="group flex items-center gap-1 hover:text-mf-edge-300 transition-colors"
                  >
                    <span className="md:hidden">Compute</span>
                    <span className="hidden md:inline">Compute Type</span>
                    <SortIcon field="compute_type" />
                  </button>
                  <div ref={computeTypeFilterRef} className="relative">
                    <button
                      onClick={() =>
                        setShowComputeTypeFilter(!showComputeTypeFilter)
                      }
                      className={`p-1 rounded hover:bg-mf-ash-500 transition-colors opacity-80 hover:opacity-100 ${
                        computeTypeFilter !== "all"
                          ? "text-mf-sally-500"
                          : "text-mf-ash-300"
                      }`}
                    >
                      <RiFilterLine className="h-4 w-4" />
                    </button>

                    {showComputeTypeFilter && (
                      <div className="absolute top-full left-0 mt-1 bg-mf-night-500 border border-mf-border-600 rounded-md shadow-lg z-50 min-w-[200px] font-normal">
                        <button
                          onClick={() => {
                            setComputeTypeFilter("all");
                            setShowComputeTypeFilter(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-mf-ash-500 transition-colors text-sm ${
                            computeTypeFilter === "all"
                              ? "text-mf-sally-500"
                              : ""
                          }`}
                        >
                          All
                        </button>
                        {availableComputeTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              setComputeTypeFilter(type);
                              setShowComputeTypeFilter(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-mf-ash-500 transition-colors text-sm ${
                              computeTypeFilter === type
                                ? "text-mf-sally-500"
                                : ""
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr className="border-b border-mf-border-600">
                <td
                  colSpan={4}
                  className="py-3 px-4 text-sm text-red-400 text-center"
                >
                  Error loading miners: {error.message}
                </td>
              </tr>
            ) : searchTerm && sorted.length === 0 ? (
              <tr className="border-b border-mf-border-600">
                <td
                  colSpan={4}
                  className="py-3 px-4 text-sm text-mf-edge-700 text-center"
                >
                  No miners found matching {searchTerm}
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr className="border-b border-mf-border-600">
                <td
                  colSpan={4}
                  className="py-3 px-4 text-sm text-mf-edge-700 text-center"
                >
                  No miners found
                </td>
              </tr>
            ) : (
              sorted.map((node, idx) => (
                <tr
                  key={idx}
                  className="border-b border-mf-border-600 hover:bg-mf-ash-500/30 transition-colors animate-fade-in-row"
                  style={{
                    animationDelay: `${idx * 0.05}s`,
                    opacity: 0,
                  }}
                >
                  <td className="py-3 px-4 text-sm text-mf-milk-500">
                    {node.uid}
                  </td>
                  <td className="py-3 px-4 text-sm text-mf-sybil-300">
                    ${(node.payout / node.cards).toFixed(2)} per hour
                  </td>
                  <td className="py-3 px-4 text-sm text-mf-sally-500">
                    {node.cards} Card{node.cards > 1 ? "s" : ""}
                  </td>
                  <td className="py-3 px-4 text-sm text-mf-sally-300">
                    {node.compute_type}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
