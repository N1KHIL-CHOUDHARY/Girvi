"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { User } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import FileUpload from "@/components/ui/FileUpload";
import { getAccountById, updateAccount } from "@/services/api";

interface CustomerFormState {
  firstName: string;
  lastName: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  street: string;
  city: string;
  state: string;
  zipCode: string;
  idNumber: string;
  pan_number: string;
  customer_photo_url: string;
}

const selectClass =
  "h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-[#1E3A66] focus:outline-none focus:ring-1 focus:ring-[#1E3A66]";

export default function UpdateCustomer() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CustomerFormState | null>(null);

  const {
    data: customerData,
    isLoading: loadingCustomer,
    isError,
  } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const res = await getAccountById(id);
      return res.data;
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load customer");
      router.push("/customers");
    }
  }, [isError, router]);

  useEffect(() => {
    if (customerData) {
      setFormData({
        firstName: customerData.firstName || "",
        lastName: customerData.lastName || "",
        phone: customerData.phone || "",
        gender: (customerData as any).gender || "Male",
        street: customerData.address?.street || "",
        city: customerData.address?.city || "",
        state: customerData.address?.state || "",
        zipCode: customerData.address?.zipCode || "",
        idNumber: customerData.identity?.number || "",
        pan_number: (customerData as any).pan_number || "",
        customer_photo_url: (customerData as any).customer_photo_url || "",
      });
    }
  }, [customerData]);

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => updateAccount(id, payload),
    onSuccess: () => {
      toast.success("Customer updated successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      router.push("/customers");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to update customer";
      toast.error(message.replace(/"/g, ""));
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => (prev ? { ...prev, [e.target.name]: e.target.value } : prev));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    updateMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      gender: formData.gender,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
      },
      identity: {
        type: "national_id",
        number: formData.idNumber,
      },
      pan_number: formData.pan_number,
      customer_photo_url: formData.customer_photo_url || undefined,
    });
  };

  if (loadingCustomer || !formData) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-3xl animate-pulse rounded-2xl border border-slate-100 bg-white p-10 shadow-sm">
          <div className="mb-4 h-6 w-1/3 rounded bg-slate-100" />
          <div className="h-4 w-1/4 rounded bg-slate-100" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
            <User className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Update Customer
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Editing details for {formData.firstName} {formData.lastName}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="mb-5">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              name="street"
              autoComplete="street-address"
              value={formData.street}
              onChange={handleChange}
            />
          </div>

          <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                autoComplete="address-level2"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                autoComplete="address-level1"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="zipCode">Pincode / Zip</Label>
              <Input
                id="zipCode"
                name="zipCode"
                inputMode="numeric"
                autoComplete="postal-code"
                value={formData.zipCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="idNumber">National ID Number</Label>
              <Input
                id="idNumber"
                name="idNumber"
                inputMode="numeric"
                value={formData.idNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="pan_number">PAN Number</Label>
              <Input
                id="pan_number"
                name="pan_number"
                autoComplete="off"
                value={formData.pan_number}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-8">
            <Label>Customer Photo</Label>
            <FileUpload
              value={formData.customer_photo_url}
              onChange={(url) =>
                setFormData((prev) => (prev ? { ...prev, customer_photo_url: url } : prev))
              }
              label="Customer photo"
            />
          </div>

          <div className="flex flex-col justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
            <Link
              href="/customers"
              className="flex items-center justify-center rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center justify-center rounded-xl bg-[#1E3A66] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#17294D] disabled:opacity-50"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}