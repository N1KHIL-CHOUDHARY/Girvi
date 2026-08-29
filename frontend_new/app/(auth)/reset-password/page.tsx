"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { resetPassword, getApiErrorMessage } from "@/services/api";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/app/(auth)/AuthLayout";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("Reset token is missing from the URL.");
      return;
    }

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({
        token,
        newPassword: password,
      });
      setSuccess("Your password has been reset successfully. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to reset password. The link may have expired."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password" required>
            New Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setError(null);
                setPassword(e.target.value);
              }}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A94A3] hover:text-[#14181F]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword" required>
            Confirm New Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setError(null);
              setConfirmPassword(e.target.value);
            }}
            disabled={isLoading}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Update Password
        </Button>
      </form>
    </>
  );
}

export default function ResetPassword() {
  return (
    <AuthLayout
      eyebrow="New password"
      headline="Choose a password you'll remember."
      subtext="This resets access for your entire store workspace, not just one device."
    >
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-[#14181F]">Set new password</h1>
        <p className="mt-1 text-[13px] text-[#8A94A3]">Create a secure password for your account.</p>
      </div>

      <Suspense fallback={<div className="py-6 text-center text-xs text-[#8A94A3]">Loading token...</div>}>
        <ResetPasswordForm />
      </Suspense>

      <div className="mt-6 border-t border-[#E7E9EC] pt-4 text-center text-xs text-[#8A94A3]">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-[#14181F] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to login</span>
        </Link>
      </div>
    </AuthLayout>
  );
}