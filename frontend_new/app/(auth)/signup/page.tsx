"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import { signup, setStoredToken, getApiErrorMessage } from "@/services/api";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { AuthLayout } from "@/app/(auth)/AuthLayout";
import type { AuthResponse } from "@/types/auth";

interface SignupForm {
  firstName: string;
  lastName: string;
  shopName: string;
  email: string;
  password: string;
}

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState<SignupForm>({
    firstName: "",
    lastName: "",
    shopName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const full_name = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();

    if (!full_name || !form.shopName.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await signup<AuthResponse>({
        full_name,
        shop_name: form.shopName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      const payload = response.data as unknown as AuthResponse;
      const token = payload?.token;
      if (token) {
        setStoredToken(token);
      }

      router.push("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Signup failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Early access"
      headline="Set up your store's ledger in minutes."
      subtext="No installs, no spreadsheets — just customers, tickets and repayments in one place."
    >
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-[#14181F]">Create store workspace</h1>
        <p className="mt-1 text-[13px] text-[#8A94A3]">Start managing collateralized pawn loans.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName" required>
              First Name
            </Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Nikhil"
              value={form.firstName}
              onChange={handleChange}
              disabled={isLoading}
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
              placeholder="Choudhary"
              value={form.lastName}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="shopName" required>
            Store / Business Name
          </Label>
          <Input
            id="shopName"
            name="shopName"
            placeholder="Choudhary Pawn Brokers"
            value={form.shopName}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <Label htmlFor="email" required>
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@girvi.io"
            value={form.email}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <Label htmlFor="password" required>
            Password (Min 6 chars)
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              disabled={isLoading}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A94A3] hover:text-[#14181F]"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          id="signup-submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Create Account &amp; Store
        </Button>
      </form>

      <div className="mt-6 border-t border-[#E7E9EC] pt-4 text-center text-xs text-[#8A94A3]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#14181F] hover:underline">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}