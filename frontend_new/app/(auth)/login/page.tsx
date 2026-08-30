"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, AlertCircle, ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { login, setStoredToken, getApiErrorMessage } from "@/services/api";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import type { AuthResponse } from "@/types/auth";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await login<AuthResponse>({
        email: email.trim(),
        password,
      });

      const payload = response.data;
      const token = payload.token;

      if (token) {
        setStoredToken(token);
      }

      router.push("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Login failed. Please verify your credentials."));
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
      <header className="relative z-10 mx-auto w-full max-w-md flex justify-center pt-2 pb-4">
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
      <div className="relative z-10 mx-auto w-full max-w-[420px] my-auto">
        <div className="rounded-2xl border border-[#E7E9EC] bg-white p-7 sm:p-9 shadow-[0_4px_24px_-4px_rgba(20,24,31,0.06)]">
          {/* Title & Subtitle */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#14181F]">
              Welcome back
            </h1>
            <p className="mt-1.5 text-[13.5px] text-[#55606D]">
              Sign in to manage your store &amp; collateral ledger
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" required>
                Email Address
              </Label>
              <div className="relative mt-1">
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
                  className="pl-9"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A94A3] pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="password" required className="mb-0">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#55606D] hover:text-[#14181F] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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
                  className="pl-9 pr-10"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A94A3] pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A94A3] hover:text-[#14181F] focus:outline-none transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 text-sm font-semibold mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign in to Workspace
            </Button>
          </form>

          {/* Divider & Switch Route */}
          <div className="mt-6 border-t border-[#E7E9EC] pt-5 text-center text-[13px] text-[#55606D]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#14181F] hover:underline underline-offset-2"
            >
              Create store account
            </Link>
          </div>
        </div>

        {/* Security / Guarantee Badge */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-[#8A94A3]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>256-bit encrypted &amp; audit-compliant ledger</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-md pt-6 pb-2 text-center text-xs text-[#8A94A3]">
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