"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export interface GenderDatum {
  gender: string;
  count: number;
}

const COLORS = ["#1E3A66", "#3B82F6", "#F59E0B"];

export default function GenderPieChart({ data }: { data: GenderDatum[] }) {
  const hasData = data && data.length > 0;

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Customers by Gender</h3>
      {!hasData ? (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
          No customer data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%" minHeight={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="gender"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={entry.gender} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #F1F5F9",
                fontSize: 13,
              }}
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