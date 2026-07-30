"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Ticket,
  CreditCard,
  TrendingUp,
  BarChart3,
  Settings,
  Shield,
  Search,
  FileSpreadsheet,
  Check,
  HelpCircle,
  Lock,
  ChevronDown,
  ArrowRight,
  Printer,
  Database,
  Calculator,
  LockKeyhole,
  FileText,
  UserCheck,
  Building,
  ArrowRightLeft,
  X,
  Sparkles,
  RefreshCw,
  Phone,
  MapPin,
  Calendar,
  Wallet
} from "lucide-react";

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<
    "dashboard" | "customers" | "tickets" | "payments" | "reports" | "settings"
  >("dashboard");
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [calculatorLoanAmount, setCalculatorLoanAmount] = useState(1000);
  const [calculatorRate, setCalculatorRate] = useState(3); // 3% per month
  const [calculatorMonths, setCalculatorMonths] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle navbar shrinking on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setFaqOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Interest calculation helper
  const calcInterest = () => {
    return (calculatorLoanAmount * (calculatorRate / 100) * calculatorMonths).toFixed(2);
  };
  const calcTotalRepay = () => {
    return (calculatorLoanAmount + Number(calcInterest())).toFixed(2);
  };

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Mock Data for Interactive Dashboard Preview
  const mockCustomers = [
    { id: "1", name: "David Miller", phone: "+1 (555) 321-9876", city: "Chicago", tickets: 2, totalLoan: 2500, kyc: "Verified" },
    { id: "2", name: "Sophia Martinez", phone: "+1 (555) 789-0123", city: "Miami", tickets: 1, totalLoan: 850, kyc: "Verified" },
    { id: "3", name: "James Wilson", phone: "+1 (555) 456-7890", city: "Dallas", tickets: 3, totalLoan: 4200, kyc: "Pending Docs" },
    { id: "4", name: "Emma Thompson", phone: "+1 (555) 123-4567", city: "New York", tickets: 0, totalLoan: 0, kyc: "Verified" },
  ];

  const filteredCustomers = mockCustomers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#E5E5E5] text-slate-900 selection:bg-[#314259] selection:text-white font-sans overflow-x-hidden antialiased">
      {/* 1. Sticky Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent ${
          scrolled
            ? "py-3 bg-white/95 backdrop-blur-md shadow-sm border-slate-200"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-[#314259] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Ticket className="h-5 w-5 rotate-12" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-[#314259] font-mono">
              PAWN<span className="font-sans text-slate-500 font-normal">manager</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-[14px] font-medium text-slate-600 hover:text-[#314259] transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("showcase")}
              className="text-[14px] font-medium text-slate-600 hover:text-[#314259] transition-colors cursor-pointer"
            >
              Screenshots
            </button>
            <button
              onClick={() => scrollToSection("workflow")}
              className="text-[14px] font-medium text-slate-600 hover:text-[#314259] transition-colors cursor-pointer"
            >
              Workflow
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-[14px] font-medium text-slate-600 hover:text-[#314259] transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-[14px] font-medium text-slate-600 hover:text-[#314259] transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-[14px] font-semibold text-slate-600 hover:text-[#314259] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2.5 rounded-xl text-[14px] font-semibold bg-[#314259] text-white hover:bg-[#233041] transition-all hover:shadow-sm"
            >
              Try Pawn Manager
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-32 pb-24 md:pt-40 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/60 border border-slate-300/40 text-[12px] font-medium text-[#314259] mb-6">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-yellow-600" />
              <span>Free early access program is now live</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-[56px] font-bold tracking-tight text-slate-900 leading-[1.08] mb-6">
              Everything Your Pawn Shop Needs. <br className="hidden sm:inline" />
              <span className="text-[#314259]">In One Workspace.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
              Ditch the paperwork. Streamline customer KYC, generate pawn tickets instantly, automate interest calculations, and secure cloud backups. Purpose-built for modern pawn shops and collateral lending teams.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <Link
                href="/signup"
                className="px-6 py-3.5 rounded-xl text-[15px] font-semibold bg-[#314259] text-white hover:bg-[#233041] transition-all hover:shadow-md text-center flex items-center justify-center gap-2 group"
              >
                Try Pawn Manager
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => {
                  scrollToSection("interactive-preview");
                }}
                className="px-6 py-3.5 rounded-xl text-[15px] font-semibold border border-slate-300 bg-white hover:bg-slate-50 transition-all text-center cursor-pointer"
              >
                Watch Demo
              </button>
            </div>
          </div>

          {/* Large Realistic Browser Mockup with floating metrics */}
          <div className="lg:col-span-6 relative mt-6 lg:mt-0">
            <div className="relative rounded-2xl border border-slate-300/80 bg-white/70 p-2.5 shadow-xl">
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-[#F8FAFC] shadow-sm aspect-[4/3]">
                {/* Browser top-bar */}
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="w-1/2 bg-white rounded-md border border-slate-200 py-0.5 text-[10px] text-center text-slate-400 truncate">
                    app.pawnmanager.io/dashboard
                  </div>
                  <div className="w-3" />
                </div>
                {/* Interface Snapshot */}
                <div className="p-5 flex flex-col h-full bg-[#F8FAFC]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-[14px] font-semibold text-slate-800">Good morning 👋</h4>
                      <p className="text-[10px] text-slate-505">Gold Star Pawnbrokers Ltd.</p>
                    </div>
                    <div className="h-6 w-16 rounded bg-slate-200 animate-pulse" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-150 shadow-2xs">
                      <span className="text-[9px] text-slate-400 font-semibold block mb-0.5 uppercase tracking-wide">Active Loans</span>
                      <span className="text-[15px] font-bold text-slate-800">$184,250</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-150 shadow-2xs">
                      <span className="text-[9px] text-slate-400 font-semibold block mb-0.5 uppercase tracking-wide">Tickets Open</span>
                      <span className="text-[15px] font-bold text-slate-800">412</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-150 shadow-2xs">
                      <span className="text-[9px] text-slate-400 font-semibold block mb-0.5 uppercase tracking-wide">Today's Interest</span>
                      <span className="text-[15px] font-bold text-emerald-600">+$1,450</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-150 p-3.5 shadow-2xs flex-1 flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-700 mb-3">Recent Transactions Ledger</span>
                    <div className="space-y-2.5 flex-1 text-slate-700">
                      <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-100">
                        <span className="font-medium">Ticket #4092 · Gold Ring Loan</span>
                        <span className="font-mono">+$420.00</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-100">
                        <span className="font-medium">Ticket #3911 · Diamond Studs Redemption</span>
                        <span className="font-mono">+$1,850.00</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium">Ticket #4095 · Interest Repayment</span>
                        <span className="font-mono">+$65.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Metric Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute -top-6 -left-6 bg-white p-3.5 rounded-xl border border-slate-200 shadow-lg hidden sm:flex items-center gap-3.5 max-w-[200px]"
            >
              <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block tracking-wider">KYC Compliance</span>
                <span className="text-[13px] font-bold text-slate-800">100% Secured Vault</span>
              </div>
            </motion.div>

            {/* Floating Metric Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="absolute -bottom-6 -right-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-lg hidden sm:flex items-center gap-3.5 max-w-[210px]"
            >
              <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block tracking-wider">Interest Earnings</span>
                <span className="text-[13px] font-bold text-slate-800">Calculated Instantly</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Social Trust Section */}
      <section className="py-10 bg-slate-100 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-12 text-slate-600 text-sm font-medium">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#314259] stroke-[3]" /> Built specifically for pawn shops
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#314259] stroke-[3]" /> Secure customer records
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#314259] stroke-[3]" /> Modern cloud-based workflow
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#314259] stroke-[3]" /> Fast customer search
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#314259] stroke-[3]" /> Professional reporting
            </span>
          </div>
        </div>
      </section>

      {/* 4. Product Showcase (Alternating Sections) */}
      <section id="showcase" className="py-24 px-6 space-y-24 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-[36px] font-bold tracking-tight text-slate-900 mb-4">
            A Clean Workspace Built for Real Operations
          </h2>
          <p className="text-slate-600 text-base">
            Powering every workflow on a unified digital platform. Built to minimize keyboard clicks and maximize store manager efficiency.
          </p>
        </div>

        {/* Segment 1: Customer Management */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col">
            <div className="h-10 w-10 rounded-xl bg-slate-200 text-[#314259] flex items-center justify-center shadow-xs mb-5">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-4">
              Customer Management & KYC
            </h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Access clean customer profile databases complete with ticket history, address records, and digital identity details. Find customers in under 2 seconds.
            </p>
            <ul className="space-y-3.5">
              <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs text-[#314259] font-bold">✓</span>
                Instant search by Name, Phone Number, or ID Number
              </li>
              <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs text-[#314259] font-bold">✓</span>
                Complete active and historically settled loans history
              </li>
              <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs text-[#314259] font-bold">✓</span>
                Digital document uploads for secure KYC compliance
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7 order-1 lg:order-2 bg-white rounded-2xl border border-slate-350 p-3 shadow-md">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col">
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 text-[11px] text-slate-400 font-mono">
                pawnmanager.io/customers
              </div>
              {/* Customer Table Mockup */}
              <div className="p-4 bg-white text-slate-700">
                <div className="flex justify-between items-center mb-3">
                  <div className="relative w-2/3">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      disabled
                      placeholder="Search customers..."
                      className="w-full text-xs pl-8.5 pr-3 py-2 border border-slate-250 rounded-lg bg-slate-50 focus:outline-none"
                    />
                  </div>
                  <span className="text-xs px-2.5 py-1.5 bg-slate-200 text-[#314259] font-semibold rounded-lg">+ Add Customer</span>
                </div>
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                      <tr>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">City</th>
                        <th className="p-2.5">KYC</th>
                        <th className="p-2.5 text-right">Loan Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      <tr>
                        <td className="p-2.5 font-bold">Robert Downey</td>
                        <td className="p-2.5">Boston</td>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">Verified</span></td>
                        <td className="p-2.5 text-right font-mono font-bold">$1,200.00</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold">Clara Oswald</td>
                        <td className="p-2.5">Austin</td>
                        <td className="p-2.5"><span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-600 rounded text-[10px] font-bold">Review</span></td>
                        <td className="p-2.5 text-right font-mono font-bold">$650.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Segment 2: Pawn Tickets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-350 p-3 shadow-md">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col">
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 text-[11px] text-slate-400 font-mono">
                pawnmanager.io/pawn-tickets/new
              </div>
              {/* Ticket Creation Form Mockup */}
              <div className="p-5 bg-white text-left text-slate-700">
                <div className="pb-3 border-b border-slate-100 mb-4">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Ticket Builder</span>
                  <span className="text-sm font-semibold text-slate-800">Generate Collateral Ticket</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Customer</label>
                    <div className="w-full text-xs p-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold">Robert Downey</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pawn Category</label>
                    <div className="w-full text-xs p-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-semibold">Gold & Jewellery</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Weight (g)</label>
                    <div className="w-full text-xs p-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-mono font-semibold">22.40g</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Loan Amount</label>
                    <div className="w-full text-xs p-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-mono font-semibold">$1,200.00</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Rate (Monthly)</label>
                    <div className="w-full text-xs p-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 font-mono font-semibold">3.00%</div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <span className="px-3 py-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg font-medium">Cancel</span>
                  <span className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#314259] rounded-lg">Create & Print Ticket</span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col">
            <div className="h-10 w-10 rounded-xl bg-slate-200 text-[#314259] flex items-center justify-center shadow-xs mb-5">
              <Ticket className="h-5 w-5" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-4">
              Pawn Tickets & Collateral
            </h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Create detailed pawn tickets with gold karatage validation, jewel classification, valuation storage, and instant ticket printing layouts. Keep a strict track of every vault item.
            </p>
            <ul className="space-y-3.5">
              <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs text-[#314259] font-bold">✓</span>
                Detailed items classification and valuation records
              </li>
              <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs text-[#314259] font-bold">✓</span>
                Customizable receipt layouts matching layout sheets
              </li>
              <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs text-[#314259] font-bold">✓</span>
                Track exact item locations inside your physically audited vaults
              </li>
            </ul>
          </div>
        </div>

        {/* Segment 3: Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col">
            <div className="h-10 w-10 rounded-xl bg-slate-200 text-[#314259] flex items-center justify-center shadow-xs mb-5">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-4">
              Repayments & Simple Interest
            </h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Record payments for principal amount, interest accruals, or extensions in one click. Watch the software calculate interest values in real time without human errors.
            </p>
            <ul className="space-y-3.5">
              <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs text-[#314259] font-bold">✓</span>
                Fully configurable interest rule presets
              </li>
              <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs text-[#314259] font-bold">✓</span>
                Partial payment acceptance and auto-adjusted principal splits
              </li>
              <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs text-[#314259] font-bold">✓</span>
                Receipt generation for repayments and vault actions
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-350 p-3 shadow-md">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col">
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 text-[11px] text-slate-400 font-mono">
                pawnmanager.io/repayments
              </div>
              {/* Repayments Mockup */}
              <div className="p-5 bg-white text-left text-slate-705">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Transaction Ledger</span>
                    <span className="text-sm font-bold text-slate-800">Ticket #3824 Repayments</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-bold">Active Ticket</span>
                </div>
                <div className="space-y-2 mb-4 text-slate-700">
                  <div className="flex justify-between text-xs">
                    <span>Principal Remaining:</span>
                    <span className="font-bold text-slate-800 font-mono">$850.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Interest Accrued (2 months @ 3%):</span>
                    <span className="font-bold text-slate-800 font-mono">$51.00</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1.5 border-t border-slate-100 font-semibold text-[#314259]">
                    <span>Total Redemption Value:</span>
                    <span className="font-mono font-bold">$901.00</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Action</span>
                    <span className="text-xs font-semibold text-slate-700">Record Repayment Payment</span>
                  </div>
                  <span className="px-3.5 py-2 bg-[#314259] text-white font-semibold rounded-lg text-xs hover:bg-[#233041] cursor-pointer">Accept Cash</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Segment 4: Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-350 p-3 shadow-md">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col">
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 text-[11px] text-slate-400 font-mono">
                pawnmanager.io/reports
              </div>
              {/* Reports Mockup */}
              <div className="p-4 bg-white text-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-slate-700">Monthly Performance Summary</span>
                  <span className="text-[10px] text-slate-400 font-semibold">July 2026</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 border border-slate-150 rounded-lg">
                    <span className="text-[9px] text-slate-400 block font-semibold mb-0.5 uppercase">Loans Disbursed</span>
                    <span className="text-sm font-bold text-slate-800 font-mono">$42,500</span>
                    <span className="text-[9px] text-emerald-600 block mt-0.5 font-semibold">↑ 12% vs June</span>
                  </div>
                  <div className="p-3 border border-slate-150 rounded-lg">
                    <span className="text-[9px] text-slate-400 block font-semibold mb-0.5 uppercase">Interest Earned</span>
                    <span className="text-sm font-bold text-[#314259] font-mono">$3,840</span>
                    <span className="text-[9px] text-emerald-600 block mt-0.5 font-semibold">↑ 8% vs June</span>
                  </div>
                  <div className="p-3 border border-slate-150 rounded-lg">
                    <span className="text-[9px] text-slate-400 block font-semibold mb-0.5 uppercase">Redemptions</span>
                    <span className="text-sm font-bold text-slate-800 font-semibold">32 Tickets</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Steady</span>
                  </div>
                </div>
                <div className="h-28 bg-slate-50 border border-slate-200 rounded-lg flex items-end justify-between p-3">
                  <div className="w-8 bg-slate-200 rounded-t h-[30%]" />
                  <div className="w-8 bg-slate-200 rounded-t h-[50%]" />
                  <div className="w-8 bg-slate-200 rounded-t h-[45%]" />
                  <div className="w-8 bg-slate-200 rounded-t h-[70%]" />
                  <div className="w-8 bg-[#314259] rounded-t h-[85%]" />
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 flex flex-col">
            <div className="h-10 w-10 rounded-xl bg-slate-200 text-[#314259] flex items-center justify-center shadow-xs mb-5">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-4">
              Real-time Business Reports
            </h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Track your shop&apos;s daily operations, collateral inventory weight, interest yield, and outstanding loan values. Download customized spreadsheets for tax audits or partner updates.
            </p>
            <ul className="space-y-3.5">
              <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs text-[#314259] font-bold">✓</span>
                Detailed interest collections ledger analysis
              </li>
              <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs text-[#314259] font-bold">✓</span>
                Daily cash reconciliation tables and manager notes
              </li>
              <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs text-[#314259] font-bold">✓</span>
                Export summaries to CSV format
              </li>
            </ul>
          </div>
        </div>

        {/* Segment 5: Employee Management */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col">
            <div className="h-10 w-10 rounded-xl bg-slate-200 text-[#314259] flex items-center justify-center shadow-xs mb-5">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-4">
              Staff & Branch Roles
            </h3>
            <p className="text-slate-600 leading-relaxed mb-6">
              Control access for cashiers, branch managers, and auditors. Grant appropriate workspace privileges to protect store data while speeding up daily operations.
            </p>
            <ul className="space-y-3.5">
              <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs text-[#314259] font-bold">✓</span>
                Different credentials and access tiers for cashiers
              </li>
              <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs text-[#314259] font-bold">✓</span>
                Complete trace activity logs for ticket creations and updates
              </li>
              <li className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs text-[#314259] font-bold">✓</span>
                Remotely revoke cashier accounts instantly when required
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-355 p-3 shadow-md">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex flex-col">
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 text-[11px] text-slate-400 font-mono">
                pawnmanager.io/settings/roles
              </div>
              {/* Role Management Mockup */}
              <div className="p-5 bg-white text-left text-slate-700">
                <span className="text-xs font-bold text-slate-800 block mb-3.5 pb-2 border-b border-slate-100">Branch Authorization Checklist</span>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">Manager Role Settings</span>
                      <span className="text-[9px] text-slate-400">Can view dashboard metrics, modify interest rates</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded">Full Access</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">Cashier Role Settings</span>
                      <span className="text-[9px] text-slate-400">Create tickets, record payments. Cannot export records.</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 border border-blue-100 rounded">Restricted Access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Business Workflow Timeline */}
      <section id="workflow" className="py-24 bg-white/70 border-y border-slate-300 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-bold uppercase tracking-widest text-[#314259] block mb-2">Automated Steps</span>
            <h2 className="text-3xl md:text-[36px] font-bold tracking-tight text-slate-900 mb-4">
              From Customer Entry to Ledger Report
            </h2>
            <p className="text-slate-600 text-sm">
              How Pawn Manager streamlines your store workflow compared to slow manual calculations.
            </p>
          </div>

          <div className="relative">
            {/* Horizontal Timeline Line */}
            <div className="hidden lg:block absolute top-[24px] left-8 right-8 h-0.5 bg-slate-200 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8 relative z-10">
              {[
                { step: "1", title: "Customer Walks In", desc: "Collect customer ID cards & items." },
                { step: "2", title: "Instant Search", desc: "Lookup phone or KYC status." },
                { step: "3", title: "Create Ticket", desc: "Enter collateral info & rate." },
                { step: "4", title: "Disburse Loan", desc: "Dispense cash safely." },
                { step: "5", title: "Print Receipt", desc: "Standard format document." },
                { step: "6", title: "Receive Payments", desc: "Record partial or full interest." },
                { step: "7", title: "Generate Reports", desc: "Track daily metrics." }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-[#314259] text-white flex items-center justify-center font-bold text-sm shadow-md mb-4 border-4 border-white">
                    {item.step}
                  </div>
                  <h4 className="text-[14px] font-semibold text-slate-800 mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[150px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Feature Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#314259] block mb-2">Feature Sets</span>
          <h2 className="text-3xl md:text-[36px] font-bold tracking-tight text-slate-900 mb-4">
            Engineered for Precision Lending
          </h2>
          <p className="text-slate-600 text-sm">
            Everything necessary for compliance, auditing, and speed in one dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Search, title: "Customer Search", desc: "Find any active record instantly with prefix matching and indexing." },
            { icon: Shield, title: "KYC Management", desc: "Securely document state identity records and photo verification assets." },
            { icon: Calculator, title: "Loan Calculator", desc: "Determine exact repayment bounds and interest schedules in real-time." },
            { icon: TrendingUp, title: "Interest Tracking", desc: "Support daily, monthly, or composite interest accrual systems." },
            { icon: Printer, title: "Receipt Printing", desc: "Direct compatibility with thermal slips or document printers." },
            { icon: BarChart3, title: "Business Analytics", desc: "Observe branch statistics, yield, and daily gold vault balances." },
            { icon: LockKeyhole, title: "Role Based Access", desc: "Assign cashiers restrictive view levels to prevent data leaks." },
            { icon: Database, title: "Cloud Storage", desc: "SSL protected connections backed up on standard datastores." }
          ].map((feat, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-300 shadow-xs hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="h-9 w-9 rounded-lg bg-slate-100 text-[#314259] flex items-center justify-center mb-4">
                <feat.icon className="h-4.5 w-4.5" />
              </div>
              <h4 className="text-[15px] font-semibold text-slate-800 mb-2">{feat.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Interactive Dashboard Preview Section */}
      <section id="interactive-preview" className="py-24 bg-white/40 border-y border-slate-300 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#314259] block mb-2">Live Demo Sandbox</span>
            <h2 className="text-3xl md:text-[36px] font-bold tracking-tight text-slate-900 mb-4">
              Explore the Workspace
            </h2>
            <p className="text-slate-600 text-sm">
              Click the tabs below to preview the actual interface and test real-time functionalities.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-350 shadow-lg overflow-hidden flex flex-col lg:flex-row min-h-[580px]">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-60 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible shrink-0 select-none">
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 mb-4 font-mono font-bold text-[#314259] text-[13px]">
                <Ticket className="h-4.5 w-4.5 rotate-12" />
                <span>PAWN SYSTEM</span>
              </div>
              
              {[
                { id: "dashboard", label: "Dashboard", icon: BarChart3 },
                { id: "customers", label: "Customers", icon: Users },
                { id: "tickets", label: "Pawn Tickets", icon: Ticket },
                { id: "payments", label: "Payments", icon: CreditCard },
                { id: "reports", label: "Reports", icon: FileText },
                { id: "settings", label: "Settings", icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePreviewTab(tab.id as any)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-tight transition-colors shrink-0 text-left w-full cursor-pointer ${
                    activePreviewTab === tab.id
                      ? "bg-[#314259] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sandbox Workspace Area */}
            <div className="flex-1 p-6 md:p-8 bg-[#F8FAFC] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePreviewTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col"
                >
                  {/* Active Tab rendering */}
                  {activePreviewTab === "dashboard" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">Good morning, Manager 👋</h3>
                          <p className="text-xs text-slate-400">July 07, 2026 · Operational Summary</p>
                        </div>
                        <span className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg flex items-center gap-1.5 shadow-2xs">
                          <RefreshCw className="h-3 w-3" /> Sync Active
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-4.5 rounded-xl border border-slate-250 shadow-2xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Collateral</span>
                          <span className="text-xl font-extrabold text-slate-800 font-mono">$184,250.00</span>
                        </div>
                        <div className="bg-white p-4.5 rounded-xl border border-slate-250 shadow-2xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Interest Collected (MTD)</span>
                          <span className="text-xl font-extrabold text-[#314259] font-mono">$4,850.00</span>
                        </div>
                        <div className="bg-white p-4.5 rounded-xl border border-slate-255 shadow-2xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Vault Inventory Items</span>
                          <span className="text-xl font-extrabold text-slate-800">412 Gold Lots</span>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-slate-250 shadow-2xs flex-1 text-slate-700">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-bold text-slate-700">Recent Customer Activity Log</span>
                          <span className="text-[10px] text-slate-400">Updated seconds ago</span>
                        </div>
                        <div className="space-y-3.5">
                          <div className="flex items-start justify-between text-xs pb-3 border-b border-slate-100">
                            <div>
                              <span className="font-bold text-slate-800">Robert Downey</span>
                              <span className="text-slate-450 block text-[10px]">Opened Gold Ticket #4092 · Loan of $1,200.00</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 font-mono">10:45 AM</span>
                          </div>
                          <div className="flex items-start justify-between text-xs pb-3 border-b border-slate-100">
                            <div>
                              <span className="font-bold text-slate-800">Sarah Jenkins</span>
                              <span className="text-slate-450 block text-[10px]">Paid interest for Ticket #3824 · Amount: $51.00</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 font-mono">09:12 AM</span>
                          </div>
                          <div className="flex items-start justify-between text-xs">
                            <div>
                              <span className="font-bold text-slate-800">David Miller</span>
                              <span className="text-slate-450 block text-[10px]">Redeemed Silver Ticket #3644 · Collateral released</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 font-mono">Yesterday</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePreviewTab === "customers" && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800">Customers Database</h3>
                        <p className="text-xs text-slate-400">Search profiles, view outstanding tickets, and track verify status.</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Type customer name to search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full text-xs pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#314259] focus:border-transparent transition-all"
                          />
                        </div>
                        <button className="px-4 py-2.5 bg-[#314259] text-white text-xs font-semibold rounded-xl hover:bg-[#233041] transition-colors shrink-0 cursor-pointer">
                          + New Customer
                        </button>
                      </div>

                      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="p-3.5">Name</th>
                              <th className="p-3.5">Location</th>
                              <th className="p-3.5">Active Loans</th>
                              <th className="p-3.5">KYC Status</th>
                              <th className="p-3.5 text-right">Total Debt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {filteredCustomers.length > 0 ? (
                              filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-3.5 font-bold text-slate-800">{customer.name}</td>
                                  <td className="p-3.5">{customer.city}</td>
                                  <td className="p-3.5">{customer.tickets} Tickets</td>
                                  <td className="p-3.5">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                        customer.kyc === "Verified"
                                          ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                          : "bg-yellow-50 border-yellow-100 text-yellow-600"
                                      }`}
                                    >
                                      {customer.kyc}
                                    </span>
                                  </td>
                                  <td className="p-3.5 text-right font-mono font-bold">${customer.totalLoan.toLocaleString()}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400">
                                  No customer records match &quot;{searchQuery}&quot;
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activePreviewTab === "tickets" && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-slate-200 flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">Pawn Ticket Detail</h3>
                          <p className="text-xs text-slate-400">High-fidelity active collateral ledger record</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-[11px] font-bold">Active Loan</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase">Collateral Details</span>
                            <span className="text-xs font-bold text-[#314259]">Ticket #4092</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Item Category</span>
                              <span className="text-xs font-semibold text-slate-800">Gold Necklace & Pendant</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Purity / Karatage</span>
                              <span className="text-xs font-semibold text-slate-800">22K Hallmark Gold</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Gross Weight</span>
                              <span className="text-xs font-semibold text-slate-800 font-mono">18.40 grams</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Net Gold Weight</span>
                              <span className="text-xs font-semibold text-slate-800 font-mono">17.20 grams</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Valuation description</span>
                            <p className="text-xs text-slate-500 italic">
                              22 karat solid yellow gold chain with embedded small red rubies. Verified weight on certified store scale. Good physical condition.
                            </p>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 text-slate-700">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase">Loan Ledger</span>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-550">Principal Disbursed:</span>
                              <span className="font-bold text-slate-800 font-mono">$1,200.00</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-550">Monthly Interest Rate:</span>
                              <span className="font-bold text-slate-800 font-mono">3.00% Simple</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-555">Issue Date:</span>
                              <span className="font-semibold text-slate-800">July 07, 2026</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-555">Maturity Date:</span>
                              <span className="font-semibold text-slate-800">Jan 07, 2027</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-4">
                            <button className="w-full py-2 bg-[#314259] text-white text-xs font-semibold rounded-lg hover:bg-[#233041] transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                              <Printer className="h-4 w-4" /> Print Ticket Duplicate
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePreviewTab === "payments" && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800">Repayment Logs & Receipting</h3>
                        <p className="text-xs text-slate-400">Record cash/digital collections. Check payment histories across ledger lines.</p>
                      </div>

                      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs mb-4 text-slate-700">
                        <span className="text-xs font-bold text-slate-750 block mb-4">Receive Cash/Card Payments</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Repayment Target Ticket</span>
                            <div className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold">Ticket #4092</div>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Accrued Interest Owed</span>
                            <div className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[#314259] font-bold font-mono">$36.00</div>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Principal Reduction</span>
                            <div className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold font-mono">$1,200.00</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                        <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">Recent Transaction Log</div>
                        <div className="divide-y divide-slate-100">
                          <div className="p-3.5 flex items-center justify-between text-xs font-medium">
                            <span className="text-slate-800 font-bold">Ticket #4092 · Interest Payment Received</span>
                            <div className="flex items-center gap-4 text-slate-600">
                              <span>Jul 07 · Cash</span>
                              <span className="font-mono font-bold text-emerald-600">+$36.00</span>
                            </div>
                          </div>
                          <div className="p-3.5 flex items-center justify-between text-xs font-medium">
                            <span className="text-slate-800 font-bold">Ticket #3921 · Complete Redemption & Return</span>
                            <div className="flex items-center gap-4 text-slate-600">
                              <span>Jul 06 · Debit Card</span>
                              <span className="font-mono font-bold text-emerald-600">+$824.00</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activePreviewTab === "reports" && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800">Business Reports</h3>
                        <p className="text-xs text-slate-400">Analyze capital deployment, total gold deposits, and interest yield averages.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                          <span className="text-xs font-bold text-slate-700 block">Gold Vault Valuation</span>
                          <div className="flex justify-between items-baseline">
                            <span className="text-2xl font-extrabold text-slate-800 font-mono">12.84 kg</span>
                            <span className="text-xs text-slate-400">Total Store Weight</span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Cumulative fine weight of stored gold lots verified inside vaults as of today.
                          </p>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                          <span className="text-xs font-bold text-slate-700 block">Interest Conversion Rate</span>
                          <div className="flex justify-between items-baseline">
                            <span className="text-2xl font-extrabold text-[#314259] font-mono">94.2%</span>
                            <span className="text-xs text-emerald-500 font-bold">↑ 2.1% MTD</span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Percentage of active customers completing interest payments within grace window bounds.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-755 block mb-1">Financial Reconciliation Sheet</span>
                          <span className="text-[11px] text-slate-400">Includes interest journals, outstanding loan offsets, and redemption summaries.</span>
                        </div>
                        <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-750 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer">
                          <FileSpreadsheet className="h-4 w-4" /> Export Excel
                        </button>
                      </div>
                    </div>
                  )}

                  {activePreviewTab === "settings" && (
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800">System Configuration</h3>
                        <p className="text-xs text-slate-400">Adjust defaults, interest rules, grace periods, and store templates.</p>
                      </div>

                      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                        <span className="text-xs font-bold text-slate-700 block">Default Shop Profile & Rate Presets</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase">Interest Computation Mode</span>
                            <select disabled className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-55 font-medium">
                              <option>Monthly Simple Interest (Default)</option>
                              <option>Daily Simple Interest</option>
                              <option>Compound Interest</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase">Default Monthly Rate</span>
                            <div className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 font-semibold font-mono text-slate-750">3.00 %</div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <span className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase">Default Grace Period (Days)</span>
                          <div className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50 font-semibold font-mono text-slate-750">30 Days</div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Collateral Interest Calculator Sandbox (Fits in visual flow) */}
              <div className="mt-8 border-t border-slate-200 pt-6">
                <div className="bg-white p-4.5 rounded-xl border border-[#314259]/30 bg-[#314259]/5 flex flex-col md:flex-row gap-5 items-center justify-between shadow-2xs">
                  <div className="flex-1 w-full space-y-4">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#314259] flex items-center gap-1.5">
                      <Calculator className="h-4.5 w-4.5" /> Interactive Sandbox Loan Calculator
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Loan Capital</label>
                        <input
                          type="number"
                          value={calculatorLoanAmount}
                          onChange={(e) => setCalculatorLoanAmount(Number(e.target.value))}
                          className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#314259] font-mono text-right"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Interest Rate % / Month</label>
                        <input
                          type="number"
                          value={calculatorRate}
                          onChange={(e) => setCalculatorRate(Number(e.target.value))}
                          className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#314259] font-mono text-right"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Duration (Months)</label>
                        <input
                          type="number"
                          value={calculatorMonths}
                          onChange={(e) => setCalculatorMonths(Number(e.target.value))}
                          className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#314259] font-mono text-right"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto bg-[#314259] text-white p-4.5 rounded-lg text-center flex flex-row md:flex-col justify-between md:justify-center items-center gap-1 md:gap-2 self-stretch shadow-sm select-none min-w-[150px]">
                    <div>
                      <span className="text-[9px] uppercase tracking-wide text-slate-300 block font-semibold">Total Repayable</span>
                      <span className="text-lg font-mono font-extrabold">${calcTotalRepay()}</span>
                    </div>
                    <span className="text-[9.5px] text-slate-350 block border-t border-slate-500 pt-1 w-full mt-1 hidden md:block">
                      Interest: ${calcInterest()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Why Pawn Manager (Old vs New) */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#314259] block mb-2">Comparison</span>
          <h2 className="text-3xl md:text-[36px] font-bold tracking-tight text-slate-900 mb-4">
            Traditional Records vs. Pawn Manager
          </h2>
          <p className="text-slate-600 text-sm">
            Discover why transitioning to a digital workspace eliminates manual errors and saves hours of auditing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-300/60 shadow-xs flex flex-col">
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider block mb-4">Traditional Ledger Paperwork</span>
            <ul className="space-y-4 flex-1">
              {[
                "Messy handwritten ledger files can fade, get stained, or get physically lost.",
                "Manual interest calculation equations are highly prone to human error and mistakes.",
                "Customer history lookup requires sorting through hundreds of physical index cards.",
                "Performing store balance sheets requires multiple hours of counting receipts manually.",
                "Zero offsite backups means a fire or theft can destroy all store loan records."
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3.5 text-xs text-slate-500 font-medium">
                  <span className="h-5 w-5 rounded-full bg-red-55 text-red-500 font-semibold flex items-center justify-center shrink-0">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#314259] p-8 rounded-2xl border border-[#314259]/80 shadow-md flex flex-col text-white">
            <span className="text-xs font-extrabold uppercase text-slate-300 tracking-wider block mb-4">Pawn Manager Cloud System</span>
            <ul className="space-y-4 flex-1">
              {[
                "All customer ledger sheets and vault history are stored securely in cloud-hosted workspaces.",
                "Interest accruals, grace periods, and total redemption values are computed automatically.",
                "Store cashiers find customer profiles in less than 2 seconds using multi-index search.",
                "Detailed performance sheets and monthly cash reconciliations are ready in 1 click.",
                "Secure backups are processed regularly, preserving records."
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3.5 text-xs text-slate-200 font-medium">
                  <span className="h-5 w-5 rounded-full bg-emerald-500 text-white font-semibold flex items-center justify-center shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 9. Early Access Section */}
      <section className="py-24 bg-white/50 border-y border-slate-300 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-600">
            <Sparkles className="h-3.5 w-3.5" /> Available Free Today
          </div>
          <h2 className="text-3xl md:text-[38px] font-bold text-slate-900 tracking-tight">
            Free During Early Access
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed max-w-xl mx-auto">
            Pawn Manager is currently available free of charge. We are building the most complete collateral loan manager and want to refine it based on feedback from actual pawn shop owners.
          </p>
          <div className="pt-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-[#314259] text-white hover:bg-[#233041] hover:shadow-md transition-all text-sm"
            >
              Start Using Pawn Manager
            </Link>
          </div>
        </div>
      </section>

      {/* 10. FAQ Section */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#314259] block mb-2">Onboarding Questions</span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3.5">
          {[
            {
              q: "Is Pawn Manager really free?",
              a: "Yes! Currently, Pawn Manager is completely free of charge during our early access program. We want to work closely with real pawnbrokers to perfect the workspace. We will communicate any future plans months in advance."
            },
            {
              q: "Can multiple employees use it simultaneously?",
              a: "Absolutely. You can invite your branch managers, cashiers, and accountants to collaborate. You can customize their settings to prevent access to analytics or spreadsheets."
            },
            {
              q: "Can I print physical receipts?",
              a: "Yes. Pawn Manager produces printer-ready layouts designed specifically for ticket copies. You can print them directly from any browser using thermal slips or standard desktop printers."
            },
            {
              q: "Can I manage multiple pawn tickets per customer?",
              a: "Yes. A customer profile supports multiple concurrent pawn tickets. You can see their active, expired, and closed histories grouped on a single profile page."
            },
            {
              q: "Is customer information secure?",
              a: "Security is our highest priority. All connection details are encrypted using SSL. Database vaults are backed up regularly to prevent data loss."
            },
            {
              q: "Can I access the workspace from a mobile phone?",
              a: "Yes, Pawn Manager has a fully responsive design, allowing you to check active ticket summaries, edit settings, or view reports on tablets and mobile phones."
            },
            {
              q: "How do I migrate my existing paper records?",
              a: "Our migration tool allows you to add customers and historical active loan balances. You can also contact our support team for setup assistance."
            }
          ].map((item, idx) => {
            const isOpen = !!faqOpen[idx];
            return (
              <div
                key={idx}
                className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-2xs hover:border-slate-350 transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 flex items-center justify-between text-left text-[14px] font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs text-slate-500 leading-relaxed border-t border-slate-100/50">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. Final CTA Section */}
      <section className="pb-28 pt-10 px-6">
        <div className="max-w-5xl mx-auto bg-[#314259] rounded-3xl p-10 md:p-16 text-center text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-16 -mb-16 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-[40px] font-bold tracking-tight leading-tight">
              Modernize Your Pawn Shop Today.
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
              Unlock instant calculations, fast customer searches, digital ticket storage, and automated reports. Set up your store in minutes.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="px-6 py-3.5 rounded-xl font-bold bg-white text-[#314259] hover:bg-slate-100 transition-all text-sm w-full sm:w-auto shadow-sm"
              >
                Try Pawn Manager
              </Link>
              <button
                onClick={() => scrollToSection("interactive-preview")}
                className="px-6 py-3.5 rounded-xl font-bold border border-slate-500 text-white hover:bg-white/10 transition-all text-sm w-full sm:w-auto cursor-pointer"
              >
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Footer */}
      <footer id="contact" className="bg-slate-100 border-t border-slate-300 py-16 px-6 text-slate-550 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Logo Column */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#314259] flex items-center justify-center text-white shadow-sm">
                <Ticket className="h-4.5 w-4.5 rotate-12" />
              </div>
              <span className="font-semibold text-base tracking-tight text-[#314259] font-mono">
                PAWN<span className="font-sans text-slate-500 font-normal">manager</span>
              </span>
            </div>
            <p className="max-w-[240px] text-slate-400 leading-relaxed text-[11px]">
              A premium, secure digital workspace designed specifically for pawn shops and collateral lending teams.
            </p>
            <span className="text-[11px] text-slate-400 mt-2 block">
              © {new Date().getFullYear()} Pawn Manager. All rights reserved.
            </span>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-3 gap-8 w-full">
            <div className="flex flex-col gap-3">
              <span className="font-bold text-[#314259] uppercase tracking-wider text-[10px] mb-1">Company</span>
              <Link href="#" className="hover:text-[#314259] transition-colors">About Us</Link>
              <Link href="#" className="hover:text-[#314259] transition-colors">Careers</Link>
              <Link href="#" className="hover:text-[#314259] transition-colors">Contact Support</Link>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold text-[#314259] uppercase tracking-wider text-[10px] mb-1">Features</span>
              <button onClick={() => scrollToSection("features")} className="hover:text-[#314259] text-left transition-colors cursor-pointer">Collateral Tracking</button>
              <button onClick={() => scrollToSection("interactive-preview")} className="hover:text-[#314259] text-left transition-colors cursor-pointer">Interactive Calculator</button>
              <button onClick={() => scrollToSection("showcase")} className="hover:text-[#314259] text-left transition-colors cursor-pointer">Screen Preview</button>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold text-[#314259] uppercase tracking-wider text-[10px] mb-1">Legal</span>
              <Link href="#" className="hover:text-[#314259] transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#314259] transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-[#314259] transition-colors">Compliance Guide</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
