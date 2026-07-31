"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Globe, Shield } from "lucide-react";
import { getProfile, updateUserPreferences } from "@/services/api";
import { getStoredLanguage, setStoredLanguage } from "@/lib/api";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  language: string;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [selectedLang, setSelectedLang] = useState<string | undefined>(undefined);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await getProfile<UserProfile>();
      return res;
    },
  });

  const lang = selectedLang ?? profileData?.data?.language ?? getStoredLanguage();

  const updateMutation = useMutation({
    mutationFn: (payload: { language: string }) => updateUserPreferences(payload),
    onSuccess: (_, variables) => {
      toast.success("Preferences updated successfully");
      setStoredLanguage(variables.language);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      window.location.reload();
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to update preferences";
      toast.error(message);
    },
  });

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLang(e.target.value);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ language: lang });
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Store Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Configure language localization and access preferences.</p>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="h-6 w-32 rounded bg-slate-100" />
            <div className="h-10 w-full rounded bg-slate-100" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-slate-400" />
                Localization & Preferences
              </h3>

              <div>
                <label htmlFor="language" className="mb-1.5 block text-xs font-medium text-slate-500">
                  Preferred App Language
                </label>
                <select
                  id="language"
                  value={lang}
                  onChange={handleLanguageChange}
                  className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-[#1E3A66] focus:outline-none focus:ring-1 focus:ring-[#1E3A66]"
                >
                  <option value="en">English (US)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </select>
                <p className="mt-1.5 text-xs text-slate-400">
                  Select the display language for pawn receipts, dashboards, and audit summaries.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-slate-400" />
                Account Authority
              </h3>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-500">Authorized User: </span>
                  <span className="font-semibold text-slate-800">{profileData?.data?.full_name}</span>
                </div>
                <div>
                  <span className="text-slate-500">Role level: </span>
                  <span className="font-semibold text-slate-800 capitalize">{profileData?.data?.role}</span>
                </div>
                <div>
                  <span className="text-slate-500">Email Reference: </span>
                  <span className="font-semibold text-[#1E3A66]">{profileData?.data?.email}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center justify-center rounded-xl bg-[#1E3A66] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#17294D] disabled:opacity-50"
              >
                {updateMutation.isPending ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
