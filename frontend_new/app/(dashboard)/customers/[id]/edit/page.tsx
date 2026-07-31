"use client";

import { useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { User } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import FileUpload from "@/components/ui/FileUpload";
import { getAccountById, updateAccount, uploadFile } from "@/services/api";
import { customerKeys } from "@/lib/queryKeys";
import type { CustomerDetail } from "@/types/customer";

interface CustomerFormState {
  full_name: string;
  phone_number: string;
  gender: "Male" | "Female" | "Other";
  line1: string;
  city: string;
  pincode: string;
  aadhaar_number: string;
  pan_number: string;
  customer_photo_url: string;
}

const selectClass =
  "h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-[#1E3A66] focus:outline-none focus:ring-1 focus:ring-[#1E3A66]";

function CustomerEditForm({ id, customer }: { id: string; customer: CustomerDetail }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CustomerFormState>(() => ({
    full_name: customer.full_name || "",
    phone_number: customer.phone_number || "",
    gender: (customer.gender as any) || "Male",
    line1: customer.address?.line1 || "",
    city: customer.address?.city || "",
    pincode: customer.address?.pincode || "",
    aadhaar_number: customer.aadhaar_number || "",
    pan_number: customer.pan_number || "",
    customer_photo_url: customer.customer_photo_url || "",
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => updateAccount(id, payload),
    onSuccess: () => {
      toast.success("Customer updated successfully");
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
      router.push("/customers");
    },
    onError: (error: any) => {
      const payload = error?.response?.data;
      if (payload?.error && typeof payload.error === "object") {
        const details = payload.error.details;
        if (details && typeof details === "object") {
          const fieldErrors: Record<string, string> = {};
          Object.entries(details).forEach(([key, val]) => {
            fieldErrors[key] = Array.isArray(val) ? val.join(", ") : String(val);
          });
          setErrors(fieldErrors);
          toast.error("Please resolve validation errors.");
          return;
        }
      }
      const message =
        payload?.error ||
        payload?.message ||
        "Failed to update customer";
      toast.error(message.replace(/"/g, ""));
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\d{10,}$/.test(formData.phone_number.trim())) {
      newErrors.phone_number = "Phone number must be at least 10 digits";
    }
    if (formData.aadhaar_number.trim()) {
      if (!/^\d{12}$/.test(formData.aadhaar_number.trim())) {
        newErrors.aadhaar_number = "Aadhaar number must be exactly 12 digits";
      }
    }
    if (formData.pan_number.trim()) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number.trim().toUpperCase())) {
        newErrors.pan_number = "Invalid PAN card format (e.g. ABCDE1234F)";
      }
    }
    if (formData.pincode.trim()) {
      if (!/^\d{6}$/.test(formData.pincode.trim())) {
        newErrors.pincode = "Pincode must be exactly 6 digits";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    updateMutation.mutate({
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      gender: formData.gender,
      address: {
        line1: formData.line1,
        city: formData.city,
        pincode: formData.pincode,
      },
      aadhaar_number: formData.aadhaar_number,
      pan_number: formData.pan_number.toUpperCase(),
      customer_photo_url: formData.customer_photo_url || undefined,
    });
  };

  return (
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
            Editing details for {formData.full_name}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              disabled={updateMutation.isPending}
              className={errors.full_name ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""}
            />
            {errors.full_name && (
              <span className="mt-1 block text-xs text-rose-500">{errors.full_name}</span>
            )}
          </div>
          <div>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              inputMode="numeric"
              value={formData.phone_number}
              onChange={handleChange}
              disabled={updateMutation.isPending}
              className={errors.phone_number ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""}
            />
            {errors.phone_number && (
              <span className="mt-1 block text-xs text-rose-500">{errors.phone_number}</span>
            )}
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={updateMutation.isPending}
              className={selectClass}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="line1">Address Line</Label>
            <Input
              id="line1"
              name="line1"
              value={formData.line1}
              onChange={handleChange}
              disabled={updateMutation.isPending}
            />
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={updateMutation.isPending}
            />
          </div>
          <div>
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              name="pincode"
              inputMode="numeric"
              value={formData.pincode}
              onChange={handleChange}
              disabled={updateMutation.isPending}
              className={errors.pincode ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""}
            />
            {errors.pincode && (
              <span className="mt-1 block text-xs text-rose-500">{errors.pincode}</span>
            )}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="aadhaar_number">Aadhaar Number</Label>
            <Input
              id="aadhaar_number"
              name="aadhaar_number"
              inputMode="numeric"
              value={formData.aadhaar_number}
              onChange={handleChange}
              disabled={updateMutation.isPending}
              className={errors.aadhaar_number ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""}
            />
            {errors.aadhaar_number && (
              <span className="mt-1 block text-xs text-rose-500">{errors.aadhaar_number}</span>
            )}
          </div>
          <div>
            <Label htmlFor="pan_number">PAN Number</Label>
            <Input
              id="pan_number"
              name="pan_number"
              autoComplete="off"
              value={formData.pan_number}
              onChange={handleChange}
              disabled={updateMutation.isPending}
              className={errors.pan_number ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : ""}
            />
            {errors.pan_number && (
              <span className="mt-1 block text-xs text-rose-500">{errors.pan_number}</span>
            )}
          </div>
        </div>

        <div className="mb-8">
          <Label>Customer Photo</Label>
          <FileUpload
            value={formData.customer_photo_url}
            onUpload={async (file) => {
              const res = await uploadFile<{ url: string }>(file);
              return res.data.url;
            }}
            onChange={(url) =>
              setFormData((prev) => ({ ...prev, customer_photo_url: url }))
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
            className="flex items-center justify-center rounded-xl bg-[#1E3A66] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#17294D] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function UpdateCustomer() {
  const { id } = useParams<{ id: string }>();

  const {
    data: customerData,
    isLoading: loadingCustomer,
    isError,
  } = useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      const res = await getAccountById<CustomerDetail>(id);
      return res;
    },
  });

  if (isError) {
    notFound();
  }

  if (loadingCustomer || !customerData?.data) {
    return (
      <div className="mx-auto w-full max-w-3xl animate-pulse rounded-2xl border border-slate-100 bg-white p-10 shadow-sm">
        <div className="mb-4 h-6 w-1/3 rounded bg-slate-100" />
        <div className="h-4 w-1/4 rounded bg-slate-100" />
      </div>
    );
  }

  return <CustomerEditForm id={id} customer={customerData.data} />;
}