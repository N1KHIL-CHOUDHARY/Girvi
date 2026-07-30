"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/Badge";
import { Search, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const TICKETS = [
  { ticket: "TICKET-10021", customer: "Ramesh Kumar", item: "Gold Chain (22K)", amount: "₹10,000", status: "Active", date: "06/05/2025" },
  { ticket: "TICKET-10020", customer: "Suresh Babu", item: "Gold Ring (18K)", amount: "₹7,500", status: "Active", date: "05/05/2025" },
  { ticket: "TICKET-10019", customer: "Meena Devi", item: "Gold Bangles (22K)", amount: "₹15,000", status: "Closed", date: "04/05/2025" },
  { ticket: "TICKET-10018", customer: "Arun Kumar", item: "Gold Chain (22K)", amount: "₹12,000", status: "Active", date: "04/05/2025" },
];

export default function PawnTickets() {
  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Pawn Tickets</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your inventory, payments, and active pledges.</p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-xl bg-[#1E3A66] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#17294D]">
          <Plus className="h-4 w-4" />
          New Ticket
        </button>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search ticket or item..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A66] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1E3A66]"
            />
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600">
            Active
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">Ticket</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Item</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Pawned Date</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {TICKETS.map((t) => (
                <tr key={t.ticket} className="text-sm text-slate-700 hover:bg-slate-50/60">
                  <td className="px-6 py-4 font-medium text-slate-900">{t.ticket}</td>
                  <td className="px-6 py-4">{t.customer}</td>
                  <td className="px-6 py-4">{t.item}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{t.amount}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-500">{t.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button aria-label="View" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button aria-label="Edit" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button aria-label="Delete" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <div className="flex items-center gap-1">
            <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={
                  n === 1
                    ? "h-8 w-8 rounded-lg bg-[#1E3A66] text-sm font-medium text-white"
                    : "h-8 w-8 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100"
                }
              >
                {n}
              </button>
            ))}
            <span className="px-1 text-sm text-slate-400">…</span>
            <button className="h-8 w-8 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100">10</button>
            <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Next page">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <select className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 focus:outline-none">
            <option>10 / page</option>
            <option>25 / page</option>
            <option>50 / page</option>
          </select>
        </div>
      </div>
    </AppShell>
  );
}