"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Receipt,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { usePaymentsLedger } from "@/hooks/usePaymentsLedger";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import type { FinancialReportRow } from "@/types/report";

function TableSkeleton() {
  return (
    <tbody className="divide-y divide-slate-50">
      {[1, 2, 3, 4, 5].map((item) => (
        <tr key={item} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="h-4 w-28 rounded bg-slate-100" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-32 rounded bg-slate-100" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-20 rounded bg-slate-100" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-20 rounded bg-slate-100" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-20 rounded bg-slate-100" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-20 rounded bg-slate-100" />
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-16 rounded bg-slate-100" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

export default function PaymentsLedger() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, error, refetch } = usePaymentsLedger(page, debouncedSearch);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 on new search
  };

  const records = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Payments & Loan Ledger</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track active principal amounts, interest receipts, and settled ticket portfolios.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-medium text-rose-900">Error loading ledger records</p>
              <p className="mt-1 text-sm text-rose-700">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search by ticket number..."
              value={search}
              onChange={handleSearchChange}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A66] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1E3A66]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">Ticket ID</th>
                <th className="px-6 py-3 font-medium">Customer Name</th>
                <th className="px-6 py-3 font-medium">Original Capital</th>
                <th className="px-6 py-3 font-medium">Active Principal</th>
                <th className="px-6 py-3 font-medium">Interest Paid</th>
                <th className="px-6 py-3 font-medium">Principal Paid</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>

            {isLoading ? (
              <TableSkeleton />
            ) : records.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Receipt className="h-10 w-10 text-slate-300" />
                      <p className="text-sm font-medium text-slate-950">No transaction records found</p>
                      <p className="text-xs text-slate-400">
                        {search ? "Try searching for a different ticket number." : "No transactions registered in this store yet."}
                      </p>
                      {search && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setPage(1);
                          }}
                          className="mt-2 text-xs font-semibold text-[#1E3A66] hover:underline"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-slate-50">
                {records.map((r: FinancialReportRow) => {
                  const statusFormatted = r.status.charAt(0).toUpperCase() + r.status.slice(1);
                  return (
                    <tr key={r.id} className="text-sm text-slate-700 hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-mono font-medium text-slate-900">
                        {r.ticket_number}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-950">
                        {r.customer_name}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {formatCurrency(r.original_loan_amount)}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {formatCurrency(r.loan_amount)}
                      </td>
                      <td className="px-6 py-4 text-emerald-600 font-medium">
                        {formatCurrency(r.total_interest_paid)}
                      </td>
                      <td className="px-6 py-4 text-blue-600 font-medium">
                        {formatCurrency(r.total_principal_paid)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={statusFormatted} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination controls */}
        {!isLoading && records.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={
                    n === page
                      ? "h-8 w-8 rounded-lg bg-[#1E3A66] text-sm font-medium text-white"
                      : "h-8 w-8 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100"
                  }
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
