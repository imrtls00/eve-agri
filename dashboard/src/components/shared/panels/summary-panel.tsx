import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/badges'
import type { StatusLevel } from '@/lib/metrics'

interface SummaryPanelProps {
  status: StatusLevel
  description: string
  className?: string
}

export function SummaryPanel({ status, description, className }: SummaryPanelProps) {
  return (
    <div className={cn('bg-canvas-surface p-16', className)}>
      <p className="text-label-medium text-text-secondary mb-8">Field Health</p>
      <div className="flex items-center gap-8 mb-8">
        <span className="text-[32px] font-bold leading-none tracking-[-0.02em] text-text-primary tabular-nums">
          {status === 'healthy' ? '98' : status === 'warning' ? '74' : '42'}%
        </span>
        <StatusBadge variant={status} />
      </div>
      <p className="text-body-medium text-text-tertiary">{description}</p>
    </div>
  )
}
