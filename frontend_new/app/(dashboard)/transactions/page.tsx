"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  Receipt,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getPaymentsLedger } from "@/services/api";
import { paymentKeys } from "@/lib/queryKeys";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { RecordPaymentModal } from "@/components/ui/RecordPaymentModal";
import { useDebounce } from "@/hooks/useDebounce";
import type { FinancialReportRow } from "@/types/report";

export default function TransactionsJournalPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);


  const { data, isLoading, refetch } = useQuery({
    queryKey: paymentKeys.ledger(page, debouncedSearch),
    queryFn: async () => {
      const res = await getPaymentsLedger<FinancialReportRow[]>(page, debouncedSearch);
      return res;
    },
  });

  const records = data?.data ?? [];
  const totalPages = (data?.meta as any)?.totalPages ?? 1;


  const columns: Column<FinancialReportRow>[] = [
    {
      key: "ticket_number",
      header: "Reference",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F6F7F8] border border-[#E7E9EC] text-[#059669]">
            <ArrowDownLeft className="h-3.5 w-3.5" />
          </div>
          <div>
            <Link
              href={`/pawn-tickets/${r.id}`}
              prefetch={false}
              className="font-mono font-semibold text-xs text-[#14181F] hover:underline block"
            >
              {r.ticket_number}
            </Link>
            <span className="text-[11px] text-[#8A94A3]">Receipt Ref</span>
          </div>
        </div>
      ),
    },
    {
      key: "customer_name",
      header: "Borrower / Counterparty",
      render: (r) => (
        <span className="text-xs font-semibold text-[#14181F]">{r.customer_name}</span>
      ),
    },
    {
      key: "total_interest_paid",
      header: "Interest Collected",
      render: (r) => (
        <span className="font-mono font-semibold text-xs text-[#059669]">
          +{formatCurrency(Number(r.total_interest_paid))}
        </span>
      ),
    },
    {
      key: "total_principal_paid",
      header: "Principal Recovered",
      render: (r) => (
        <span className="font-mono font-semibold text-xs text-[#2563EB]">
          +{formatCurrency(Number(r.total_principal_paid))}
        </span>
      ),
    },
    {
      key: "loan_amount",
      header: "Remaining Exposure",
      render: (r) => (
        <span className="font-mono text-xs text-[#55606D]">
          {formatCurrency(Number(r.loan_amount))}
        </span>
      ),
    },
    {
      key: "status",
      header: "Settlement Status",
      align: "right",
      render: (r) => (
        <Badge tone={r.status === "settled" ? "info" : "success"}>
          {r.status?.toUpperCase()}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insights →"
        title="Transactions Ledger"
        subtitle="Chronological audit log of all interest collections, principal settlements, and repayments."
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

      <DataTable<FinancialReportRow>
        columns={columns}
        data={records}
        isLoading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter journal by ticket or customer..."
        getRowId={(r) => r.id}
        emptyTitle="No ledger transactions found"
        emptyDescription="No transaction entries match the current filters."
        emptyIcon={<Receipt className="h-10 w-10 text-[#8A94A3]" />}
      />

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
