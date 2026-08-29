"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BarChart3,
  Users,
  Ticket,
  CreditCard,
  FileText,
  Settings,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  eyebrow: string;
  headline: string;
  subtext: string;
}

export function AuthLayout({
  children,
  eyebrow,
  headline,
  subtext,
}: AuthLayoutProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Smooth Canvas Radial Shader Effect matching the Landing Page Hero
  useEffect(() => {
    const container = panelRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = container.offsetWidth);
    let height = (canvas.height = container.offsetHeight);

    let targetX = width / 2;
    let targetY = height / 3;
    let currentX = width / 2;
    let currentY = height / 3;

    let rafId: number | null = null;
    let active = true;

    const handleResize = () => {
      if (!container || !canvas) return;
      const dpr = window.devicePixelRatio || 1;
      width = container.offsetWidth;
      height = container.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      targetX = width / 2;
      targetY = height / 3;
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    let time = 0;

    const render = () => {
      if (!active) return;
      time += 0.015;

      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // Canvas Base Layer
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Node 1: Indigo/Purple Glow
      const orb1X = currentX + Math.sin(time * 0.8) * 60;
      const orb1Y = currentY + Math.cos(time * 0.6) * 45;
      const grad1 = ctx.createRadialGradient(
        orb1X,
        orb1Y,
        0,
        orb1X,
        orb1Y,
        width * 0.55
      );
      grad1.addColorStop(0, "rgba(167, 139, 250, 0.40)");
      grad1.addColorStop(0.35, "rgba(129, 140, 248, 0.25)");
      grad1.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Node 2: Amber Glow Accent
      const orb2X = width - currentX * 0.5 + Math.cos(time * 0.5) * 80;
      const orb2Y = height * 0.2 + Math.sin(time * 0.7) * 50;
      const grad2 = ctx.createRadialGradient(
        orb2X,
        orb2Y,
        0,
        orb2X,
        orb2Y,
        width * 0.45
      );
      grad2.addColorStop(0, "rgba(251, 191, 36, 0.30)");
      grad2.addColorStop(0.5, "rgba(245, 158, 11, 0.15)");
      grad2.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Node 3: Sky Blue Bottom Glow
      const orb3X = width * 0.3 + Math.cos(time * 0.4) * 90;
      const orb3Y = height * 0.75 + Math.sin(time * 0.5) * 40;
      const grad3 = ctx.createRadialGradient(
        orb3X,
        orb3Y,
        0,
        orb3X,
        orb3Y,
        width * 0.5
      );
      grad3.addColorStop(0, "rgba(56, 189, 248, 0.22)");
      grad3.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad3;
      ctx.fillRect(0, 0, width, height);

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      active = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#14181F] selection:bg-[#314259] selection:text-white antialiased font-sans lg:grid lg:grid-cols-2">
      {/* =========================================================
          FORM SECTION
      ========================================================= */}
      <section className="flex min-h-screen flex-col px-6 py-7 sm:px-10 lg:px-16 lg:py-9">
        {/* Logo Header */}
        <Link
          href="/"
          className="group flex w-fit items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <Image
            src="/icon.png"
            alt="GIRVI logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-bold text-[16px] tracking-tight text-[#14181F]">
            GIRVI
          </span>
        </Link>

        {/* Auth Form Children */}
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[390px]">{children}</div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[12px] text-[#8A94A3]">
          <span>© 2026 GIRVI. All rights reserved.</span>

          <div className="hidden gap-4 sm:flex">
            <span className="hover:text-[#14181F] cursor-pointer transition-colors">
              Privacy
            </span>
            <span className="hover:text-[#14181F] cursor-pointer transition-colors">
              Terms
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================
          BRAND PANEL (Interactive Landing Page Design Match)
      ========================================================= */}
      <section
        ref={panelRef}
        className="
          relative
          hidden
          min-h-screen
          overflow-hidden
          border-l
          border-[#E7E9EC]
          bg-white
          lg:flex
          lg:flex-col
          lg:justify-between
          px-10
          py-12
          xl:px-14
          xl:py-14
        "
      >
        {/* Canvas Background Layer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* Top Header & Copy */}
        <div className="relative z-20">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 border border-indigo-100/80 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
            <span className="uppercase tracking-wider text-[10px]">
              {eyebrow}
            </span>
          </div>

          <div className="mt-5 max-w-[440px]">
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-[#14181F] leading-[1.15]">
              {headline}
            </h2>

            <p className="mt-3 text-[14px] leading-relaxed text-[#55606D]">
              {subtext}
            </p>
          </div>
        </div>

        {/* Dashboard Preview Glass Mockup (Mirrors Landing Page Hero Card) */}
        <div className="relative z-20 flex items-center justify-center py-6">
          <div
            className="
              relative
              w-full
              max-w-[540px]
              -rotate-[1.5deg]
              transition-all
              duration-500
              ease-out
              hover:rotate-0
            "
          >
            {/* Soft Ambient Shadow */}
            <div className="absolute -inset-4 rounded-3xl bg-indigo-500/10 blur-2xl pointer-events-none" />

            {/* Glass Dashboard Container */}
            <div className="relative w-full rounded-2xl border border-white/80 bg-white/80 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 overflow-hidden text-left">
              {/* Window Bar */}
              <div className="bg-slate-100/70 border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="text-[11px] font-medium text-slate-400">
                  girvi.app/dashboard
                </div>
                <div className="w-4" />
              </div>

              {/* Main Dashboard Layout */}
              <div className="p-4 grid grid-cols-12 gap-3.5">
                {/* Mini Sidebar */}
                <div className="col-span-3 border-r border-slate-100 pr-2.5 space-y-1.5 text-[11px]">
                  <div className="font-bold text-[#14181F] mb-2.5 flex items-center gap-1 text-[11px]">
                    <div className="w-2 h-2 rounded-full bg-indigo-600" /> GIRVI
                  </div>
                  <div className="px-2 py-1 rounded-md bg-indigo-50 font-semibold text-indigo-600 flex items-center gap-1.5">
                    <BarChart3 className="w-3 h-3" /> Dashboard
                  </div>
                  <div className="px-2 py-1 text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> Customers
                  </div>
                  <div className="px-2 py-1 text-slate-500 flex items-center gap-1.5">
                    <Ticket className="w-3 h-3" /> Tickets
                  </div>
                  <div className="px-2 py-1 text-slate-500 flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" /> Payments
                  </div>
                </div>

                {/* Dashboard Main Area */}
                <div className="col-span-9 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">
                      Good morning, Manager 👋
                    </span>
                    <span className="text-[9px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                      Live
                    </span>
                  </div>

                  {/* Top Stats */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold block">
                        Active Loans
                      </span>
                      <span className="text-[11px] font-bold font-mono text-slate-800">
                        $184,250
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold block">
                        Interest
                      </span>
                      <span className="text-[11px] font-bold font-mono text-emerald-600">
                        +$4,850
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold block">
                        Vault Items
                      </span>
                      <span className="text-[11px] font-bold text-slate-800">
                        412
                      </span>
                    </div>
                  </div>

                  {/* Activity Feed */}
                  <div className="rounded-xl border border-slate-100 p-2.5 bg-slate-50/50">
                    <span className="text-[10px] font-semibold text-slate-700 block mb-1.5">
                      Recent Activity
                    </span>
                    <div className="space-y-1.5 text-[9.5px]">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <span>
                          New ticket{" "}
                          <strong className="text-slate-700">
                            #4092 · Robert D.
                          </strong>
                        </span>
                        <span className="text-slate-400 font-mono">10:30 AM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>
                          Payment rec.{" "}
                          <strong className="text-slate-700">
                            #3824 · Clara O.
                          </strong>
                        </span>
                        <span className="text-slate-400 font-mono">09:45 AM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Collateral Badge (Landing Page Style) */}
            <div
              className="
                absolute
                -bottom-5
                -right-4
                w-[185px]
                rotate-[4deg]
                rounded-xl
                border
                border-white/80
                bg-white/95
                p-3
                shadow-xl
                shadow-indigo-500/10
                backdrop-blur-md
              "
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400">
                  Collateral Ticket
                </span>
                <span className="text-[8.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  #4092
                </span>
              </div>

              <div className="text-[11px] font-bold text-slate-800">
                Gold Necklace · 22K
              </div>
              <div className="text-[9px] text-slate-400">Gross: 18.40 grams</div>

              <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[8.5px] text-slate-400">Principal</span>
                <span className="font-mono text-[10px] font-bold text-slate-800">
                  $1,200.00
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-20 flex items-center justify-between border-t border-[#E7E9EC] pt-4 text-[12px] text-[#8A94A3]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Simple
            records. Smarter pledges.
          </span>
          <span className="font-mono text-[11px]">GIRVI / 01</span>
        </div>
      </section>
    </main>
  );
}