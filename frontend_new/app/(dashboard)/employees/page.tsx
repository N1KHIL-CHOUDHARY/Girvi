"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UserPlus, Pencil, Trash2, Loader2, AlertTriangle, RefreshCw } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui/Badge";
import { useEmployees } from "@/hooks/useEmployees";
import { createEmployee, deleteEmployee, getRoles, getApiErrorMessage } from "@/services/api";
import type { Role } from "@/types/role";
import type { Employee } from "@/types/employee";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1E3A66] focus:outline-none focus:ring-1 focus:ring-[#1E3A66] disabled:cursor-not-allowed disabled:opacity-50";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-500";

interface EmployeeFormState {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  roleId: string;
  phone: string;
}

const initialFormState: EmployeeFormState = {
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  password: "",
  roleId: "",
  phone: "",
};

export default function Employees() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EmployeeFormState>(initialFormState);

  // Fetch employees list
  const { data: employeesData = [], isLoading, error, refetch } = useEmployees();

  // Fetch roles list
  const { data: roles = [], isLoading: isRolesLoading } = useQuery<Role[], Error>({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await getRoles<Role[]>();
      return res.data;
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const createMutation = useMutation({
    mutationFn: (payload: any) => createEmployee(payload),
    onSuccess: () => {
      toast.success("Employee created successfully");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setForm(initialFormState);
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to create employee."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      toast.success("Employee deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to delete employee."));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.username.trim() || !form.password || !form.roleId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password,
      roleId: form.roleId,
      phone: form.phone.trim() || undefined,
    };

    createMutation.mutate(payload);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete employee "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Manage Employees</h1>
          <p className="mt-1 text-sm text-slate-500">Add and manage your staff accounts.</p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-medium text-rose-900">Error loading employees</p>
              <p className="mt-1 text-sm text-rose-700">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        {/* Creation Form */}
        <form onSubmit={handleSubmit} className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 border-b border-slate-50 pb-3">
            <UserPlus className="h-4 w-4 text-slate-400" />
            Add New Employee
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className={labelClass}>First Name *</label>
              <input
                id="firstName"
                name="firstName"
                placeholder="Nikhil"
                value={form.firstName}
                onChange={handleChange}
                disabled={createMutation.isPending}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>Last Name *</label>
              <input
                id="lastName"
                name="lastName"
                placeholder="Choudhary"
                value={form.lastName}
                onChange={handleChange}
                disabled={createMutation.isPending}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>Email Address *</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="nikhil@example.com"
              value={form.email}
              onChange={handleChange}
              disabled={createMutation.isPending}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className={labelClass}>Phone Number</label>
            <input
              id="phone"
              name="phone"
              placeholder="9876543210"
              value={form.phone}
              onChange={handleChange}
              disabled={createMutation.isPending}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="username" className={labelClass}>Username *</label>
            <input
              id="username"
              name="username"
              placeholder="nikhilc"
              value={form.username}
              onChange={handleChange}
              disabled={createMutation.isPending}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>Password *</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              disabled={createMutation.isPending}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="roleId" className={labelClass}>Assign Role *</label>
            <select
              id="roleId"
              name="roleId"
              value={form.roleId}
              onChange={handleChange}
              disabled={createMutation.isPending || isRolesLoading}
              className={`${inputClass} cursor-pointer appearance-none`}
              required
            >
              <option value="">Select role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A66] py-2.5 text-sm font-semibold text-white hover:bg-[#17294D] disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Employee"
            )}
          </button>
        </form>

        {/* List Table */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden h-fit">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Username</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-400" />
                    </td>
                  </tr>
                ) : employeesData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                      No employees registered.
                    </td>
                  </tr>
                ) : (
                  employeesData.map((e: Employee) => {
                    const fullName = `${e.firstName} ${e.lastName}`.trim() || "N/A";
                    const roleName = typeof e.role === "object" ? e.role.name : e.role;
                    const statusText = e.isActive ? "Active" : "Inactive";

                    return (
                      <tr key={e.id} className="text-sm text-slate-700 hover:bg-slate-50/60">
                        <td className="px-6 py-4 font-medium text-slate-900">{fullName}</td>
                        <td className="px-6 py-4 font-mono">{e.username}</td>
                        <td className="px-6 py-4">{e.email}</td>
                        <td className="px-6 py-4 capitalize">{roleName}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={statusText} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleDelete(e.id, fullName)}
                              disabled={deleteMutation.isPending}
                              aria-label="Delete"
                              className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}