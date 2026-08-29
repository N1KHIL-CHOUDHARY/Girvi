"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  UserPlus,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Users,
} from "lucide-react";


import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { PageHeader } from "@/components/ui/PageHeader";
import { useEmployees } from "@/hooks/useEmployees";
import { createEmployee, deleteEmployee, getRoles, getApiErrorMessage } from "@/services/api";
import type { Role } from "@/types/role";
import type { Employee } from "@/types/employee";

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
      toast.success("Staff account created successfully");
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
      toast.success("Employee account removed");
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Management →"
        title="Staff & Role Permissions"
        subtitle="Manage appraiser, cashier, and administrator credentials and store access."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-xs font-medium text-red-900">{error.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        {/* Add Employee Form */}
        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-xl border border-[#E7E9EC] bg-white p-5 space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-[#E7E9EC] pb-3">
            <UserPlus className="h-4 w-4 text-[#314259]" />
            <h3 className="text-sm font-semibold text-[#14181F]">
              Add Staff Member
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" required>
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Priya"
                value={form.firstName}
                onChange={handleChange}
                disabled={createMutation.isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" required>
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Sharma"
                value={form.lastName}
                onChange={handleChange}
                disabled={createMutation.isPending}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" required>
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="priya@grivi.io"
              value={form.email}
              onChange={handleChange}
              disabled={createMutation.isPending}
              required
            />

          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="9876543210"
              value={form.phone}
              onChange={handleChange}
              disabled={createMutation.isPending}
            />
          </div>

          <div>
            <Label htmlFor="username" required>
              Username
            </Label>
            <Input
              id="username"
              name="username"
              placeholder="priyas"
              value={form.username}
              onChange={handleChange}
              disabled={createMutation.isPending}
              required
            />
          </div>

          <div>
            <Label htmlFor="password" required>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              disabled={createMutation.isPending}
              required
            />
          </div>

          <div>
            <Label htmlFor="roleId" required>
              Assigned Role
            </Label>
            <select
              id="roleId"
              name="roleId"
              value={form.roleId}
              onChange={handleChange}
              disabled={createMutation.isPending || isRolesLoading}
              className="h-10 w-full rounded-xl border border-[#E7E9EC] bg-white px-3 text-xs text-[#14181F] focus:border-[#14181F] focus:outline-none focus:ring-1 focus:ring-[#14181F] cursor-pointer"
              required
            >
              <option value="">Select role</option>
              {Array.isArray(roles) &&
                roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                  </option>
                ))}
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={createMutation.isPending}
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Create Staff Account
          </Button>
        </form>

        {/* Staff Roster Table */}
        <div className="rounded-xl border border-[#E7E9EC] bg-white overflow-hidden h-fit">
          <div className="border-b border-[#E7E9EC] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#314259]" />
              <h3 className="text-sm font-semibold text-[#14181F]">Staff Roster</h3>
            </div>
            <span className="text-xs text-[#8A94A3]">
              {employeesData.length} team members
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E9EC] bg-[#F6F7F8] text-[11px] font-semibold text-[#55606D] uppercase tracking-wider">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E9EC]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-[#8A94A3]">
                      Loading staff roster...
                    </td>
                  </tr>
                ) : !Array.isArray(employeesData) || employeesData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-[#8A94A3]">
                      No employee accounts registered yet.
                    </td>
                  </tr>
                ) : (
                  employeesData.map((e: Employee) => {
                    const fullName = `${e.firstName} ${e.lastName}`.trim() || "N/A";
                    const roleName = typeof e.role === "object" ? e.role.name : e.role;
                    const statusText = e.isActive ? "Active" : "Inactive";

                    return (
                      <tr key={e.id} className="hover:bg-[#F6F7F8]/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F6F7F8] border border-[#E7E9EC] font-semibold text-[#314259]">
                              {e.firstName.substring(0, 1)}
                            </div>
                            <div>
                              <span className="font-semibold text-[#14181F] block">{fullName}</span>
                              <span className="text-[11px] text-[#8A94A3]">{e.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#55606D]">{e.username}</td>
                        <td className="py-3.5 px-4">
                          <Badge tone="neutral">{roleName?.toUpperCase() || "STAFF"}</Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={statusText} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDelete(e.id, fullName)}
                            disabled={deleteMutation.isPending}
                            aria-label="Delete"
                            className="rounded-lg p-1.5 text-[#8A94A3] hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
    </div>
  );
}