"use client";

import { useQuery } from "@tanstack/react-query";
import { getAccounts, getPawnTickets, type ApiResponse } from "@/services/api";
import type { CustomerListResponse } from "@/types/customer";
import type { PawnTicketListResponse } from "@/types/pawn";

export interface GlobalSearchResult {
  id: string;
  type: "customer" | "ticket";
  title: string;
  subtitle: string;
  href: string;
}

export function useGlobalSearch(query: string) {
  const normalizedQuery = query.trim();

  return useQuery<GlobalSearchResult[], Error>({
    queryKey: ["globalSearch", normalizedQuery],
    queryFn: async () => {
      if (!normalizedQuery) return [];

      try {
        // Query both endpoints in parallel
        const [customersRes, ticketsRes] = await Promise.all([
          getAccounts<CustomerListResponse>(1, normalizedQuery),
          getPawnTickets<PawnTicketListResponse>(1, normalizedQuery, "all"),
        ]);

        const customerResults: GlobalSearchResult[] = (customersRes.data?.items || []).map((c) => ({
          id: `customer-${c.id}`,
          type: "customer",
          title: c.full_name,
          subtitle: `Customer · Phone: ${c.phone_number}`,
          href: `/customers/${c.id}`,
        }));

        const ticketResults: GlobalSearchResult[] = (ticketsRes.data?.items || []).map((t) => ({
          id: `ticket-${t.id}`,
          type: "ticket",
          title: t.ticket_number,
          subtitle: `Pawn Ticket · Amt: ₹${Number(t.loan_amount).toLocaleString("en-IN")} · ${t.status}`,
          href: `/pawn-tickets/${t.id}`,
        }));

        return [...customerResults, ...ticketResults];
      } catch (err) {
        console.error("Global search error:", err);
        return [];
      }
    },
    enabled: normalizedQuery.length >= 2, // Only query if at least 2 characters
    staleTime: 5000,
  });
}
