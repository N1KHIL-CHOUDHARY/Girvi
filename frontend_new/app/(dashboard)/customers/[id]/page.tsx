"use client";

import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  Ticket,
  ChevronLeft,
  Calendar,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { getAccountById, getAccountStats, getPawnTicketsByAccountId } from "@/services/api";
import { customerKeys } from "@/lib/queryKeys";
import { formatCurrency } from "@/lib/format";
import type { CustomerDetail, CustomerStatsResponse } from "@/types/customer";
import type { PawnTicketRecord } from "@/types/pawn";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

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
      <AppShell>
        <div className="mx-auto w-full max-w-5xl animate-pulse space-y-6">
          <div className="h-6 w-32 rounded bg-slate-100" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="h-64 rounded-2xl bg-slate-100 md:col-span-1" />
            <div className="h-64 rounded-2xl bg-slate-100 md:col-span-2" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!customer) {
    notFound();
  }

  const tickets = ticketsData?.data ?? [];
  const rawStats = statsData?.data as any;
  const stats = rawStats?.stats ?? rawStats ?? {};
  const payments = (rawStats?.payments ?? []) as any[];

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
    payments.find((p) => p.payment_for === "interest")?.total_paid ??
    "0";

  const principalPaid =
    stats?.total_principal_paid ??
    stats?.totalPrincipalPaid ??
    payments.find((p) => p.payment_for === "principal")?.total_paid ??
    "0";

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/customers"
            className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Customers
          </Link>
          <Link
            href={`/customers/${id}/edit`}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
            {customer.customer_photo_url ? (
              <img
                src={customer.customer_photo_url}
                alt={customer.full_name}
                className="h-24 w-24 rounded-full border-2 border-slate-100 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-3xl font-semibold text-slate-600">
                {customer.full_name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <h2 className="mt-4 text-lg font-bold text-slate-900">{customer.full_name}</h2>
            <p className="text-sm text-slate-500">{customer.gender ?? "Gender unspecified"}</p>

            <div className="mt-6 w-full space-y-3 border-t border-slate-100 pt-6 text-left">
              <div className="flex items-center gap-2.5 text-sm text-slate-600">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                <span>{customer.phone_number}</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  {customer.address
                    ? [customer.address.line1, customer.address.city, customer.address.pincode].filter(Boolean).join(", ")
                    : "No address registered"}
                </span>
              </div>
            </div>

            <div className="mt-6 w-full space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left">
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">KYC Verification</p>
              <div className="text-sm">
                <span className="text-slate-500">Aadhaar: </span>
                <span className="font-semibold text-slate-800">
                  {customer.aadhaar_number ? `XXXX-XXXX-${customer.aadhaar_number.slice(-4)}` : "Not verified"}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-slate-500">PAN: </span>
                <span className="font-semibold text-slate-800 uppercase">
                  {customer.pan_number ?? "Not registered"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:col-span-2">
            <h3 className="border-b border-slate-100 pb-3 text-sm font-semibold text-slate-900">Financial Ledger Balance</h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-medium tracking-wider uppercase">Total Active Loan Balance</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(totalActiveLoan)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Layers className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-medium tracking-wider uppercase">Historical Total Valuation</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(totalLoanValue)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium tracking-wider uppercase">Total Interest Paid</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(interestPaid)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium tracking-wider uppercase">Total Principal Paid</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(principalPaid)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs font-medium tracking-wider text-slate-400 uppercase">Total Pledged Tickets</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{totalTickets}</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <p className="text-xs font-medium tracking-wider text-slate-400 uppercase">Active Tickets</p>
                  <p className="mt-1 text-lg font-bold text-[#1E3A66]">{activeTickets}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">Pledge Portfolio History</h3>
          </div>

          {tickets.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No pawn tickets registered for this customer.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-medium tracking-wide text-slate-400 uppercase">
                    <th className="py-3 pr-4 font-medium">Ticket ID</th>
                    <th className="py-3 px-4 font-medium">Items Pledged</th>
                    <th className="py-3 px-4 font-medium">Loan Value</th>
                    <th className="py-3 px-4 font-medium">Rate</th>
                    <th className="py-3 px-4 font-medium">Date</th>
                    <th className="py-3 pl-4 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
                  {tickets.map((ticket) => {
                    const statusClass =
                      (ticket.status || "").toLowerCase() === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : (ticket.status || "").toLowerCase() === "settled"
                        ? "bg-blue-50 text-blue-700 border-blue-100"
                        : "bg-amber-50 text-amber-700 border-amber-100";

                    return (
                      <tr key={ticket.id} className="hover:bg-slate-50/50">
                        <td className="py-4 pr-4 font-mono font-semibold text-slate-900">
                          <Link href={`/pawn-tickets/${ticket.id}`} className="hover:underline text-[#1E3A66]">
                            {ticket.ticket_number}
                          </Link>
                        </td>
                        <td className="max-w-xs truncate py-4 px-4 font-medium">
                          {ticket.items.map((i) => `${i.name} (${i.weight_grams}g)`).join(", ")}
                        </td>
                        <td className="py-4 px-4 font-medium text-slate-900">
                          {formatCurrency(ticket.loan_amount)}
                        </td>
                        <td className="py-4 px-4 font-medium">{ticket.interest_rate}%</td>
                        <td className="py-4 px-4 text-slate-500">
                          {new Date(ticket.pawned_date).toLocaleDateString()}
                        </td>
                        <td className="py-4 pl-4 text-right">
                          <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold uppercase ${statusClass}`}>
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}