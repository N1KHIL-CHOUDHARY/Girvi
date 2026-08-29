"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency } from "@/lib/format";
import { getDashboardStats } from "@/services/api";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "1y">("30d");

  const { data: statsData } = useQuery({
    queryKey: ["analytics-stats", timeRange],
    queryFn: async () => {
      const res = await getDashboardStats<any>();
      return res.data;
    },
  });

  const rawStats = (statsData ?? {}) as any;
  const activeLoanAmount = rawStats?.activeLoans?.totalAmount ?? 1450000;
  const settledAmount = rawStats?.settledLoans?.totalAmount ?? 820000;
  const defaultAmount = rawStats?.overdueLoans?.totalAmount ?? 35000;



  // Monthly yield / performance data
  const performanceMonths = [
    { month: "Jan", disbursed: 320000, interest: 28800, repaid: 210000 },
    { month: "Feb", disbursed: 410000, interest: 36900, repaid: 290000 },
    { month: "Mar", disbursed: 380000, interest: 34200, repaid: 310000 },
    { month: "Apr", disbursed: 490000, interest: 44100, repaid: 380000 },
    { month: "May", disbursed: 520000, interest: 46800, repaid: 420000 },
    { month: "Jun", disbursed: 580000, interest: 52200, repaid: 490000 },
  ];

  const maxDisbursed = Math.max(...performanceMonths.map((m) => m.disbursed));

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
          delta="+8.4% vs last period"
          deltaDirection="up"
        />
        <StatCard
          label="Monthly Interest Accrual"
          value={formatCurrency((activeLoanAmount * 0.03))}
          delta="36.0% Annualized APR"
          tone="emerald"
        />
        <StatCard
          label="Repaid Principal Recovered"
          value={formatCurrency(settledAmount)}
          delta="92.4% Recovery rate"
          tone="blue"
        />
        <StatCard
          label="Overdue At-Risk Exposure"
          value={formatCurrency(defaultAmount)}
          delta="2.1% of active book"
          tone="rose"
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
            <div className="grid grid-cols-6 gap-3 items-end h-52 pb-4">
              {performanceMonths.map((m) => {
                const barHeight = (m.disbursed / maxDisbursed) * 100;
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
          </div>
        </div>

        {/* Collateral Asset Class Allocation */}
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 space-y-4">
          <div className="border-b border-[#E7E9EC] pb-3">
            <h3 className="text-sm font-semibold text-[#14181F]">
              Collateral Vault Composition
            </h3>
            <p className="text-xs text-[#8A94A3]">Weighted exposure by asset type</p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#14181F]">22K / 24K Gold Jewelry</span>
                <span className="font-mono text-[#55606D]">82.4% (₹11.95L)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#F6F7F8] overflow-hidden">
                <div className="h-full bg-[#D97706] rounded-full" style={{ width: "82.4%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#14181F]">Silver Articles / Bullion</span>
                <span className="font-mono text-[#55606D]">11.8% (₹1.71L)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#F6F7F8] overflow-hidden">
                <div className="h-full bg-[#314259] rounded-full" style={{ width: "11.8%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#14181F]">Diamonds &amp; Gemstones</span>
                <span className="font-mono text-[#55606D]">4.2% (₹60.9K)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#F6F7F8] overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full" style={{ width: "4.2%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-[#14181F]">Watches &amp; Luxury</span>
                <span className="font-mono text-[#55606D]">1.6% (₹23.2K)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#F6F7F8] overflow-hidden">
                <div className="h-full bg-[#8A94A3] rounded-full" style={{ width: "1.6%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
