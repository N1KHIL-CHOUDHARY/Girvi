"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  User,
  Store,
  Mail,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { signup, setStoredToken, getApiErrorMessage } from "@/services/api";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
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

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
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
    <main className="relative min-h-screen flex flex-col justify-between bg-[#F8F9FA] text-[#14181F] selection:bg-[#314259] selection:text-white antialiased font-sans px-4 py-8 sm:px-6 lg:px-8">
      {/* Subtle Background Glow Accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 -top-24 h-96 w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-100/60 via-purple-50/40 to-transparent blur-3xl" />
      </div>

      {/* Top Header / Brand */}
      <header className="relative z-10 mx-auto w-full max-w-lg flex justify-center pt-2 pb-4">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <Image
            src="/icon.png"
            alt="GIRVI logo"
            width={34}
            height={34}
            className="rounded-lg shadow-sm"
          />
          <span className="text-[17px] font-bold tracking-tight text-[#14181F]">
            GIRVI
          </span>
        </Link>
      </header>

      {/* Main Auth Card */}
      <div className="relative z-10 mx-auto w-full max-w-[480px] my-auto">
        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-7 sm:p-9 shadow-[0_4px_24px_-4px_rgba(20,24,31,0.06)]">
          {/* Title & Subtitle */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#14181F]">
              Create store workspace
            </h1>
            <p className="mt-1.5 text-[13.5px] text-[#55606D]">
              Start managing collateralized pawn loans and repayments
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200/80 bg-red-50/80 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName" required>
                  First Name
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Nikhil"
                    value={form.firstName}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                    className="pl-9"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A94A3] pointer-events-none" />
                </div>
              </div>

              <div>
                <Label htmlFor="lastName" required>
                  Last Name
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Choudhary"
                    value={form.lastName}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="pl-3"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="shopName" required>
                Store / Business Name
              </Label>
              <div className="relative mt-1">
                <Input
                  id="shopName"
                  name="shopName"
                  placeholder="Choudhary Pawn Brokers"
                  value={form.shopName}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className="pl-9"
                />
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A94A3] pointer-events-none" />
              </div>
            </div>

            <div>
              <Label htmlFor="email" required>
                Email Address
              </Label>
              <div className="relative mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@girvi.io"
                  value={form.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className="pl-9"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A94A3] pointer-events-none" />
              </div>
            </div>

            <div>
              <Label htmlFor="password" required>
                Password (Min 6 chars)
              </Label>
              <div className="relative mt-1">
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
                  className="pl-9 pr-10"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A94A3] pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A94A3] hover:text-[#14181F] focus:outline-none transition-colors"
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
              className="w-full h-11 text-sm font-semibold mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Create Account &amp; Store
            </Button>
          </form>

          {/* Divider & Switch Route */}
          <div className="mt-6 border-t border-[#E7E9EC] pt-5 text-center text-[13px] text-[#55606D]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#14181F] hover:underline underline-offset-2"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Security / Guarantee Badge */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-[#8A94A3]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Quick onboarding · Instant ledger access · No credit card required</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-lg pt-6 pb-2 text-center text-xs text-[#8A94A3]">
        <div className="flex items-center justify-center gap-4">
          <span>© 2026 GIRVI. All rights reserved.</span>
          <span className="text-[#E7E9EC]">|</span>
          <Link href="/" className="hover:text-[#14181F] transition-colors">
            Home
          </Link>
        </div>
      </footer>
    </main>
  );
}