import React from 'react'
import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { IconUsers } from '@tabler/icons-react'

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f43f5e']

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-zinc-200/60 dark:border-white/[0.08] bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {payload[0].name}
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

const renderLegendText = (value) => {
  return <span className="text-sm text-zinc-600 dark:text-zinc-400 ml-1">{value}</span>
}

export default function GenderPieChart({ data }) {
  const { t } = useTranslation()
  
  const chartData = data.map((item, index) => ({
    name: item.gender || t('common.notSet'),
    value: item.count,
    fill: COLORS[index % COLORS.length]
  }))

  return (
    <div className="flex flex-col h-full w-full">
      <h3 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-white mb-6">
        {t('dashboard.customerGender')}
      </h3>
      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              iconSize={8}
              formatter={renderLegendText} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}