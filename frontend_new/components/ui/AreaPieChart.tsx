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

export interface AreaDatum {
  area: string;
  total_loan: number;
}

export default function AreaBarChart({ data }: { data: AreaDatum[] }) {
  const hasData = data && data.length > 0;

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Loans by Area</h3>
      {!hasData ? (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
          No area data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%" minHeight={220}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="area"
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
              formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Total Loan"]}
            />
            <Bar dataKey="total_loan" fill="#1E3A66" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}