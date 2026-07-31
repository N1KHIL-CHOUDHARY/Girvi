"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/Badge";
import { usePaymentsLedger } from "@/hooks/usePaymentsLedger";
import { useDebounce } from "@/hooks/useDebounce";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { BarChart3, Printer, RefreshCw, AlertCircle, TrendingUp, DollarSign, Wallet } from "lucide-react";
import Link from "next/link";
import type { FinancialReportRow } from "@/types/report";

export default function Reports() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search, 300);

  // Query payments ledger report
  const { data, isLoading, error, refetch, isRefetching } = usePaymentsLedger(page, debouncedSearch);

  const records = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  // Simple aggregation totals based on loaded list
  const totalPrincipalLent = records.reduce((sum: number, r: FinancialReportRow) => sum + Number(r.original_loan_amount || 0), 0);
  const totalInterestCollected = records.reduce((sum: number, r: FinancialReportRow) => sum + Number(r.total_interest_paid || 0), 0);
  const activeCount = records.filter((r: FinancialReportRow) => r.status === "active").length;

  const handlePrint = () => {
    window.print();
  };

  const pageActions = (
    <div className="flex gap-2 no-print">
      <Button
        variant="secondary"
        onClick={() => void refetch()}
        isLoading={isRefetching}
        leftIcon={<RefreshCw className="h-4 w-4" />}
        size="sm"
      >
        Refresh
      </Button>
      <Button
        variant="primary"
        onClick={handlePrint}
        leftIcon={<Printer className="h-4 w-4" />}
        size="sm"
      >
        Print Report Vouchers
      </Button>
    </div>
  );

  // Column definitions for the report list
  const columns: Column<FinancialReportRow>[] = [
    {
      key: "ticket_number",
      header: "Ticket ID",
      render: (r) => (
        <Link
          href={`/pawn-tickets/${r.id}`}
          className="font-mono font-bold text-[var(--color-primary)] hover:underline"
        >
          {r.ticket_number}
        </Link>
      ),
    },
    {
      key: "customer_name",
      header: "Customer",
      render: (r) => <span className="font-semibold text-[var(--color-text-primary)]">{r.customer_name}</span>,
    },
    {
      key: "original_loan_amount",
      header: "Principal Lent",
      render: (r) => <span className="font-mono text-xs font-semibold text-[var(--color-text-secondary)]">{formatCurrency(r.original_loan_amount)}</span>,
    },
    {
      key: "total_interest_paid",
      header: "Interest Paid",
      render: (r) => <span className="font-mono text-xs font-bold text-[var(--color-success-text)]">{formatCurrency(r.total_interest_paid)}</span>,
    },
    {
      key: "total_principal_paid",
      header: "Principal Returned",
      render: (r) => <span className="font-mono text-xs font-bold text-[var(--color-info-text)]">{formatCurrency(r.total_principal_paid)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status.charAt(0).toUpperCase() + r.status.slice(1)} />,
    },
  ];

  return (
    <AppShell>
      {/* Print summary layout header */}
      <div className="print-only border-b border-black pb-4 mb-6 text-sm font-mono bg-white text-center">
        <h1 className="text-lg font-bold">PAWN SHOP MANAGER</h1>
        <p className="text-xs">Financial Audit Ledger Summary Report</p>
        <p className="text-[10px] mt-1">Generated: {new Date().toLocaleDateString("en-IN")}</p>
      </div>

      <PageHeader
        title="Store Financial Audit Reports"
        subtitle="Review global loan capital payouts, active principal balances, interest collections, and auditing records."
        actions={pageActions}
        className="no-print"
      />

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-[var(--radius-xl)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-4 text-[var(--color-danger-text)]">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Error loading financial audit records</p>
            <p className="mt-0.5 text-xs opacity-90">{error.message}</p>
          </div>
        </div>
      )}

      {/* Aggregate Report summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border-light)] bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Report Principal Lent</p>
            <p className="mt-1.5 text-xl font-bold text-[var(--color-text-primary)] font-mono">{formatCurrency(totalPrincipalLent)}</p>
          </div>
          <div className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--color-info-bg)] text-[var(--color-info-text)] flex items-center justify-center border border-[var(--color-info-border)]">
            <Wallet className="h-4 w-4" />
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border-light)] bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Report Interest Paid</p>
            <p className="mt-1.5 text-xl font-bold text-[var(--color-success-text)] font-mono">{formatCurrency(totalInterestCollected)}</p>
          </div>
          <div className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--color-success-bg)] text-[var(--color-success-text)] flex items-center justify-center border border-[var(--color-success-border)]">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border-light)] bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Report Active Pledges</p>
            <p className="mt-1.5 text-xl font-bold text-[var(--color-text-primary)] font-mono">{activeCount} active</p>
          </div>
          <div className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center border border-[var(--color-border)]">
            <BarChart3 className="h-4 w-4" />
          </div>
        </div>
      </div>

      <DataTable<FinancialReportRow>
        columns={columns}
        data={records}
        isLoading={isLoading}
        getRowId={(r) => r.id}
        emptyTitle="No report entries generated"
        emptyDescription="Review filters or search query terms to load accounting ledger records."
        emptyIcon={<BarChart3 className="h-6 w-6" />}
        // Pagination state
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        // Search control
        searchQuery={search}
        onSearchChange={(q) => {
          setSearch(q);
          setPage(1);
        }}
        searchPlaceholder="Search ticket ID or customer..."
      />
    </AppShell>
  );
}
