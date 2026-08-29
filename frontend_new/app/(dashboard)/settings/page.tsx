"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Shield, User, Store, KeyRound, Save } from "lucide-react";
import { profileApi, updateUserPreferences } from "@/services/api";
import { getStoredLanguage, setStoredLanguage } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  language: string;
  phone?: string;
  shop?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
}

interface ProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  shopName: string;
  shopPhone: string;
  shopAddress: string;
}

function SettingsForms({ profile }: { profile: UserProfile }) {
  const queryClient = useQueryClient();
  const [selectedLang, setSelectedLang] = useState<string | undefined>(undefined);

  const [profileForm, setProfileForm] = useState<ProfileFormState>(() => {
    const names = (profile.full_name || "").split(" ");
    return {
      firstName: names[0] || "",
      lastName: names.slice(1).join(" ") || "",
      email: profile.email || "",
      phone: profile.phone || "",
      shopName: profile.shop?.name || "",
      shopPhone: profile.shop?.phone || "",
      shopAddress: profile.shop?.address || "",
    };
  });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const lang = selectedLang ?? profile.language ?? getStoredLanguage();

  const updatePreferencesMutation = useMutation({
    mutationFn: (payload: { language: string }) => updateUserPreferences(payload),
    onSuccess: (_, variables) => {
      toast.success("Preferences updated successfully");
      setStoredLanguage(variables.language);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      window.location.reload();
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to update preferences";
      toast.error(message);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (payload: Partial<ProfileFormState>) => profileApi.updateProfile(payload),
    onSuccess: () => {
      toast.success("Profile and shop details updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to update profile";
      toast.error(message);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: Record<string, string>) => profileApi.changePassword(payload),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to change password";
      toast.error(message);
    },
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    changePasswordMutation.mutate({
      oldPassword,
      newPassword,
    });
  };

  const handleLangSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferencesMutation.mutate({ language: lang });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System →"
        title="Store & User Settings"
        subtitle="Manage personal credentials, store configuration, and regional language preferences."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Profile & Store Configuration */}
        <div className="space-y-6 md:col-span-2">
          <form
            onSubmit={handleProfileSave}
            className="rounded-xl border border-[#E7E9EC] bg-white p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-[#E7E9EC] pb-3">
              <User className="h-4 w-4 text-[#314259]" />
              <h3 className="text-sm font-semibold text-[#14181F]">
                Staff Profile Information
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
                  type="text"
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
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
                  type="text"
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
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
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="text"
                value={profileForm.phone}
                onChange={handleProfileChange}
              />
            </div>

            <div className="flex items-center gap-2 border-b border-[#E7E9EC] pt-3 pb-3">
              <Store className="h-4 w-4 text-[#314259]" />
              <h3 className="text-sm font-semibold text-[#14181F]">
                Pawn Shop Store Profile
              </h3>
            </div>

            <div>
              <Label htmlFor="shopName" required>
                Shop Name / Business Entity
              </Label>
              <Input
                id="shopName"
                name="shopName"
                type="text"
                value={profileForm.shopName}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="shopPhone">Store Contact Number</Label>
              <Input
                id="shopPhone"
                name="shopPhone"
                type="text"
                value={profileForm.shopPhone}
                onChange={handleProfileChange}
              />
            </div>

            <div>
              <Label htmlFor="shopAddress">Registered Store Address</Label>
              <textarea
                id="shopAddress"
                name="shopAddress"
                rows={2}
                className="w-full rounded-xl border border-[#E7E9EC] bg-white p-3 text-xs text-[#14181F] placeholder:text-[#8A94A3] focus:border-[#14181F] focus:outline-none focus:ring-1 focus:ring-[#14181F]"
                value={profileForm.shopAddress}
                onChange={handleProfileChange}
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E7E9EC]">
              <Button
                type="submit"
                variant="primary"
                isLoading={updateProfileMutation.isPending}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Store Profile
              </Button>
            </div>
          </form>

          {/* Security & Password */}
          <form
            onSubmit={handlePasswordSave}
            className="rounded-xl border border-[#E7E9EC] bg-white p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-[#E7E9EC] pb-3">
              <KeyRound className="h-4 w-4 text-[#314259]" />
              <h3 className="text-sm font-semibold text-[#14181F]">
                Security & Password Authentication
              </h3>
            </div>

            <div>
              <Label htmlFor="oldPassword" required>
                Current Password
              </Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="newPassword" required>
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" required>
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E7E9EC]">
              <Button
                type="submit"
                variant="secondary"
                isLoading={changePasswordMutation.isPending}
              >
                Change Password
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Language & Authority */}
        <div className="space-y-6">
          <form
            onSubmit={handleLangSave}
            className="rounded-xl border border-[#E7E9EC] bg-white p-5 space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-[#E7E9EC] pb-3">
              <Globe className="h-4 w-4 text-[#314259]" />
              <h3 className="text-sm font-semibold text-[#14181F]">
                Language &amp; Region
              </h3>
            </div>

            <div>
              <Label htmlFor="language">Preferred Interface Language</Label>
              <select
                id="language"
                value={lang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#E7E9EC] bg-white px-3 text-xs text-[#14181F] focus:border-[#14181F] focus:outline-none focus:ring-1 focus:ring-[#14181F] cursor-pointer"
              >
                <option value="en">English (India / US)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full"
              isLoading={updatePreferencesMutation.isPending}
            >
              Apply Language
            </Button>
          </form>

          {/* Account Authority */}
          <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E7E9EC] pb-3">
              <Shield className="h-4 w-4 text-[#059669]" />
              <h3 className="text-sm font-semibold text-[#14181F]">
                System Authority
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#8A94A3] text-[11px] block">Role Level</span>
                <span className="font-semibold text-[#14181F] capitalize">
                  {profile.role || "Store Administrator"}
                </span>
              </div>
              <div>
                <span className="text-[#8A94A3] text-[11px] block">Shop Reference ID</span>
                <span className="font-mono text-[#55606D] break-all">
                  {profile.shop?.id || "SH-2026-HQ"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await profileApi.getProfile<UserProfile>();
      return res;
    },
  });

  if (isLoading || !profileData?.data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 rounded bg-[#F6F7F8]" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="h-96 rounded-xl bg-[#F6F7F8] md:col-span-2" />
          <div className="h-96 rounded-xl bg-[#F6F7F8] md:col-span-1" />
        </div>
      </div>
    );
  }

  return <SettingsForms profile={profileData.data} />;
}

