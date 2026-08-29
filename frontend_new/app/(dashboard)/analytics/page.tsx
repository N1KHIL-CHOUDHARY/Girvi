"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency } from "@/lib/format";
import { getDashboardStats } from "@/services/api";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "1y">("30d");

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["analytics-stats", timeRange],
    queryFn: async () => {
      const res = await getDashboardStats<any>();
      return res.data;
    },
  });

  const rawStats = (statsData ?? {}) as any;
  const activeLoanAmount = Number(rawStats?.stats?.total_loan_active || rawStats?.activeLoans?.totalAmount || 0);
  const monthlyLoanGiven = Number(rawStats?.stats?.monthly_loan_given || 0);
  const totalActiveTickets = Number(rawStats?.stats?.total_active_tickets || 0);
  const settledAmount = Number(rawStats?.settledLoans?.totalAmount || 0);
  const defaultAmount = Number(rawStats?.overdueLoans?.totalAmount || 0);

  const performanceMonths: Array<{ month: string; disbursed: number; interest: number; repaid: number }> =
    rawStats?.monthly_performance ?? [];

  const maxDisbursed = performanceMonths.length > 0 ? Math.max(...performanceMonths.map((m) => m.disbursed || 1)) : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insights →"
        title="Portfolio Analytics & Yield"
        subtitle="Operational liquidity, interest margin yield curves, and collateral risk exposure."
        actions={
          <div className="flex items-center gap-1 rounded-lg border border-[#E7E9EC] bg-white p-0.5 text-xs">
            {(["30d", "90d", "1y"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                  timeRange === range
                    ? "bg-[#14181F] text-white"
                    : "text-[#55606D] hover:text-[#14181F]"
                }`}
              >
                {range === "30d" ? "Last 30 Days" : range === "90d" ? "Quarterly" : "Annual"}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          label="Active Pledged Principal"
          value={formatCurrency(activeLoanAmount)}
          isLoading={isLoading}
        />
        <StatCard
          label="Monthly Disbursed"
          value={formatCurrency(monthlyLoanGiven)}
          tone="navy"
          isLoading={isLoading}
        />
        <StatCard
          label="Active Pawn Tickets"
          value={String(totalActiveTickets)}
          tone="blue"
          isLoading={isLoading}
        />
        <StatCard
          label="Overdue Exposure"
          value={formatCurrency(defaultAmount)}
          tone="rose"
          isLoading={isLoading}
        />
      </div>

      {/* Main Charts & Visualizations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Disbursed vs Interest Realized */}
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7E9EC] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#14181F]">
                Disbursements &amp; Interest Realization
              </h3>
              <p className="text-xs text-[#8A94A3]">Monthly origination vs interest cash flow</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#55606D]">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#14181F]" /> Disbursed
              </span>
              <span className="flex items-center gap-1.5 text-[#55606D]">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#059669]" /> Interest Income
              </span>
            </div>
          </div>

          <div className="pt-4">
            {performanceMonths.length === 0 ? (
              <div className="flex h-52 items-center justify-center text-xs text-[#8A94A3]">
                No monthly disbursement data available yet.
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-3 items-end h-52 pb-4">
                {performanceMonths.map((m) => {
                  const barHeight = maxDisbursed > 0 ? (m.disbursed / maxDisbursed) * 100 : 0;
                  return (
                    <div key={m.month} className="flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] font-mono text-[#8A94A3]">
                        {(m.disbursed / 1000).toFixed(0)}k
                      </span>
                      <div className="w-full max-w-[36px] flex flex-col gap-1 items-center">
                        <div
                          className="w-full bg-[#14181F] rounded-t transition-all hover:bg-[#314259]"
                          style={{ height: `${barHeight}%` }}
                        />
                        <div
                          className="w-full bg-[#059669] rounded-t transition-all"
                          style={{ height: `${barHeight * 0.15}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[#55606D]">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Collateral Asset Class Allocation */}
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 space-y-4">
          <div className="border-b border-[#E7E9EC] pb-3">
            <h3 className="text-sm font-semibold text-[#14181F]">
              Collateral Vault Composition
            </h3>
            <p className="text-xs text-[#8A94A3]">Summary of active pledged portfolio</p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#14181F]">Active Loan Portfolio</span>
                <span className="font-mono text-[#55606D]">{formatCurrency(activeLoanAmount)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#F6F7F8] overflow-hidden">
                <div className="h-full bg-[#D97706] rounded-full" style={{ width: activeLoanAmount > 0 ? "100%" : "0%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#14181F]">Settled Loans</span>
                <span className="font-mono text-[#55606D]">{formatCurrency(settledAmount)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#F6F7F8] overflow-hidden">
                <div className="h-full bg-[#314259] rounded-full" style={{ width: settledAmount > 0 ? "100%" : "0%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#14181F]">Overdue Exposure</span>
                <span className="font-mono text-[#55606D]">{formatCurrency(defaultAmount)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#F6F7F8] overflow-hidden">
                <div className="h-full bg-[#E11D48] rounded-full" style={{ width: defaultAmount > 0 ? "100%" : "0%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
