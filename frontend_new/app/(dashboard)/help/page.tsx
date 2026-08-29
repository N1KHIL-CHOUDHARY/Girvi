"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Ticket,
  Users,
  Calculator,
  Search,
  ChevronDown,
  ChevronRight,
  Mail,
} from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";


interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FaqItem[] = [
  {
    category: "Pawn Tickets & Origination",
    question: "How is monthly interest accrued on active loan tickets?",
    answer:
      "Interest is computed monthly based on the simple interest formula: (Active Principal × Monthly Rate %) / 100. When partial payments are recorded against principal, interest is dynamically recalculated on the reduced principal balance.",
  },
  {
    category: "Pawn Tickets & Origination",
    question: "How do I settle and release pledged collateral to a borrower?",
    answer:
      "Open the Pawn Ticket details page, click 'Settle Loan' or record final settlement payment. Once the balance reaches ₹0, the ticket status changes to Settled and the inventory item is marked as Released from vault custody.",
  },
  {
    category: "Borrower KYC",
    question: "What KYC credentials are required for originating a pawn agreement?",
    answer:
      "Under standard statutory regulations, a borrower requires a 12-digit verified Aadhaar Number, permanent address, contact phone number, and PAN card for high-value pledges exceeding statutory limits.",
  },
  {
    category: "Collateral Vault",
    question: "How is gold purity verified and recorded?",
    answer:
      "Gross weight is recorded in grams up to 2 decimal places. Karat purity is recorded (e.g. 22K for 91.6% purity or 18K for 75% purity) to establish baseline loan-to-value (LTV) ratios.",
  },
  {
    category: "Staff & Permissions",
    question: "What are the differences between Admin, Appraiser, and Cashier roles?",
    answer:
      "Administrators have full operational authority including staff management and store settings. Appraisers can originate tickets and record item valuations. Cashiers record interest payments and print customer receipts.",
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        eyebrow="System →"
        title="Help & Knowledge Base"
        subtitle="Operator manuals, statutory compliance guidelines, and system documentation."
      />

      {/* Search Header Banner */}
      <div className="rounded-xl border border-[#E7E9EC] bg-white p-6 space-y-4">
        <div className="max-w-xl">
          <h2 className="text-base font-semibold text-[#14181F]">
            How can we help you today?
          </h2>
          <p className="text-xs text-[#8A94A3] mt-1">
            Search topics on loan origination, repayment calculations, and collateral vault audit.
          </p>
        </div>

        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A94A3]" />
          <input
            type="search"
            placeholder="Search guides, FAQs, or workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#E7E9EC] bg-[#F6F7F8] pl-9 pr-4 text-xs text-[#14181F] placeholder:text-[#8A94A3] focus:border-[#14181F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#14181F]"
          />
        </div>
      </div>

      {/* Quick Access Topic Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/pawn-tickets/new"
          className="rounded-xl border border-[#E7E9EC] bg-white p-4 hover:border-[#14181F] transition-colors group"
        >
          <Ticket className="h-5 w-5 text-[#314259] group-hover:text-[#14181F]" />
          <h3 className="mt-2.5 text-xs font-semibold text-[#14181F]">
            Originate Loan Ticket
          </h3>
          <p className="mt-1 text-[11px] text-[#8A94A3]">
            Step-by-step guide on creating pawn tickets and collateral appraisal.
          </p>
        </Link>

        <Link
          href="/customers/new"
          className="rounded-xl border border-[#E7E9EC] bg-white p-4 hover:border-[#14181F] transition-colors group"
        >
          <Users className="h-5 w-5 text-[#314259] group-hover:text-[#14181F]" />
          <h3 className="mt-2.5 text-xs font-semibold text-[#14181F]">
            KYC & Customer Onboarding
          </h3>
          <p className="mt-1 text-[11px] text-[#8A94A3]">
            Managing Aadhaar credentials and borrower address records.
          </p>
        </Link>

        <Link
          href="/payments"
          className="rounded-xl border border-[#E7E9EC] bg-white p-4 hover:border-[#14181F] transition-colors group"
        >
          <Calculator className="h-5 w-5 text-[#314259] group-hover:text-[#14181F]" />
          <h3 className="mt-2.5 text-xs font-semibold text-[#14181F]">
            Interest & Principal Ledger
          </h3>
          <p className="mt-1 text-[11px] text-[#8A94A3]">
            Recording partial repayments and printing receipts vouchers.
          </p>
        </Link>
      </div>

      {/* FAQ Accordion */}
      <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 space-y-4">
        <div className="border-b border-[#E7E9EC] pb-3">
          <h3 className="text-sm font-semibold text-[#14181F]">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="divide-y divide-[#E7E9EC]">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-3.5">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between text-left text-xs font-semibold text-[#14181F] hover:text-[#314259] cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-[#8A94A3] shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[#8A94A3] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="mt-2 text-xs text-[#55606D] leading-relaxed pr-6">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Support Contact Footer */}
      <div className="rounded-xl border border-[#E7E9EC] bg-[#F6F7F8] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-semibold text-[#14181F] block">Need dedicated assistance?</span>
          <span className="text-[#8A94A3]">Our technical support team is available 24/7.</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="mailto:support@grivi.io"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E9EC] bg-white px-3 py-1.5 font-semibold text-[#14181F] hover:bg-[#F6F7F8]"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Email Support</span>
          </a>
        </div>

      </div>
    </div>
  );
}
