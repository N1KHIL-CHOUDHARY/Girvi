"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/ui/StatCard";
import { Sparkline } from "@/components/ui/SparkLine";
import {
  Wallet,
  TrendingUp,
  Ticket,
  AlertTriangle,
  Plus,
  Receipt,
  UserPlus,
  FilePlus2,
  Printer,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

const UPCOMING_PAYMENTS = [
  { name: "Ramesh Kumar", amount: "₹12,500" },
  { name: "Suresh Babu", amount: "₹8,750" },
  { name: "Meena Devi", amount: "₹6,200" },
  { name: "Arun Kumar", amount: "₹15,000" },
];

const RECENT_ACTIVITY = [
  { text: "Payment received from Ramesh Kumar", time: "10 min ago", tone: "success" as const },
  { text: "New loan created for Suresh Babu", time: "25 min ago", tone: "info" as const },
  { text: "Pawn ticket created — ticket-10012", time: "45 min ago", tone: "info" as const },
];

const QUICK_ACTIONS = [
  { label: "Create Loan", icon: Plus, primary: true },
  { label: "Receive Payment", icon: Receipt },
  { label: "Add Customer", icon: UserPlus },
  { label: "New Pawn Ticket", icon: FilePlus2 },
  { label: "Print Receipt", icon: Printer },
];

const ACTIVITY_DOT: Record<string, string> = {
  success: "bg-emerald-500",
  info: "bg-blue-500",
};

export default function Dashboard() {
  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Good morning, Nikhil 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <button className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          May 06, 2025
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Cash in Hand" value="₹1,24,500" delta="12.5% vs yesterday" icon={Wallet} tone="emerald" />
        <StatCard label="Money Lent" value="₹8,45,200" delta="8.2% vs yesterday" icon={TrendingUp} tone="blue" />
        <StatCard label="Active Loans" value="128" delta="5 vs yesterday" icon={Ticket} tone="violet" />
        <StatCard
          label="Overdue Loans"
          value="16"
          delta="2 vs yesterday"
          deltaDirection="down"
          icon={AlertTriangle}
          tone="rose"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Quick Actions</h3>
          <div className="space-y-2">
            {QUICK_ACTIONS.map(({ label, icon: Icon, primary }) => (
              <button
                key={label}
                className={
                  primary
                    ? "flex w-full items-center gap-2.5 rounded-xl bg-[#1E3A66] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#17294D]"
                    : "flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Upcoming Payments</h3>
          <div className="space-y-4">
            {UPCOMING_PAYMENTS.map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {p.name[0]}
                  </div>
                  <span className="text-sm text-slate-700">{p.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{p.amount}</span>
              </div>
            ))}
          </div>
          <button className="mt-5 flex items-center gap-1 text-xs font-medium text-[#1E3A66]">
            View all upcoming <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-slate-900">Collections (Today)</h3>
          <p className="text-2xl font-semibold tracking-tight text-slate-900">₹28,450</p>
          <p className="text-xs font-medium text-emerald-600">+18.6% vs yesterday</p>
          <div className="mt-4 h-24">
            <Sparkline data={[10, 14, 11, 18, 15, 22, 28]} height={100} color="#1E3A66" />
          </div>
          <button className="mt-3 flex items-center gap-1 text-xs font-medium text-[#1E3A66]">
            View collections report <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-sm font-semibold text-slate-900">Recent Activity</h3>
          <div className="space-y-5">
            {RECENT_ACTIVITY.map((a) => (
              <div key={a.text} className="flex items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${ACTIVITY_DOT[a.tone]}`} />
                <div>
                  <p className="text-sm text-slate-700">{a.text}</p>
                  <p className="text-xs text-slate-400">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-5 flex items-center gap-1 text-xs font-medium text-[#1E3A66]">
            View all activity <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Performance Overview</h3>
            <button className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
              This Month <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mb-2 text-xs text-slate-400">Loan portfolio trend</p>
          <div className="h-36">
            <Sparkline data={[8000, 8300, 7900, 8600, 8400, 9100, 10000]} height={140} color="#1E3A66" />
          </div>
          <button className="mt-3 flex items-center gap-1 text-xs font-medium text-[#1E3A66]">
            View full report <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}