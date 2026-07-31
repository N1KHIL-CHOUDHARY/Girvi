"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Globe, Shield, User, Store, KeyRound } from "lucide-react";
import { profileApi, updateUserPreferences } from "@/services/api";
import { getStoredLanguage, setStoredLanguage } from "@/lib/api";
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

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1E3A66] focus:outline-none focus:ring-1 focus:ring-[#1E3A66] disabled:cursor-not-allowed disabled:opacity-50";
const selectClass =
  "h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-[#1E3A66] focus:outline-none focus:ring-1 focus:ring-[#1E3A66]";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-500";

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
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Store Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Configure language localization and access preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <form onSubmit={handleProfileSave} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="h-4.5 w-4.5 text-slate-400" />
              Employee Profile
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className={labelClass}>First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  className={inputClass}
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className={labelClass}>Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className={inputClass}
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                className={inputClass}
                value={profileForm.email}
                onChange={handleProfileChange}
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="text"
                className={inputClass}
                value={profileForm.phone}
                onChange={handleProfileChange}
              />
            </div>

            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pt-4 pb-3 border-b border-slate-100">
              <Store className="h-4.5 w-4.5 text-slate-400" />
              Shop Settings
            </h3>
            <div>
              <label htmlFor="shopName" className={labelClass}>Shop Name</label>
              <input
                id="shopName"
                name="shopName"
                type="text"
                className={inputClass}
                value={profileForm.shopName}
                onChange={handleProfileChange}
                required
              />
            </div>
            <div>
              <label htmlFor="shopPhone" className={labelClass}>Shop Phone</label>
              <input
                id="shopPhone"
                name="shopPhone"
                type="text"
                className={inputClass}
                value={profileForm.shopPhone}
                onChange={handleProfileChange}
              />
            </div>
            <div>
              <label htmlFor="shopAddress" className={labelClass}>Shop Address</label>
              <textarea
                id="shopAddress"
                name="shopAddress"
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1E3A66] focus:outline-none focus:ring-1 focus:ring-[#1E3A66]"
                value={profileForm.shopAddress}
                onChange={handleProfileChange}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="rounded-xl bg-[#1E3A66] px-5 py-2 text-sm font-semibold text-white hover:bg-[#17294D] disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>

          <form onSubmit={handlePasswordSave} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <KeyRound className="h-4.5 w-4.5 text-slate-400" />
              Security & Password
            </h3>
            <div>
              <label htmlFor="oldPassword" className={labelClass}>Current Password</label>
              <input
                id="oldPassword"
                type="password"
                className={inputClass}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword" className={labelClass}>New Password</label>
              <input
                id="newPassword"
                type="password"
                className={inputClass}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelClass}>Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="rounded-xl bg-[#1E3A66] px-5 py-2 text-sm font-semibold text-white hover:bg-[#17294D] disabled:opacity-50"
              >
                {changePasswordMutation.isPending ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleLangSave} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Globe className="h-4.5 w-4.5 text-slate-400" />
              Language Selection
            </h3>
            <div>
              <label htmlFor="language" className={labelClass}>Preferred Language</label>
              <select
                id="language"
                value={lang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className={selectClass}
              >
                <option value="en">English (US)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updatePreferencesMutation.isPending}
                className="w-full rounded-xl bg-slate-100 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Save Preferences
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Shield className="h-4.5 w-4.5 text-slate-400" />
              Account Authority
            </h3>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block mb-0.5">Role Level</span>
                <span className="font-semibold text-slate-800 capitalize">{profile.role}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Shop Reference ID</span>
                <span className="font-mono text-slate-800 break-all">{profile.shop?.id}</span>
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
      <AppShell>
        <div className="mx-auto w-full max-w-3xl animate-pulse space-y-6">
          <div className="h-6 w-32 rounded bg-slate-100" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="h-96 rounded-2xl bg-slate-100 md:col-span-2" />
            <div className="h-96 rounded-2xl bg-slate-100 md:col-span-1" />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SettingsForms profile={profileData.data} />
    </AppShell>
  );
}
