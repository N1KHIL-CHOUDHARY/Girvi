"use client";

import AreaPieChart from "@/components/ui/AreaPieChart";
import GenderPieChart from "@/components/ui/GenderPieChart";
import { StatCard } from "@/components/ui/StatCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  RefreshCw,
  Ticket,
  TrendingUp,
  Wallet,
} from "lucide-react";

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex animate-pulse items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-100" />
            <div className="h-4 w-32 rounded bg-slate-100" />
          </div>
          <div className="h-4 w-16 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function DashboardErrorNotice({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <p className="text-sm font-medium text-rose-900">
              Could not load dashboard data
            </p>
            <p className="mt-1 text-sm text-rose-700">{message}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void onRetry()}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useDashboardData();

  const stats = data?.stats;
  const topCustomers = data?.top_customers ?? [];
  const recentActivity = data?.recent_activity ?? [];
  const genderData = data?.gender_data ?? [];
  const areaData = data?.area_data ?? [];

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Good morning 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <DashboardErrorNotice message={error} onRetry={refetch} />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Active Loan"
          value={formatCurrency(stats?.total_loan_active)}
          icon={Wallet}
          tone="emerald"
          isLoading={isLoading}
        />
        <StatCard
          label="Loan Given (Last 30 Days)"
          value={formatCurrency(stats?.monthly_loan_given)}
          icon={TrendingUp}
          tone="blue"
          isLoading={isLoading}
        />
        <StatCard
          label="Active Pawn Tickets"
          value={String(stats?.total_active_tickets ?? 0)}
          icon={Ticket}
          tone="violet"
          isLoading={isLoading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <GenderPieChart data={genderData} isLoading={isLoading} />
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <AreaPieChart data={areaData} isLoading={isLoading} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Top Customers
          </h3>
          {isLoading ? (
            <ListSkeleton />
          ) : topCustomers.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No open ticket ledger entries found
            </div>
          ) : (
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <span className="text-sm text-slate-700">
                      {customer.full_name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(customer.total_loan)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">
              Recent Activity
            </h3>
          </div>
          {isLoading ? (
            <ListSkeleton />
          ) : recentActivity.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No recent activity found
            </div>
          ) : (
            <div className="space-y-5">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm text-slate-700">{activity.message}</p>
                    <p className="text-xs text-slate-400">
                      {formatRelativeTime(activity.createdAt)}
                      {activity.user?.full_name
                        ? ` · ${activity.user.full_name}`
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoading && recentActivity.length > 0 && (
            <button
              type="button"
              className="mt-5 flex items-center gap-1 text-xs font-medium text-[#1E3A66]"
            >
              View all activity <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
