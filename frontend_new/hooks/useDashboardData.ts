"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "@/services/api";
import { getApiErrorMessage } from "@/lib/api";
import type { DashboardStatsResponse } from "@/types/dashboard";
import type { ApiResponse } from "@/types/api";

export interface UseDashboardDataResult {
  data: DashboardStatsResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataResult {
  const query = useQuery<ApiResponse<DashboardStatsResponse>, Error>({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      try {
        const response = await fetchDashboardStats<DashboardStatsResponse>();
        return response;
      } catch (err) {
        throw new Error(
          getApiErrorMessage(err, "Failed to load dashboard data. Please try again.")
        );
      }
    },
  });

  return {
    data: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: async () => {
      await query.refetch();
    },
  };
}
