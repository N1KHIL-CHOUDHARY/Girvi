"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Ticket as TicketIcon,
  AlertTriangle,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/Badge";
import { usePawnTickets } from "@/hooks/usePawnTickets";
import { useDebounce } from "@/hooks/useDebounce";
import { pawnTicketKeys } from "@/lib/queryKeys";
import { deletePawnTicket, getApiErrorMessage } from "@/services/api";
import { formatCurrency } from "@/lib/format";
import type { PawnTicketRecord } from "@/types/pawn";

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
            <div className="h-4 w-36 rounded bg-slate-100" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-20 rounded bg-slate-100" />
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-16 rounded bg-slate-100" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-24 rounded bg-slate-100" />
          </td>
          <td className="px-6 py-4 text-right">
            <div className="ml-auto h-8 w-24 rounded bg-slate-100" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

export default function PawnTickets() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "settled" | "defaulted">("all");

  const { data, isLoading, error, refetch } = usePawnTickets(page, debouncedSearch, statusFilter);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePawnTicket(id),
    onSuccess: () => {
      toast.success("Pawn ticket deleted successfully");
      queryClient.invalidateQueries({ queryKey: pawnTicketKeys.all });
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to delete pawn ticket."));
    },
  });

  const handleDelete = (id: string, ticketNo: string) => {
    if (confirm(`Are you sure you want to delete pawn ticket "${ticketNo}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as any);
    setPage(1);
  };

  const tickets = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Pawn Tickets</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your inventory, payments, and active pledges.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/pawn-tickets/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#1E3A66] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#17294D]"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-medium text-rose-900">Error loading pawn tickets</p>
              <p className="mt-1 text-sm text-rose-700">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search ticket or item..."
              value={search}
              onChange={handleSearchChange}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A66] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1E3A66]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Status:</span>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1E3A66] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="settled">Settled</option>
              <option value="defaulted">Defaulted</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">Ticket</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Item</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Pawned Date</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            {isLoading ? (
              <TableSkeleton />
            ) : tickets.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <TicketIcon className="h-10 w-10 text-slate-300" />
                      <p className="text-sm font-medium text-slate-950">No pawn tickets found</p>
                      <p className="text-xs text-slate-400">
                        {search || statusFilter !== "all"
                          ? "Try adjusting your search query or status filter."
                          : "No pawn tickets registered in this store yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-slate-50">
                {tickets.map((t: PawnTicketRecord) => {
                  const customerName = t.customer?.full_name ?? "N/A";
                  const firstItem = t.items?.[0];
                  const itemName = firstItem
                    ? `${firstItem.name} (${firstItem.type})`
                    : "No items";

                  const formattedDate = t.pawned_date
                    ? new Date(t.pawned_date).toLocaleDateString()
                    : "N/A";

                  return (
                    <tr key={t.id} className="text-sm text-slate-700 hover:bg-slate-50/60">
                      <td className="px-6 py-4 font-mono font-medium text-slate-900">{t.ticket_number}</td>
                      <td className="px-6 py-4">{customerName}</td>
                      <td className="px-6 py-4">{itemName}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {formatCurrency(parseFloat(t.loan_amount))}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-500">{formattedDate}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/pawn-tickets/${t.id}`}
                            aria-label="View"
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/pawn-tickets/${t.id}/edit`}
                            aria-label="Edit"
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(t.id, t.ticket_number)}
                            aria-label="Delete"
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination controls */}
        {!isLoading && tickets.length > 0 && (
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