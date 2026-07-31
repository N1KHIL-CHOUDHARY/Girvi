"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  UserX,
} from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { useDebounce } from "@/hooks/useDebounce";
import { deleteAccount } from "@/services/api";
import toast from "react-hot-toast";
import { DataTable, Column } from "@/components/ui/DataTable";
import type { CustomerListItem } from "@/types/customer";

export default function Customers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading, error, refetch } = useCustomers(page, debouncedSearch);

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

  const handleSearchChange = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const customers = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const columns: Column<CustomerListItem>[] = [
    {
      key: "full_name",
      header: "Name",
      render: (c) => {
        const init = c.full_name
          ? c.full_name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
          : "?";
        return (
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
        );
      },
    },
    {
      key: "phone_number",
      header: "Phone",
    },
    {
      key: "address",
      header: "Address",
      render: (c) => {
        const addressStr = c.address
          ? [c.address.line1, c.address.city, c.address.pincode]
              .filter(Boolean)
              .join(", ")
          : "No address recorded";
        return (
          <span className="text-slate-500" title={addressStr}>
            {addressStr}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Joined Date",
      render: (c) => {
        return c.createdAt
          ? new Date(c.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "-";
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Link
            href={`/customers/${c.id}`}
            aria-label="View"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Eye className="h-4 w-4" />
          </Link>
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
      ),
    },
  ];

  return (
    <>
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
            Add Customer
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <p className="text-sm font-medium text-rose-900">Error loading customer accounts</p>
          <p className="mt-1 text-sm text-rose-700">{error.message}</p>
        </div>
      )}

      <DataTable<CustomerListItem>
        columns={columns}
        data={customers}
        isLoading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        searchQuery={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search customers..."
        getRowId={(c) => c.id}
        emptyTitle="No customers found"
        emptyDescription={search ? "Try adjusting your search query." : "Add a profile to get started."}
        emptyIcon={<UserX className="h-10 w-10 text-slate-350" />}
      />
    </>
  );
}