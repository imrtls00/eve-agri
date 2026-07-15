import { cn } from '@/lib/utils'

interface ShimmerProps {
  className?: string
}

export function Shimmer({ className }: ShimmerProps) {
  return (
    <div
      className={cn('animate-shimmer rounded-6', className)}
      aria-hidden="true"
    />
  )
}
