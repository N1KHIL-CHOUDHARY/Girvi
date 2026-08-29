"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Shield,
  Store,
  Phone,
  MapPin,
  Pencil,
} from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { profileApi } from "@/services/api";

export default function ProfilePage() {
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await profileApi.getProfile<any>();
      return res;
    },
  });

  const profile = profileResponse?.data?.user || profileResponse?.data || null;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 animate-pulse">
        <div className="h-6 w-32 rounded bg-[#F6F7F8]" />
        <div className="h-48 rounded-xl bg-[#F6F7F8]" />
        <div className="h-48 rounded-xl bg-[#F6F7F8]" />
      </div>
    );
  }

  const fullName = profile?.full_name || profile?.fullName || "User";
  const email = profile?.email || "No email available";
  const role = profile?.role || "Staff";
  const phone = profile?.phone || profile?.phone_number || "Not set";
  const shopName = profile?.shop?.name || "Main Store";
  const shopId = profile?.shop?.id || "—";
  const shopAddress = profile?.shop?.address || "Address not provided";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((p: string) => p[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "U";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="System →"
        title="User & Store Profile"
        subtitle="Active user credentials, role permissions, and store branch metadata."
        actions={
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E9EC] bg-white px-3 py-1.5 text-xs font-semibold text-[#14181F] hover:bg-[#F6F7F8] transition-colors"
          >
            <Pencil className="h-3.5 w-3.5 text-[#55606D]" />
            <span>Edit in Settings</span>
          </Link>
        }
      />

      {/* Profile Overview Card */}
      <div className="rounded-xl border border-[#E7E9EC] bg-white p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#F6F7F8] border border-[#E7E9EC] text-2xl font-semibold text-[#314259]">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#14181F]">
                {fullName}
              </h2>
              <Badge tone="info">{String(role).toUpperCase()}</Badge>
            </div>
            <p className="text-xs text-[#8A94A3] mt-0.5">{email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-[#E7E9EC] pt-4 text-xs">
          <div className="space-y-1">
            <span className="text-[11px] text-[#8A94A3] block">Phone Contact</span>
            <div className="flex items-center gap-2 text-[#14181F]">
              <Phone className="h-3.5 w-3.5 text-[#8A94A3]" />
              <span className="font-mono">{phone}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-[#8A94A3] block">Account Authority</span>
            <div className="flex items-center gap-2 text-[#059669] font-medium">
              <Shield className="h-3.5 w-3.5" />
              <span className="capitalize">{String(role)} Permissions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Store Information Card */}
      <div className="rounded-xl border border-[#E7E9EC] bg-white p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E7E9EC] pb-3">
          <Store className="h-4 w-4 text-[#314259]" />
          <h3 className="text-sm font-semibold text-[#14181F]">
            Store &amp; Branch Information
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
          <div>
            <span className="text-[11px] text-[#8A94A3] block">Business Name</span>
            <span className="font-semibold text-[#14181F]">
              {shopName}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#8A94A3] block">Store ID</span>
            <span className="font-mono text-[#55606D]">
              {shopId}
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="text-[11px] text-[#8A94A3] block">Registered Address</span>
            <div className="flex items-start gap-2 mt-1 text-[#55606D]">
              <MapPin className="h-3.5 w-3.5 text-[#8A94A3] shrink-0 mt-0.5" />
              <span>{shopAddress}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
