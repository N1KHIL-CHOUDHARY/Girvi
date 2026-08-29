"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
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
    <div className="w-full max-w-sm rounded-xl border border-[#E7E9EC] bg-white p-7 sm:p-8 space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#314259] text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="mt-3 text-base font-semibold text-[#14181F]">
          Welcome back
        </h1>
        <p className="mt-0.5 text-xs text-[#8A94A3]">
          Sign in to your GIRVI workspace
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" required>
            Email Address
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="password" required className="mb-0">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-medium text-[#55606D] hover:text-[#14181F]"
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

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Sign in to Workspace
        </Button>
      </form>

      <div className="border-t border-[#E7E9EC] pt-4 text-center text-xs text-[#8A94A3]">
        Don't have an account?{" "}
        <Link href="/signup" className="font-semibold text-[#14181F] hover:underline">
          Create store account
        </Link>
      </div>
    </div>
  );
}