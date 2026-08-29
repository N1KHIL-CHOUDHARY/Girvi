"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion} from "framer-motion";
import {
  Users,
  Ticket,
  CreditCard,
  TrendingUp,
  BarChart3,
  Settings,
  Search,
  FileSpreadsheet,
  Check,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  Printer,
  Calculator,
  LockKeyhole,
  FileText,
  X,
  RefreshCw,
  ClipboardCheck,
  Webhook,
  ScanLine,
  FolderLock,
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  const beforeAfterRows = [
    ["Paper customer records", "Centralized profiles"],
    ["Manual interest calculations", "Automatic calculations"],
    ["Searching through files", "Instant search"],
    ["Separate spreadsheets", "Unified dashboard"],
    ["Manual reports", "Real-time reporting"],
    ["Shared staff access", "Role-based permissions"],
  ];

  const audienceFit = [
    {
      label: "Independent shops",
      title: "Run the whole counter from one screen",
      desc: "Customers, tickets, repayments and reports without switching between a notebook, a spreadsheet and a calculator.",
    },
    {
      label: "Multi-branch operators",
      title: "See every branch the same way",
      desc: "Consistent tickets and reporting across locations, so performance is easy to compare and roll up.",
    },
    {
      label: "Cashiers & staff",
      title: "Do the job without extra training",
      desc: "A ticket workflow built around what happens at the counter, not around what's easy to build.",
    },
    {
      label: "Collateral lending teams",
      title: "Keep the vault and the ledger in sync",
      desc: "Every item logged against a ticket, every ticket logged against a customer — nothing tracked twice.",
    },
  ];

  const changelog = [
    {
      tag: "New",
      title: "Digital KYC document uploads",
      desc: "Attach ID scans and proof-of-address directly to a customer profile instead of keeping paper copies on file.",
      date: "Aug 2026",
    },
    {
      tag: "Improved",
      title: "Faster customer search",
      desc: "Search by name, phone or ID and get a match as you type, even across thousands of records.",
      date: "Aug 2026",
    },
    {
      tag: "New",
      title: "Printable ticket templates",
      desc: "Ticket layouts you can print directly from the browser on thermal or standard printers.",
      date: "Jul 2026",
    },
    {
      tag: "New",
      title: "Role-based staff permissions",
      desc: "Give cashiers, managers and auditors access to exactly what their role needs.",
      date: "Jul 2026",
    },
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
    <div className="min-h-screen bg-white text-[#14181F] selection:bg-[#314259] selection:text-white antialiased" style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <style jsx global>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .anim-fade-up { animation: fadeUp 0.4s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .anim-fade-up { animation: none; } }
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

      {/* Nav */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled ? "bg-white/95 backdrop-blur-md border-[#E7E9EC]" : "bg-white border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-[#314259] flex items-center justify-center text-white">
              <Ticket className="h-3.5 w-3.5 rotate-12" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight">
              GIRVI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {[
              ["Features", "features"],
              ["Product", "showcase"],
              ["Workflow", "workflow"],
              ["Pricing", "pricing"],
              ["FAQ", "faq"],
            ].map(([label, id]) => (
              <button key={id} onClick={() => scrollToSection(id)} className="text-[13.5px] text-[#55606D] hover:text-[#14181F] transition-colors cursor-pointer">
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/login" className="px-3.5 py-2 text-[13.5px] font-medium text-[#55606D] hover:text-[#14181F] transition-colors">
              Login
            </Link>
            <Link href="/signup" className="px-4 py-2 rounded-lg text-[13.5px] font-semibold bg-[#14181F] text-white hover:bg-[#314259] transition-colors">
              Start Free
            </Link>
          </div>

          <button className="md:hidden h-8 w-8 flex items-center justify-center" onClick={() => setMobileMenuOpen((v) => !v)} aria-label="Toggle menu">
            <span className="text-[#14181F] text-lg">{mobileMenuOpen ? "✕" : "☰"}</span>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E7E9EC] px-6 py-4 flex flex-col gap-1">
            {[
              ["Features", "features"], ["Product", "showcase"], ["Workflow", "workflow"], ["Pricing", "pricing"], ["FAQ", "faq"],
            ].map(([label, id]) => (
              <button key={id} onClick={() => scrollToSection(id)} className="text-left px-2 py-2.5 text-[15px] text-[#55606D]">
                {label}
              </button>
            ))}
            <div className="h-px bg-[#E7E9EC] my-2" />
            <Link href="/login" className="px-2 py-2.5 text-[15px] font-medium text-[#55606D]">Login</Link>
            <Link href="/signup" className="mt-1 px-4 py-3 rounded-lg text-[14px] font-semibold bg-[#14181F] text-white text-center">Start Free</Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-left">
          <span className="text-[13px] text-[#8A94A3] mb-5 block">Built for modern pawn shops</span>
          <h1 className="text-4xl sm:text-5xl md:text-[52px] font-semibold tracking-tight leading-[1.08] mb-3 max-w-2xl">
            Run your pawn shop without the paperwork.
          </h1>
          <p className="text-lg text-[#55606D] mb-8 max-w-xl leading-relaxed">
            Manage customers, KYC, pawn tickets, repayments, collateral and reporting from one
            secure workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link href="/signup" className="px-5 py-2.5 rounded-lg text-[14px] font-semibold bg-[#14181F] text-white hover:bg-[#314259] transition-colors">
              Get Started
            </Link>
            <button onClick={() => scrollToSection("interactive-preview")} className="px-5 py-2.5 rounded-lg text-[14px] font-medium border border-[#E7E9EC] hover:bg-[#F6F7F8] transition-colors">
              Explore the product
            </button>
          </div>
        </div>

        {/* Flat canvas hero visual */}
        <div className="max-w-6xl mx-auto mt-14 relative">
          <div className="rounded-2xl bg-[#F6F7F8] p-8 md:p-14 relative overflow-hidden min-h-[420px]">
            {/* Main dashboard window */}
            <div className="relative z-10 rounded-xl border border-[#E7E9EC] bg-white overflow-hidden max-w-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="border-b border-[#E7E9EC] px-4 py-2.5 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E7E9EC]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E7E9EC]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E7E9EC]" />
              </div>
              <div className="p-5">
                <h4 className="text-[14px] font-semibold mb-4">Good morning, Manager 👋</h4>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[#F6F7F8] p-3 rounded-lg">
                    <span className="text-[9px] text-[#8A94A3] font-medium block mb-0.5 uppercase tracking-wide">Active Loans</span>
                    <span className="text-[14px] font-semibold">$184,250</span>
                  </div>
                  <div className="bg-[#F6F7F8] p-3 rounded-lg">
                    <span className="text-[9px] text-[#8A94A3] font-medium block mb-0.5 uppercase tracking-wide">Interest Collected</span>
                    <span className="text-[14px] font-semibold text-[#059669]">$4,850</span>
                  </div>
                  <div className="bg-[#F6F7F8] p-3 rounded-lg">
                    <span className="text-[9px] text-[#8A94A3] font-medium block mb-0.5 uppercase tracking-wide">Vault Items</span>
                    <span className="text-[14px] font-semibold">412</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {["New pawn ticket · #4092", "Interest payment · #3824", "Redemption · #3644", "KYC verification · S. Jenkins"].map((row) => (
                    <div key={row} className="flex items-center justify-between text-[11.5px] py-1.5 border-b border-[#F1F2F4] last:border-0">
                      <span className="text-[#3A4350] font-medium">{row}</span>
                      <span className="text-[#8A94A3]">Today</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overlapping small card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="hidden md:block absolute z-20 bottom-10 right-10 w-64 rounded-xl border border-[#E7E9EC] bg-white p-4 shadow-[0_8px_24px_rgba(20,24,31,0.08)]"
            >
              <div className="flex items-center gap-2 mb-3">
                <ClipboardCheck className="h-4 w-4 text-[#059669]" />
                <span className="text-[12.5px] font-semibold">KYC Verified</span>
              </div>
              <p className="text-[11.5px] text-[#8A94A3] leading-relaxed mb-3">Customer records protected</p>
              <div className="h-px bg-[#F1F2F4] mb-3" />
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#314259]" />
                <span className="text-[12.5px] font-semibold">Interest calculated automatically</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-14 px-6 border-y border-[#E7E9EC]">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-[13px] text-[#8A94A3] mb-8">Built specifically for the way pawn shops operate</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {["Customer & KYC management", "Digital pawn tickets", "Automated interest calculations", "Secure cloud records", "Business reporting"].map((item) => (
              <span key={item} className="flex items-center gap-2 text-[14px] text-[#3A4350] font-medium">
                <Check className="h-4 w-4 text-[#14181F]" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Value proposition */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="max-w-xl mb-14">
          <h2 className="text-3xl md:text-[34px] font-semibold tracking-tight mb-3">Less paperwork. More control.</h2>
          <p className="text-[#55606D] text-base">Everything your team needs to manage the counter, the vault and the books.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E7E9EC] rounded-2xl overflow-hidden border border-[#E7E9EC]">
          {[
            { icon: Users, title: "Know every customer", desc: "Find customer records, KYC documents and complete ticket history instantly." },
            { icon: Ticket, title: "Never lose track of collateral", desc: "Create detailed pawn tickets and keep every item, valuation and vault record organized." },
            { icon: Calculator, title: "Get the numbers right", desc: "Calculate interest, repayments and outstanding balances automatically." },
          ].map((card) => (
            <div key={card.title} className="bg-white p-8">
              <card.icon className="h-5 w-5 text-[#314259] mb-5" strokeWidth={1.75} />
              <h3 className="text-[16px] font-semibold mb-2">{card.title}</h3>
              <p className="text-[14px] text-[#55606D] leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product showcase — three stories */}
      <section id="showcase" className="py-8 px-6 space-y-28 max-w-6xl mx-auto">
        {/* Story 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-4 order-2 lg:order-1">
            <span className="text-[13px] text-[#8A94A3] mb-3 block">Customers →</span>
            <h3 className="text-2xl font-semibold tracking-tight mb-3 leading-snug">Every customer record, one click away</h3>
            <p className="text-[#55606D] text-[15px] leading-relaxed">
              Search by name, phone or ID and instantly see KYC status, active tickets, previous loans and customer history.
            </p>
          </div>
          <div className="lg:col-span-8 order-1 lg:order-2 rounded-2xl bg-[#F6F7F8] p-6">
            <div className="rounded-xl border border-[#E7E9EC] bg-white overflow-hidden">
              <div className="border-b border-[#E7E9EC] px-4 py-2 text-[11px] text-[#8A94A3]">girvi.app/customers</div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="relative w-2/3">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8A94A3]" />
                    <input disabled placeholder="Search customers..." className="w-full text-xs pl-8.5 pr-3 py-2 border border-[#E7E9EC] rounded-lg bg-[#F6F7F8]" />
                  </div>
                  <span className="text-xs px-2.5 py-1.5 bg-[#F6F7F8] text-[#14181F] font-semibold rounded-lg">+ Add Customer</span>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="text-[#8A94A3] font-medium border-b border-[#F1F2F4]">
                    <tr><th className="p-2.5">Name</th><th className="p-2.5">City</th><th className="p-2.5">KYC</th><th className="p-2.5 text-right">Loan Value</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F2F4] text-[#3A4350] font-medium">
                    <tr>
                      <td className="p-2.5 font-semibold">Robert Downey</td><td className="p-2.5">Boston</td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 bg-emerald-50 text-[#059669] rounded text-[10px] font-semibold">Verified</span></td>
                      <td className="p-2.5 text-right font-mono font-semibold">$1,200.00</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold">Clara Oswald</td><td className="p-2.5">Austin</td>
                      <td className="p-2.5"><span className="px-1.5 py-0.5 bg-amber-50 text-[#D97706] rounded text-[10px] font-semibold">Pending Docs</span></td>
                      <td className="p-2.5 text-right font-mono font-semibold">$650.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Story 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8 rounded-2xl bg-[#F6F7F8] p-6">
            <div className="rounded-xl border border-[#E7E9EC] bg-white overflow-hidden">
              <div className="border-b border-[#E7E9EC] px-4 py-2 text-[11px] text-[#8A94A3]">girvi.app/pawn-tickets/new</div>
              <div className="p-5">
                <span className="text-[10px] text-[#8A94A3] font-semibold block uppercase tracking-wider mb-1">Ticket Builder</span>
                <span className="text-sm font-semibold block mb-4">Generate Collateral Ticket</span>
                <div className="grid grid-cols-2 gap-3 mb-3.5">
                  <div><label className="text-[10px] font-medium text-[#8A94A3] uppercase block mb-1">Customer</label><div className="w-full text-xs p-2 border border-[#E7E9EC] bg-[#F6F7F8] rounded-lg font-medium">Robert Downey</div></div>
                  <div><label className="text-[10px] font-medium text-[#8A94A3] uppercase block mb-1">Pawn Category</label><div className="w-full text-xs p-2 border border-[#E7E9EC] bg-[#F6F7F8] rounded-lg font-medium">Gold & Jewellery</div></div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div><label className="text-[10px] font-medium text-[#8A94A3] uppercase block mb-1">Weight (g)</label><div className="w-full text-xs p-2 border border-[#E7E9EC] bg-[#F6F7F8] rounded-lg font-mono font-medium">22.40g</div></div>
                  <div><label className="text-[10px] font-medium text-[#8A94A3] uppercase block mb-1">Loan Amount</label><div className="w-full text-xs p-2 border border-[#E7E9EC] bg-[#F6F7F8] rounded-lg font-mono font-medium">$1,200.00</div></div>
                  <div><label className="text-[10px] font-medium text-[#8A94A3] uppercase block mb-1">Rate (Monthly)</label><div className="w-full text-xs p-2 border border-[#E7E9EC] bg-[#F6F7F8] rounded-lg font-mono font-medium">3.00%</div></div>
                </div>
                <div className="flex justify-end gap-2">
                  <span className="px-3 py-1.5 text-xs text-[#8A94A3] border border-[#E7E9EC] rounded-lg font-medium">Cancel</span>
                  <span className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#14181F] rounded-lg">Create & Print Ticket</span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4">
            <span className="text-[13px] text-[#8A94A3] mb-3 block">Pawn Tickets →</span>
            <h3 className="text-2xl font-semibold tracking-tight mb-3 leading-snug">Create a pawn ticket in seconds</h3>
            <p className="text-[#55606D] text-[15px] leading-relaxed">
              Record collateral, weight, valuation and loan terms in one structured workflow — then print the ticket immediately.
            </p>
          </div>
        </div>

        {/* Story 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-4 order-2 lg:order-1">
            <span className="text-[13px] text-[#8A94A3] mb-3 block">Reports →</span>
            <h3 className="text-2xl font-semibold tracking-tight mb-3 leading-snug">Know exactly what your shop is earning</h3>
            <p className="text-[#55606D] text-[15px] leading-relaxed">
              Track repayments, interest, outstanding loans, collateral and daily performance without manually maintaining spreadsheets.
            </p>
          </div>
          <div className="lg:col-span-8 order-1 lg:order-2 rounded-2xl bg-[#F6F7F8] p-6">
            <div className="rounded-xl border border-[#E7E9EC] bg-white overflow-hidden">
              <div className="border-b border-[#E7E9EC] px-4 py-2 text-[11px] text-[#8A94A3]">girvi.app/reports</div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold">Monthly Performance Summary</span>
                  <span className="text-[10px] text-[#8A94A3] font-medium">July 2026</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-[#F6F7F8] rounded-lg"><span className="text-[9px] text-[#8A94A3] block font-medium mb-0.5 uppercase">Loans Disbursed</span><span className="text-sm font-semibold font-mono">$42,500</span></div>
                  <div className="p-3 bg-[#F6F7F8] rounded-lg"><span className="text-[9px] text-[#8A94A3] block font-medium mb-0.5 uppercase">Interest Earned</span><span className="text-sm font-semibold font-mono text-[#314259]">$3,840</span></div>
                  <div className="p-3 bg-[#F6F7F8] rounded-lg"><span className="text-[9px] text-[#8A94A3] block font-medium mb-0.5 uppercase">Redemptions</span><span className="text-sm font-semibold">32 Tickets</span></div>
                </div>
                <div className="h-24 bg-[#F6F7F8] rounded-lg flex items-end justify-between p-3">
                  <div className="w-8 bg-[#E7E9EC] rounded-t h-[30%]" /><div className="w-8 bg-[#E7E9EC] rounded-t h-[50%]" /><div className="w-8 bg-[#E7E9EC] rounded-t h-[45%]" /><div className="w-8 bg-[#E7E9EC] rounded-t h-[70%]" /><div className="w-8 bg-[#14181F] rounded-t h-[85%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before / after */}
      <section className="py-24 px-6 bg-[#F6F7F8]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-[34px] font-semibold tracking-tight mb-12 text-center">Stop running your shop from scattered records.</h2>
          <div className="bg-white rounded-2xl border border-[#E7E9EC] overflow-hidden">
            <div className="grid grid-cols-2 border-b border-[#E7E9EC]">
              <div className="p-4 text-center text-[13px] font-medium text-[#8A94A3] border-r border-[#E7E9EC]">Before</div>
              <div className="p-4 text-center text-[13px] font-semibold text-[#14181F]">With GIRVI</div>
            </div>
            {beforeAfterRows.map(([before, after], idx) => (
              <div key={idx} className={`grid grid-cols-2 ${idx !== beforeAfterRows.length - 1 ? "border-b border-[#F1F2F4]" : ""}`}>
                <div className="p-4 text-sm text-[#8A94A3] border-r border-[#E7E9EC]">{before}</div>
                <div className="p-4 text-sm text-[#14181F] font-medium flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#059669] shrink-0" />{after}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-[34px] font-semibold tracking-tight mb-16 text-center">From customer entry to final repayment.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8">
          {workflowSteps.map((item) => (
            <div key={item.step} className="flex flex-col">
              <span className="text-[13px] text-[#8A94A3] font-mono mb-3">{item.step}</span>
              <h4 className="text-[14px] font-semibold mb-1.5">{item.title}</h4>
              <p className="text-[12.5px] text-[#8A94A3] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive demo */}
      <section id="interactive-preview" className="py-24 px-6 bg-[#F6F7F8]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-10">
            <h2 className="text-3xl md:text-[34px] font-semibold tracking-tight mb-3">Don&apos;t take our word for it.</h2>
            <p className="text-[#55606D] text-[15px]">Click through the product and see how GIRVI works before creating an account.</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E9EC] overflow-hidden flex flex-col lg:flex-row min-h-[560px]">
            <div className="w-full lg:w-56 bg-[#F6F7F8] border-b lg:border-b-0 lg:border-r border-[#E7E9EC] p-3 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible shrink-0">
              {previewTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePreviewTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors shrink-0 text-left w-full cursor-pointer ${
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
                        <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E7E9EC]"><span className="font-medium">Interest payment · Sarah Jenkins</span><span className="text-[#8A94A3] font-mono">09:12 AM</span></div>
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
                    <div className="bg-[#F6F7F8] rounded-xl overflow-hidden">
                      <div className="divide-y divide-[#E7E9EC]">
                        <div className="p-3.5 flex items-center justify-between text-xs font-medium"><span className="font-semibold">Ticket #4092 · Interest Payment</span><span className="font-mono font-semibold text-[#059669]">+$36.00</span></div>
                        <div className="p-3.5 flex items-center justify-between text-xs font-medium"><span className="font-semibold">Ticket #3921 · Redemption</span><span className="font-mono font-semibold text-[#059669]">+$824.00</span></div>
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
                    <div className="bg-[#F6F7F8] p-5 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-semibold">Reconciliation Sheet</span>
                      <button className="px-4 py-2.5 bg-white text-xs font-semibold rounded-lg flex items-center gap-1.5"><FileSpreadsheet className="h-4 w-4" /> Export</button>
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
                  <div className="w-full md:w-auto bg-[#14181F] text-white p-4 rounded-lg text-center flex flex-row md:flex-col justify-between md:justify-center items-center gap-1 md:gap-2 self-stretch min-w-[150px]">
                    <div><span className="text-[9px] uppercase tracking-wide text-slate-400 block font-medium">Total Repayable</span><span className="text-lg font-mono font-semibold">${calcTotalRepay()}</span></div>
                    <span className="text-[9.5px] text-slate-400 block border-t border-slate-600 pt-1 w-full mt-1 hidden md:block">Interest: ${calcInterest()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark trust / controls band */}
      <section className="bg-[#14181F] text-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <span className="text-[13px] text-slate-400 mb-3 block">Controls →</span>
          <h2 className="text-3xl md:text-[34px] font-semibold tracking-tight mb-14">Your customer records deserve more than a spreadsheet.</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <LockKeyhole className="h-5 w-5 text-white mb-4" strokeWidth={1.75} />
              <h4 className="text-[14px] font-semibold mb-4">Secure access</h4>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-[11px]"><span>Manager</span><span className="text-emerald-400 font-medium">Full Access</span></div>
                <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-[11px]"><span>Cashier</span><span className="text-blue-400 font-medium">Restricted</span></div>
              </div>
              <p className="text-[12.5px] text-slate-400 leading-relaxed mt-4">Role-based permissions help ensure staff only access what their role needs.</p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <FolderLock className="h-5 w-5 text-white mb-4" strokeWidth={1.75} />
              <h4 className="text-[14px] font-semibold mb-4">Reliable records</h4>
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-2"><ScanLine className="h-3.5 w-3.5 text-slate-500" /> KYC documents attached to profile</div>
                <div className="flex items-center gap-2"><Ticket className="h-3.5 w-3.5 text-slate-500" /> Tickets linked to customer history</div>
                <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-slate-500" /> Reports generated from live data</div>
              </div>
              <p className="text-[12.5px] text-slate-400 leading-relaxed mt-4">Customer, ticket and repayment records stay organized in one central system.</p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <ClipboardCheck className="h-5 w-5 text-white mb-4" strokeWidth={1.75} />
              <h4 className="text-[14px] font-semibold mb-4">Controlled operations</h4>
              <div className="space-y-2.5 text-[11px]">
                <div className="bg-white/5 rounded-lg px-3 py-2"><span className="text-slate-300">Marcelo</span><span className="text-slate-500"> created Ticket #4092</span></div>
                <div className="bg-white/5 rounded-lg px-3 py-2"><span className="text-slate-300">Katherine</span><span className="text-slate-500"> updated a role</span></div>
              </div>
              <p className="text-[12.5px] text-slate-400 leading-relaxed mt-4">Track staff activity and keep clearer operational accountability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Audience fit — new section */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-[34px] font-semibold tracking-tight mb-14">Built for the way your team actually works.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#E7E9EC] rounded-2xl overflow-hidden border border-[#E7E9EC]">
          {audienceFit.map((item) => (
            <div key={item.label} className="bg-white p-8 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[12.5px] font-semibold text-[#314259]">{item.label}</span>
                <ArrowUpRight className="h-4 w-4 text-[#8A94A3]" />
              </div>
              <h3 className="text-[17px] font-semibold mb-2">{item.title}</h3>
              <p className="text-[14px] text-[#55606D] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recently added — new section */}
      <section className="py-24 px-6 bg-[#F6F7F8]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-[34px] font-semibold tracking-tight">Recently added</h2>
            <Webhook className="h-5 w-5 text-[#8A94A3] hidden sm:block" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {changelog.map((item) => (
              <div key={item.title} className="border-t-2 border-[#14181F] pt-4">
                <span className={`text-[11px] font-semibold ${item.tag === "New" ? "text-[#059669]" : "text-[#314259]"}`}>{item.tag}</span>
                <h4 className="text-[14.5px] font-semibold mt-2 mb-2">{item.title}</h4>
                <p className="text-[13px] text-[#55606D] leading-relaxed mb-3">{item.desc}</p>
                <span className="text-[11px] text-[#8A94A3]">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / early access */}
      <section id="pricing" className="py-28 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <span className="text-[13px] text-[#8A94A3] mb-4 block">Pricing</span>
          <h2 className="text-3xl md:text-[36px] font-semibold tracking-tight mb-4">Get early access while we&apos;re building.</h2>
          <p className="text-[#55606D] text-[15px] leading-relaxed mb-8">
            We&apos;re working directly with the first generation of pawn shops on GIRVI. Join now
            for full access, and we&apos;ll keep you informed well ahead of any pricing changes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="px-5 py-2.5 rounded-lg text-[14px] font-semibold bg-[#14181F] text-white hover:bg-[#314259] transition-colors w-full sm:w-auto">
              Join Early Access
            </Link>
            <span className="text-[13px] text-[#8A94A3]">No credit card required</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-semibold tracking-tight mb-12 text-center">Frequently asked questions</h2>
        <div className="divide-y divide-[#E7E9EC] border-t border-b border-[#E7E9EC]">
          {faqs.map((item, idx) => {
            const isOpen = !!faqOpen[idx];
            return (
              <div key={idx}>
                <button onClick={() => toggleFaq(idx)} aria-expanded={isOpen} className="w-full py-5 flex items-center justify-between text-left text-[15px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14181F] cursor-pointer min-h-[48px]">
                  <span>{item.q}</span>
                  <ChevronDown className={`h-4 w-4 text-[#8A94A3] transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <div className="grid transition-all duration-200 ease-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                  <div className="overflow-hidden">
                    <p className="pb-5 text-[14px] text-[#55606D] leading-relaxed max-w-2xl">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-28 px-6">
        <div className="max-w-5xl mx-auto bg-[#14181F] rounded-3xl p-12 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-[38px] font-semibold tracking-tight mb-4">Ready to leave the paperwork behind?</h2>
          <p className="text-slate-400 text-[15px] mb-8 max-w-md mx-auto">Bring your customers, tickets, repayments and reports into one workspace.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="px-5 py-2.5 rounded-lg font-semibold bg-white text-[#14181F] hover:bg-slate-100 transition-colors text-[14px] w-full sm:w-auto flex items-center justify-center gap-2">
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
            <button onClick={() => scrollToSection("interactive-preview")} className="px-5 py-2.5 rounded-lg font-medium border border-white/20 text-white hover:bg-white/10 transition-colors text-[14px] w-full sm:w-auto">
              Explore the demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-[#E7E9EC] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-10">
            <div className="h-7 w-7 rounded-md bg-[#14181F] flex items-center justify-center text-white"><Ticket className="h-3.5 w-3.5 rotate-12" /></div>
            <span className="font-semibold text-[15px]">GIRVI</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-14">
            <div className="flex flex-col gap-3">
              <span className="text-[12px] font-semibold text-[#8A94A3] mb-1">Product</span>
              <button onClick={() => scrollToSection("features")} className="text-left text-[13.5px] text-[#55606D] hover:text-[#14181F]">Features</button>
              <button onClick={() => scrollToSection("interactive-preview")} className="text-left text-[13.5px] text-[#55606D] hover:text-[#14181F]">Product Demo</button>
              <button onClick={() => scrollToSection("workflow")} className="text-left text-[13.5px] text-[#55606D] hover:text-[#14181F]">Workflow</button>
              <button onClick={() => scrollToSection("pricing")} className="text-left text-[13.5px] text-[#55606D] hover:text-[#14181F]">Pricing</button>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[12px] font-semibold text-[#8A94A3] mb-1">Company</span>
              <Link href="#" className="text-[13.5px] text-[#55606D] hover:text-[#14181F]">About</Link>
              <Link href="#" className="text-[13.5px] text-[#55606D] hover:text-[#14181F]">Contact</Link>
              <Link href="/signup" className="text-[13.5px] text-[#55606D] hover:text-[#14181F]">Early Access</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[12px] font-semibold text-[#8A94A3] mb-1">Resources</span>
              <button onClick={() => scrollToSection("faq")} className="text-left text-[13.5px] text-[#55606D] hover:text-[#14181F]">FAQ</button>
              <Link href="#" className="text-[13.5px] text-[#55606D] hover:text-[#14181F]">Security</Link>
              <Link href="#" className="text-[13.5px] text-[#55606D] hover:text-[#14181F]">Support</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[12px] font-semibold text-[#8A94A3] mb-1">Legal</span>
              <Link href="#" className="text-[13.5px] text-[#55606D] hover:text-[#14181F]">Privacy Policy</Link>
              <Link href="#" className="text-[13.5px] text-[#55606D] hover:text-[#14181F]">Terms of Service</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-[#E7E9EC]">
            <span className="text-[12.5px] text-[#8A94A3]">© 2026 GIRVI. All rights reserved.</span>
            <div className="flex gap-2 w-full sm:w-auto">
              <input type="email" placeholder="Your email" className="text-[13px] px-3 py-2 border border-[#E7E9EC] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#14181F] flex-1 sm:w-56" />
              <button className="text-[13px] font-semibold px-3.5 py-2 rounded-lg bg-[#14181F] text-white hover:bg-[#314259] transition-colors shrink-0">Subscribe</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}