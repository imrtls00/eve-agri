import { type LucideIcon, type LucideProps } from 'lucide-react'

interface LucideIconProps extends LucideProps {
  icon: LucideIcon
}

export function LucideIcon({ icon: Icon, className, ...props }: LucideIconProps) {
  return (
    <Icon
      className={className}
      strokeWidth={1.75}
      size={20}
      {...props}
    />
  )
}
