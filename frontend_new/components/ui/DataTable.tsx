"use client";

import { useId } from "react";
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
      return (
        <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40 hover:opacity-100 transition-opacity" />
      );
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-[#14181F]" />
    ) : (
      <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-[#14181F]" />
    );
  };

  return (
    <div className="w-full space-y-3">
      {/* Search Header if supplied */}
      {onSearchChange && searchQuery !== undefined && (
        <div className="relative w-full max-w-xs">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A94A3]">
            <Search className="h-4 w-4" />
          </span>
          <input
            id={searchId}
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-full rounded-lg border border-[#E7E9EC] bg-white pl-9 pr-4 text-xs text-[#14181F] placeholder:text-[#8A94A3] transition-colors focus:border-[#14181F] focus:outline-none focus:ring-1 focus:ring-[#14181F]"
          />
        </div>
      )}

      {/* Table Container */}
      <div className="relative overflow-hidden rounded-xl border border-[#E7E9EC] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-10 bg-[#F6F7F8] border-b border-[#E7E9EC] select-none">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSortClick(col.key)}
                    className={cn(
                      "py-3 px-4 text-[11px] font-semibold text-[#55606D] uppercase tracking-wider",
                      col.sortable && "cursor-pointer hover:text-[#14181F] transition-colors",
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
            <tbody className="divide-y divide-[#E7E9EC] bg-white">
              {isLoading ? (
                Array.from({ length: pageSize || 5 }).map((_, rIdx) => (
                  <tr key={`skeleton-row-${rIdx}`} className="animate-pulse">
                    {columns.map((col, cIdx) => (
                      <td key={`skeleton-cell-${rIdx}-${cIdx}`} className="py-3.5 px-4">
                        <div
                          className={cn(
                            "h-4 rounded bg-[#F6F7F8]",
                            col.align === "right"
                              ? "ml-auto"
                              : col.align === "center"
                              ? "mx-auto"
                              : "",
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
                      className="hover:bg-[#F6F7F8]/60 transition-colors duration-150"
                    >
                      {columns.map((col) => (
                        <td
                          key={`${rowId}-${col.key}`}
                          className={cn(
                            "py-3.5 px-4 text-[#14181F] text-[13px] leading-normal",
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
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#E7E9EC] bg-[#FFFFFF] px-4 py-3 gap-3">
            <div className="flex items-center gap-1.5 order-2 sm:order-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
                className="px-2.5 h-8 text-xs"
                aria-label="Previous page"
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = Math.min(currentPage - 2 + i, totalPages);
                }
                return (
                  <button
                    key={`page-btn-${pageNum}`}
                    onClick={() => onPageChange(pageNum)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors focus:outline-none cursor-pointer",
                      pageNum === currentPage
                        ? "bg-[#14181F] text-white"
                        : "text-[#55606D] hover:bg-[#F6F7F8] border border-transparent"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                className="px-2.5 h-8 text-xs"
                aria-label="Next page"
              >
                Next
              </Button>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-[#55606D] order-1 sm:order-2">
              {onPageSizeChange && (
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="h-7 rounded-md border border-[#E7E9EC] bg-white px-2 py-0.5 text-xs text-[#14181F] focus:outline-none focus:border-[#14181F] cursor-pointer"
                  >
                    {pageSizeOptions.map((opt) => (
                      <option key={`opt-${opt}`} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <span className="text-[#8A94A3]">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

