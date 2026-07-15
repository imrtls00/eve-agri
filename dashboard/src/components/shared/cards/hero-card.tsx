import { cn } from '@/lib/utils'
import { PanelCard } from './panel-card'

interface HeroCardProps {
  title: string
  value: string
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' }
  children?: React.ReactNode
  className?: string
}

export function HeroCard({ title, value, trend, children, className }: HeroCardProps) {
  return (
    <PanelCard className={cn('space-y-16', className)}>
      <p className="text-label-medium text-text-secondary">{title}</p>
      <div className="flex items-baseline gap-12">
        <h1 className="text-[40px] font-bold leading-none tracking-[-0.02em] text-text-primary tabular-nums">
          {value}
        </h1>
        {trend && (
          <span
            className={cn(
              'text-body-medium font-medium',
              trend.direction === 'up' && 'text-status-success',
              trend.direction === 'down' && 'text-status-danger',
              trend.direction === 'neutral' && 'text-text-tertiary'
            )}
          >
            {trend.direction === 'up' && '+'}{trend.value}
          </span>
        )}
      </div>
      {children}
    </PanelCard>
  )
}
