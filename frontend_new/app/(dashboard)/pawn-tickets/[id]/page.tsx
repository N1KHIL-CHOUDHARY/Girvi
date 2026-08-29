"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Ticket,
  Layers,
  Scale,
  Receipt,
  Printer,
  Pencil,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { getPawnTicketById, getPaymentsForTicket, updatePawnTicketStatus } from "@/services/api";
import { pawnTicketKeys, paymentKeys } from "@/lib/queryKeys";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { RecordPaymentModal } from "@/components/ui/RecordPaymentModal";
import type { PawnTicketRecord } from "@/types/pawn";
import type { PaymentRecord } from "@/types/payment";
import toast from "react-hot-toast";

export default function PawnTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: ticketData, isLoading: isLoadingTicket, error: ticketError } = useQuery({
    queryKey: pawnTicketKeys.detail(id),
    queryFn: async () => {
      const res = await getPawnTicketById<PawnTicketRecord>(id);
      return res;
    },
  });



  const { data: paymentsData, isLoading: isLoadingPayments } = useQuery({
    queryKey: paymentKeys.byTicket(id),
    queryFn: async () => {
      const res = await getPaymentsForTicket<PaymentRecord[]>(id);
      return res;
    },
    enabled: !!ticketData?.data,
  });

  const settleMutation = useMutation({
    mutationFn: () => updatePawnTicketStatus(id, "settled"),
    onSuccess: () => {
      toast.success("Ticket loan marked as settled / redeemed");
      queryClient.invalidateQueries({ queryKey: pawnTicketKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: paymentKeys.byTicket(id) });
    },
    onError: (err: any) => {
      toast.error("Failed to settle ticket.");
    },
  });

  const isLoading = isLoadingTicket || isLoadingPayments;
  const ticket = ticketData?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 rounded bg-[#F6F7F8]" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="h-64 rounded-xl bg-[#F6F7F8] md:col-span-2" />
          <div className="h-64 rounded-xl bg-[#F6F7F8] md:col-span-1" />
        </div>
      </div>
    );
  }

  if (ticketError || !ticket) {
    notFound();
  }

  const paymentList = paymentsData?.data ?? [];
  const interestDue = (Number(ticket.loan_amount) * Number(ticket.interest_rate)) / 100;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Loans & Tickets →"
        title={`Ticket ${ticket.ticket_number}`}
        subtitle="Active collateral custody record, payment ledger, and pledge agreement."
        breadcrumbs={
          <Link
            href="/pawn-tickets"
            className="inline-flex items-center gap-1 text-xs text-[#55606D] hover:text-[#14181F]"
          >
            <ArrowLeft className="h-3 w-3" /> Back to ledger
          </Link>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="h-3.5 w-3.5" />}
            >
              Print Ticket
            </Button>
            {ticket.status === "active" && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPaymentModalOpen(true)}
                  leftIcon={<CreditCard className="h-3.5 w-3.5" />}
                >
                  Record Payment
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (confirm("Confirm loan settlement and release of pledged items?")) {
                      settleMutation.mutate();
                    }
                  }}
                  isLoading={settleMutation.isPending}
                  leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                >
                  Settle Loan
                </Button>
              </>
            )}
            <Link
              href={`/pawn-tickets/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E9EC] bg-white px-3 py-1.5 text-xs font-semibold text-[#14181F] hover:bg-[#F6F7F8] transition-colors"
            >
              <Pencil className="h-3.5 w-3.5 text-[#55606D]" />
              <span>Edit</span>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left 2 Columns: Financials and Collateral Item Cards */}
        <div className="space-y-6 md:col-span-2">
          {/* Financial Overview Card */}
          <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E7E9EC] pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-[#314259]" />
                <span className="text-xs font-mono font-semibold text-[#14181F]">
                  {ticket.ticket_number}
                </span>
              </div>
              <StatusBadge status={ticket.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-[#E7E9EC] bg-[#F6F7F8] p-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A94A3] block">
                  Outstanding Balance
                </span>
                <p className="mt-1 text-2xl font-semibold font-mono text-[#14181F]">
                  {formatCurrency(Number(ticket.loan_amount))}
                </p>
              </div>

              <div className="rounded-lg border border-[#E7E9EC] bg-[#F6F7F8] p-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A94A3] block">
                  Original Principal
                </span>
                <p className="mt-1 text-2xl font-semibold font-mono text-[#55606D]">
                  {formatCurrency(Number(ticket.original_loan_amount || ticket.loan_amount))}
                </p>
              </div>

              <div className="rounded-lg border border-[#E7E9EC] bg-[#F6F7F8] p-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#8A94A3] block">
                  Monthly Rate
                </span>
                <p className="mt-1 text-2xl font-semibold font-mono text-[#14181F]">
                  {ticket.interest_rate}% <span className="text-xs text-[#8A94A3]">/ mo</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-[#E7E9EC] pt-4 text-xs text-[#55606D]">
              <div>
                <span className="text-[11px] text-[#8A94A3] block">Pawned On</span>
                <span className="font-mono font-medium text-[#14181F]">
                  {ticket.pawned_date ? new Date(ticket.pawned_date).toLocaleDateString() : "—"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#8A94A3] block">Advance / Deductions</span>
                <span className="font-mono font-medium text-[#14181F]">
                  {formatCurrency(Number(ticket.adv_amount || 0))}
                </span>
              </div>
              {ticket.settled_date && (
                <div>
                  <span className="text-[11px] text-[#059669] block">Settled On</span>
                  <span className="font-mono font-medium text-[#059669]">
                    {new Date(ticket.settled_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Pledged Asset Collateral Card */}
          <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E7E9EC] pb-3">
              <Layers className="h-4 w-4 text-[#314259]" />
              <h3 className="text-sm font-semibold text-[#14181F]">
                Pledged Collateral Asset
              </h3>
            </div>

            <div className="space-y-3">
              {ticket.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-[#E7E9EC] rounded-xl bg-[#F6F7F8]/50 gap-4"
                >
                  <div className="flex items-center gap-3">
                    {item.item_photo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.item_photo_url}
                        alt={item.name}
                        className="h-14 w-14 rounded-lg object-cover border border-[#E7E9EC]"
                      />
                    ) : (

                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white border border-[#E7E9EC] text-[#314259] shrink-0">
                        <Layers className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-xs text-[#14181F]">{item.name}</p>
                      <p className="text-[11px] text-[#8A94A3] capitalize">
                        {item.type} · Purity: {item.purity ? `${item.purity}%` : "Standard Hallmark"}
                      </p>
                      {item.description && (
                        <p className="mt-1 text-[11px] text-[#55606D]">{item.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-white border border-[#E7E9EC] px-3 py-1.5 text-xs font-mono font-semibold text-[#14181F]">
                    <Scale className="h-3.5 w-3.5 text-[#314259]" />
                    <span>{item.weight_grams} grams</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Payment History */}
        <div className="space-y-6">
          {/* Customer Profile Snippet */}
          <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E9EC] pb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A94A3]">
                Borrower Profile
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-[#059669]" />
            </div>

            {ticket.customer ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F6F7F8] border border-[#E7E9EC] text-sm font-semibold text-[#314259]">
                    {ticket.customer.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <Link
                      href={`/customers/${ticket.customer.id}`}
                      className="font-semibold text-xs text-[#14181F] hover:underline block"
                    >
                      {ticket.customer.full_name}
                    </Link>
                    <span className="text-[11px] text-[#8A94A3] font-mono">
                      {ticket.customer.phone_number}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#E7E9EC] pt-2 text-xs text-[#55606D] space-y-1">
                  <p className="text-[11px] text-[#8A94A3]">Address</p>
                  <p>
                    {ticket.customer.address
                      ? [ticket.customer.address.line1, ticket.customer.address.city]
                          .filter(Boolean)
                          .join(", ")
                      : "Registered address on file"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-[#8A94A3]">
                Walk-in borrower
              </div>
            )}
          </div>

          {/* Payment Receipts Ledger */}
          <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E9EC] pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-[#314259]" />
                <h3 className="text-xs font-semibold text-[#14181F]">
                  Repayment Receipts
                </h3>
              </div>
              <span className="text-[11px] text-[#8A94A3]">{paymentList.length} total</span>
            </div>

            {paymentList.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#8A94A3]">
                No payments recorded yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {paymentList.map((payment) => {
                  const isInterest = payment.payment_for === "interest";
                  return (
                    <div
                      key={payment.id}
                      className="flex justify-between items-start text-xs border-b border-[#E7E9EC] pb-2.5"
                    >
                      <div>
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 font-semibold uppercase text-[10px] ${
                            isInterest
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {payment.payment_for}
                        </span>
                        <p className="mt-1 text-[11px] text-[#8A94A3] font-mono">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-mono font-semibold text-[#14181F]">
                        {formatCurrency(Number(payment.amount_paid))}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record Payment Drawer / Modal */}
      {isPaymentModalOpen && (
        <RecordPaymentModal
          isOpen={true}
          onClose={() => setIsPaymentModalOpen(false)}
          ticketId={ticket.id}
          ticketNumber={ticket.ticket_number}
          customerName={ticket.customer?.full_name}
          principalBalance={ticket.loan_amount}
          interestDue={interestDue}
        />
      )}
    </div>
  );
}

