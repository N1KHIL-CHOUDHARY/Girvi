"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Search, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  outstanding: string;
};

const CUSTOMERS: Customer[] = [
  { id: "RK", name: "Ramesh Kumar", phone: "+91 98765 43210", address: "Chennai, 600001", outstanding: "₹25,000" },
  { id: "SB", name: "Suresh Babu", phone: "+91 87654 32109", address: "Chennai, 600045", outstanding: "₹12,500" },
  { id: "MD", name: "Meena Devi", phone: "+91 91234 56789", address: "Chennai, 600078", outstanding: "₹8,750" },
  { id: "AK", name: "Arun Kumar", phone: "+91 99887 66554", address: "Chennai, 600112", outstanding: "₹15,200" },
];

export default function Customers() {
  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage client profiles, KYC details, and histories.</p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-xl bg-[#1E3A66] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#17294D]">
          <Plus className="h-4 w-4" />
          New Customer
        </button>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search customers..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#1E3A66] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1E3A66]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Address</th>
                <th className="px-6 py-3 font-medium">Outstanding</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {CUSTOMERS.map((c) => (
                <tr key={c.name} className="text-sm text-slate-700 hover:bg-slate-50/60">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {c.id}
                      </div>
                      <span className="font-medium text-slate-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{c.phone}</td>
                  <td className="px-6 py-4">{c.address}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{c.outstanding}</td>
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
            <button className="h-8 w-8 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100">20</button>
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