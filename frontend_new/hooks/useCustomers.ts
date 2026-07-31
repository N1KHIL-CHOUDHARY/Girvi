"use client";

import { useQuery } from "@tanstack/react-query";
import { getAccounts } from "@/services/api";
import { getApiErrorMessage } from "@/lib/api";
import { customerKeys } from "@/lib/queryKeys";
import type { CustomerListItem } from "@/types/customer";
import type { ApiResponse } from "@/types/api";

export function useCustomers(page = 1, search = "") {
  return useQuery<ApiResponse<CustomerListItem[]>, Error>({
    queryKey: customerKeys.list(page, search),
    queryFn: async () => {
      try {
        const response = await getAccounts<CustomerListItem[]>(page, search);
        return response;
      } catch (err) {
        throw new Error(
          getApiErrorMessage(err, "Failed to load customer profiles. Please try again.")
        );
      }
    },
    placeholderData: (previousData) => previousData,
  });
}

