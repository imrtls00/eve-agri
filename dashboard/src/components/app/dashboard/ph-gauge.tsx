'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { FlaskConical } from 'lucide-react'
import { PanelCard } from '@/components/shared/cards'
import { StatusBadge } from '@/components/shared/badges'
import type { StatusLevel } from '@/lib/metrics'

interface PhGaugeProps {
  value: number | null
  idealMin: number
  idealMax: number
  delta: number | null
  cropLabel: string | null
  className?: string
}

const MIN = 0
const MAX = 14
const WIDTH = 280
const HEIGHT = 48
const BAR_Y = 16
const BAR_H = 12

function xFromPh(ph: number): number {
  return ((ph - MIN) / (MAX - MIN)) * WIDTH
}

export function PhGauge({ value, idealMin, idealMax, delta, cropLabel, className }: PhGaugeProps) {
  const status: StatusLevel = value !== null
    ? (value >= idealMin && value <= idealMax ? 'healthy' : 'warning')
    : 'healthy'

  const deltaText = useMemo(() => {
    if (delta === null || delta === 0) return null
    return `${delta > 0 ? '+' : ''}${delta.toFixed(1)} in the last hour`
  }, [delta])

  const idealStart = xFromPh(idealMin)
  const idealEnd = xFromPh(idealMax)

  return (
    <PanelCard className={className}>
      <div className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-2 bg-text-secondary/10">
            <FlaskConical strokeWidth={1.75} size={20} className="text-text-secondary" />
          </div>
          <p className="text-label-medium text-text-secondary">Soil pH</p>
        </div>
        <StatusBadge variant={status} />
      </div>

      {/* Value + delta */}
      <div className="flex items-baseline gap-4 mb-8">
        <span className="text-[40px] font-bold leading-none tracking-[-0.02em] text-text-primary tabular-nums">
          {value !== null ? value.toFixed(1) : '--'}
        </span>
        <span className="text-body-medium text-text-tertiary">pH</span>
        {deltaText && (
          <span className={cn(
            'text-label-medium ml-8',
            delta! > 0 ? 'text-status-danger' : 'text-status-success'
          )}>
            {deltaText}
          </span>
        )}
      </div>

      {/* SVG gauge */}
      <svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="overflow-visible">
        {/* Background track */}
        <rect x={0} y={BAR_Y} width={WIDTH} height={BAR_H} rx={2} style={{ fill: 'var(--color-border-faint)' }} />

        {/* Acidic zone (red tint) */}
        <rect x={0} y={BAR_Y} width={idealStart} height={BAR_H} rx={2} style={{ fill: 'var(--color-zone-warning)' }} />

        {/* Alkaline zone (red tint) */}
        <rect x={idealEnd} y={BAR_Y} width={WIDTH - idealEnd} height={BAR_H} rx={2} style={{ fill: 'var(--color-zone-warning)' }} />

        {/* Ideal range (green tint) */}
        <rect x={idealStart} y={BAR_Y} width={idealEnd - idealStart} height={BAR_H} rx={2} style={{ fill: 'var(--color-zone-healthy)' }} />

        {/* Tick marks at key pH values */}
        {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((ph) => (
          <g key={ph}>
            <line
              x1={xFromPh(ph)} y1={BAR_Y + BAR_H + 2}
              x2={xFromPh(ph)} y2={BAR_Y + BAR_H + 6}
              style={{ stroke: 'var(--color-border-divider)' }}
              strokeWidth={1}
            />
            <text
              x={xFromPh(ph)} y={BAR_Y + BAR_H + 16}
              textAnchor="middle"
              className="text-[8px] fill-text-tertiary"
            >
              {ph}
            </text>
          </g>
        ))}

        {/* Value needle */}
        {value !== null && (
          <g>
            <line
              x1={xFromPh(value)} y1={BAR_Y - 4}
              x2={xFromPh(value)} y2={BAR_Y + BAR_H + 4}
              style={{ stroke: 'var(--color-cherry-100)' }}
              strokeWidth={2.5}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
            {/* Triangle pointer */}
            <polygon
              points={`${xFromPh(value) - 4},${BAR_Y - 4} ${xFromPh(value) + 4},${BAR_Y - 4} ${xFromPh(value)},${BAR_Y - 10}`}
              style={{ fill: 'var(--color-cherry-100)' }}
              className="transition-all duration-500 ease-out"
            />
          </g>
        )}
      </svg>

      {/* Crop ideal range */}
      <p className="text-label-medium text-text-tertiary mt-8">
        {cropLabel
          ? `Ideal for ${cropLabel}: ${idealMin}–${idealMax} pH`
          : `Default ideal range: ${idealMin}–${idealMax} pH`
        }
      </p>
    </PanelCard>
  )
}
