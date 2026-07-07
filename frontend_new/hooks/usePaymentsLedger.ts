"use client";

import { useQuery } from "@tanstack/react-query";
import { getFinancialReport } from "@/services/api";
import { getApiErrorMessage } from "@/lib/api";
import type { FinancialReportResponse } from "@/types/report";

export function usePaymentsLedger(page = 1, search = "") {
  return useQuery<FinancialReportResponse, Error>({
    queryKey: ["paymentsLedger", page, search],
    queryFn: async () => {
      try {
        const response = await getFinancialReport<FinancialReportResponse>(page, search);
        return response.data;
      } catch (err) {
        throw new Error(
          getApiErrorMessage(err, "Failed to load payments ledger. Please try again.")
        );
      }
    },
    placeholderData: (previousData) => previousData,
  });
}
