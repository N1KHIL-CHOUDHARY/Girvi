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
      <div className="mb-4 h-4 w-36 rounded bg-slate-100" />
      <div className="flex flex-1 items-end gap-3 px-2 pb-2">
        {[72, 48, 88, 56, 64].map((height) => (
          <div
            key={height}
            className="flex-1 rounded-t-lg bg-slate-100"
            style={{ height }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AreaPieChart({
  data,
  isLoading = false,
}: {
  data: DashboardAreaDatum[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <AreaPieChartSkeleton />;
  }

  const hasData = data.length > 0;
  const chartData = data.map((item) => ({
    pincode: item.pincode,
    customers: item.count,
  }));

  return (
    <div className="flex h-full min-h-[280px] flex-col">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">
        Top Customer Areas
      </h3>
      {!hasData ? (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
          No open ticket ledger entries found
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%" minHeight={220}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="pincode"
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ fill: "#F8FAFC" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #F1F5F9",
                fontSize: 13,
              }}
              formatter={(value) => [
                `${Number(value ?? 0).toLocaleString("en-IN")} customers`,
                "Pincode",
              ]}
            />
            <Bar
              dataKey="customers"
              fill="#1E3A66"
              radius={[6, 6, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
