import { cn } from '@/lib/utils'

interface GridOverlayProps {
  className?: string
}

export function GridOverlay({ className }: GridOverlayProps) {
  return (
    <div
      className={cn('pointer-events-none fixed inset-0 z-0 opacity-[0.02]', className)}
      style={{
        backgroundImage: `linear-gradient(var(--color-border-divider) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-divider) 1px, transparent 1px)`,
        backgroundSize: '64px 64px',
      }}
      aria-hidden="true"
    />
  )
}
