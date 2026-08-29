"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { usePaymentsLedger } from "@/hooks/usePaymentsLedger";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency } from "@/lib/format";
import { BarChart3, Printer, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { FinancialReportRow } from "@/types/report";


export default function Reports() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, error, refetch, isRefetching } = usePaymentsLedger(page, debouncedSearch);

  const records = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  const totalPrincipalLent = records.reduce((sum: number, r: FinancialReportRow) => sum + Number(r.original_loan_amount || 0), 0);
  const totalInterestCollected = records.reduce((sum: number, r: FinancialReportRow) => sum + Number(r.total_interest_paid || 0), 0);
  const activeCount = records.filter((r: FinancialReportRow) => r.status === "active").length;

  const handlePrint = () => {
    window.print();
  };

  const columns: Column<FinancialReportRow>[] = [
    {
      key: "ticket_number",
      header: "Ticket ID",
      render: (r) => (
        <Link
          href={`/pawn-tickets/${r.id}`}
          className="font-mono font-semibold text-[#14181F] hover:underline"
        >
          {r.ticket_number}
        </Link>
      ),
    },
    {
      key: "customer_name",
      header: "Customer",
      render: (r) => <span className="font-semibold text-[#14181F]">{r.customer_name}</span>,
    },
    {
      key: "original_loan_amount",
      header: "Principal Lent",
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-[#55606D]">
          {formatCurrency(Number(r.original_loan_amount))}
        </span>
      ),
    },
    {
      key: "total_interest_paid",
      header: "Interest Paid",
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-[#059669]">
          {formatCurrency(Number(r.total_interest_paid))}
        </span>
      ),
    },
    {
      key: "total_principal_paid",
      header: "Principal Returned",
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-[#2563EB]">
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
      {/* Print summary layout header */}
      <div className="print-only border-b border-black pb-4 mb-6 text-sm font-mono bg-white text-center">
        <h1 className="text-lg font-bold">PAWN SHOP MANAGER</h1>
        <p className="text-xs">Financial Audit Ledger Summary Report</p>
        <p className="text-[10px] mt-1">Generated: {new Date().toLocaleDateString("en-IN")}</p>
      </div>

      <PageHeader
        eyebrow="Insights →"
        title="Financial Audit & Reports"
        subtitle="Review global loan capital payouts, active principal balances, interest collections, and auditing records."
        actions={
          <div className="flex gap-2 no-print">
            <Button
              variant="secondary"
              onClick={() => void refetch()}
              isLoading={isRefetching}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              size="sm"
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={handlePrint}
              leftIcon={<Printer className="h-3.5 w-3.5" />}
              size="sm"
            >
              Print Vouchers
            </Button>
          </div>
        }
        className="no-print"
      />

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
          <div className="text-xs">
            <p className="font-bold">Error loading financial audit records</p>
            <p className="mt-0.5 opacity-90">{error.message}</p>
          </div>
        </div>
      )}

      {/* Aggregate Report summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A94A3] block">
            Report Principal Lent
          </span>
          <p className="mt-1 text-2xl font-semibold font-mono text-[#14181F]">
            {formatCurrency(totalPrincipalLent)}
          </p>
        </div>

        <div className="rounded-xl border border-[#E7E9EC] bg-white p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A94A3] block">
            Report Interest Paid
          </span>
          <p className="mt-1 text-2xl font-semibold font-mono text-[#059669]">
            {formatCurrency(totalInterestCollected)}
          </p>
        </div>

        <div className="rounded-xl border border-[#E7E9EC] bg-white p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A94A3] block">
            Report Active Pledges
          </span>
          <p className="mt-1 text-2xl font-semibold font-mono text-[#14181F]">
            {activeCount} active loans
          </p>
        </div>
      </div>

      <DataTable<FinancialReportRow>
        columns={columns}
        data={records}
        isLoading={isLoading}
        getRowId={(r) => r.id}
        emptyTitle="No report entries generated"
        emptyDescription="Review filters or search query terms to load accounting ledger records."
        emptyIcon={<BarChart3 className="h-8 w-8 text-[#8A94A3]" />}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        searchQuery={search}
        onSearchChange={(q) => {
          setSearch(q);
          setPage(1);
        }}
        searchPlaceholder="Search ticket ID or customer..."
      />
    </div>
  );
}

