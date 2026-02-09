import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 app-surface shadow-lg rounded-md border border-app">
        <p className="text-sm font-semibold text-app-primary">{`Pincode: ${label}`}</p>
        <p className="text-sm app-accent">{`Customers: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function AreaBarChart({ data }) {
  const { t } = useTranslation();
  // data from API: [{ pincode: '600001', count: 1 }]
  // We rename 'pincode' to 'name' and 'customers' to 'value'
  const chartData = data.map(item => ({
    name: item.pincode,
    customers: item.count,
  }));

  return (
    <div className="shadow-input w-full rounded-2xl app-surface p-4 min-h-[320px]">
      <h3 className="text-lg font-semibold text-app-primary mb-4">
        {t('dashboard.topCustomerAreas')}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical">
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            stroke="var(--color-text-secondary)" 
            width={80} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Legend formatter={(value) => <span className="text-app-secondary">{value}</span>} />
          <Bar dataKey="customers" fill="var(--color-chart-1)" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}