'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Droplets } from 'lucide-react'
import { PanelCard } from '@/components/shared/cards'
import { StatusBadge } from '@/components/shared/badges'
import { LineChart } from '@/components/ui/charts'
import type { StatusLevel } from '@/lib/metrics'

interface MoistureGaugeProps {
  value: number | null
  idealMin: number
  idealMax: number
  delta: number | null
  cropLabel: string | null
  history: { time: string; value: number }[]
  className?: string
}

const SIZE = 120
const CX = SIZE / 2
const CY = SIZE / 2
const RADIUS = 48
const START_ANGLE = -210
const END_ANGLE = 30
const ARC_RANGE = END_ANGLE - START_ANGLE

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polarToCartesian(cx, cy, r, start)
  const e = polarToCartesian(cx, cy, r, end)
  const large = end - start > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

function valueToAngle(value: number): number {
  return START_ANGLE + (value / 100) * ARC_RANGE
}

export function MoistureGauge({ value, idealMin, idealMax, delta, cropLabel, history, className }: MoistureGaugeProps) {
  const status: StatusLevel = value !== null
    ? (value >= idealMin && value <= idealMax ? 'healthy' : value < idealMin ? 'warning' : 'critical')
    : 'healthy'

  const deltaText = useMemo(() => {
    if (delta === null || delta === 0) return null
    return `${delta > 0 ? '+' : ''}${delta.toFixed(0)}% in the last hour`
  }, [delta])

  return (
    <PanelCard className={className}>
      <div className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-2 bg-status-success/10">
            <Droplets strokeWidth={1.75} size={20} className="text-status-success" />
          </div>
          <p className="text-label-medium text-text-secondary">Soil Moisture</p>
        </div>
        <StatusBadge variant={status} />
      </div>

      <div className="flex items-center gap-24">
        {/* Radial gauge */}
        <div className="relative shrink-0">
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {/* Background arc */}
            <path
              d={describeArc(CX, CY, RADIUS, START_ANGLE, END_ANGLE)}
              fill="none"
              style={{ stroke: 'var(--color-border-faint)' }}
              strokeWidth={10}
              strokeLinecap="round"
            />

            {/* Ideal range arc */}
            {(() => {
              const aStart = valueToAngle(idealMin)
              const aEnd = valueToAngle(idealMax)
              return (
                <path
                  d={describeArc(CX, CY, RADIUS, aStart, aEnd)}
                  fill="none"
                  style={{ stroke: 'var(--color-zone-healthy-arc)' }}
                  strokeWidth={10}
                  strokeLinecap="round"
                />
              )
            })()}

            {/* Value arc */}
            {value !== null && (
              <path
                d={describeArc(CX, CY, RADIUS, START_ANGLE, valueToAngle(value))}
                fill="none"
                style={{
                  stroke:
                    value < idealMin ? 'var(--color-status-danger)' :
                    value > idealMax ? 'var(--color-status-danger)' :
                    'var(--color-status-success)'
                }}
                strokeWidth={10}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            )}

            {/* Center value */}
            <text
              x={CX} y={CY - 4}
              textAnchor="middle"
              className="fill-text-primary text-[22px] font-bold tabular-nums"
            >
              {value !== null ? value.toFixed(0) : '--'}
            </text>
            <text
              x={CX} y={CY + 14}
              textAnchor="middle"
              className="fill-text-tertiary text-[10px]"
            >
              %
            </text>
          </svg>
        </div>

        {/* Right side: value details */}
        <div className="flex-1 min-w-0 space-y-8">
          <div className="flex items-baseline gap-4">
            <span className="text-[32px] font-bold leading-none tracking-[-0.02em] text-text-primary tabular-nums">
              {value !== null ? value.toFixed(0) : '--'}
            </span>
            <span className="text-body-medium text-text-tertiary">%</span>
          </div>

          {deltaText && (
            <p className={cn(
              'text-label-medium',
              delta! > 0 ? 'text-status-success' : 'text-status-danger'
            )}>
              {deltaText}
            </p>
          )}

          <p className="text-label-medium text-text-tertiary">
            {cropLabel
              ? `Ideal: ${idealMin}%–${idealMax}%`
              : `Default range: ${idealMin}%–${idealMax}%`
            }
          </p>

          {/* Sparkline */}
          {history.length > 1 && (
            <div className="h-12 -ml-4 -mr-4">
              <LineChart data={history} color="var(--color-status-success)" height={36} />
            </div>
          )}
        </div>
      </div>
    </PanelCard>
  )
}
