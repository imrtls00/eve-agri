import { cn } from '@/lib/utils'

export function PrimaryButton({ className, children, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-2 bg-cherry-100 px-5 text-sm font-medium text-white transition-colors hover:bg-cherry-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cherry-100/50 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
