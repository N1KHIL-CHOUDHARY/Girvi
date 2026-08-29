"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { forgotPassword, getApiErrorMessage } from "@/services/api";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/app/(auth)/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      await forgotPassword(email.trim());
      setSuccess("If the email matches an active account, a password reset link has been dispatched.");
      setEmail("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to request password reset. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      headline="We'll get you back into the ledger."
      subtext="Enter your email and we'll send a link to reset your password."
    >
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-[#14181F]">Recover access</h1>
        <p className="mt-1 text-[13px] text-[#8A94A3]">
          Enter your registered email to reset your credentials.
        </p>
      </div>

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
          <Label htmlFor="email" required>
            Registered Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@girvi.io"
            value={email}
            onChange={(e) => {
              setError(null);
              setEmail(e.target.value);
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
          Send Reset Instructions
        </Button>
      </form>

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