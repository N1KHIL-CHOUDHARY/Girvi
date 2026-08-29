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
  AlertCircle,
} from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { useDebounce } from "@/hooks/useDebounce";
import { deleteAccount } from "@/services/api";
import toast from "react-hot-toast";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
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
    } catch {
      toast.error("Failed to delete customer profile.");
    }
  };

  const handleSearchChange = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const customers = data?.data ?? [];
  const totalCount = data?.meta?.totalCount ?? data?.meta?.totalItems ?? customers.length;
  const totalPages = data?.meta?.totalPages ?? 1;

  const columns: Column<CustomerListItem>[] = [
    {
      key: "full_name",
      header: "Customer Name",
      render: (c) => {
        const init = c.full_name
          ? c.full_name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
          : "C";
        return (
          <div className="flex items-center gap-3">
            {c.customer_photo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={c.customer_photo_url}
                alt={c.full_name}
                className="h-8 w-8 rounded-lg object-cover border border-[#E7E9EC]"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F6F7F8] text-xs font-semibold text-[#314259] border border-[#E7E9EC]">
                {init}
              </div>
            )}
            <div>
              <Link
                href={`/customers/${c.id}`}
                prefetch={false}
                className="font-medium text-[#14181F] hover:underline"
              >
                {c.full_name}
              </Link>
              {c.gender && (
                <span className="block text-[11px] text-[#8A94A3]">
                  {c.gender}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "phone_number",
      header: "Contact",
      render: (c) => (
        <div className="text-xs space-y-0.5">
          <span className="font-mono text-[#14181F] block">{c.phone_number}</span>
          <span className="text-[11px] text-[#8A94A3]">
            {c.address?.city || "City not recorded"}
          </span>
        </div>
      ),
    },
    {
      key: "kyc_status",
      header: "KYC Documents",
      render: (c) => {
        const hasAadhaar = Boolean(c.aadhaar_number);
        const hasPan = Boolean(c.pan_number);
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {hasAadhaar ? (
              <Badge tone="success">Aadhaar Verified</Badge>
            ) : (
              <Badge tone="warning">Aadhaar Pending</Badge>
            )}
            {hasPan && <Badge tone="info">PAN</Badge>}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "Joined Date",
      render: (c) => {
        return (
          <span className="text-xs text-[#55606D] font-mono">
            {c.createdAt
              ? new Date(c.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "—"}
          </span>
        );
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
            prefetch={false}
            aria-label="View Customer Details"
            className="rounded-lg p-1.5 text-[#8A94A3] hover:bg-[#F6F7F8] hover:text-[#14181F] transition-colors"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/customers/${c.id}/edit`}
            prefetch={false}
            aria-label="Edit Customer Profile"
            className="rounded-lg p-1.5 text-[#8A94A3] hover:bg-[#F6F7F8] hover:text-[#14181F] transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => void handleDelete(c.id, c.full_name)}
            aria-label="Delete Customer"
            className="rounded-lg p-1.5 text-[#8A94A3] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CRM & Borrowers →"
        title="Customers"
        subtitle="Manage client identities, Aadhaar KYC verification, and pledge portfolio history."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void refetch()}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />}
            >
              Refresh
            </Button>
            <Link
              href="/customers/new"
              prefetch={false}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#14181F] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#314259] transition-colors shadow-none"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Customer</span>
            </Link>
          </>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-xs font-medium text-red-900">{error.message}</p>
        </div>
      )}

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-4">
          <span className="text-[11px] font-medium text-[#8A94A3] uppercase tracking-wider block">
            Total Borrowers
          </span>
          <p className="mt-1 text-2xl font-semibold font-mono text-[#14181F]">
            {totalCount}
          </p>
        </div>
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-4">
          <span className="text-[11px] font-medium text-[#8A94A3] uppercase tracking-wider block">
            KYC Compliance
          </span>
          <p className="mt-1 text-2xl font-semibold font-mono text-[#059669]">
            {totalCount > 0 && customers.length > 0
              ? `${Math.round((customers.filter((c) => Boolean(c.aadhaar_number)).length / customers.length) * 100)}%`
              : "0%"}
          </p>
        </div>
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-4">
          <span className="text-[11px] font-medium text-[#8A94A3] uppercase tracking-wider block">
            Verified Profiles
          </span>
          <p className="mt-1 text-2xl font-semibold font-mono text-[#14181F]">
            {customers.filter((c) => Boolean(c.aadhaar_number || c.pan_number)).length}
          </p>
        </div>
      </div>

      <DataTable<CustomerListItem>
        columns={columns}
        data={customers}
        isLoading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        searchQuery={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search customer name, phone, city..."
        getRowId={(c) => c.id}
        emptyTitle="No customers found"
        emptyDescription={search ? "Try adjusting your search query." : "Add a profile to start tracking loans."}
        emptyIcon={<UserX className="h-10 w-10 text-[#8A94A3]" />}
        emptyAction={
          <Link
            href="/customers/new"
            prefetch={false}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#14181F] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#314259] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add First Customer
          </Link>
        }
      />
    </div>
  );
}