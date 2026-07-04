"use client";

import { useState } from "react";
import Link from "next/link";
import { Wallet, Eye, EyeOff } from "lucide-react";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1E3A66] focus:outline-none focus:ring-1 focus:ring-[#1E3A66]";
const labelClass = "mb-1.5 block text-xs font-medium text-slate-500";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#1E3A66]">
            <Wallet className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Welcome Back</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to your Pawn Manager account</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className={labelClass}>Email Address</label>
            <input type="email" placeholder="bala@gmail.com" className={inputClass} />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-slate-500">Password</label>
              <Link href="/forgot-password" className="text-xs font-medium text-[#1E3A66]">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="••••••••" className={`${inputClass} pr-10`} />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#1E3A66] focus:ring-[#1E3A66]" />
            Remember me
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#1E3A66] py-2.5 text-sm font-medium text-white hover:bg-[#17294D]"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-[#1E3A66]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}