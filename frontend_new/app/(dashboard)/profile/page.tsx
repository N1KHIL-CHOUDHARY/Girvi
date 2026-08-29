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
  const { data: profileData } = useQuery({

    queryKey: ["profile"],
    queryFn: async () => {
      const res = await profileApi.getProfile<any>();
      return res.data;
    },
  });

  const profile = profileData || {
    full_name: "Nikhil Choudhary",
    email: "nikhil@grivi.io",
    role: "Administrator",

    phone: "+91 98765 43210",
    shop: {
      id: "SH-2026-HQ",
      name: "Choudhary Jewelers & Pawn Brokers",
      phone: "+91 98765 00000",
      address: "Suite 402, Zaveri Bazaar, Mumbai 400002",
    },
  };

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
            {(profile.full_name || "AD").substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#14181F]">
                {profile.full_name}
              </h2>
              <Badge tone="info">{profile.role?.toUpperCase() || "ADMIN"}</Badge>
            </div>
            <p className="text-xs text-[#8A94A3] mt-0.5">{profile.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-[#E7E9EC] pt-4 text-xs">
          <div className="space-y-1">
            <span className="text-[11px] text-[#8A94A3] block">Phone Contact</span>
            <div className="flex items-center gap-2 text-[#14181F]">
              <Phone className="h-3.5 w-3.5 text-[#8A94A3]" />
              <span className="font-mono">{profile.phone || "Not set"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-[#8A94A3] block">Account Authority</span>
            <div className="flex items-center gap-2 text-[#059669] font-medium">
              <Shield className="h-3.5 w-3.5" />
              <span>Full System Administrator Access</span>
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
              {profile.shop?.name || "Main Branch"}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#8A94A3] block">Store ID</span>
            <span className="font-mono text-[#55606D]">
              {profile.shop?.id || "SH-2026-HQ"}
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="text-[11px] text-[#8A94A3] block">Registered Address</span>
            <div className="flex items-start gap-2 mt-1 text-[#55606D]">
              <MapPin className="h-3.5 w-3.5 text-[#8A94A3] shrink-0 mt-0.5" />
              <span>{profile.shop?.address || "Address registered on file"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
