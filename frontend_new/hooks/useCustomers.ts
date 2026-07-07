"use client";

import { useQuery } from "@tanstack/react-query";
import { getAccounts } from "@/services/api";
import { getApiErrorMessage } from "@/lib/api";
import type { CustomerListResponse } from "@/types/customer";

export function useCustomers(page = 1, search = "") {
  return useQuery<CustomerListResponse, Error>({
    queryKey: ["customers", page, search],
    queryFn: async () => {
      try {
        const response = await getAccounts<CustomerListResponse>(page, search);
        return response.data;
      } catch (err) {
        throw new Error(
          getApiErrorMessage(err, "Failed to load customer profiles. Please try again.")
        );
      }
    },
    placeholderData: (previousData) => previousData,
  });
}
