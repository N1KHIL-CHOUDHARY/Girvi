"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DashboardGenderDatum } from "@/types/dashboard";

const COLORS = ["#1E3A66", "#3B82F6", "#F59E0B", "#EC4899"];

export function GenderPieChartSkeleton() {
  return (
    <div className="flex h-full min-h-[280px] flex-col animate-pulse">
      <div className="mb-4 h-4 w-40 rounded bg-slate-100" />
      <div className="flex flex-1 items-center justify-center">
        <div className="h-44 w-44 rounded-full bg-slate-100" />
      </div>
      <div className="mt-4 flex justify-center gap-4">
        <div className="h-3 w-16 rounded bg-slate-100" />
        <div className="h-3 w-16 rounded bg-slate-100" />
        <div className="h-3 w-16 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export default function GenderPieChart({
  data,
  isLoading = false,
}: {
  data: DashboardGenderDatum[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <GenderPieChartSkeleton />;
  }

  const hasData = data.length > 0;
  const chartData = data.map((item, index) => ({
    gender: item.gender ?? "Not set",
    count: item.count,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="flex h-full min-h-[280px] flex-col">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">
        Customers by Gender
      </h3>
      {!hasData ? (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
          No customer data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%" minHeight={220}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="gender"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.gender} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #F1F5F9",
                fontSize: 13,
              }}
              formatter={(value) => [
                `${Number(value ?? 0).toLocaleString("en-IN")} customers`,
                "Count",
              ]}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: "#64748B" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
