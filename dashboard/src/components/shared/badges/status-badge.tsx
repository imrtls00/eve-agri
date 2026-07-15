import { cn } from '@/lib/utils'
import type { StatusLevel } from '@/lib/metrics'

export type BadgeVariant = StatusLevel | 'deploying'

interface StatusBadgeProps {
  variant: BadgeVariant
  children?: React.ReactNode
  className?: string
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  healthy: 'bg-status-success/10 text-status-success',
  warning: 'bg-status-warning/10 text-status-warning',
  critical: 'bg-status-danger/10 text-status-danger',
  deploying: 'bg-cherry-tint text-cherry-100',
}

const DEFAULT_LABELS: Record<BadgeVariant, string> = {
  healthy: 'Healthy',
  warning: 'Warning',
  critical: 'Critical',
  deploying: 'Deploying',
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center gap-1 rounded-2 px-2 text-xs font-medium whitespace-nowrap',
        VARIANT_STYLES[variant],
        className
      )}
    >
      {children ?? DEFAULT_LABELS[variant]}
    </span>
  )
}
