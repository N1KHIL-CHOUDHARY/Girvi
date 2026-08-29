"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Receipt,
  CreditCard,
  AlertCircle,
} from "lucide-react";


import { usePaymentsLedger } from "@/hooks/usePaymentsLedger";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordPaymentModal } from "@/components/ui/RecordPaymentModal";
import type { FinancialReportRow } from "@/types/report";

export default function PaymentsLedger() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = usePaymentsLedger(page, debouncedSearch);

  const handleSearchChange = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const records = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  // Aggregate totals
  const totalInterestCollected = records.reduce(
    (acc, r) => acc + (parseFloat(r.total_interest_paid as any) || 0),
    0
  );
  const totalPrincipalRepaid = records.reduce(
    (acc, r) => acc + (parseFloat(r.total_principal_paid as any) || 0),
    0
  );

  const columns: Column<FinancialReportRow>[] = [
    {
      key: "ticket_number",
      header: "Ticket ID",
      render: (r) => (
        <Link
          href={`/pawn-tickets/${r.id}`}
          prefetch={false}
          className="font-mono font-semibold text-[#14181F] hover:underline"
        >
          {r.ticket_number}
        </Link>
      ),
    },
    {
      key: "customer_name",
      header: "Customer",
      render: (r) => (
        <span className="font-medium text-[#14181F]">{r.customer_name}</span>
      ),
    },
    {
      key: "original_loan_amount",
      header: "Original Capital",
      render: (r) => (
        <span className="font-mono text-[#55606D]">
          {formatCurrency(Number(r.original_loan_amount))}
        </span>
      ),
    },
    {
      key: "loan_amount",
      header: "Active Principal",
      render: (r) => (
        <span className="font-mono font-semibold text-[#14181F]">
          {formatCurrency(Number(r.loan_amount))}
        </span>
      ),
    },
    {
      key: "total_interest_paid",
      header: "Interest Paid",
      render: (r) => (
        <span className="font-mono font-semibold text-[#059669]">
          {formatCurrency(Number(r.total_interest_paid))}
        </span>
      ),
    },
    {
      key: "total_principal_paid",
      header: "Principal Repaid",
      render: (r) => (
        <span className="font-mono font-semibold text-[#2563EB]">
          {formatCurrency(Number(r.total_principal_paid))}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace →"
        title="Payments & Loan Ledger"
        subtitle="Track active principal balances, interest income receipts, and portfolio settlements."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void refetch()}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsRecordModalOpen(true)}
              leftIcon={<CreditCard className="h-3.5 w-3.5" />}
            >
              Record Payment
            </Button>
          </div>
        }
      />

      {/* Quick Balance Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A94A3] block">
            Interest Realized
          </span>
          <p className="mt-1 text-2xl font-semibold font-mono text-[#059669]">
            {formatCurrency(totalInterestCollected)}
          </p>
        </div>

        <div className="rounded-xl border border-[#E7E9EC] bg-white p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A94A3] block">
            Principal Recovered
          </span>
          <p className="mt-1 text-2xl font-semibold font-mono text-[#2563EB]">
            {formatCurrency(totalPrincipalRepaid)}
          </p>
        </div>

        <div className="rounded-xl border border-[#E7E9EC] bg-white p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A94A3] block">
            Audited Portfolio Rows
          </span>
          <p className="mt-1 text-2xl font-semibold font-mono text-[#14181F]">
            {records.length}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-xs font-medium text-red-900">{error.message}</p>
        </div>
      )}

      <DataTable<FinancialReportRow>
        columns={columns}
        data={records}
        isLoading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        searchQuery={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search ticket ID or borrower..."
        getRowId={(r) => r.id}
        emptyTitle="No transaction records found"
        emptyDescription={
          search
            ? "Try searching for a different ticket number or borrower name."
            : "No repayment transactions registered yet."
        }
        emptyIcon={<Receipt className="h-10 w-10 text-[#8A94A3]" />}
      />

      {/* Global Quick Record Payment Modal */}
      {isRecordModalOpen && (
        <RecordPaymentModal
          isOpen={true}
          onClose={() => {
            setIsRecordModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

