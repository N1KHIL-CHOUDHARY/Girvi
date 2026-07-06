"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  UserX,
} from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { deleteAccount } from "@/services/api";
import toast from "react-hot-toast";

function TableSkeleton() {
  return (
    <tbody className="divide-y divide-slate-50">
      {[1, 2, 3, 4, 5].map((item) => (
        <tr key={item} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-100" />
              <div className="h-4 w-32 rounded bg-slate-100" />
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-24 rounded bg-slate-100" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-40 rounded bg-slate-100" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-16 rounded bg-slate-100" />
          </td>
          <td className="px-6 py-4 text-right">
            <div className="ml-auto h-8 w-24 rounded bg-slate-100" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

export default function Customers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, error, refetch } = useCustomers(page, search);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer "${name}"?`)) {
      return;
    }

    try {
      await deleteAccount(id);
      toast.success(`Deleted customer "${name}"`);
      void refetch();
    } catch (err) {
      toast.error("Failed to delete customer profile.");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 on new search query
  };

  const customers = data?.customers ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage client profiles, KYC details, and histories.</p>
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
            href="/customers/new"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#1E3A66] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#17294D]"
          >
            <Plus className="h-4 w-4" />
            New Customer
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-medium text-rose-900">Error loading customer accounts</p>
              <p className="mt-1 text-sm text-rose-700">{error}</p>
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
              placeholder="Search customers..."
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
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Address</th>
                <th className="px-6 py-3 font-medium">Joined Date</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            {isLoading ? (
              <TableSkeleton />
            ) : customers.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserX className="h-10 w-10 text-slate-300" />
                      <p className="text-sm font-medium text-slate-950">No customers found</p>
                      <p className="text-xs text-slate-400">
                        {search ? "Try adjusting your search query." : "Add a profile to get started."}
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
                {customers.map((c) => {
                  const init = c.full_name
                    ? c.full_name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : "?";

                  const addressStr = c.address
                    ? [c.address.line1, c.address.city, c.address.pincode]
                        .filter(Boolean)
                        .join(", ")
                    : "No address recorded";

                  const dateStr = c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "-";

                  return (
                    <tr key={c.id} className="text-sm text-slate-700 hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {c.customer_photo_url ? (
                            <img
                              src={c.customer_photo_url}
                              alt={c.full_name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                              {init}
                            </div>
                          )}
                          <span className="font-medium text-slate-900">{c.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{c.phone_number}</td>
                      <td className="px-6 py-4 max-w-xs truncate" title={addressStr}>
                        {addressStr}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{dateStr}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/customers/${c.id}/edit`}
                            aria-label="Edit"
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => void handleDelete(c.id, c.full_name)}
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
        {!isLoading && customers.length > 0 && (
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