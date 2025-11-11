import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white dark:bg-neutral-800 shadow-lg rounded-md border border-gray-200 dark:border-neutral-700">
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{`Pincode: ${label}`}</p>
        <p className="text-sm text-indigo-500">{`Customers: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function AreaBarChart({ data }) {
  const { isDarkMode } = useTheme();

  // data from API: [{ pincode: '600001', count: 1 }]
  // We rename 'pincode' to 'name' and 'customers' to 'value'
  const chartData = data.map(item => ({
    name: item.pincode,
    customers: item.count,
  }));

  return (
    <div className="shadow-input w-full rounded-2xl bg-white p-4 dark:bg-black">
      <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
        Top Customer Areas (by Pincode)
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical">
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            stroke={isDarkMode ? "#a3a3a3" : "#4b5563"} 
            width={80} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Legend formatter={(value) => <span className={isDarkMode ? 'text-white/80' : 'text-gray-700'}>{value}</span>} />
          <Bar dataKey="customers" fill="#6366f1" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}