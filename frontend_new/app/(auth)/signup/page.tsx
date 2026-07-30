"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wallet, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { signup, setStoredToken, getApiErrorMessage } from "@/services/api";
import type { AuthResponse } from "@/types/auth";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1E3A66] focus:outline-none focus:ring-1 focus:ring-[#1E3A66] disabled:cursor-not-allowed disabled:opacity-50";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-500";

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

    if (!full_name) {
      setError("Please enter your first and last name.");
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

      const payload = response.data as { data?: AuthResponse };
      const token = payload?.data?.token;
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
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#1E3A66]">
            <Wallet className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Create Your Account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Start managing your pawn shop in one smart system.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className={labelClass}>
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                placeholder="Nikhil"
                className={inputClass}
                value={form.firstName}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className={labelClass}>
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                placeholder="Choudhary"
                className={inputClass}
                value={form.lastName}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="shopName" className={labelClass}>
              Shop Name
            </label>
            <input
              id="shopName"
              name="shopName"
              placeholder="Nikhil Pawn Shop"
              className={inputClass}
              value={form.shopName}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className={inputClass}
              value={form.email}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`${inputClass} pr-10`}
                value={form.password}
                onChange={handleChange}
                disabled={isLoading}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="signup-submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A66] py-2.5 text-sm font-medium text-white hover:bg-[#17294D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[#1E3A66]">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}