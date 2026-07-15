'use client'

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface AreaChartProps {
  data: { time: string; value: number }[]
  color: string
  height?: number
}

export function AreaChart({ data, color, height = 120 }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-divider)" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
          interval="preserveStartEnd"
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
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`${color}10`}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: 'var(--color-canvas-surface)', strokeWidth: 2 }}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}
