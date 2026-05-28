import React from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { IconMapPin } from '@tabler/icons-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-zinc-200/60 dark:border-white/[0.08] bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md p-4 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1.5">
          <IconMapPin className="w-3.5 h-3.5 text-zinc-400" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Pincode {label}
          </p>
        </div>
        <p className="text-lg font-medium tracking-tight text-zinc-900 dark:text-white">
          {payload[0].value} <span className="text-sm font-normal text-zinc-500">Customers</span>
        </p>
      </div>
    )
  }
  return null
}

export default function AreaBarChart({ data }) {
  const { t } = useTranslation()
  
  const chartData = data.map(item => ({
    name: item.pincode,
    customers: item.count,
  }))

  return (
    <div className="flex flex-col h-full w-full">
      <h3 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-white mb-6">
        {t('dashboard.topCustomerAreas')}
      </h3>
      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="#71717a" 
              width={80} 
              tickLine={false} 
              axisLine={false}
              tick={{ fontSize: 12, fontFamily: 'monospace' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(161, 161, 170, 0.05)' }} />
            <Bar 
              dataKey="customers" 
              fill="currentColor"
              className="fill-zinc-800 dark:fill-zinc-200" 
              barSize={24} 
              radius={[0, 6, 6, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}