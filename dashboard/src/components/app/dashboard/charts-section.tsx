'use client'

import { cn } from '@/lib/utils'
import { LineChart } from '@/components/ui/charts'
import { PanelCard } from '@/components/shared/cards'
import { CHART_CONFIG } from '@/lib/metrics'
import type { SensorReading } from '@/types'

const CHART_TEXT_COLORS: Record<string, string> = {
  soilMoisture: 'text-status-success',
  ph: 'text-text-secondary',
  tds1: 'text-status-warning',
  tds2: 'text-text-tertiary',
}

interface ChartsSectionProps {
  history: SensorReading[]
  searchQuery?: string
}

export function ChartsSection({ history, searchQuery = '' }: ChartsSectionProps) {
  const filtered = CHART_CONFIG.filter((cfg) =>
    cfg.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-text-tertiary py-8">
        No charts match &ldquo;{searchQuery}&rdquo;
      </p>
    )
  }

  return (
    <section>
      <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
        {filtered.map((cfg) => {
          const chartData = history.map((d) => ({
            time: new Date(d.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
            value: d[cfg.dataKey],
          }))

          const latest = history.length > 0 ? history[history.length - 1][cfg.dataKey] : null

          return (
            <PanelCard key={cfg.dataKey}>
              <div className="flex items-center justify-between mb-16">
                <p className="text-label-medium text-text-secondary">
                  {cfg.title} — 24h Trend
                </p>
                <span
                  className={cn('text-title-h2 text-text-primary tabular-nums', CHART_TEXT_COLORS[cfg.dataKey])}
                >
                  {latest !== null ? `${latest}${cfg.unit}` : '--'}
                </span>
              </div>
              <LineChart data={chartData} color={cfg.color} height={160} />
            </PanelCard>
          )
        })}
      </div>
    </section>
  )
}
