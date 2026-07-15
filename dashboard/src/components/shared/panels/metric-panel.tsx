import { cn } from '@/lib/utils'
import type { StatusLevel } from '@/lib/metrics'
import { StatusBadge } from '@/components/shared/badges'

interface MetricPanelProps {
  label: string
  value: number | null
  unit: string
  status: StatusLevel
  range: string
  previous: string | null
  trend?: { time: string; value: number }[]
  children?: React.ReactNode
  className?: string
}

export function MetricPanel({ label, value, unit, status, range, previous, children, className }: MetricPanelProps) {
  return (
    <div className={cn('bg-canvas-surface p-16', className)}>
      <p className="text-label-medium text-text-secondary mb-8">{label}</p>

      <div className="flex items-baseline gap-4 mb-4">
        <span className="text-[28px] font-bold leading-none tracking-[-0.02em] text-text-primary tabular-nums">
          {value !== null ? value.toFixed(1) : '--'}
        </span>
        <span className="text-body-medium text-text-tertiary">{unit}</span>
      </div>

      <div className="mb-8">
        <StatusBadge variant={status} />
      </div>

      <p className="text-body-medium text-text-tertiary mb-2">Normal: {range}</p>

      {previous && (
        <p className="text-body-medium text-text-tertiary">Previous: {previous}</p>
      )}

      {children}
    </div>
  )
}
