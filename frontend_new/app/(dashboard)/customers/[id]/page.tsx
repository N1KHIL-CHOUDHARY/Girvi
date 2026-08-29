"use client";

import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Phone,
  MapPin,
  Ticket,
  ShieldCheck,
  Plus,
  Pencil,
  ArrowLeft,
} from "lucide-react";
import { getAccountById, getAccountStats, getPawnTicketsByAccountId } from "@/services/api";
import { customerKeys } from "@/lib/queryKeys";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import type { CustomerDetail, CustomerStatsResponse } from "@/types/customer";
import type { PawnTicketRecord } from "@/types/pawn";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: customerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      const res = await getAccountById<CustomerDetail>(id);
      return res;
    },
  });

  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: customerKeys.stats(id),
    queryFn: async () => {
      const res = await getAccountStats<CustomerStatsResponse>(id);
      return res;
    },
  });

  const { data: ticketsData, isLoading: isLoadingTickets } = useQuery({
    queryKey: customerKeys.tickets(id),
    queryFn: async () => {
      const res = await getPawnTicketsByAccountId<PawnTicketRecord[]>(id);
      return res;
    },
  });

  const isLoading = isLoadingCustomer || isLoadingStats || isLoadingTickets;
  const customer = customerData?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 rounded bg-[#F6F7F8]" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="h-64 rounded-xl bg-[#F6F7F8] md:col-span-1" />
          <div className="h-64 rounded-xl bg-[#F6F7F8] md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!customer) {
    notFound();
  }

  const tickets = ticketsData?.data ?? [];
  const rawStats = statsData?.data as any;
  const stats = (statsData?.data?.stats ?? statsData?.data ?? {}) as any;
  const payments = (statsData?.meta as any)?.payments ?? rawStats?.payments ?? [];

  const activeTicketsList = tickets.filter(
    (t) => (t.status || "").toLowerCase() === "active"
  );

  const computedActiveLoanSum = activeTicketsList.reduce(
    (acc, t) => acc + Number(t.loan_amount || 0),
    0
  );

  const computedTotalLoanSum = tickets.reduce(
    (acc, t) => acc + Number(t.loan_amount || 0),
    0
  );

  const totalActiveLoan =
    stats?.total_active_loan ??
    stats?.totalActiveLoan ??
    (computedActiveLoanSum > 0 ? computedActiveLoanSum : 0);

  const totalLoanValue =
    stats?.total_loan_value ??
    stats?.totalLoanValue ??
    (computedTotalLoanSum > 0 ? computedTotalLoanSum : 0);

  const totalTickets =
    stats?.total_tickets ??
    stats?.totalTickets ??
    tickets.length;

  const activeTickets =
    stats?.active_tickets ??
    stats?.activeTickets ??
    activeTicketsList.length;

  const interestPaid =
    stats?.total_interest_paid ??
    stats?.totalInterestPaid ??
    payments.find((p: any) => (p.payment_for || "").toLowerCase() === "interest")?.total_paid ??
    "0";

  const principalPaid =
    stats?.total_principal_paid ??
    stats?.totalPrincipalPaid ??
    payments.find((p: any) => (p.payment_for || "").toLowerCase() === "principal")?.total_paid ??
    "0";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customers →"
        title={customer.full_name}
        subtitle="Complete borrower portfolio, active collateral exposure, and repayment history."
        breadcrumbs={
          <Link
            href="/customers"
            className="inline-flex items-center gap-1 text-xs text-[#55606D] hover:text-[#14181F]"
          >
            <ArrowLeft className="h-3 w-3" /> Back to directory
          </Link>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/customers/${id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7E9EC] bg-white px-3 py-1.5 text-xs font-semibold text-[#14181F] hover:bg-[#F6F7F8] transition-colors"
            >
              <Pencil className="h-3.5 w-3.5 text-[#55606D]" />
              <span>Edit Profile</span>
            </Link>
            <Link
              href={`/pawn-tickets/new?customer_id=${id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#14181F] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#314259] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Loan Ticket</span>
            </Link>
          </div>
        }
      />

      {/* Main 2-Column Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Column: Customer Identity Card */}
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 space-y-5">
          <div className="flex flex-col items-center text-center">
            {customer.customer_photo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={customer.customer_photo_url}
                alt={customer.full_name}
                className="h-20 w-20 rounded-xl border border-[#E7E9EC] object-cover"
              />
            ) : (

              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-[#F6F7F8] text-xl font-semibold text-[#314259] border border-[#E7E9EC]">
                {customer.full_name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <h2 className="mt-3 text-base font-semibold text-[#14181F]">
              {customer.full_name}
            </h2>
            <p className="text-xs text-[#8A94A3]">
              {customer.gender ?? "Borrower"} &middot; Member since{" "}
              {customer.createdAt ? new Date(customer.createdAt).getFullYear() : "2026"}
            </p>
          </div>

          <div className="space-y-3 border-t border-[#E7E9EC] pt-4 text-xs">
            <div className="flex items-center gap-2.5 text-[#55606D]">
              <Phone className="h-3.5 w-3.5 text-[#8A94A3] shrink-0" />
              <span className="font-mono text-[#14181F]">{customer.phone_number}</span>
            </div>
            <div className="flex items-start gap-2.5 text-[#55606D]">
              <MapPin className="mt-0.5 h-3.5 w-3.5 text-[#8A94A3] shrink-0" />
              <span>
                {customer.address
                  ? [customer.address.line1, customer.address.city, customer.address.pincode]
                      .filter(Boolean)
                      .join(", ")
                  : "No address recorded"}
              </span>
            </div>
          </div>

          {/* KYC Credentials Box */}
          <div className="rounded-lg border border-[#E7E9EC] bg-[#F6F7F8] p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A94A3]">
                KYC Verification
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-[#059669]" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#55606D]">Aadhaar</span>
              <span className="font-mono font-medium text-[#14181F]">
                {customer.aadhaar_number
                  ? `•••• •••• ${customer.aadhaar_number.slice(-4)}`
                  : "Not provided"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#55606D]">PAN Card</span>
              <span className="font-mono font-medium text-[#14181F] uppercase">
                {customer.pan_number || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Exposure & Balances */}
        <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 md:col-span-2 space-y-5">
          <div className="border-b border-[#E7E9EC] pb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#14181F]">
              Financial Ledger Exposure
            </h3>
            <span className="text-xs text-[#8A94A3]">
              {activeTickets} active pledges of {totalTickets} total loans
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-[#E7E9EC] bg-[#F6F7F8] p-4">
              <span className="text-[11px] font-medium text-[#8A94A3] uppercase tracking-wider block">
                Active Loan Balance
              </span>
              <p className="mt-1 text-2xl font-semibold font-mono text-[#14181F]">
                {formatCurrency(Number(totalActiveLoan))}
              </p>
            </div>

            <div className="rounded-lg border border-[#E7E9EC] bg-[#F6F7F8] p-4">
              <span className="text-[11px] font-medium text-[#8A94A3] uppercase tracking-wider block">
                Historical Valuation
              </span>
              <p className="mt-1 text-2xl font-semibold font-mono text-[#55606D]">
                {formatCurrency(Number(totalLoanValue))}
              </p>
            </div>

            <div className="rounded-lg border border-[#E7E9EC] bg-[#F6F7F8] p-4">
              <span className="text-[11px] font-medium text-[#8A94A3] uppercase tracking-wider block">
                Total Interest Paid
              </span>
              <p className="mt-1 text-2xl font-semibold font-mono text-[#059669]">
                {formatCurrency(Number(interestPaid))}
              </p>
            </div>

            <div className="rounded-lg border border-[#E7E9EC] bg-[#F6F7F8] p-4">
              <span className="text-[11px] font-medium text-[#8A94A3] uppercase tracking-wider block">
                Total Principal Repaid
              </span>
              <p className="mt-1 text-2xl font-semibold font-mono text-[#2563EB]">
                {formatCurrency(Number(principalPaid))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pledge Portfolio History Table */}
      <div className="rounded-xl border border-[#E7E9EC] bg-white p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7E9EC] pb-3">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-[#314259]" />
            <h3 className="text-sm font-semibold text-[#14181F]">
              Pledge Portfolio History
            </h3>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#8A94A3]">
            No pawn tickets registered for this customer yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E9EC] bg-[#F6F7F8] text-[11px] font-semibold text-[#55606D] uppercase tracking-wider">
                  <th className="py-3 px-3">Ticket ID</th>
                  <th className="py-3 px-3">Pledged Collateral</th>
                  <th className="py-3 px-3">Principal Loan</th>
                  <th className="py-3 px-3">Rate</th>
                  <th className="py-3 px-3">Pawned Date</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E9EC]">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-[#F6F7F8]/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-[#14181F]">
                      <Link
                        href={`/pawn-tickets/${ticket.id}`}
                        className="hover:underline text-[#314259]"
                      >
                        {ticket.ticket_number}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-[#55606D] max-w-xs truncate">
                      {ticket.items?.map((i) => `${i.name} (${i.weight_grams}g)`).join(", ") || "Collateral items"}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#14181F]">
                      {formatCurrency(Number(ticket.loan_amount))}
                    </td>
                    <td className="py-3 px-3 text-[#55606D] font-mono">
                      {ticket.interest_rate}% monthly
                    </td>
                    <td className="py-3 px-3 text-[#8A94A3] font-mono">
                      {new Date(ticket.pawned_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <StatusBadge status={ticket.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}