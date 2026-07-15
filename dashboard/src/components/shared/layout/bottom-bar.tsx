import { cn } from '@/lib/utils'

interface BottomBarProps {
  deviceId?: string
  firmware?: string
  uptime?: string
  className?: string
}

export function BottomBar({ deviceId = 'gateway-01', firmware = 'v2.4.1', uptime = '14d 6h', className }: BottomBarProps) {
  return (
    <div className={cn('flex items-center justify-between border-t border-border-faint bg-canvas-surface px-16 py-8 text-xs text-text-tertiary', className)}>
      <span>&copy; AgriSense &mdash; {new Date().getFullYear()}</span>
      <div className="flex items-center gap-16">
        <span className="tabular-nums">Device: {deviceId}</span>
        <span>Firmware: {firmware}</span>
        <span className="tabular-nums">Uptime: {uptime}</span>
      </div>
    </div>
  )
}
