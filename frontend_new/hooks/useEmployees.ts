"use client";

import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "@/services/api";
import { getApiErrorMessage } from "@/lib/api";
import type { EmployeeListResponse } from "@/types/employee";

export function useEmployees() {
  return useQuery<EmployeeListResponse, Error>({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const response = await getEmployees<EmployeeListResponse>();
        return response.data;
      } catch (err) {
        throw new Error(
          getApiErrorMessage(err, "Failed to load employees. Please try again.")
        );
      }
    },
  });
}
