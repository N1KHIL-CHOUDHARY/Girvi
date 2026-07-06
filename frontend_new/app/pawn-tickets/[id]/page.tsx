"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Ticket,
  ChevronLeft,
  Calendar,
  Layers,
  Percent,
  User,
  Scale,
  Receipt,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { getPawnTicketById, getPaymentsForTicket, updatePawnTicketStatus } from "@/services/api";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import type { PawnTicketRecord } from "@/types/pawn";
import type { PaymentRecord } from "@/types/payment";
import toast from "react-hot-toast";

export default function PawnTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Query Pawn Ticket
  const { data: ticket, isLoading: isLoadingTicket, error: ticketError } = useQuery({
    queryKey: ["pawnTicket", id],
    queryFn: async () => {
      const res = await getPawnTicketById<PawnTicketRecord>(id);
      return res.data;
    },
  });

  // Query Payments for this Ticket
  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["ticketPayments", id],
    queryFn: async () => {
      const res = await getPaymentsForTicket<PaymentRecord[]>(id);
      return res.data;
    },
    enabled: !!ticket,
  });

  // Settle Ticket Mutation
  const settleMutation = useMutation({
    mutationFn: () => updatePawnTicketStatus(id, "settled"),
    onSuccess: () => {
      toast.success("Ticket marked as settled");
      queryClient.invalidateQueries({ queryKey: ["pawnTicket", id] });
      queryClient.invalidateQueries({ queryKey: ["ticketPayments", id] });
    },
    onError: (err: any) => {
      toast.error("Failed to settle ticket.");
    },
  });

  const isLoading = isLoadingTicket || isLoadingPayments;

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto w-full max-w-5xl animate-pulse space-y-6">
          <div className="h-6 w-32 rounded bg-slate-100" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="h-64 rounded-2xl bg-slate-100 md:col-span-2" />
            <div className="h-64 rounded-2xl bg-slate-100 md:col-span-1" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (ticketError || !ticket) {
    return (
      <AppShell>
        <div className="py-16 text-center">
          <p className="text-lg font-medium text-slate-900">Pawn ticket not found</p>
          <Link href="/pawn-tickets" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1E3A66]">
            <ChevronLeft className="h-4 w-4" /> Back to Tickets
          </Link>
        </div>
      </AppShell>
    );
  }

  const paymentList = payments ?? [];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/pawn-tickets"
            className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Tickets
          </Link>
          <div className="flex gap-2">
            {ticket.status === "active" && (
              <button
                type="button"
                onClick={() => void settleMutation.mutate()}
                disabled={settleMutation.isPending}
                className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-semibold hover:bg-emerald-100 disabled:opacity-50"
              >
                Settle Balance
              </button>
            )}
            <Link
              href={`/pawn-tickets/${id}/edit`}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Edit Ticket
            </Link>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: Ticket financials and Customer info */}
          <div className="space-y-6 md:col-span-2">
            {/* Financial Details */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-slate-400" />
                  <h2 className="text-lg font-bold text-slate-900 font-mono">{ticket.ticket_number}</h2>
                </div>
                <StatusBadge status={ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Balance</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-950">{formatCurrency(ticket.loan_amount)}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Original Principal</p>
                  <p className="mt-1 text-xl font-bold text-slate-700">{formatCurrency(ticket.original_loan_amount)}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interest Rate</p>
                  <p className="mt-1 text-xl font-bold text-slate-700">{ticket.interest_rate}% / mo</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-6 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Pawned: {new Date(ticket.pawned_date).toLocaleDateString()}</span>
                </div>
                {ticket.settled_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-700">Settled: {new Date(ticket.settled_date).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Percent className="h-4 w-4 text-slate-400" />
                  <span>Advance Deducted: {formatCurrency(ticket.adv_amount)}</span>
                </div>
              </div>
            </div>

            {/* Pledged Items List */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-900">Pledged Asset Details</h3>
              </div>

              <div className="space-y-4">
                {ticket.items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-slate-100 rounded-xl bg-slate-50/50 gap-4">
                    <div className="flex items-center gap-3">
                      {item.item_photo_url ? (
                        <img
                          src={item.item_photo_url}
                          alt={item.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 shrink-0">
                          <Layers className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-950">{item.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{item.type} purity: {item.purity ? `${item.purity}%` : "Not specified"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-slate-700 text-sm font-medium">
                        <Scale className="h-4 w-4 text-slate-400" />
                        <span>{item.weight_grams} grams</span>
                      </div>
                      {item.description && (
                        <span className="text-xs text-slate-400 max-w-xs truncate" title={item.description}>
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Customer info and Payment ledger */}
          <div className="space-y-6">
            {/* Customer profile link */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer Profile</h3>
              {ticket.customer ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {ticket.customer.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <Link
                      href={`/customers/${ticket.customer.id}`}
                      className="font-bold text-[#1E3A66] hover:underline block text-sm"
                    >
                      {ticket.customer.full_name}
                    </Link>
                    <span className="text-xs text-slate-500">{ticket.customer.phone_number}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <User className="h-4 w-4" />
                  <span>No customer profile linked</span>
                </div>
              )}
            </div>

            {/* Payment Ledger / History */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Receipt className="h-4.5 w-4.5 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-900">Receipts History</h3>
              </div>

              {paymentList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No payments recorded for this ticket.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                  {paymentList.map((payment) => {
                    const isInterest = payment.payment_for === "interest";
                    return (
                      <div key={payment.id} className="flex justify-between items-start text-xs border-b border-slate-50 pb-2.5">
                        <div>
                          <span className={`inline-flex rounded px-1.5 py-0.5 font-bold uppercase tracking-wider text-[10px] ${isInterest ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                            {payment.payment_for}
                          </span>
                          <p className="mt-1 text-slate-400">
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(payment.amount_paid)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
