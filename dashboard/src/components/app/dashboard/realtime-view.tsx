'use client'

import { Droplets, FlaskConical, Beaker } from 'lucide-react'
import type { LucideIcon as LucideIconType } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PanelCard } from '@/components/shared/cards'
import { StatusBadge } from '@/components/shared/badges'
import { LineChart } from '@/components/ui/charts'
import { METRICS } from '@/lib/metrics'
import { evaluateReading } from '@/lib/status'
import type { SensorReading, Thresholds } from '@/types'

interface RealtimeViewProps {
  reading: SensorReading | null
  thresholds: Thresholds
  history: SensorReading[]
  demoMode: boolean
  lastUpdated: Date | null
}

const ICON_MAP: Record<string, LucideIconType> = {
  Droplets,
  FlaskConical,
  Beaker,
}

const METRIC_STYLE: Record<string, { bg: string; text: string }> = {
  soilMoisture: { bg: 'bg-status-success/10', text: 'text-status-success' },
  ph: { bg: 'bg-text-secondary/10', text: 'text-text-secondary' },
  tds1: { bg: 'bg-status-warning/10', text: 'text-status-warning' },
  tds2: { bg: 'bg-text-tertiary/10', text: 'text-text-tertiary' },
}

export function RealtimeView({ reading, thresholds, history, demoMode, lastUpdated }: RealtimeViewProps) {
  const getThreshold = (key: string) => {
    if (key === 'ph') return { min: thresholds.ph.min, max: thresholds.ph.max }
    if (key === 'soilMoisture') return { min: thresholds.moist.min, max: thresholds.moist.max }
    return { min: thresholds.tds.min, max: thresholds.tds.max }
  }

  return (
    <div className="space-y-24">
      {/* Live indicator + header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-12">
          <h1 className="text-title-h1 text-text-primary">Real-time Data</h1>
          <div className="flex items-center gap-6 rounded-2 bg-status-success/10 px-10 py-4">
            <span className="relative flex h-6 w-6">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-2 bg-status-success opacity-40" />
              <span className="relative inline-flex h-6 w-6 rounded-2 bg-status-success" />
            </span>
            <span className="text-xs font-semibold text-status-success uppercase tracking-wider">
              {demoMode ? 'Demo' : 'Live'}
            </span>
          </div>
        </div>
        {lastUpdated && (
          <span className="text-label-medium text-text-tertiary tabular-nums">
            {lastUpdated.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })}
          </span>
        )}
      </div>

      {/* 2×2 Metric Grid */}
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2">
        {METRICS.map((m) => {
          const { min, max } = getThreshold(m.key)
          const value = reading ? reading[m.key] : null
          const dataKey = m.key

          const chartData = history.slice(-20).map((d) => ({
            time: new Date(d.timestamp).toLocaleTimeString('en-US', {
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            }),
            value: d[dataKey],
          }))

          const status = value !== null
            ? evaluateReading(m.label, value, min, max).severity
            : 'healthy' as const

          const Icon = ICON_MAP[m.icon] ?? Beaker
          const style = METRIC_STYLE[m.key] ?? { bg: 'bg-canvas-hover', text: 'text-text-secondary' }

          return (
            <PanelCard key={m.key}>
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-8">
                  <div
                    className={cn('flex h-10 w-10 items-center justify-center rounded-2', style.bg)}
                  >
                    <Icon strokeWidth={1.75} size={22} className={style.text} />
                  </div>
                  <p className="text-label-medium text-text-secondary">{m.label}</p>
                </div>
                <StatusBadge variant={status} />
              </div>

              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-[48px] font-bold leading-none tracking-[-0.02em] text-text-primary tabular-nums">
                  {value !== null ? value.toFixed(m.decimals ?? 0) : '--'}
                </span>
                <span className="text-body-medium text-text-tertiary">{m.unit}</span>
              </div>

              <p className="text-label-medium text-text-tertiary mb-12">
                Range: {min}{m.unit} – {max}{m.unit}
              </p>

              {chartData.length > 1 && (
                <div className="h-16">
                  <LineChart data={chartData} color={m.color} height={48} />
                </div>
              )}
            </PanelCard>
          )
        })}
      </div>

      {/* Live feed */}
      {reading && (
        <PanelCard>
          <p className="text-label-medium text-text-secondary mb-12 uppercase tracking-wider">
            Latest Reading
          </p>
          <div className="grid grid-cols-2 gap-16 sm:grid-cols-4">
            {METRICS.map((m) => {
              const value = reading ? reading[m.key] : null
              return (
                <div key={m.key}>
                  <p className="text-xs text-text-tertiary mb-4">{m.label}</p>
                  <p className="text-title-h2 text-text-primary tabular-nums">
                    {value !== null ? value.toFixed(m.decimals ?? 0) : '--'}
                    <span className="text-label-medium text-text-tertiary ml-4">{m.unit}</span>
                  </p>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-text-tertiary mt-12">
            Device: {reading.deviceId} &middot; RSSI: {reading.rssi} dBm
            {reading.battery !== null && ` \u00b7 Battery: ${reading.battery}%`}
          </p>
        </PanelCard>
      )}
    </div>
  )
}
