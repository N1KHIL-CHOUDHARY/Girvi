"use client";

import { useQuery } from "@tanstack/react-query";
import { getFinancialReport } from "@/services/api";
import { getApiErrorMessage } from "@/lib/api";
import { paymentKeys } from "@/lib/queryKeys";
import type { FinancialReportRow } from "@/types/report";
import type { ApiResponse } from "@/types/api";

export function usePaymentsLedger(page = 1, search = "") {
  return useQuery<ApiResponse<FinancialReportRow[]>, Error>({
    queryKey: paymentKeys.ledgerList(page, search),
    queryFn: async () => {
      try {
        const response = await getFinancialReport<FinancialReportRow[]>(page, search);
        return response;
      } catch (err) {
        throw new Error(
          getApiErrorMessage(err, "Failed to load payments ledger. Please try again.")
        );
      }
    },
    placeholderData: (previousData) => previousData,
  });
}

