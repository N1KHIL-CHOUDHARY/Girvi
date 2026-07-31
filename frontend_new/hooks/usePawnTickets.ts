"use client";

import { useQuery } from "@tanstack/react-query";
import { getPawnTickets } from "@/services/api";
import { getApiErrorMessage } from "@/lib/api";
import { pawnTicketKeys } from "@/lib/queryKeys";
import type { PawnTicketRecord } from "@/types/pawn";
import type { ApiResponse } from "@/types/api";

export function usePawnTickets(page = 1, search = "", status = "all") {
  return useQuery<ApiResponse<PawnTicketRecord[]>, Error>({
    queryKey: pawnTicketKeys.list(page, status, search),
    queryFn: async () => {
      try {
        const response = await getPawnTickets<PawnTicketRecord[]>(page, search, status);
        return response;
      } catch (err) {
        throw new Error(
          getApiErrorMessage(err, "Failed to load pawn tickets. Please try again.")
        );
      }
    },
    placeholderData: (previousData) => previousData,
  });
}

