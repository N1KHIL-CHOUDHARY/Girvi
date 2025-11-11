import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Custom Tooltip for Theming
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white dark:bg-neutral-800 shadow-lg rounded-md border border-gray-200 dark:border-neutral-700">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{`${payload[0].name} : ${payload[0].value} customers`}</p>
      </div>
    );
  }
  return null;
};

// This component now accepts a 'data' prop
export default function GenderPieChart({ data }) {
  const { isDarkMode } = useTheme();

  // data from API: [{ gender: 'Male', count: 1 }]
  // We rename 'gender' to 'name' and 'count' to 'value' for the chart
  const chartData = data.map(item => ({
    name: item.gender || 'Not Set',
    value: item.count,
  }));

  return (
    <div className="shadow-input w-full rounded-2xl bg-white p-4 dark:bg-black">
      <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
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
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={(value) => <span className={isDarkMode ? 'text-white/80' : 'text-gray-700'}>{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}