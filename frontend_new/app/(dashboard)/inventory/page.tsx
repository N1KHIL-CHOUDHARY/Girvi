"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Scale,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { getPawnTickets } from "@/services/api";
import { pawnTicketKeys } from "@/lib/queryKeys";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useDebounce } from "@/hooks/useDebounce";
import type { PawnTicketRecord, PawnTicketItemRecord } from "@/types/pawn";

interface CollateralItemWithTicket extends PawnTicketItemRecord {
  ticketNumber: string;
  ticketId: string;
  ticketStatus: string;
  loanAmount: string;
  customerName: string;
  pawnedDate: string;
}

export default function InventoryVaultPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data, isLoading, refetch } = useQuery({
    queryKey: pawnTicketKeys.list(1, debouncedSearch, "all"),
    queryFn: async () => {
      const res = await getPawnTickets<PawnTicketRecord[]>(1, debouncedSearch, "all");
      return res;
    },
  });

  const tickets = data?.data ?? [];

  // Flatten collateral items from tickets
  const allCollateralItems: CollateralItemWithTicket[] = [];
  tickets.forEach((ticket) => {
    ticket.items?.forEach((item) => {
      allCollateralItems.push({
        ...item,
        ticketNumber: ticket.ticket_number,
        ticketId: ticket.id,
        ticketStatus: ticket.status,
        loanAmount: ticket.loan_amount,
        customerName: ticket.customer?.full_name ?? "Borrower",
        pawnedDate: ticket.pawned_date,
      });
    });
  });

  // Filter by category
  const filteredItems = allCollateralItems.filter((item) => {
    if (categoryFilter === "all") return true;
    return (item.type || "").toLowerCase() === categoryFilter.toLowerCase();
  });

  // Calculate vault weight metrics
  let totalGoldGrams = 0;
  let totalSilverGrams = 0;
  let totalDiamondCount = 0;
  let totalCustodialValuation = 0;

  allCollateralItems.forEach((item) => {
    const weight = parseFloat(item.weight_grams) || 0;
    const loan = parseFloat(item.loanAmount) || 0;
    totalCustodialValuation += loan;

    const type = (item.type || "").toLowerCase();
    if (type === "gold") totalGoldGrams += weight;
    else if (type === "silver") totalSilverGrams += weight;
    else if (type === "diamond") totalDiamondCount += 1;
  });

  const columns: Column<CollateralItemWithTicket>[] = [
    {
      key: "name",
      header: "Asset Description",
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.item_photo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.item_photo_url}
              alt={item.name}
              className="h-10 w-10 rounded-lg object-cover border border-[#E7E9EC]"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F6F7F8] border border-[#E7E9EC] text-[#314259] shrink-0">
              <Package className="h-5 w-5" />
            </div>
          )}
          <div>
            <span className="font-semibold text-xs text-[#14181F] block">{item.name}</span>
            <span className="text-[11px] text-[#8A94A3] capitalize">
              {item.description || "Hallmarked asset"}
            </span>
          </div>
        </div>
      ),
    },

    {
      key: "type",
      header: "Category",
      render: (item) => (
        <span className="inline-flex items-center rounded-md border border-[#E7E9EC] bg-[#F6F7F8] px-2 py-0.5 text-[11px] font-semibold text-[#55606D] uppercase">
          {item.type}
        </span>
      ),
    },
    {
      key: "weight_grams",
      header: "Gross Weight",
      render: (item) => (
        <div className="flex items-center gap-1 font-mono font-semibold text-xs text-[#14181F]">
          <Scale className="h-3 w-3 text-[#8A94A3]" />
          <span>{item.weight_grams} g</span>
        </div>
      ),
    },
    {
      key: "purity",
      header: "Purity / Karat",
      render: (item) => (
        <span className="text-xs font-mono text-[#55606D]">
          {item.purity ? `${item.purity}%` : "Standard 22K"}
        </span>
      ),
    },
    {
      key: "ticketNumber",
      header: "Pawn Ticket",
      render: (item) => (
        <Link
          href={`/pawn-tickets/${item.ticketId}`}
          className="font-mono font-semibold text-xs text-[#14181F] hover:underline"
        >
          {item.ticketNumber}
        </Link>
      ),
    },
    {
      key: "customerName",
      header: "Pledgor",
      render: (item) => (
        <span className="text-xs text-[#55606D]">{item.customerName}</span>
      ),
    },
    {
      key: "ticketStatus",
      header: "Custody Status",
      align: "right",
      render: (item) => {
        const isSettled = item.ticketStatus?.toLowerCase() === "settled";
        return (
          <Badge tone={isSettled ? "neutral" : "success"}>
            {isSettled ? "Released" : "In Vault"}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace →"
        title="Collateral Vault & Inventory"
        subtitle="Audited physical custody tracking for pledged precious metals, gemstones, and assets."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Refresh Vault
          </Button>
        }
      />

      {/* Vault KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A94A3] block">
            Gold Vault Reserve
          </span>
          <p className="mt-1 text-2xl font-semibold font-mono text-[#14181F]">
            {totalGoldGrams.toFixed(2)} <span className="text-xs text-[#8A94A3]">grams</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#E7E9EC] bg-white p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A94A3] block">
            Silver Vault Reserve
          </span>
          <p className="mt-1 text-2xl font-semibold font-mono text-[#14181F]">
            {(totalSilverGrams / 1000).toFixed(2)} <span className="text-xs text-[#8A94A3]">kg</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#E7E9EC] bg-white p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A94A3] block">
            Gemstones / Luxury
          </span>
          <p className="mt-1 text-2xl font-semibold font-mono text-[#14181F]">
            {totalDiamondCount} <span className="text-xs text-[#8A94A3]">items</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#E7E9EC] bg-white p-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A94A3] block">
            Custody Loan Valuation
          </span>
          <p className="mt-1 text-2xl font-semibold font-mono text-[#059669]">
            {formatCurrency(totalCustodialValuation)}
          </p>
        </div>
      </div>

      {/* Category Pills Ribbon */}
      <div className="flex items-center gap-1.5 border-b border-[#E7E9EC] pb-3 overflow-x-auto">
        {(
          [
            { id: "all", label: "All Collateral" },
            { id: "gold", label: "Gold Assets" },
            { id: "silver", label: "Silver Assets" },
            { id: "diamond", label: "Diamonds & Gems" },
            { id: "other", label: "Other / Luxury" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setCategoryFilter(tab.id);
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              categoryFilter === tab.id
                ? "bg-[#14181F] text-white"
                : "bg-white text-[#55606D] hover:bg-[#F6F7F8] hover:text-[#14181F]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable<CollateralItemWithTicket>
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        currentPage={page}
        totalPages={1}
        onPageChange={setPage}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search collateral name, purity, ticket..."
        getRowId={(item) => `${item.ticketId}-${item.id || item.name}`}
        emptyTitle="No collateral assets found"
        emptyDescription="No collateral matches the current category or search criteria."
        emptyIcon={<Package className="h-10 w-10 text-[#8A94A3]" />}
      />
    </div>
  );
}
