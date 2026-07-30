"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FileQuestion, MoveLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  const isRecordNotFound =
    pathname?.includes("/customers/") ||
    pathname?.includes("/pawn-tickets/") ||
    pathname?.includes("/payments/");

  const title = isRecordNotFound ? "Record Not Found" : "Page Not Found";
  const description = isRecordNotFound
    ? "The requested database record does not exist, has been removed, or you do not have permission to access it."
    : "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.";

  return (
    <AppShell>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
          <FileQuestion className="h-8 w-8 text-slate-400" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          404
        </h1>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-800">
          {title}
        </h2>
        <p className="mt-3 max-w-md text-sm text-slate-500">
          {description}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            <MoveLeft className="h-4 w-4" />
            Go Back
          </button>
          <Link
            href="/dashboard"
            className="flex items-center justify-center rounded-xl bg-[#1E3A66] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#17294D]"
          >
            Dashboard Home
          </Link>
        </div>
      </div>
    </AppShell>
  );
}