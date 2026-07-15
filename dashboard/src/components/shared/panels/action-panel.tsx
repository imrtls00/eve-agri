import { cn } from '@/lib/utils'

interface ActionPanelProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick?: () => void
  className?: string
}

export function ActionPanel({ title, description, icon, onClick, className }: ActionPanelProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-16 bg-canvas-surface p-24 text-left transition-colors hover:bg-canvas-hover',
        className
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2 border border-border-faint text-text-secondary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-title-h2 text-text-primary">{title}</p>
        <p className="text-body-medium text-text-tertiary">{description}</p>
      </div>
    </button>
  )
}
