import { cn } from '@/lib/utils'
import { Wifi, Upload, HardDrive, Signal, Cpu } from 'lucide-react'

interface StatusItemProps {
  icon: React.ReactNode
  label: string
  value: string
  ok: boolean
}

function StatusItem({ icon, label, value, ok }: StatusItemProps) {
  return (
    <div className="flex items-center gap-8">
      <span className={cn('shrink-0', ok ? 'text-status-success' : 'text-status-danger')}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-label-medium text-text-secondary">{label}</p>
        <p className={cn('text-sm font-medium', ok ? 'text-text-primary' : 'text-status-danger')}>
          {value}
        </p>
      </div>
    </div>
  )
}

interface StatusPanelProps {
  deviceStatus: string
  sensorStatus: string
  uploadStatus: string
  memoryUsage: string
  signalStrength: string
  className?: string
}

export function StatusPanel({ deviceStatus, sensorStatus, uploadStatus, memoryUsage, signalStrength, className }: StatusPanelProps) {
  return (
    <div className={cn('bg-canvas-surface p-16 space-y-12', className)}>
      <p className="text-label-medium text-text-secondary mb-4">Device Status</p>
      <StatusItem icon={<Wifi strokeWidth={1.75} size={16} />} label="Device" value={deviceStatus} ok={deviceStatus === 'Online'} />
      <StatusItem icon={<Cpu strokeWidth={1.75} size={16} />} label="Sensors" value={sensorStatus} ok={sensorStatus === 'All Operational'} />
      <StatusItem icon={<Upload strokeWidth={1.75} size={16} />} label="Upload" value={uploadStatus} ok={uploadStatus === 'Real-time'} />
      <StatusItem icon={<HardDrive strokeWidth={1.75} size={16} />} label="Memory" value={memoryUsage} ok={true} />
      <StatusItem icon={<Signal strokeWidth={1.75} size={16} />} label="Signal" value={signalStrength} ok={signalStrength.includes('dBm')} />
    </div>
  )
}
