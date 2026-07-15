import { cn } from '@/lib/utils'
import type { MetricConfig } from '@/types'
import type { StatusLevel } from '@/lib/metrics'
import type { LucideIcon as LucideIconType } from 'lucide-react'
import { Droplets, FlaskConical, Beaker } from 'lucide-react'
import { Skeleton } from '@/components/ui/shadcn/skeleton'

const ICON_MAP: Record<string, LucideIconType> = {
  Droplets,
  FlaskConical,
  Beaker,
}

interface MetricCardProps {
  config: MetricConfig
  value: number | null
  status: StatusLevel
  className?: string
}

const STATUS_COLORS: Record<StatusLevel, string> = {
  healthy: 'text-status-success',
  warning: 'text-status-warning',
  critical: 'text-status-danger',
}

export function MetricCard({ config, value, status, className }: MetricCardProps) {
  const Icon = ICON_MAP[config.icon] ?? Beaker

  if (value === null) {
    return (
      <div className={cn('rounded-2 border border-border-faint bg-canvas-surface p-24 space-y-12', className)}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-full" />
      </div>
    )
  }

  return (
    <div className={cn('rounded-2 border border-border-faint bg-canvas-surface p-24 space-y-12', className)}>
      <div className="flex items-center justify-between">
        <p className="text-label-medium text-text-secondary">
          {config.label}
        </p>
        <Icon className="text-text-tertiary" strokeWidth={1.75} size={20} />
      </div>
      <div className="flex items-baseline gap-4">
        <h2 className="text-title-display text-text-primary tabular-nums">
          {value.toFixed(config.decimals ?? 0)}
        </h2>
        <span className="text-body-medium text-text-tertiary">{config.unit}</span>
      </div>
      <p className={cn('text-label-medium font-medium', STATUS_COLORS[status])}>
        {status === 'healthy' && 'In range'}
        {status === 'warning' && 'Needs attention'}
        {status === 'critical' && 'Critical'}
      </p>
    </div>
  )
}
