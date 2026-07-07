"use client";

import { useId, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Input } from "./Input";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  
  // Sorting (Controlled/Optional)
  sortKey?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string, order: "asc" | "desc") => void;

  // Pagination (Controlled/Optional)
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];

  // Search (Controlled/Optional)
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;

  // Key extractor
  getRowId?: (item: T) => string | number;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyTitle = "No records found",
  emptyDescription = "There are no entries recorded in this list yet.",
  emptyIcon,
  emptyAction,

  sortKey,
  sortOrder,
  onSort,

  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],

  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search records...",

  getRowId,
}: DataTableProps<T>) {
  const searchId = useId();

  const handleSortClick = (columnKey: string) => {
    if (!onSort) return;
    
    let nextOrder: "asc" | "desc" = "asc";
    if (sortKey === columnKey) {
      nextOrder = sortOrder === "asc" ? "desc" : "asc";
    }
    onSort(columnKey, nextOrder);
  };

  const renderSortIndicator = (col: Column<T>) => {
    if (!col.sortable || !onSort) return null;
    if (sortKey !== col.key) {
      return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40 hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-[var(--color-primary)]" />
    ) : (
      <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-[var(--color-primary)]" />
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Header */}
      {onSearchChange && searchQuery !== undefined && (
        <div className="relative w-full max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            id={searchId}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white pl-9 pr-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
          />
        </div>
      )}

      {/* Table Container */}
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-light)] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[var(--color-bg-muted)] border-b border-[var(--color-border)] select-none">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSortClick(col.key)}
                    className={cn(
                      "py-3 px-4 text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]",
                      col.sortable && "cursor-pointer hover:text-[var(--color-text-primary)] transition-colors",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      col.className
                    )}
                  >
                    <span className="inline-flex items-center">
                      {col.header}
                      {renderSortIndicator(col)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-light)] bg-white">
              {isLoading ? (
                // Skeletons
                Array.from({ length: pageSize }).map((_, rIdx) => (
                  <tr key={`skeleton-row-${rIdx}`} className="animate-pulse">
                    {columns.map((col, cIdx) => (
                      <td key={`skeleton-cell-${rIdx}-${cIdx}`} className="py-4 px-4">
                        <div
                          className={cn(
                            "h-4 rounded bg-[var(--color-bg-skeleton)]",
                            col.align === "right" ? "ml-auto" : col.align === "center" ? "mx-auto" : "",
                            cIdx % 2 === 0 ? "w-2/3" : "w-1/2"
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-0">
                    <EmptyState
                      icon={emptyIcon}
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction}
                      className="border-none shadow-none rounded-none py-12"
                    />
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => {
                  const rowId = getRowId ? getRowId(item) : idx;
                  return (
                    <tr
                      key={rowId}
                      className="hover:bg-[var(--color-bg-muted)]/40 transition-colors duration-[var(--transition-fast)]"
                    >
                      {columns.map((col) => (
                        <td
                          key={`${rowId}-${col.key}`}
                          className={cn(
                            "py-3.5 px-4 text-[var(--color-text-primary)] leading-normal",
                            col.align === "center" && "text-center",
                            col.align === "right" && "text-right",
                            col.className
                          )}
                        >
                          {col.render ? col.render(item) : (item as any)[col.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Controls */}
        {!isLoading && data.length > 0 && onPageChange && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[var(--color-border)] bg-white px-5 py-3.5 gap-4">
            <div className="flex items-center gap-1.5 order-2 sm:order-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
                className="px-2"
                aria-label="Previous page"
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={`page-btn-${n}`}
                  onClick={() => onPageChange(n)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-xs font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]",
                    n === currentPage
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]"
                  )}
                >
                  {n}
                </button>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                rightIcon={<ChevronRight className="h-4 w-4" />}
                className="px-2"
                aria-label="Next page"
              />
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-[var(--color-text-secondary)] order-1 sm:order-2">
              {onPageSizeChange && (
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="h-8 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-2 pr-6 py-1 text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer appearance-none relative"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238A929C'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 6px center",
                      backgroundSize: "12px",
                    }}
                  >
                    {pageSizeOptions.map((opt) => (
                      <option key={`opt-${opt}`} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <span>per page</span>
                </div>
              )}
              <span className="text-[var(--color-text-muted)] font-normal">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
