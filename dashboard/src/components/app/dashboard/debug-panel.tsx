'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SensorReading } from '@/types'

interface DebugPanelProps {
  history: SensorReading[]
}

export function DebugPanel({ history }: DebugPanelProps) {
  const [open, setOpen] = useState(false)

  const recent = useMemo(() => {
    return history.slice(-20).reverse().map((r, i, arr) => {
      const prev = arr[i + 1] ?? null
      const gap = prev
        ? Math.round(
            (new Date(r.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000
          )
        : null
      return { reading: r, gap }
    })
  }, [history])

  return (
    <section>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-8 rounded-2 border border-border-faint bg-canvas-surface px-16 py-8 text-left text-sm font-medium text-text-secondary hover:bg-canvas-hover transition-colors"
      >
        {open ? (
          <ChevronDown strokeWidth={1.75} size={16} className="shrink-0" />
        ) : (
          <ChevronRight strokeWidth={1.75} size={16} className="shrink-0" />
        )}
        <span>Debug — Raw Payload Log</span>
        <span className="text-label-medium text-text-tertiary">
          ({history.length} readings in memory, showing last {recent.length})
        </span>
      </button>

      {open && (
        <div className="mt-8 overflow-x-auto rounded-2 border border-border-faint bg-canvas-surface">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-faint">
                <th className="px-12 py-8 text-left font-medium text-text-secondary">#</th>
                <th className="px-12 py-8 text-left font-medium text-text-secondary">Timestamp</th>
                <th className="px-12 py-8 text-left font-medium text-text-secondary">Device</th>
                <th className="px-12 py-8 text-right font-medium text-text-secondary">Moisture</th>
                <th className="px-12 py-8 text-right font-medium text-text-secondary">pH</th>
                <th className="px-12 py-8 text-right font-medium text-text-secondary">TDS1</th>
                <th className="px-12 py-8 text-right font-medium text-text-secondary">TDS2</th>
                <th className="px-12 py-8 text-right font-medium text-text-secondary">RSSI</th>
                <th className="px-12 py-8 text-right font-medium text-text-secondary">Gap</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(({ reading, gap }, i) => (
                <tr key={reading.timestamp} className="border-b border-border-faint/50 hover:bg-canvas-hover">
                  <td className="px-12 py-6 text-text-tertiary">{i + 1}</td>
                  <td className="px-12 py-6 tabular-nums text-text-primary whitespace-nowrap">
                    {new Date(reading.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
                    })}
                  </td>
                  <td className="px-12 py-6 text-text-primary font-mono">{reading.deviceId}</td>
                  <td className="px-12 py-6 text-right tabular-nums text-text-primary">{reading.soilMoisture}%</td>
                  <td className="px-12 py-6 text-right tabular-nums text-text-primary">{reading.ph}</td>
                  <td className="px-12 py-6 text-right tabular-nums text-text-primary">{reading.tds1}</td>
                  <td className="px-12 py-6 text-right tabular-nums text-text-primary">{reading.tds2}</td>
                  <td className="px-12 py-6 text-right tabular-nums text-text-primary">{reading.rssi} dBm</td>
                  <td className={cn(
                    'px-12 py-6 text-right tabular-nums',
                    gap !== null && gap > 15 ? 'text-status-warning' : 'text-text-tertiary'
                  )}>
                    {gap !== null ? `${gap}s` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
