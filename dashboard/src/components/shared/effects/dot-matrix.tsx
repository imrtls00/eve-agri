import { cn } from '@/lib/utils'

interface DotMatrixProps {
  className?: string
}

export function DotMatrix({ className }: DotMatrixProps) {
  return (
    <div
      className={cn('pointer-events-none fixed inset-0 z-0 opacity-[0.05]', className)}
      style={{
        backgroundImage: `radial-gradient(circle, var(--color-text-tertiary) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
      aria-hidden="true"
    />
  )
}
