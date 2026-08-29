"use client";

import { useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { User, ArrowLeft, MapPin, FileCheck, Save } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
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
      toast.success("Customer profile updated successfully");
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
      router.push(`/customers/${id}`);
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
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Customers →"
        title="Edit Customer Profile"
        subtitle={`Updating information and KYC details for ${formData.full_name}`}
        breadcrumbs={
          <Link
            href={`/customers/${id}`}
            className="inline-flex items-center gap-1 text-xs text-[#55606D] hover:text-[#14181F]"
          >
            <ArrowLeft className="h-3 w-3" /> Back to profile
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E7E9EC] pb-3">
            <User className="h-4 w-4 text-[#314259]" />
            <h2 className="text-sm font-semibold text-[#14181F]">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="full_name" required>
                Full Name
              </Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                disabled={updateMutation.isPending}
                error={errors.full_name}
              />
            </div>
            <div>
              <Label htmlFor="phone_number" required>
                Phone Number
              </Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                inputMode="numeric"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={updateMutation.isPending}
                error={errors.phone_number}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={updateMutation.isPending}
              className="h-10 w-full rounded-xl border border-[#E7E9EC] bg-white px-3.5 text-sm text-[#14181F] focus:border-[#14181F] focus:outline-none focus:ring-1 focus:ring-[#14181F] cursor-pointer"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E7E9EC] pb-3">
            <MapPin className="h-4 w-4 text-[#314259]" />
            <h2 className="text-sm font-semibold text-[#14181F]">
              Residential Address
            </h2>
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="city">City / Area</Label>
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
                error={errors.pincode}
              />
            </div>
          </div>
        </div>

        {/* KYC */}
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E7E9EC] pb-3">
            <FileCheck className="h-4 w-4 text-[#314259]" />
            <h2 className="text-sm font-semibold text-[#14181F]">
              KYC & Identity Verification
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="aadhaar_number">Aadhaar Number (12 Digits)</Label>
              <Input
                id="aadhaar_number"
                name="aadhaar_number"
                inputMode="numeric"
                value={formData.aadhaar_number}
                onChange={handleChange}
                disabled={updateMutation.isPending}
                error={errors.aadhaar_number}
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
                disabled={updateMutation.isPending}
                error={errors.pan_number}
              />
            </div>
          </div>

          <div>
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
              label="Borrower photo"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#E7E9EC] pt-4">
          <Button
            variant="secondary"
            onClick={() => router.push(`/customers/${id}`)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={updateMutation.isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Changes
          </Button>
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
      <div className="mx-auto max-w-3xl space-y-6 animate-pulse">
        <div className="h-6 w-1/3 rounded bg-[#F6F7F8]" />
        <div className="h-64 rounded-xl bg-[#F6F7F8]" />
      </div>
    );
  }

  return <CustomerEditForm id={id} customer={customerData.data} />;
}