import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)'
];

// Custom Tooltip for Theming
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 app-surface shadow-lg rounded-md border border-app">
        <p className="text-sm text-app-primary">{`${payload[0].name} : ${payload[0].value} customers`}</p>
      </div>
    );
  }
  return null;
};

// This component now accepts a 'data' prop
export default function GenderPieChart({ data }) {
  // data from API: [{ gender: 'Male', count: 1 }]
  // We rename 'gender' to 'name' and 'count' to 'value' for the chart
  const chartData = data.map(item => ({
    name: item.gender || 'Not Set',
    value: item.count,
  }));

  return (
    <div className="shadow-input w-full rounded-2xl app-surface p-4 min-h-[320px]">
      <h3 className="text-lg font-semibold text-app-primary mb-4">
        Customer Gender
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="var(--color-chart-1)"
            dataKey="value"
            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={(value) => <span className="text-app-secondary">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}