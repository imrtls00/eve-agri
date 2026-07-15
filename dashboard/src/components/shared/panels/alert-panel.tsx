import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

interface AlertItem {
  message: string
  time: string
  severity: 'warning' | 'critical'
}

interface AlertPanelProps {
  alerts: AlertItem[]
  className?: string
}

export function AlertPanel({ alerts, className }: AlertPanelProps) {
  return (
    <div className={cn('bg-canvas-surface p-16', className)}>
      <p className="text-label-medium text-text-secondary mb-8">Active Alerts</p>
      {alerts.length === 0 ? (
        <p className="text-body-medium text-status-success">No active alerts</p>
      ) : (
        <div className="space-y-6">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-start gap-8">
              <AlertTriangle
                strokeWidth={1.75}
                size={14}
                className={cn('shrink-0 mt-0.5', a.severity === 'critical' ? 'text-status-danger' : 'text-status-warning')}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{a.message}</p>
                <p className="text-xs text-text-tertiary">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
