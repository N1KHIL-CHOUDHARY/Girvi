"use client";

import { useQuery } from "@tanstack/react-query";
import { getPawnTickets } from "@/services/api";
import { getApiErrorMessage } from "@/lib/api";
import type { PawnTicketListResponse } from "@/types/pawn";

export function usePawnTickets(page = 1, search = "", status = "all") {
  return useQuery<PawnTicketListResponse, Error>({
    queryKey: ["pawnTickets", page, search, status],
    queryFn: async () => {
      try {
        const response = await getPawnTickets<PawnTicketListResponse>(page, search, status);
        return response.data;
      } catch (err) {
        throw new Error(
          getApiErrorMessage(err, "Failed to load pawn tickets. Please try again.")
        );
      }
    },
    placeholderData: (previousData) => previousData,
  });
}
