"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import { formatCurrency } from "@/lib/format";
import type { ApiResponse } from "@/types/api";

export interface GlobalSearchResult {
  id: string;
  type: "customer" | "ticket";
  title: string;
  subtitle: string;
  href: string;
}

interface SearchResponse {
  customers: Array<{
    id: string;
    full_name: string;
    phone_number: string;
    customerCode?: string;
  }>;
  tickets: Array<{
    id: string;
    ticket_number: string;
    loan_amount: string | number;
    status: string;
  }>;
}

export function useGlobalSearch(query: string) {
  const normalizedQuery = query.trim();

  return useQuery<GlobalSearchResult[], Error>({
    queryKey: ["globalSearch", normalizedQuery],
    queryFn: async () => {
      if (!normalizedQuery) return [];

      try {
        const res = (await apiClient.get<ApiResponse<SearchResponse>>("/app/search", {
          params: { q: normalizedQuery }
        })) as unknown as ApiResponse<SearchResponse>;

        const customerResults: GlobalSearchResult[] = (res.data?.customers || []).map((c) => ({
          id: `customer-${c.id}`,
          type: "customer",
          title: c.full_name,
          subtitle: `Customer · Phone: ${c.phone_number}`,
          href: `/customers/${c.id}`,
        }));

        const ticketResults: GlobalSearchResult[] = (res.data?.tickets || []).map((t) => ({
          id: `ticket-${t.id}`,
          type: "ticket",
          title: t.ticket_number,
          subtitle: `Pawn Ticket · Amt: ${formatCurrency(Number(t.loan_amount))} · ${t.status}`,
          href: `/pawn-tickets/${t.id}`,
        }));

        return [...customerResults, ...ticketResults];
      } catch (err) {
        console.error("Global search error:", err);
        return [];
      }
    },
    enabled: normalizedQuery.length >= 2,
    staleTime: 5000,
  });
}
