import { cn } from '@/lib/utils'

export function GhostButton({ className, children, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-2 px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-canvas-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-faint disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
