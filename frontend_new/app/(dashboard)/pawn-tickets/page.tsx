"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  Ticket as TicketIcon,
  AlertCircle,
  CreditCard,
} from "lucide-react";


import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordPaymentModal } from "@/components/ui/RecordPaymentModal";
import { usePawnTickets } from "@/hooks/usePawnTickets";
import { useDebounce } from "@/hooks/useDebounce";
import { pawnTicketKeys } from "@/lib/queryKeys";
import { deletePawnTicket, getApiErrorMessage } from "@/services/api";
import { formatCurrency } from "@/lib/format";
import type { PawnTicketRecord } from "@/types/pawn";

export default function PawnTickets() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "settled" | "overdue">("all");
  const [selectedTicketForPayment, setSelectedTicketForPayment] = useState<PawnTicketRecord | null>(null);

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

  const handleSearchChange = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const tickets = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const columns: Column<PawnTicketRecord>[] = [
    {
      key: "ticket_number",
      header: "Ticket ID",
      render: (t) => (
        <Link
          href={`/pawn-tickets/${t.id}`}
          className="font-mono font-semibold text-[#14181F] hover:underline"
        >
          {t.ticket_number}
        </Link>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (t) => {
        const customerName = t.customer?.full_name ?? "Walk-in";
        return (
          <div>
            {t.customer?.id ? (
              <Link
                href={`/customers/${t.customer.id}`}
                className="font-medium text-[#14181F] hover:underline"
              >
                {customerName}
              </Link>
            ) : (
              <span className="font-medium text-[#14181F]">{customerName}</span>
            )}
            {t.customer?.phone_number && (
              <span className="block text-[11px] text-[#8A94A3] font-mono">
                {t.customer.phone_number}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "items",
      header: "Collateral Pledged",
      render: (t) => {
        const firstItem = t.items?.[0];
        if (!firstItem) return <span className="text-[#8A94A3]">No items</span>;
        return (
          <div className="max-w-[200px] truncate">
            <span className="font-medium text-[#14181F] block truncate">
              {firstItem.name}
            </span>
            <span className="text-[11px] text-[#8A94A3]">
              {firstItem.weight_grams ? `${firstItem.weight_grams}g` : ""} {firstItem.type?.toUpperCase()}
              {t.items.length > 1 ? ` (+${t.items.length - 1} more)` : ""}
            </span>
          </div>
        );
      },
    },
    {
      key: "loan_amount",
      header: "Loan Principal",
      render: (t) => (
        <div>
          <span className="font-mono font-semibold text-[#14181F]">
            {formatCurrency(parseFloat(t.loan_amount || "0"))}
          </span>
          <span className="block text-[11px] text-[#8A94A3]">
            {t.interest_rate}% / mo
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: "pawned_date",
      header: "Origination Date",
      render: (t) => (
        <span className="text-xs text-[#55606D] font-mono">
          {t.pawned_date ? new Date(t.pawned_date).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (t) => (
        <div className="flex justify-end gap-1">
          {t.status === "active" && (
            <button
              onClick={() => setSelectedTicketForPayment(t)}
              title="Record Payment"
              className="rounded-lg p-1.5 text-[#55606D] hover:bg-[#F6F7F8] hover:text-[#14181F] transition-colors cursor-pointer"
            >
              <CreditCard className="h-4 w-4" />
            </button>
          )}
          <Link
            href={`/pawn-tickets/${t.id}`}
            aria-label="View Ticket Details"
            className="rounded-lg p-1.5 text-[#8A94A3] hover:bg-[#F6F7F8] hover:text-[#14181F] transition-colors"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/pawn-tickets/${t.id}/edit`}
            aria-label="Edit Ticket"
            className="rounded-lg p-1.5 text-[#8A94A3] hover:bg-[#F6F7F8] hover:text-[#14181F] transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(t.id, t.ticket_number)}
            aria-label="Delete Ticket"
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
        eyebrow="Workspace →"
        title="Loans & Pawn Tickets"
        subtitle="Originate, inspect, settle, and audit collateralized pawn loans."
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
              href="/pawn-tickets/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#14181F] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#314259] transition-colors shadow-none"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Ticket</span>
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

      {/* Status Filter Tabs Ribbon */}
      <div className="flex items-center justify-between gap-4 border-b border-[#E7E9EC] pb-3 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {(
            [
              { id: "all", label: "All Tickets" },
              { id: "active", label: "Active Loans" },
              { id: "settled", label: "Settled / Redeemed" },
              { id: "overdue", label: "Overdue" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-[#14181F] text-white"
                  : "bg-white text-[#55606D] hover:bg-[#F6F7F8] hover:text-[#14181F]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable<PawnTicketRecord>
        columns={columns}
        data={tickets}
        isLoading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        searchQuery={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search ticket ID, borrower, collateral..."
        getRowId={(t) => t.id}
        emptyTitle="No pawn tickets found"
        emptyDescription={
          search || statusFilter !== "all"
            ? "Try adjusting your search query or status filter."
            : "No pawn tickets originated yet. Create your first ticket."
        }
        emptyIcon={<TicketIcon className="h-10 w-10 text-[#8A94A3]" />}
        emptyAction={
          <Link
            href="/pawn-tickets/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#14181F] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#314259] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Originate Loan Ticket
          </Link>
        }
      />

      {/* Record Payment Drawer / Modal */}
      {selectedTicketForPayment && (
        <RecordPaymentModal
          isOpen={true}
          onClose={() => setSelectedTicketForPayment(null)}
          ticketId={selectedTicketForPayment.id}
          ticketNumber={selectedTicketForPayment.ticket_number}
          customerName={selectedTicketForPayment.customer?.full_name}
          principalBalance={selectedTicketForPayment.loan_amount}
          interestDue={
            (Number(selectedTicketForPayment.loan_amount) *
              Number(selectedTicketForPayment.interest_rate)) /
            100
          }
        />
      )}
    </div>
  );
}