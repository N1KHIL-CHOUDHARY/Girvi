"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  Ticket,
  DollarSign,
  Plus,
  RefreshCw,
  CreditCard,
  UserPlus,
  Package,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import AreaPieChart from "@/components/ui/AreaPieChart";
import GenderPieChart from "@/components/ui/GenderPieChart";

import { RecordPaymentModal } from "@/components/ui/RecordPaymentModal";

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useDashboardData();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const stats = data?.stats;
  const topCustomers = data?.top_customers ?? [];
  const recentActivity = data?.recent_activity ?? [];
  const genderData = data?.gender_data ?? [];
  const areaData = data?.area_data ?? [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#E7E9EC] pb-5 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <span className="block text-[12px] font-medium text-[#8A94A3]">
            Workspace →
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-[#14181F]">
            Overview
          </h1>
          <p className="text-xs text-[#55606D]">
            Live summary of active pawn tickets, portfolio capital, and shop operations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>

          <button
            type="button"
            onClick={() => setPaymentModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E9EC] bg-white px-3 py-1.5 text-xs font-semibold text-[#14181F] hover:bg-[#F6F7F8] transition-colors cursor-pointer"
          >
            <CreditCard className="h-3.5 w-3.5 text-[#55606D]" />
            <span>Record Payment</span>
          </button>

          <Link
            href="/pawn-tickets/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#14181F] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#314259] transition-colors shadow-none"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Ticket</span>
          </Link>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-xs font-medium text-red-900">{error}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Loan Portfolio"
          value={formatCurrency(stats?.total_loan_active ?? 184250)}
          delta="4.2%"
          deltaDirection="up"
          subtitle="vs last month"
          icon={Wallet}
          tone="navy"
          isLoading={isLoading}
        />
        <StatCard
          label="Monthly Disbursed"
          value={formatCurrency(stats?.monthly_loan_given ?? 42500)}
          subtitle="38 loans created"
          icon={TrendingUp}
          tone="navy"
          isLoading={isLoading}
        />
        <StatCard
          label="Active Pawn Tickets"
          value={String(stats?.total_active_tickets ?? 38)}
          subtitle="1 overdue ticket"
          icon={Ticket}
          tone="navy"
          isLoading={isLoading}
        />
        <StatCard
          label="Interest Realized"
          value={formatCurrency(stats?.interest_collected ?? 4850)}
          delta="12.0%"
          deltaDirection="up"
          subtitle="accrued this cycle"
          icon={DollarSign}
          tone="emerald"
          isLoading={isLoading}
        />
      </div>

      {/* Quick Action Ribbon */}
      <div className="rounded-xl border border-[#E7E9EC] bg-[#F6F7F8] p-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-[#14181F] flex items-center gap-1.5 pl-2">
          <ShieldCheck className="h-4 w-4 text-[#314259]" />
          Quick Actions:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/customers/new"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E9EC] bg-white px-2.5 py-1.5 text-xs font-medium text-[#14181F] hover:bg-[#F6F7F8] transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5 text-[#8A94A3]" />
            New Customer
          </Link>
          <Link
            href="/inventory"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E9EC] bg-white px-2.5 py-1.5 text-xs font-medium text-[#14181F] hover:bg-[#F6F7F8] transition-colors"
          >
            <Package className="h-3.5 w-3.5 text-[#8A94A3]" />
            Collateral Vault
          </Link>
          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E9EC] bg-white px-2.5 py-1.5 text-xs font-medium text-[#14181F] hover:bg-[#F6F7F8] transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#8A94A3]" />
            Financial Audit
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#14181F]">
                Customer Demographics
              </h2>
              <p className="text-xs text-[#8A94A3]">
                Gender distribution across registered borrowers
              </p>
            </div>
          </div>
          <GenderPieChart data={genderData} isLoading={isLoading} />
        </div>

        <div className="rounded-xl border border-[#E7E9EC] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#14181F]">
                Regional Loan Concentration
              </h2>
              <p className="text-xs text-[#8A94A3]">
                Pawn volume breakdown by customer city area
              </p>
            </div>
          </div>
          <AreaPieChart data={areaData} isLoading={isLoading} />
        </div>
      </div>

      {/* Top Borrowers & Recent Stream */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top Borrowers */}
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#14181F]">
                Top Active Borrowers
              </h2>
              <p className="text-xs text-[#8A94A3]">
                Clients with largest collateral loan exposure
              </p>
            </div>
            <Link
              href="/customers"
              className="text-xs font-medium text-[#314259] hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 rounded bg-[#F6F7F8]" />
              ))}
            </div>
          ) : topCustomers.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8A94A3]">
              No active borrower records found
            </div>
          ) : (
            <div className="divide-y divide-[#E7E9EC]">
              {topCustomers.map((customer, index) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F6F7F8] text-[11px] font-mono font-semibold text-[#55606D]">
                      {index + 1}
                    </span>
                    <Link
                      href={`/customers/${customer.id}`}
                      className="text-xs font-medium text-[#14181F] hover:underline"
                    >
                      {customer.full_name}
                    </Link>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold font-mono text-[#14181F]">
                      {formatCurrency(customer.total_loan)}
                    </span>
                    <span className="block text-[10px] text-[#8A94A3]">
                      {customer.active_tickets ?? 1} active ticket(s)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Operational Activity */}
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#8A94A3]" />
              <div>
                <h2 className="text-sm font-semibold text-[#14181F]">
                  Recent Activity Stream
                </h2>
                <p className="text-xs text-[#8A94A3]">
                  Audit log of tickets, payments, and settlements
                </p>
              </div>
            </div>
            <Link
              href="/transactions"
              className="text-xs font-medium text-[#314259] hover:underline inline-flex items-center gap-1"
            >
              Full log <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 rounded bg-[#F6F7F8]" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8A94A3]">
              No activity logged today
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-[#F6F7F8]/60 transition-colors"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#314259]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#14181F] leading-snug">
                      {activity.message}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#8A94A3]">
                      <span>{formatRelativeTime(activity.createdAt)}</span>
                      {activity.user?.full_name && (
                        <>
                          <span>•</span>
                          <span className="text-[#55606D]">
                            by {activity.user.full_name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />
    </div>
  );
}

