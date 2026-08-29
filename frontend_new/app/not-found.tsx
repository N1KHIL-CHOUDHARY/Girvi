"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HelpCircle, MoveLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F6F7F8] p-4 text-center">
      <div className="w-full max-w-md rounded-xl border border-[#E7E9EC] bg-white p-8 space-y-5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F6F7F8] border border-[#E7E9EC] text-[#314259]">
          <HelpCircle className="h-6 w-6" />
        </div>

        <div>
          <span className="font-mono text-xs font-semibold text-[#8A94A3] uppercase tracking-wider block">
            Error 404
          </span>
          <h1 className="mt-1 text-lg font-semibold text-[#14181F]">
            Page or Record Not Found
          </h1>
          <p className="mt-1 text-xs text-[#55606D] leading-relaxed">
            The requested database record, pawn ticket, or workspace route does not exist or has been relocated.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.back()}
            leftIcon={<MoveLeft className="h-3.5 w-3.5" />}
          >
            Go Back
          </Button>
          <Link href="/dashboard">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Home className="h-3.5 w-3.5" />}
            >
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}