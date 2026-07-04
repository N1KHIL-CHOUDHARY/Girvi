"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/Badge";
import { UserPlus, Pencil, Trash2, ChevronDown } from "lucide-react";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1E3A66] focus:outline-none focus:ring-1 focus:ring-[#1E3A66]";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-500";

const EMPLOYEES = [
  { name: "Vignesh S", email: "vignesh@example.com", role: "Manager", status: "Active" },
  { name: "Karthik R", email: "karthik@example.com", role: "Staff", status: "Active" },
  { name: "Deepak M", email: "deepak@example.com", role: "Staff", status: "Active" },
  { name: "Siva K", email: "siva@example.com", role: "Staff", status: "Inactive" },
];

export default function Employees() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Manage Employees</h1>
        <p className="mt-1 text-sm text-slate-500">Add and manage your staff accounts.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <form className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <UserPlus className="h-4 w-4 text-slate-400" />
            Add New Employee
          </h3>

          <div className="mb-4">
            <label className={labelClass}>Full Name</label>
            <input placeholder="Enter full name" className={inputClass} />
          </div>
          <div className="mb-4">
            <label className={labelClass}>Email Address</label>
            <input type="email" placeholder="Enter email address" className={inputClass} />
          </div>
          <div className="mb-4">
            <label className={labelClass}>Phone Number</label>
            <input placeholder="Enter phone number" className={inputClass} />
          </div>
          <div className="mb-6">
            <label className={labelClass}>Role</label>
            <select className={`${inputClass} cursor-pointer appearance-none`}>
              <option value="">Select role</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#1E3A66] py-2.5 text-sm font-medium text-white hover:bg-[#17294D]"
          >
            Create Employee
          </button>
        </form>

        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {EMPLOYEES.map((e) => (
                  <tr key={e.email} className="text-sm text-slate-700 hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-medium text-slate-900">{e.name}</td>
                    <td className="px-6 py-4">{e.email}</td>
                    <td className="px-6 py-4">{e.role}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
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
        </div>
      </div>
    </AppShell>
  );
}