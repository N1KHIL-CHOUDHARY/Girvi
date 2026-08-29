"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardAreaDatum } from "@/types/dashboard";

export function AreaPieChartSkeleton() {
  return (
    <div className="flex h-full min-h-[280px] flex-col animate-pulse">
      <div className="mb-4 h-4 w-36 rounded bg-[#F6F7F8]" />
      <div className="flex flex-1 items-end gap-3 px-2 pb-2">
        {[72, 48, 88, 56, 64].map((height) => (
          <div
            key={height}
            className="flex-1 rounded-t-lg bg-[#F6F7F8]"
            style={{ height }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AreaPieChart({
  data = [],
  isLoading = false,
}: {
  data?: DashboardAreaDatum[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <AreaPieChartSkeleton />;
  }

  // Aggregate by pincode
  const groupedData: Record<string, number> = {};
  (data || []).forEach((item) => {
    const key = item.pincode?.trim() || "Local";
    groupedData[key] = (groupedData[key] || 0) + (Number(item.count) || 0);
  });

  const chartData = Object.entries(groupedData).map(([pincode, customers]) => ({
    pincode,
    customers,
  }));

  const hasData = chartData.length > 0 && chartData.some((d) => d.customers > 0);

  return (
    <div className="flex h-full min-h-[280px] flex-col">
      <h3 className="mb-4 text-sm font-semibold text-[#14181F]">
        Borrower Distribution by Area (Pincode)
      </h3>
      {!hasData ? (
        <div className="flex flex-1 items-center justify-center text-xs text-[#8A94A3]">
          No area distribution records found
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%" minHeight={220}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#E7E9EC" />
            <XAxis
              dataKey="pincode"
              tick={{ fontSize: 11, fill: "#8A94A3" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8A94A3" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ fill: "#F6F7F8" }}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E7E9EC",
                fontSize: 12,
                backgroundColor: "#FFFFFF",
              }}
              formatter={(value) => [
                `${Number(value ?? 0).toLocaleString("en-IN")} borrowers`,
                "Area",
              ]}
            />
            <Bar
              dataKey="customers"
              fill="#314259"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

