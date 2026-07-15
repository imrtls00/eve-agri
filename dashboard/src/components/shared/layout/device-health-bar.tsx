'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { SensorReading } from '@/types'

interface DeviceHealthBarProps {
  reading: SensorReading | null
  lastUpdated: Date | null
}

function timeAgo(date: Date, now: number): string {
  const sec = Math.floor((now - date.getTime()) / 1000)
  if (sec < 10) return 'just now'
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  return `${Math.floor(min / 60)}h ago`
}

function rssiLabel(rssi: number): { label: string; color: string } {
  if (rssi > -70) return { label: 'Excellent', color: 'text-status-success' }
  if (rssi > -85) return { label: 'Good', color: 'text-status-success' }
  if (rssi > -100) return { label: 'Weak', color: 'text-status-warning' }
  return { label: 'Poor', color: 'text-status-danger' }
}

export function DeviceHealthBar({ reading, lastUpdated }: DeviceHealthBarProps) {
  const [now, setNow] = useState(Date.now)

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(timer)
  }, [])

  function connectionStatus(lu: Date | null) {
    if (!lu) return { label: 'Offline', color: 'text-status-danger', dot: 'bg-status-danger' }
    const sec = Math.floor((now - lu.getTime()) / 1000)
    if (sec > 120) return { label: 'Offline', color: 'text-status-danger', dot: 'bg-status-danger' }
    if (sec > 30) return { label: 'Stale', color: 'text-status-warning', dot: 'bg-status-warning' }
    return { label: 'Live', color: 'text-status-success', dot: 'bg-status-success' }
  }

  const cs = connectionStatus(lastUpdated)

  const signal = reading ? rssiLabel(reading.rssi) : { label: '--', color: 'text-text-tertiary' }

  return (
    <div className="sticky top-[72px] z-20 flex h-10 items-center gap-24 border-b border-border-faint bg-canvas-base/90 backdrop-blur-sm px-16 sm:px-24 md:px-32 text-xs">
      {/* Connection status */}
      <div className="flex items-center gap-6">
        <span className={cn('relative flex h-2 w-2', cs.dot === 'bg-status-success' && 'animate-pulse')}>
          <span className={cn('absolute inline-flex h-full w-full rounded-full', cs.dot === 'bg-status-success' && 'animate-ping opacity-40', cs.dot)} />
          <span className={cn('relative inline-flex h-2 w-2 rounded-full', cs.dot)} />
        </span>
        <span className={cn('font-semibold', cs.color)}>
          {cs.label}
        </span>
      </div>

      {/* LoRa signal */}
      <div className="flex items-center gap-4">
        <span className="text-text-tertiary">LoRa:</span>
        <span className={cn('font-medium', signal.color)}>{signal.label}</span>
        {reading && (
          <span className="text-text-tertiary ml-1" suppressHydrationWarning>{reading.rssi} dBm</span>
        )}
      </div>

      {/* Battery */}
      <div className="flex items-center gap-4">
        <span className="text-text-tertiary">Battery:</span>
        {reading?.battery !== null && reading?.battery !== undefined ? (
          <span className="font-medium text-text-primary">{reading.battery}%</span>
        ) : (
          <span className="text-text-tertiary italic">Not wired</span>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Last updated */}
      {lastUpdated && (
        <span className="text-text-tertiary tabular-nums" title={lastUpdated.toLocaleString()}>
          {timeAgo(lastUpdated, now)}
        </span>
      )}
    </div>
  )
}
