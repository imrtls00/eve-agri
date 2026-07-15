'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface BarChartProps {
  data: { label: string; value: number }[]
  color: string
  height?: number
}

export function BarChart({ data, color, height = 120 }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-divider)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
          width={32}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-canvas-surface)',
            border: '1px solid var(--color-border-faint)',
            borderRadius: 8,
            fontSize: 13,
            boxShadow: 'var(--shadow-card)',
          }}
        />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={32} />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
