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

const COLORS = ["#314259", "#2563EB", "#059669", "#D97706", "#8A94A3"];

export function GenderPieChartSkeleton() {
  return (
    <div className="flex h-full min-h-[280px] flex-col animate-pulse">
      <div className="mb-4 h-4 w-40 rounded bg-[#F6F7F8]" />
      <div className="flex flex-1 items-center justify-center">
        <div className="h-44 w-44 rounded-full bg-[#F6F7F8]" />
      </div>
      <div className="mt-4 flex justify-center gap-4">
        <div className="h-3 w-16 rounded bg-[#F6F7F8]" />
        <div className="h-3 w-16 rounded bg-[#F6F7F8]" />
        <div className="h-3 w-16 rounded bg-[#F6F7F8]" />
      </div>
    </div>
  );
}

export default function GenderPieChart({
  data = [],
  isLoading = false,
}: {
  data?: DashboardGenderDatum[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <GenderPieChartSkeleton />;
  }

  // Aggregate and sum by gender category
  const groupedData: Record<string, number> = {};
  (data || []).forEach((item) => {
    const key = item.gender?.trim() || "Not specified";
    groupedData[key] = (groupedData[key] || 0) + (Number(item.count) || 0);
  });

  const chartData = Object.entries(groupedData).map(([gender, count], index) => ({
    gender,
    count,
    fill: COLORS[index % COLORS.length],
  }));

  const hasData = chartData.length > 0 && chartData.some((d) => d.count > 0);

  return (
    <div className="flex h-full min-h-[280px] flex-col">
      <h3 className="mb-4 text-sm font-semibold text-[#14181F]">
        Borrower Demographics by Gender
      </h3>
      {!hasData ? (
        <div className="flex flex-1 items-center justify-center text-xs text-[#8A94A3]">
          No customer data recorded yet
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
              {chartData.map((entry, index) => (
                <Cell key={`gender-slice-${entry.gender}-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E7E9EC",
                fontSize: 12,
                backgroundColor: "#FFFFFF",
              }}
              formatter={(value) => [
                `${Number(value ?? 0).toLocaleString("en-IN")} borrowers`,
                "Count",
              ]}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: "#55606D" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

