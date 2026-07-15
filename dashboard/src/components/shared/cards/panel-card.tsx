import { cn } from '@/lib/utils'

interface PanelCardProps {
  children: React.ReactNode
  className?: string
}

export function PanelCard({ children, className }: PanelCardProps) {
  return (
    <div
      className={cn(
        'rounded-2 border border-border-faint bg-canvas-surface p-24',
        className
      )}
    >
      {children}
    </div>
  )
}
