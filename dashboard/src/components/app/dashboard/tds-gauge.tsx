'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Beaker } from 'lucide-react'
import { PanelCard } from '@/components/shared/cards'
import { StatusBadge } from '@/components/shared/badges'
import { LineChart } from '@/components/ui/charts'
import { tdsAverage, tdsSpread } from '@/lib/metrics'
import type { SensorReading } from '@/types'

interface TdsGaugeProps {
  reading: SensorReading | null
  idealMin: number
  idealMax: number
  delta: number | null
  cropLabel: string | null
  history: { time: string; value: number }[]
  className?: string
}

const DISPLAY_MAX = 1000
const BAR_W = 280
const BAR_H = 12
const BAR_Y = 0

function xFromValue(v: number): number {
  return (v / DISPLAY_MAX) * BAR_W
}

export function TdsGauge({ reading, idealMin, idealMax, delta, cropLabel, history, className }: TdsGaugeProps) {
  const avg = reading ? tdsAverage(reading) : null
  const spread = reading ? tdsSpread(reading) : null
  const displayValue = avg !== null ? Math.round(avg) : null

  const status: 'healthy' | 'warning' | 'critical' = avg !== null
    ? (avg >= idealMin && avg <= idealMax ? 'healthy' : avg < idealMin ? 'warning' : 'critical')
    : 'healthy'

  const deltaText = useMemo(() => {
    if (delta === null || delta === 0) return null
    return `${delta > 0 ? '+' : ''}${delta.toFixed(0)} ppm in the last hour`
  }, [delta])

  const idealStart = xFromValue(idealMin)
  const idealEnd = xFromValue(idealMax)

  return (
    <PanelCard className={className}>
      <div className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-2 bg-text-tertiary/10">
            <Beaker strokeWidth={1.75} size={20} className="text-text-tertiary" />
          </div>
          <p className="text-label-medium text-text-secondary">Total Dissolved Solids</p>
        </div>
        <StatusBadge variant={status} />
      </div>

      {/* Large value */}
      <div className="flex items-baseline gap-4 mb-8">
        <span className="text-[40px] font-bold leading-none tracking-[-0.02em] text-text-primary tabular-nums">
          {displayValue !== null ? displayValue : '--'}
        </span>
        <span className="text-body-medium text-text-tertiary">ppm</span>
        {deltaText && (
          <span className={cn(
            'text-label-medium ml-8',
            delta! > 0 ? 'text-status-danger' : 'text-status-success'
          )}>
            {deltaText}
          </span>
        )}
      </div>

      {/* Probe spread */}
      {spread !== null && spread > 20 && (
        <p className="text-label-medium text-status-warning mb-8">
          Probe mismatch: ±{spread} ppm
        </p>
      )}

      {/* SVG level bar */}
      <svg width="100%" height={BAR_H + 24} viewBox={`0 0 ${BAR_W} ${BAR_H + 24}`} className="overflow-visible mb-8">
        {/* Background */}
        <rect x={0} y={BAR_Y} width={BAR_W} height={BAR_H} rx={2} style={{ fill: 'var(--color-border-faint)' }} />

        {/* Below-ideal tint */}
        <rect x={0} y={BAR_Y} width={idealStart} height={BAR_H} rx={2} style={{ fill: 'var(--color-zone-warning-subtle)' }} />

        {/* Above-ideal tint */}
        <rect x={idealEnd} y={BAR_Y} width={BAR_W - idealEnd} height={BAR_H} rx={2} style={{ fill: 'var(--color-zone-warning-subtle)' }} />

        {/* Ideal range */}
        <rect x={idealStart} y={BAR_Y} width={idealEnd - idealStart} height={BAR_H} rx={2} style={{ fill: 'var(--color-zone-healthy-subtle)' }} />

        {/* Filled bar */}
        {displayValue !== null && (
          <rect
            x={0} y={BAR_Y}
            width={Math.min(xFromValue(displayValue), BAR_W)}
            height={BAR_H}
            rx={2}
            style={{
              fill:
                status === 'healthy' ? 'var(--color-status-success)' :
                status === 'warning' ? 'var(--color-status-warning)' :
                'var(--color-status-danger)'
            }}
            className="transition-all duration-500 ease-out"
          />
        )}

        {/* Scale markers */}
        {[0, 250, 500, 750, 1000].map((v) => (
          <g key={v}>
            <line
              x1={xFromValue(v)} y1={BAR_H + 2}
              x2={xFromValue(v)} y2={BAR_H + 6}
              style={{ stroke: 'var(--color-border-divider)' }}
              strokeWidth={1}
            />
            <text
              x={xFromValue(v)} y={BAR_H + 16}
              textAnchor="middle"
              className="text-[8px] fill-text-tertiary"
            >
              {v}
            </text>
          </g>
        ))}
      </svg>

      {/* Crop reference */}
      <p className="text-label-medium text-text-tertiary">
        {cropLabel
          ? `Ideal for ${cropLabel}: ${idealMin}–${idealMax} ppm`
          : `Default ideal range: ${idealMin}–${idealMax} ppm`
        }
      </p>

      {/* Sparkline */}
      {history.length > 1 && (
        <div className="h-12 mt-8 -ml-4 -mr-4">
          <LineChart data={history} color="var(--color-text-tertiary)" height={36} />
        </div>
      )}
    </PanelCard>
  )
}
