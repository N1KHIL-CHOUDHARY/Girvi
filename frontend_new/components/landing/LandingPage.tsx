"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Users,
  Ticket,
  CreditCard,
  BarChart3,
  Settings,
  Search,
  Check,
  ChevronDown,
  ArrowRight,
  Printer,
  Calculator,
  FileText,
  X,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(true);
  const [activePreviewTab, setActivePreviewTab] = useState<
    "dashboard" | "customers" | "tickets" | "payments" | "reports" | "staff"
  >("dashboard");
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  const [calculatorLoanAmount, setCalculatorLoanAmount] = useState(1000);
  const [calculatorRate, setCalculatorRate] = useState(3);
  const [calculatorMonths, setCalculatorMonths] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");

  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cursor-interactive canvas shader effect + floating card mouse variables
  useEffect(() => {
    const container = heroRef.current;
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

    let targetNormX = 0;
    let targetNormY = 0;
    let currentNormX = 0;
    let currentNormY = 0;

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

      const relX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const relY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetNormX = Math.max(-1, Math.min(1, relX));
      targetNormY = Math.max(-1, Math.min(1, relY));
    };

    const handlePointerLeave = () => {
      targetX = width / 2;
      targetY = height / 3;
      targetNormX = 0;
      targetNormY = 0;
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    let time = 0;

    const render = () => {
      if (!active) return;
      time += 0.015;

      // Smooth interpolation for fluid interactive motion
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      currentNormX += (targetNormX - currentNormX) * 0.05;
      currentNormY += (targetNormY - currentNormY) * 0.05;

      container.style.setProperty("--mouse-x", currentNormX.toFixed(4));
      container.style.setProperty("--mouse-y", currentNormY.toFixed(4));

      ctx.clearRect(0, 0, width, height);

      // Base background layer
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Orbital ambient node 1 (Purple/Indigo Primary Glow)
      const orb1X = currentX + Math.sin(time * 0.8) * 80;
      const orb1Y = currentY + Math.cos(time * 0.6) * 60;
      const grad1 = ctx.createRadialGradient(
        orb1X,
        orb1Y,
        0,
        orb1X,
        orb1Y,
        width * 0.45
      );
      grad1.addColorStop(0, "rgba(167, 139, 250, 0.45)");
      grad1.addColorStop(0.35, "rgba(129, 140, 248, 0.28)");
      grad1.addColorStop(0.7, "rgba(192, 132, 252, 0.12)");
      grad1.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Orbital ambient node 2 (Warm Amber Accent Glow)
      const orb2X = width - currentX * 0.5 + Math.cos(time * 0.5) * 100;
      const orb2Y = height * 0.2 + Math.sin(time * 0.7) * 70;
      const grad2 = ctx.createRadialGradient(
        orb2X,
        orb2Y,
        0,
        orb2X,
        orb2Y,
        width * 0.35
      );
      grad2.addColorStop(0, "rgba(251, 191, 36, 0.35)");
      grad2.addColorStop(0.4, "rgba(245, 158, 11, 0.18)");
      grad2.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Orbital ambient node 3 (Cyan/Sky Soft Bottom Accent Glow)
      const orb3X = width * 0.3 + Math.cos(time * 0.4) * 120;
      const orb3Y = height * 0.75 + Math.sin(time * 0.5) * 50;
      const grad3 = ctx.createRadialGradient(
        orb3X,
        orb3Y,
        0,
        orb3X,
        orb3Y,
        width * 0.4
      );
      grad3.addColorStop(0, "rgba(56, 189, 248, 0.25)");
      grad3.addColorStop(0.5, "rgba(99, 102, 241, 0.12)");
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

  const toggleFaq = (index: number) => {
    setFaqOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const calcInterest = () =>
    (calculatorLoanAmount * (calculatorRate / 100) * calculatorMonths).toFixed(2);
  const calcTotalRepay = () =>
    (calculatorLoanAmount + Number(calcInterest())).toFixed(2);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const demoCustomers = [
    { id: "1", name: "David Miller", city: "Chicago", tickets: 2, totalLoan: 2500, kyc: "Verified" },
    { id: "2", name: "Sophia Martinez", city: "Miami", tickets: 1, totalLoan: 850, kyc: "Verified" },
    { id: "3", name: "James Wilson", city: "Dallas", tickets: 3, totalLoan: 4200, kyc: "Pending Docs" },
    { id: "4", name: "Emma Thompson", city: "New York", tickets: 0, totalLoan: 0, kyc: "Verified" },
  ];
  const filteredCustomers = demoCustomers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const previewTabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "customers", label: "Customers", icon: Users },
    { id: "tickets", label: "Pawn Tickets", icon: Ticket },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "staff", label: "Staff", icon: Settings },
  ] as const;

  const workflowSteps = [
    { step: "01", title: "Customer", desc: "Customer walks in with an item and ID." },
    { step: "02", title: "Search", desc: "Find their profile in seconds." },
    { step: "03", title: "Ticket", desc: "Record collateral and loan terms." },
    { step: "04", title: "Disburse", desc: "Complete the loan and hand over cash." },
    { step: "05", title: "Receipt", desc: "Print the record immediately." },
    { step: "06", title: "Repayment", desc: "Track interest and principal over time." },
    { step: "07", title: "Report", desc: "Understand how the business is doing." },
  ];

  const faqs = [
    {
      q: "Is GIRVI free?",
      a: "GIRVI is currently in early access. Shops that join now get full access while we build alongside real pawnbrokers, and we'll communicate any pricing changes well in advance before they take effect.",
    },
    {
      q: "Do I need to install anything?",
      a: "No. GIRVI runs entirely in your browser, so there's nothing to install or maintain on your store computers — you just sign in and get to work.",
    },
    {
      q: "Can my staff have different permissions?",
      a: "Yes. You can set role-based permissions so cashiers, managers and auditors each see only what's relevant to their role.",
    },
    {
      q: "Can I print pawn tickets and receipts?",
      a: "Yes. Tickets and repayment receipts are laid out for printing directly from your browser, and work with standard desktop printers.",
    },
    {
      q: "How does interest calculation work?",
      a: "GIRVI calculates interest and outstanding balances automatically based on the rate and terms you set on each ticket, so nothing has to be worked out by hand.",
    },
    {
      q: "Is my customer data secure?",
      a: "Customer and ticket records are kept in a central cloud system with role-based access, rather than scattered across paper files or spreadsheets that anyone in the store can open.",
    },
    {
      q: "Can I migrate existing records?",
      a: "We can help you bring over your existing customers and open loan balances during setup — reach out to our team and we'll walk through it with you.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#14181F] selection:bg-[#314259] selection:text-white antialiased font-sans">
      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .anim-fade-up {
          animation: fadeUp 0.4s ease-out both;
        }

        @keyframes heroFloat1 {
          0%, 100% { transform: translateY(0px) rotate(-3.5deg); }
          50% { transform: translateY(-7px) rotate(-3.5deg); }
        }
        @keyframes heroFloat2 {
          0%, 100% { transform: translateY(0px) rotate(3.5deg); }
          50% { transform: translateY(8px) rotate(3.5deg); }
        }
        @keyframes heroFloat3 {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-6px) rotate(-2deg); }
        }
        @keyframes heroFloat4 {
          0%, 100% { transform: translateY(0px) rotate(2.5deg); }
          50% { transform: translateY(7px) rotate(2.5deg); }
        }
        @keyframes heroFloat5 {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50% { transform: translateY(-5px) rotate(-1.5deg); }
        }
        @keyframes heroFloat6 {
          0%, 100% { transform: translateY(0px) rotate(1.5deg); }
          50% { transform: translateY(6px) rotate(1.5deg); }
        }

        .hero-card-1 { animation: heroFloat1 7.8s ease-in-out infinite; }
        .hero-card-2 { animation: heroFloat2 8.6s ease-in-out infinite; }
        .hero-card-3 { animation: heroFloat3 9.2s ease-in-out infinite; }
        .hero-card-4 { animation: heroFloat4 8.2s ease-in-out infinite; }
        .hero-card-5 { animation: heroFloat5 10s ease-in-out infinite; }
        .hero-card-6 { animation: heroFloat6 9s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .hero-card-1, .hero-card-2, .hero-card-3,
          .hero-card-4, .hero-card-5, .hero-card-6 {
            animation: none;
          }
        }
      `}</style>

      {/* Announcement bar */}
      {announcementOpen && (
        <div className="bg-[#14181F] text-white text-[13px] py-2.5 px-6 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center pr-6">
            <span className="text-slate-300">Early access is now open —</span>
            <button onClick={() => scrollToSection("pricing")} className="font-semibold underline underline-offset-2 hover:text-slate-200">
              Join GIRVI
            </button>
          </div>
          <button
            onClick={() => setAnnouncementOpen(false)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Nav Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled ? "bg-white/95 backdrop-blur-md border-[#E7E9EC]" : "bg-white border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/icon.png" alt="GIRVI logo" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-[16px] tracking-tight text-[#14181F]">
              GIRVI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              ["Features", "features"],
              ["Product", "showcase"],
              ["Workflow", "workflow"],
              ["FAQ", "faq"],
            ].map(([label, id]) => (
              <button key={id} onClick={() => scrollToSection(id)} className="text-[14px] font-medium text-[#55606D] hover:text-[#14181F] transition-colors cursor-pointer">
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-[14px] font-medium text-[#55606D] hover:text-[#14181F] transition-colors">
              Login
            </Link>
            <Link href="/signup" className="px-5 py-2 rounded-full text-[14px] font-semibold bg-[#14181F] text-white hover:bg-[#314259] transition-colors shadow-sm">
              Start Free
            </Link>
          </div>

          <button className="md:hidden h-8 w-8 flex items-center justify-center" onClick={() => setMobileMenuOpen((v) => !v)} aria-label="Toggle menu">
            <span className="text-[#14181F] text-lg">{mobileMenuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </header>

      {/* Interactive Hero Section */}
      <section
        ref={heroRef}
        className="relative isolate w-full min-h-[calc(100vh-44px)] flex items-center justify-center overflow-hidden px-6 py-20"
      >
        {/* Cursor Interactive Canvas Shader Background Layer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* Orbiting Floating Cards — z-10 layered above canvas background */}
        <div className="absolute inset-0 hidden lg:block pointer-events-none z-10">
          {/* Card 1: Top Left - Customers */}
          <div className="absolute top-[10%] left-[8%] xl:left-[13%] hero-card-1 pointer-events-auto">
            <div className="w-[220px] p-3.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-indigo-500/5 text-left transition-all hover:bg-white/95">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
                  <Users className="w-3.5 h-3.5 text-slate-500" /> Customers
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100/80 px-1.5 py-0.5 rounded">1,248</span>
              </div>
              <div className="space-y-2 text-[10.5px]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">Robert Downey</span>
                    <span className="text-[9px] text-slate-400">Boston · 2 tickets</span>
                  </div>
                  <span className="text-[8.5px] font-bold text-emerald-600 bg-emerald-50/90 px-1.5 py-0.5 rounded-md border border-emerald-100/80">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100/80">
                  <div>
                    <span className="font-semibold text-slate-800 block">Clara Oswald</span>
                    <span className="text-[9px] text-slate-400">Austin · 1 ticket</span>
                  </div>
                  <span className="text-[8.5px] font-bold text-amber-600 bg-amber-50/90 px-1.5 py-0.5 rounded-md border border-amber-100/80">Pending Docs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Bottom Left - Repayment */}
          <div className="absolute bottom-[12%] left-[6%] xl:left-[10%] hero-card-2 pointer-events-auto">
            <div className="w-[210px] p-3.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-indigo-500/5 text-left transition-all hover:bg-white/95">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" /> Repayment
                </div>
                <span className="text-[9px] text-slate-400">10:45 AM</span>
              </div>
              <div className="space-y-1.5 text-[10.5px]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 block">Ticket #4092</span>
                    <span className="text-[9px] text-slate-400">Monthly Interest</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 text-[11.5px]">+$36.00</span>
                </div>
                <div className="pt-1.5 border-t border-slate-100/80 flex items-center justify-between text-[9px]">
                  <span className="text-slate-400">Remaining Principal:</span>
                  <span className="font-mono font-bold text-slate-800">$1,200.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Top Right - Ticket Detail */}
          <div className="absolute top-[10%] right-[8%] xl:right-[13%] hero-card-4 pointer-events-auto">
            <div className="w-[220px] p-3.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-indigo-500/5 text-left transition-all hover:bg-white/95">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
                  <Ticket className="w-3.5 h-3.5 text-slate-500" /> Ticket #4092
                </div>
                <span className="text-[8.5px] font-bold text-emerald-600 bg-emerald-50/90 px-1.5 py-0.5 rounded-md border border-emerald-100/80">Active</span>
              </div>
              <div className="space-y-2 text-[10px]">
                <div className="bg-slate-50/80 p-2 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[8px] text-slate-400 uppercase font-semibold block">Collateral Item</span>
                    <span className="font-bold text-slate-800 block">Gold Necklace · 22K (18.4g)</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-amber-100/80 flex items-center justify-center text-amber-600 text-xs shrink-0">✨</div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-0.5 text-[10px]">
                  <div>
                    <span className="text-[8px] text-slate-400 uppercase font-semibold block">Principal</span>
                    <span className="font-mono font-bold text-slate-800">$1,200.00</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-slate-400 uppercase font-semibold block">Rate / Mo</span>
                    <span className="font-mono font-bold text-indigo-600">3.00%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Bottom Right - Vault Status */}
          <div className="absolute bottom-[12%] right-[6%] xl:right-[10%] hero-card-6 pointer-events-auto">
            <div className="w-[210px] p-3.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-indigo-500/5 text-left transition-all hover:bg-white/95">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Vault Status
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[9px] text-center">
                <div className="p-1.5 rounded-lg bg-slate-50/80">
                  <span className="text-slate-400 block">Active</span>
                  <strong className="font-mono text-[10px]">$184k</strong>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50/80">
                  <span className="text-slate-400 block">Items</span>
                  <strong className="text-[10px]">412</strong>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50/80">
                  <span className="text-slate-400 block">Gold</span>
                  <strong className="text-[10px]">12.8kg</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Central Content — elevated z-20 above background and cards */}
        <div className="relative z-20 max-w-2xl mx-auto text-center flex flex-col items-center gap-4">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#14181F] tracking-tight leading-[1.1]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            Run your pawn shop
            <br className="hidden sm:block" />
            without the paperwork.
          </motion.h1>

          <motion.p
            className="text-[14px] sm:text-[15px] text-[#55606D] leading-relaxed max-w-md font-normal"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            Manage customers, KYC, pawn tickets, repayments, collateral and reporting from one secure workspace.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
          >
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-full text-[13px] font-semibold bg-[#14181F] text-white hover:bg-[#314259] transition-all shadow-md inline-flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => scrollToSection("interactive-preview")}
              className="px-5 py-2.5 rounded-full text-[13px] font-medium border border-[#E7E9EC] bg-white/90 backdrop-blur-md hover:bg-slate-50 text-[#14181F] transition-all shadow-sm"
            >
              Explore the product
            </button>
          </motion.div>

          {/* Compact dashboard glimpse */}
          <motion.div
            className="w-full max-w-xl mx-auto rounded-2xl border border-white/80 bg-white/80 backdrop-blur-xl shadow-2xl shadow-indigo-500/10 overflow-hidden text-left"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <div className="bg-slate-100/70 border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="text-[11px] font-medium text-slate-400">girvi.app/dashboard</div>
              <div className="w-4" />
            </div>

            <div className="p-5 grid grid-cols-12 gap-4">
              {/* Mini Sidebar */}
              <div className="col-span-3 border-r border-slate-100 pr-3 space-y-2 text-[12px]">
                <div className="font-bold text-[#14181F] mb-3 flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-600" /> GIRVI
                </div>
                <div className="px-2 py-1.5 rounded-md bg-indigo-50 font-semibold text-indigo-600 flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5" /> Dashboard
                </div>
                <div className="px-2 py-1.5 text-slate-500 flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Customers</div>
                <div className="px-2 py-1.5 text-slate-500 flex items-center gap-2"><Ticket className="w-3.5 h-3.5" /> Pawn Tickets</div>
                <div className="px-2 py-1.5 text-slate-500 flex items-center gap-2"><CreditCard className="w-3.5 h-3.5" /> Repayments</div>
                <div className="px-2 py-1.5 text-slate-500 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Reports</div>
                <div className="px-2 py-1.5 text-slate-500 flex items-center gap-2"><Settings className="w-3.5 h-3.5" /> Settings</div>
              </div>

              {/* Main Content Area */}
              <div className="col-span-9 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">Good morning, Manager 👋</span>
                  <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium block">Active Loans</span>
                    <span className="text-xs font-bold font-mono text-slate-800">$184,250</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium block">Interest Earned</span>
                    <span className="text-xs font-bold font-mono text-emerald-600">$4,850</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium block">Vault Items</span>
                    <span className="text-xs font-bold text-slate-800">412</span>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/50">
                  <span className="text-[11px] font-semibold text-slate-700 block mb-2">Recent Activity</span>
                  <div className="space-y-2 text-[10.5px]">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <span>New pawn ticket created <strong className="text-slate-700">#4092 · Robert Downey</strong></span>
                      <span className="text-slate-400 font-mono">10:30 AM</span>
                    </div>
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <span>Interest payment recorded <strong className="text-slate-700">#3824 · Clara Oswald</strong></span>
                      <span className="text-slate-400 font-mono">9:45 AM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pawn ticket redeemed <strong className="text-slate-700">#3644 · David Miller</strong></span>
                      <span className="text-slate-400 font-mono">Yesterday</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-12 px-6 border-y border-[#E7E9EC] bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[13px] text-[#8A94A3] mb-6 font-medium">Built specifically for the way modern pawn shops operate</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {["Customer & KYC management", "Digital pawn tickets", "Automated interest calculations", "Secure cloud records", "Business reporting"].map((item) => (
              <span key={item} className="flex items-center gap-2 text-[13.5px] text-[#3A4350] font-medium">
                <Check className="h-4 w-4 text-emerald-600" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="max-w-xl mb-14">
          <h2 className="text-3xl sm:text-[34px] font-extrabold tracking-tight mb-3">Less paperwork. More control.</h2>
          <p className="text-[#55606D] text-base">Everything your team needs to manage the counter, the vault and the books.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Users, title: "Know every customer", desc: "Find customer records, KYC documents and complete ticket history instantly." },
            { icon: Ticket, title: "Never lose track of collateral", desc: "Create detailed pawn tickets and keep every item, valuation and vault record organized." },
            { icon: Calculator, title: "Get the numbers right", desc: "Calculate interest, repayments and outstanding balances automatically." },
          ].map((card) => (
            <div key={card.title} className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <card.icon className="h-6 w-6 text-indigo-600 mb-5" strokeWidth={1.75} />
              <h3 className="text-[17px] font-semibold mb-2">{card.title}</h3>
              <p className="text-[14px] text-[#55606D] leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive preview */}
      <section id="interactive-preview" className="py-24 px-6 bg-[#F6F7F8]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-10">
            <h2 className="text-3xl md:text-[34px] font-extrabold tracking-tight mb-3">Don&apos;t take our word for it.</h2>
            <p className="text-[#55606D] text-[15px]">Click through the product and see how GIRVI works before creating an account.</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E9EC] overflow-hidden flex flex-col lg:flex-row min-h-[560px] shadow-sm">
            <div className="w-full lg:w-56 bg-[#F6F7F8] border-b lg:border-b-0 lg:border-r border-[#E7E9EC] p-3 flex flex-row lg:flex-col gap-1 overflow-x-auto shrink-0">
              {previewTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePreviewTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-colors shrink-0 text-left w-full cursor-pointer ${
                    activePreviewTab === tab.id ? "bg-[#14181F] text-white" : "text-[#55606D] hover:bg-white"
                  }`}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />{tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
              <div key={activePreviewTab} className="flex-1 flex flex-col anim-fade-up">
                {activePreviewTab === "dashboard" && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-[#F1F2F4]">
                      <h3 className="text-lg font-semibold">Good morning, Manager 👋</h3>
                      <span className="px-3 py-1.5 text-[11px] font-medium text-[#55606D] bg-[#F6F7F8] rounded-lg flex items-center gap-1.5"><RefreshCw className="h-3 w-3" /> Sync Active</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-[#F6F7F8] p-4 rounded-xl"><span className="text-[10px] font-medium text-[#8A94A3] uppercase tracking-wider block mb-1">Active Loans</span><span className="text-xl font-semibold font-mono">$184,250</span></div>
                      <div className="bg-[#F6F7F8] p-4 rounded-xl"><span className="text-[10px] font-medium text-[#8A94A3] uppercase tracking-wider block mb-1">Interest Collected</span><span className="text-xl font-semibold font-mono text-[#059669]">$4,850</span></div>
                      <div className="bg-[#F6F7F8] p-4 rounded-xl"><span className="text-[10px] font-medium text-[#8A94A3] uppercase tracking-wider block mb-1">Vault Items</span><span className="text-xl font-semibold">412</span></div>
                    </div>
                    <div className="bg-[#F6F7F8] p-5 rounded-xl flex-1">
                      <span className="text-xs font-semibold mb-4 block">Recent Activity</span>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E7E9EC]"><span className="font-medium">New pawn ticket · Robert Downey</span><span className="text-[#8A94A3] font-mono">10:45 AM</span></div>
                        <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E7E9EC]"><span className="font-medium">Interest payment · Clara Oswald</span><span className="text-[#8A94A3] font-mono">09:12 AM</span></div>
                        <div className="flex items-center justify-between text-xs"><span className="font-medium">Redemption · David Miller</span><span className="text-[#8A94A3] font-mono">Yesterday</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === "customers" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Customers</h3>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-[#8A94A3]" />
                        <input type="text" placeholder="Search by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full text-xs pl-9 pr-4 py-2.5 border border-[#E7E9EC] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#14181F]" />
                      </div>
                      <button className="px-4 py-2.5 bg-[#14181F] text-white text-xs font-semibold rounded-xl shrink-0">+ New Customer</button>
                    </div>
                    <div className="bg-[#F6F7F8] rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="text-[#8A94A3] font-medium uppercase tracking-wider text-[10px]"><tr><th className="p-3.5">Name</th><th className="p-3.5">Location</th><th className="p-3.5">Active Loans</th><th className="p-3.5">KYC Status</th><th className="p-3.5 text-right">Total Debt</th></tr></thead>
                        <tbody className="divide-y divide-[#E7E9EC] font-medium">
                          {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                            <tr key={customer.id}>
                              <td className="p-3.5 font-semibold">{customer.name}</td><td className="p-3.5">{customer.city}</td><td className="p-3.5">{customer.tickets} Tickets</td>
                              <td className="p-3.5"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${customer.kyc === "Verified" ? "bg-emerald-50 text-[#059669]" : "bg-amber-50 text-[#D97706]"}`}>{customer.kyc}</span></td>
                              <td className="p-3.5 text-right font-mono font-semibold">${customer.totalLoan.toLocaleString()}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan={5} className="p-8 text-center text-[#8A94A3]">No matches for &quot;{searchQuery}&quot;</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activePreviewTab === "tickets" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Pawn Ticket Detail</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 bg-[#F6F7F8] rounded-xl p-5 space-y-4">
                        <span className="text-xs font-semibold text-[#314259]">Ticket #4092</span>
                        <div className="grid grid-cols-2 gap-4">
                          <div><span className="text-[10px] font-medium text-[#8A94A3] uppercase block mb-1">Item Category</span><span className="text-xs font-semibold">Gold Necklace & Pendant</span></div>
                          <div><span className="text-[10px] font-medium text-[#8A94A3] uppercase block mb-1">Purity</span><span className="text-xs font-semibold">22K Hallmark Gold</span></div>
                          <div><span className="text-[10px] font-medium text-[#8A94A3] uppercase block mb-1">Gross Weight</span><span className="text-xs font-semibold font-mono">18.40 grams</span></div>
                          <div><span className="text-[10px] font-medium text-[#8A94A3] uppercase block mb-1">Net Gold Weight</span><span className="text-xs font-semibold font-mono">17.20 grams</span></div>
                        </div>
                      </div>
                      <div className="bg-[#F6F7F8] rounded-xl p-5 space-y-3">
                        <div className="flex justify-between text-xs"><span className="text-[#8A94A3]">Principal:</span><span className="font-semibold font-mono">$1,200.00</span></div>
                        <div className="flex justify-between text-xs"><span className="text-[#8A94A3]">Monthly Rate:</span><span className="font-semibold font-mono">3.00%</span></div>
                        <div className="flex justify-between text-xs"><span className="text-[#8A94A3]">Issue Date:</span><span className="font-semibold">Jul 07, 2026</span></div>
                        <button className="w-full py-2 bg-[#14181F] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 mt-2"><Printer className="h-4 w-4" /> Print Ticket</button>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === "payments" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Repayments</h3>
                    <div className="bg-[#F6F7F8] rounded-xl p-5">
                      <span className="text-xs font-semibold block mb-4">Record a Payment</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div><span className="text-[10px] font-medium text-[#8A94A3] uppercase block mb-1">Ticket</span><div className="text-xs p-2.5 bg-white rounded-lg font-semibold">Ticket #4092</div></div>
                        <div><span className="text-[10px] font-medium text-[#8A94A3] uppercase block mb-1">Interest Owed</span><div className="text-xs p-2.5 bg-white rounded-lg text-[#314259] font-semibold font-mono">$36.00</div></div>
                        <div><span className="text-[10px] font-medium text-[#8A94A3] uppercase block mb-1">Principal</span><div className="text-xs p-2.5 bg-white rounded-lg font-semibold font-mono">$1,200.00</div></div>
                      </div>
                    </div>
                  </div>
                )}

                {activePreviewTab === "reports" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Business Reports</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#F6F7F8] p-5 rounded-xl space-y-2"><span className="text-xs font-semibold block">Vault Valuation</span><span className="text-2xl font-semibold font-mono block">12.84 kg</span></div>
                      <div className="bg-[#F6F7F8] p-5 rounded-xl space-y-2"><span className="text-xs font-semibold block">Interest Conversion</span><span className="text-2xl font-semibold font-mono text-[#314259] block">94.2%</span></div>
                    </div>
                  </div>
                )}

                {activePreviewTab === "staff" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Staff & Roles</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3.5 bg-[#F6F7F8] rounded-lg">
                        <div><span className="text-xs font-semibold block">Manager</span><span className="text-[10px] text-[#8A94A3]">Views metrics, adjusts interest rates</span></div>
                        <span className="text-[10px] font-semibold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded">Full Access</span>
                      </div>
                      <div className="flex items-center justify-between p-3.5 bg-[#F6F7F8] rounded-lg">
                        <div><span className="text-xs font-semibold block">Cashier</span><span className="text-[10px] text-[#8A94A3]">Creates tickets, records payments</span></div>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Restricted</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Calculator Footer */}
              <div className="mt-8 border-t border-[#F1F2F4] pt-6">
                <div className="bg-[#F6F7F8] p-4.5 rounded-xl flex flex-col md:flex-row gap-5 items-center justify-between">
                  <div className="flex-1 w-full space-y-4">
                    <span className="text-[11px] font-semibold text-[#314259] flex items-center gap-1.5"><Calculator className="h-4 w-4" /> Try the interest calculator</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div><label className="text-[9px] font-medium text-[#8A94A3] uppercase block mb-1">Loan Amount</label><input type="number" value={calculatorLoanAmount} onChange={(e) => setCalculatorLoanAmount(Number(e.target.value))} className="w-full text-xs p-1.5 bg-white border border-[#E7E9EC] rounded-md font-mono text-right" /></div>
                      <div><label className="text-[9px] font-medium text-[#8A94A3] uppercase block mb-1">Rate % / Month</label><input type="number" value={calculatorRate} onChange={(e) => setCalculatorRate(Number(e.target.value))} className="w-full text-xs p-1.5 bg-white border border-[#E7E9EC] rounded-md font-mono text-right" /></div>
                      <div><label className="text-[9px] font-medium text-[#8A94A3] uppercase block mb-1">Duration (Months)</label><input type="number" value={calculatorMonths} onChange={(e) => setCalculatorMonths(Number(e.target.value))} className="w-full text-xs p-1.5 bg-white border border-[#E7E9EC] rounded-md font-mono text-right" /></div>
                    </div>
                  </div>
                  <div className="w-full md:w-auto bg-[#14181F] text-white p-4 rounded-xl text-center flex flex-row md:flex-col justify-between md:justify-center items-center gap-1 md:gap-2 self-stretch min-w-[150px]">
                    <div><span className="text-[9px] uppercase tracking-wide text-slate-400 block font-medium">Total Repayable</span><span className="text-lg font-mono font-semibold">${calcTotalRepay()}</span></div>
                    <span className="text-[9.5px] text-slate-400 block border-t border-slate-700 pt-1 w-full mt-1 hidden md:block">Interest: ${calcInterest()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24 px-6 bg-[#F6F7F8]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-14">
            <span className="text-[13px] text-[#8A94A3] mb-3 block font-medium">Workflow</span>
            <h2 className="text-3xl sm:text-[34px] font-extrabold tracking-tight mb-3">From walk-in to receipt in minutes.</h2>
            <p className="text-[#55606D] text-[15px]">Every step of the pawn process, handled in one place without switching tools.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((s) => (
              <div key={s.step} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[11px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md font-mono mb-3 inline-block">{s.step}</span>
                <h3 className="text-[15px] font-semibold mb-1.5 text-[#14181F]">{s.title}</h3>
                <p className="text-[13px] text-[#55606D] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12 text-center">
            <span className="text-[13px] text-[#8A94A3] mb-3 block font-medium">FAQ</span>
            <h2 className="text-3xl sm:text-[34px] font-extrabold tracking-tight">Common questions.</h2>
          </div>
          <div className="divide-y divide-[#E7E9EC]">
            {faqs.map((faq, i) => (
              <div key={i} className="py-5">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer"
                >
                  <span className="text-[15px] font-semibold text-[#14181F]">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#8A94A3] shrink-0 transition-transform duration-200 ${
                      faqOpen[i] ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {faqOpen[i] && (
                  <p className="mt-3 text-[14px] text-[#55606D] leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-[#E7E9EC] py-12 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/icon.png" alt="GIRVI logo" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-[15px]">GIRVI</span>
          </div>
          <span className="text-[12.5px] text-[#8A94A3]">© 2026 GIRVI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}