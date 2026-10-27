"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Users,
  CreditCard,
  Search,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Layers,
  Archive,
  FileText,
  Settings,
} from "lucide-react";

export default function GirviLandingPage() {
  return (
    <div className="min-h-screen w-full bg-[#FAFAFC] text-[#111827] font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* ─────────────────────────────────────────────────────────────
          1. NAVIGATION BAR
      ─────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[#F0F2F5] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F172A] text-white font-black text-sm tracking-tight shadow-xs">
              G
            </span>
            <span className="font-extrabold tracking-tight text-[#0F172A] text-base">
              GIRVI
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#4B5563]">
            <a href="#product" className="hover:text-[#0F172A] transition-colors">Product</a>
            <a href="#features" className="hover:text-[#0F172A] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#0F172A] transition-colors">How it works</a>
            <a href="#faq" className="hover:text-[#0F172A] transition-colors">FAQ</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#4B5563] hover:text-[#0F172A] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1E293B] transition active:scale-95"
            >
              <span>Get started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO CONTENT
      ─────────────────────────────────────────────────────────────── */}
      <section className="pt-14 pb-12 sm:pt-20 sm:pb-16 text-center">
        <div className="mx-auto max-w-4xl px-6">
          
          {/* Sparkle Pill */}
         

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-[1.12]">
            Run your pawn shop with ease.
          </h1>

          {/* Subtext */}
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-[#6B7280] leading-relaxed">
            Track pledges, manage customers, record payments and never miss a due date — <br className="hidden sm:inline" />
            all in one simple system.
          </p>

          {/* Dual CTAs */}
          <div className="mt-7 flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F172A] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#1E293B] transition active:scale-95"
            >
              <span>Get started free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#features"
              className="rounded-lg border border-[#E5E7EB] bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#374151] hover:bg-neutral-50 shadow-2xs transition active:scale-95"
            >
              View features
            </a>
          </div>

          {/* 3-Pill Feature Row */}
          
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. REALISTIC APPLICATION DASHBOARD PREVIEW
      ─────────────────────────────────────────────────────────────── */}
      <section id="product" className="pb-24 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          
          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)]">
            
            {/* Top Workspace Header */}
            <div className="flex items-center justify-between border-b border-[#F0F2F5] px-6 py-3 bg-white">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F172A] text-white font-black text-xs">
                  G
                </span>
                <span className="font-extrabold tracking-tight text-[#0F172A] text-sm">
                  GIRVI
                </span>
              </div>

              {/* Global Search Bar */}
              <div className="relative w-80 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search by customer, item or pledge ID..."
                  readOnly
                  className="w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] py-1.5 pl-8 pr-3 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
                />
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <button className="text-[#6B7280] hover:text-[#111827]">
                  <Bell className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 border-l border-[#F0F2F5] pl-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F172A] text-[10px] font-bold text-white">
                    NK
                  </div>
                  <span className="text-xs font-semibold text-[#111827] hidden sm:inline">
                    Nikhil Traders
                  </span>
                  <ChevronDown className="h-3 w-3 text-[#9CA3AF]" />
                </div>
              </div>
            </div>

            {/* Split Dashboard Body */}
            <div className="grid grid-cols-12 min-h-[520px]">
              
              {/* Sidebar */}
              <div className="col-span-12 md:col-span-3 border-r border-[#F0F2F5] bg-[#FBFBFC] p-4 space-y-1 text-xs">
                <div className="rounded-lg bg-[#EFF6FF] px-3 py-2 font-semibold text-[#2563EB] flex items-center gap-2.5">
                  <LayoutDashboard className="h-4 w-4" />
                  Overview
                </div>
                <div className="px-3 py-2 text-[#4B5563] hover:text-[#111827] flex items-center gap-2.5">
                  <Layers className="h-4 w-4 text-[#9CA3AF]" />
                  Pledges
                </div>
                <div className="px-3 py-2 text-[#4B5563] hover:text-[#111827] flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-[#9CA3AF]" />
                  Customers
                </div>
                <div className="px-3 py-2 text-[#4B5563] hover:text-[#111827] flex items-center gap-2.5">
                  <Archive className="h-4 w-4 text-[#9CA3AF]" />
                  Inventory
                </div>
                <div className="px-3 py-2 text-[#4B5563] hover:text-[#111827] flex items-center gap-2.5">
                  <CreditCard className="h-4 w-4 text-[#9CA3AF]" />
                  Payments
                </div>
                <div className="px-3 py-2 text-[#4B5563] hover:text-[#111827] flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-[#9CA3AF]" />
                  Reports
                </div>
                <div className="px-3 py-2 text-[#4B5563] hover:text-[#111827] flex items-center gap-2.5">
                  <Settings className="h-4 w-4 text-[#9CA3AF]" />
                  Settings
                </div>
              </div>

              {/* Main Workspace Area */}
              <div className="col-span-12 md:col-span-9 p-6 space-y-6">
                
                {/* Greeting & Date Filter */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">Overview</h3>
                    <p className="text-xs text-[#6B7280]">Good morning, Nikhil</p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#374151] shadow-2xs">
                    <Calendar className="h-3.5 w-3.5 text-[#6B7280]" />
                    <span>Oct 1, 2026 - Oct 31, 2026</span>
                    <ChevronDown className="h-3 w-3 text-[#9CA3AF]" />
                  </div>
                </div>

                {/* 4 KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-[#F0F2F5] bg-white p-3.5 shadow-2xs">
                    <span className="text-[10px] text-[#6B7280] font-medium block">Total pledges</span>
                    <p className="text-lg font-bold font-mono text-[#111827] mt-1">₹8,42,500</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">↑ 12% from last month</span>
                  </div>

                  <div className="rounded-xl border border-[#F0F2F5] bg-white p-3.5 shadow-2xs">
                    <span className="text-[10px] text-[#6B7280] font-medium block">Due this week</span>
                    <p className="text-lg font-bold font-mono text-[#111827] mt-1">24</p>
                    <span className="text-[10px] text-rose-600 font-semibold">6 overdue</span>
                  </div>

                  <div className="rounded-xl border border-[#F0F2F5] bg-white p-3.5 shadow-2xs">
                    <span className="text-[10px] text-[#6B7280] font-medium block">Payments received</span>
                    <p className="text-lg font-bold font-mono text-[#111827] mt-1">₹1,26,000</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">↑ 18% from last month</span>
                  </div>

                  <div className="rounded-xl border border-[#F0F2F5] bg-white p-3.5 shadow-2xs">
                    <span className="text-[10px] text-[#6B7280] font-medium block">Total customers</span>
                    <p className="text-lg font-bold font-mono text-[#111827] mt-1">183</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">↑ 8% from last month</span>
                  </div>
                </div>

                {/* Charts Split Area */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Activity Line Graph */}
                  <div className="md:col-span-8 rounded-xl border border-[#F0F2F5] p-4 bg-white shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#111827]">Pledge activity</span>
                      <span className="text-[10px] text-[#6B7280] border border-[#E5E7EB] px-2 py-0.5 rounded">
                        Last 30 days ▾
                      </span>
                    </div>

                    <div className="relative h-28 w-full pt-2">
                      <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                        <path
                          d="M 0,80 Q 50,75 80,60 T 160,70 T 240,40 T 320,65 T 400,30"
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="2"
                        />
                      </svg>
                      <div className="flex justify-between text-[9px] text-[#9CA3AF] mt-2 font-mono">
                        <span>Oct 1</span>
                        <span>Oct 10</span>
                        <span>Oct 20</span>
                        <span>Oct 31</span>
                      </div>
                    </div>
                  </div>

                  {/* Donut Status Chart */}
                  <div className="md:col-span-4 rounded-xl border border-[#F0F2F5] p-4 bg-white shadow-2xs flex flex-col justify-between">
                    <span className="text-xs font-bold text-[#111827]">Pledge status</span>
                    
                    <div className="flex items-center gap-3 my-2">
                      <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                          <circle
                            cx="18"
                            cy="18"
                            r="14"
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="4"
                            strokeDasharray="65 100"
                          />
                        </svg>
                        <span className="absolute text-[11px] font-bold text-[#111827]">128</span>
                      </div>

                      <div className="space-y-1 text-[10px] text-[#4B5563] w-full">
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" /> Active
                          </span>
                          <span className="font-semibold text-[#111827]">84</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Due soon
                          </span>
                          <span className="font-semibold text-[#111827]">24</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Overdue
                          </span>
                          <span className="font-semibold text-[#111827]">12</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] text-[#9CA3AF] text-center">Total 128 items</span>
                  </div>
                </div>

                {/* Table: Recent Pledges */}
                <div className="rounded-xl border border-[#F0F2F5] bg-white overflow-hidden shadow-2xs">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F2F5]">
                    <span className="text-xs font-bold text-[#111827]">Recent pledges</span>
                    <span className="text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer">
                      View all →
                    </span>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F9FAFB] text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-4">Customer</th>
                        <th className="py-2.5 px-4">Item</th>
                        <th className="py-2.5 px-4">Amount</th>
                        <th className="py-2.5 px-4">Pledge date</th>
                        <th className="py-2.5 px-4">Due date</th>
                        <th className="py-2.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F2F5] text-[11px] text-[#374151]">
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#111827]">Ramesh Kumar</td>
                        <td className="py-3 px-4">Gold Necklace</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#111827]">₹62,000</td>
                        <td className="py-3 px-4 text-[#6B7280]">Oct 12, 2026</td>
                        <td className="py-3 px-4 text-[#6B7280]">Nov 12, 2026</td>
                        <td className="py-3 px-4 text-center">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                            Active
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#111827]">Suresh Patel</td>
                        <td className="py-3 px-4">Gold Bangles (Pair)</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#111827]">₹45,000</td>
                        <td className="py-3 px-4 text-[#6B7280]">Oct 15, 2026</td>
                        <td className="py-3 px-4 text-[#6B7280]">Nov 15, 2026</td>
                        <td className="py-3 px-4 text-center">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                            Active
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. CLEAN FOOTER
      ─────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#F0F2F5] py-8 text-xs text-[#6B7280] bg-white">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-[#0F172A] text-[10px] font-bold text-white">
              G
            </span>
            <span className="font-bold text-[#111827]">GIRVI</span>
            <span>— Simple pawn shop management</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-[#111827] transition">Privacy</Link>
            <Link href="/" className="hover:text-[#111827] transition">Terms</Link>
            <Link href="/login" className="hover:text-[#111827] transition">Sign In</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

export { GirviLandingPage as LandingPage };
