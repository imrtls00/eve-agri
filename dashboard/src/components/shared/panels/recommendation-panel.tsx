import { cn } from '@/lib/utils'

interface RecommendationPanelProps {
  action: string
  reason: string
  className?: string
}

export function RecommendationPanel({ action, reason, className }: RecommendationPanelProps) {
  return (
    <div className={cn('bg-canvas-surface p-16', className)}>
      <p className="text-label-medium text-text-secondary mb-8">Recommendation</p>
      <p className="text-title-h2 text-cherry-100 mb-4">{action}</p>
      <p className="text-body-medium text-text-tertiary">{reason}</p>
    </div>
  )
}
