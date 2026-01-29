"use client";

import BlockSelector from "@/app/_components/BlockSelector";
import Search from "@/app/_components/Search";
import {
  RiArrowDownSFill,
  RiArrowUpSFill,
  RiExpandUpDownFill,
} from "@remixicon/react";
import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc" | null;

export type TableColumn<T> = {
  key: string;
  label: ReactNode;
  sortable?: boolean;
  renderHeader?: (props: {
    sortDirection: SortDirection;
    onSort: () => void;
    isSorted: boolean;
  }) => ReactNode;
  renderCell: (row: T, index: number) => ReactNode;
  className?: string;
  width?: string;
};

type TableProps<T> = {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  error?: Error | null;
  title?: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onSearchClear?: () => void;
  onSearchEnter?: (uid: string) => void;
  block?: number;
  latestBlock?: number;
  onBlockChange?: (block: number) => void;
  emptyMessage?: string;
  emptySearchMessage?: (searchTerm: string) => string;
  getRowKey: (row: T, index: number) => string | number;
  sortField?: string | null;
  sortDirection?: SortDirection;
  onSort?: (field: string) => void;
};

export default function Table<T>({
  data,
  columns,
  isLoading = false,
  error = null,
  title,
  searchTerm = "",
  onSearchChange,
  onSearchClear,
  onSearchEnter,
  block,
  latestBlock,
  onBlockChange,
  emptyMessage = "No data found",
  emptySearchMessage = (term) => `No results found matching ${term}`,
  getRowKey,
  sortField = null,
  sortDirection = null,
  onSort,
}: TableProps<T>) {
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
              className="h-10 w-full bg-mf-night-300 rounded-lg animate-skeleton-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const SortIcon = ({ field }: { field: string }) => {
    const isSorted = sortField === field;
    const isAsc = sortDirection === "asc";

    if (!isSorted) {
      return (
        <RiExpandUpDownFill className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
      );
    }

    return isAsc ? (
      <RiArrowUpSFill className="h-4 w-4 text-mf-sybil-500" />
    ) : (
      <RiArrowDownSFill className="h-4 w-4 text-mf-sybil-500" />
    );
  };

  const handleSort = (field: string) => {
    if (!onSort) return;
    onSort(field);
  };

  return (
    <div className="rounded-lg border border-mf-border-600 bg-mf-night-450 p-4">
      <div className="flex items-center px-3">
        {title && <h2 className="flex-1">{title}</h2>}
        {onSearchChange && (
          <div className="hidden md:flex flex-1 justify-center">
            <div className="max-w-xs w-full">
              <Search
                value={searchTerm}
                onChange={onSearchChange}
                onClear={onSearchClear || (() => onSearchChange(""))}
                onEnter={onSearchEnter}
              />
            </div>
          </div>
        )}
        {block !== undefined && latestBlock !== undefined && onBlockChange && (
          <div className="hidden md:flex flex-1 justify-end">
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
              {columns.map((column) => {
                const isSorted = sortField === column.key;
                const currentSortDirection = isSorted ? sortDirection : null;

                return (
                  <th
                    key={column.key}
                    className={`text-left py-3 px-4 text-sm font-semibold ${
                      column.sortable !== false && onSort
                        ? "group cursor-pointer hover:text-mf-edge-300 transition-colors"
                        : ""
                    } ${column.className || ""}`}
                    style={
                      column.width
                        ? { width: column.width, whiteSpace: "nowrap" }
                        : { whiteSpace: "nowrap" }
                    }
                    onClick={
                      column.sortable !== false && onSort
                        ? () => handleSort(column.key)
                        : undefined
                    }
                  >
                    {column.renderHeader ? (
                      column.renderHeader({
                        sortDirection: currentSortDirection,
                        onSort: () => handleSort(column.key),
                        isSorted: isSorted,
                      })
                    ) : (
                      <div className="flex items-center gap-1">
                        {column.label}
                        {column.sortable !== false && onSort && (
                          <SortIcon field={column.key} />
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr className="border-b border-mf-border-600">
                <td
                  colSpan={columns.length}
                  className="py-3 px-4 text-sm text-red-400 text-center"
                >
                  Error loading data: {error.message}
                </td>
              </tr>
            ) : searchTerm && data.length === 0 ? (
              <tr className="border-b border-mf-border-600">
                <td
                  colSpan={columns.length}
                  className="py-3 px-4 text-sm text-mf-edge-700 text-center"
                >
                  {emptySearchMessage(searchTerm)}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr className="border-b border-mf-border-600">
                <td
                  colSpan={columns.length}
                  className="py-3 px-4 text-sm text-mf-edge-700 text-center"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={getRowKey(row, idx)}
                  className="border-b border-mf-border-600 hover:bg-mf-ash-500/30 transition-colors animate-fade-in-row"
                  style={{
                    animationDelay: `${idx * 0.05}s`,
                    opacity: 0,
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`py-3 px-4 text-sm ${column.className || ""}`}
                      style={
                        column.width
                          ? { width: column.width, whiteSpace: "nowrap" }
                          : { whiteSpace: "nowrap" }
                      }
                    >
                      {column.renderCell(row, idx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
