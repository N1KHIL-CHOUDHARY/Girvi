"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchDashboardStats, getApiErrorMessage } from "@/lib/api";
import type { DashboardStatsResponse } from "@/types/dashboard";

export interface UseDashboardDataResult {
  data: DashboardStatsResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataResult {
  const [data, setData] = useState<DashboardStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dashboardData = await fetchDashboardStats();
      setData(dashboardData);
    } catch (err) {
      setData(null);
      setError(
        getApiErrorMessage(err, "Failed to load dashboard data. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
