"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UserPlus, ArrowLeft, User, MapPin, FileCheck } from "lucide-react";


import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import FileUpload from "@/components/ui/FileUpload";
import { createAccount, uploadFile } from "@/services/api";
import { customerKeys } from "@/lib/queryKeys";

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

const initialState: CustomerFormState = {
  full_name: "",
  phone_number: "",
  gender: "Male",
  line1: "",
  city: "",
  pincode: "",
  aadhaar_number: "",
  pan_number: "",
  customer_photo_url: "",
};

export default function NewCustomer() {
  const [formData, setFormData] = useState<CustomerFormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createAccount(payload),
    onSuccess: () => {
      toast.success("Customer profile created successfully");
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
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
        "Failed to create customer";
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
    if (!validate()) {
      return;
    }

    mutation.mutate({
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
        title="Add Customer"
        subtitle="Onboard a new borrower with verified KYC credentials and contact information."
        breadcrumbs={
          <Link
            href="/customers"
            className="inline-flex items-center gap-1 text-xs text-[#55606D] hover:text-[#14181F]"
          >
            <ArrowLeft className="h-3 w-3" /> Back to directory
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Details */}
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E7E9EC] pb-3">
            <User className="h-4 w-4 text-[#314259]" />
            <h2 className="text-sm font-semibold text-[#14181F]">
              Personal & Contact Details
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
                placeholder="e.g. Robert Downey"
                autoComplete="name"
                value={formData.full_name}
                onChange={handleChange}
                disabled={mutation.isPending}
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
                placeholder="e.g. 9876543210"
                autoComplete="tel"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={mutation.isPending}
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
              disabled={mutation.isPending}
              className="h-10 w-full rounded-xl border border-[#E7E9EC] bg-white px-3.5 text-sm text-[#14181F] focus:border-[#14181F] focus:outline-none focus:ring-1 focus:ring-[#14181F] cursor-pointer"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Section 2: Address Information */}
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
              placeholder="Street address, house/flat number"
              autoComplete="street-address"
              value={formData.line1}
              onChange={handleChange}
              disabled={mutation.isPending}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="city">City / Area</Label>
              <Input
                id="city"
                name="city"
                placeholder="City name"
                autoComplete="address-level2"
                value={formData.city}
                onChange={handleChange}
                disabled={mutation.isPending}
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                name="pincode"
                inputMode="numeric"
                placeholder="6-digit postal code"
                autoComplete="postal-code"
                value={formData.pincode}
                onChange={handleChange}
                disabled={mutation.isPending}
                error={errors.pincode}
              />
            </div>
          </div>
        </div>

        {/* Section 3: KYC Verification */}
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
                placeholder="XXXX XXXX XXXX"
                value={formData.aadhaar_number}
                onChange={handleChange}
                disabled={mutation.isPending}
                error={errors.aadhaar_number}
              />
            </div>
            <div>
              <Label htmlFor="pan_number">PAN Number</Label>
              <Input
                id="pan_number"
                name="pan_number"
                autoComplete="off"
                placeholder="ABCDE1234F"
                value={formData.pan_number}
                onChange={handleChange}
                disabled={mutation.isPending}
                error={errors.pan_number}
              />
            </div>
          </div>

          <div>
            <Label>Customer Photo (Optional)</Label>
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

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-[#E7E9EC] pt-4">
          <Button
            variant="secondary"
            onClick={() => router.push("/customers")}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={mutation.isPending}
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Save Customer
          </Button>
        </div>
      </form>
    </div>
  );
}