'use client'

import { useState, useEffect, useMemo } from 'react'

export const dynamic = 'force-dynamic'
import { Sidebar } from '@/components/shared/layout/sidebar'
import type { ViewType } from '@/components/shared/layout/sidebar'
import { TopNav } from '@/components/shared/layout/top-nav'
import { DeviceHealthBar } from '@/components/shared/layout/device-health-bar'
import { BottomBar } from '@/components/shared/layout/bottom-bar'
import { GridOverlay } from '@/components/shared/effects'
import { ChartsSection } from '@/components/app/dashboard/charts-section'
import { RealtimeView } from '@/components/app/dashboard/realtime-view'
import { PhGauge } from '@/components/app/dashboard/ph-gauge'
import { MoistureGauge } from '@/components/app/dashboard/moisture-gauge'
import { TdsGauge } from '@/components/app/dashboard/tds-gauge'
import { DebugPanel } from '@/components/app/dashboard/debug-panel'
import { StatusPanel, MetricPanel, SummaryPanel, RecommendationPanel, AlertPanel, ActionPanel } from '@/components/shared/panels'
import { Info, Download, Settings } from 'lucide-react'
import { generateMockReading, generateHistory, findReadingNear } from '@/lib/mock-data'
import { getThresholds, CROP_PRESETS } from '@/lib/crop-presets'
import { evaluateAll } from '@/lib/status'
import { tdsAverage } from '@/lib/metrics'
import type { SensorReading, CropKey } from '@/types'

export default function DashboardPage() {
  const [demoMode, setDemoMode] = useState(true)
  const [crop, setCrop] = useState<CropKey | null>(null)
  const [view, setView] = useState<ViewType>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [history, setHistory] = useState<SensorReading[]>(() => generateHistory(24))
  const [reading, setReading] = useState<SensorReading | null>(() => {
    const h = generateHistory(24)
    return h[h.length - 1] ?? null
  })
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const thresholds = getThresholds(crop)

  const deltas = useMemo(() => {
    if (history.length < 2) return { ph: null, moisture: null, tds: null }
    const hourAgo = findReadingNear(history, 60)
    if (!hourAgo || !reading) return { ph: null, moisture: null, tds: null }
    return {
      ph: Number((reading.ph - hourAgo.ph).toFixed(2)),
      moisture: Math.round(reading.soilMoisture - hourAgo.soilMoisture),
      tds: Math.round(
        (reading.tds1 + reading.tds2) / 2 - (hourAgo.tds1 + hourAgo.tds2) / 2
      ),
    }
  }, [history, reading])

  const checks = useMemo(() => {
    if (!reading) return []
    return evaluateAll(reading, thresholds)
  }, [reading, thresholds])

  const alertItems = useMemo(() => {
    const items: { message: string; time: string; severity: 'warning' | 'critical' }[] = []
    for (const c of checks) {
      if (!c.inRange) {
        items.push({
          message: `${c.label} at ${c.value?.toFixed(1)} (target ${c.min}–${c.max})`,
          time: reading ? new Date(reading.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
          severity: c.severity === 'critical' ? 'critical' : 'warning',
        })
      }
    }
    return items
  }, [checks, reading])

  const overallDescription = useMemo(() => {
    const outOfRange = checks.filter((c) => !c.inRange)
    if (outOfRange.length === 0) return 'All systems normal'
    if (outOfRange.length <= 2) return `${outOfRange.length} parameter${outOfRange.length > 1 ? 's' : ''} outside ideal range`
    return 'Multiple parameters need attention'
  }, [checks])

  const overallStatus = useMemo(() => {
    const hasCritical = checks.some((c) => c.severity === 'critical')
    if (hasCritical) return 'critical' as const
    const hasWarning = checks.some((c) => !c.inRange)
    if (hasWarning) return 'warning' as const
    return 'healthy' as const
  }, [checks])

  useEffect(() => {
    if (!demoMode) return

    const interval = setInterval(() => {
      const next = generateMockReading()
      setReading(next)
      setLastUpdated(new Date())
      setHistory((prev) => [...prev.slice(-200), next])
    }, 1500)

    return () => clearInterval(interval)
  }, [demoMode])

  const chartDataMoisture = history.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    value: d.soilMoisture,
  }))

  const chartDataTds = history.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    value: tdsAverage(d),
  }))

  const cropLabel = crop ? CROP_PRESETS[crop]?.label ?? null : null

  return (
    <div className="flex min-h-screen">
      <GridOverlay />
      <Sidebar
        activeView={view}
        onViewChange={setView}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col ml-0 md:ml-72">
        <TopNav
          crop={crop}
          onCropChange={setCrop}
          demoMode={demoMode}
          onDemoToggle={setDemoMode}
          lastUpdated={lastUpdated}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {demoMode && (
          <div className="flex items-center gap-8 bg-status-warning/10 border-b border-status-warning/20 px-16 sm:px-24 md:px-32 py-6 text-xs text-status-warning">
            <Info strokeWidth={1.75} size={14} />
            <span className="font-semibold">Demo Mode</span>
            <span className="text-status-warning/70">— sensor data is simulated</span>
          </div>
        )}

        <DeviceHealthBar reading={reading} lastUpdated={lastUpdated} />

        <main className="flex-1">
          {view === 'dashboard' ? (
            <div className="border border-border-faint rounded-2 overflow-hidden">
              {/* ── Row 1: 5-panel Sensor Strip ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-border-faint gap-px border-b border-border-faint">
                <PhGauge
                  className="border-0 rounded-none p-16"
                  value={reading?.ph ?? null}
                  idealMin={thresholds.ph.min}
                  idealMax={thresholds.ph.max}
                  delta={deltas.ph}
                  cropLabel={cropLabel}
                />
                <MoistureGauge
                  className="border-0 rounded-none p-16"
                  value={reading?.soilMoisture ?? null}
                  idealMin={thresholds.moist.min}
                  idealMax={thresholds.moist.max}
                  delta={deltas.moisture}
                  cropLabel={cropLabel}
                  history={chartDataMoisture}
                />
                <TdsGauge
                  className="border-0 rounded-none p-16"
                  reading={reading}
                  idealMin={thresholds.tds.min}
                  idealMax={thresholds.tds.max}
                  delta={deltas.tds}
                  cropLabel={cropLabel}
                  history={chartDataTds}
                />
                <StatusPanel
                  className="border-0"
                  deviceStatus={reading ? 'Online' : 'Offline'}
                  sensorStatus="All Operational"
                  uploadStatus="Real-time"
                  memoryUsage="34% used"
                  signalStrength={reading ? `${reading.rssi} dBm` : '—'}
                />
              </div>

              {/* ── Row 2: Historical + Summary ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 bg-border-faint gap-px border-b border-border-faint">
                <div className="col-span-8 p-24 bg-canvas-surface">
                  <ChartsSection history={history} searchQuery={searchQuery} />
                </div>
                <div className="col-span-4 flex flex-col bg-border-faint gap-px">
                  <SummaryPanel status={overallStatus} description={overallDescription} />
                  <RecommendationPanel
                    action={alertItems.length === 0 ? 'No action needed' : 'Review sensor readings'}
                    reason={alertItems.length === 0 ? 'All parameters within ideal range' : `${alertItems.length} parameter${alertItems.length > 1 ? 's' : ''} outside range`}
                  />
                  <AlertPanel alerts={alertItems} />
                </div>
              </div>

              {/* ── Row 3: Action Panels ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 bg-border-faint gap-px">
                <ActionPanel
                  title="Export Data"
                  description="Download sensor logs as CSV for offline analysis"
                  icon={<Download strokeWidth={1.75} size={20} />}
                />
                <ActionPanel
                  title="Configure Sensors"
                  description="Adjust sampling intervals, thresholds, and device settings"
                  icon={<Settings strokeWidth={1.75} size={20} />}
                />
              </div>
            </div>
          ) : (
            <div className="p-16 sm:p-24 md:p-32">
              <RealtimeView
                reading={reading}
                thresholds={thresholds}
                history={history}
                demoMode={demoMode}
                lastUpdated={lastUpdated}
              />
            </div>
          )}
        </main>

        <BottomBar deviceId={reading?.deviceId} />

        <DebugPanel history={history} />
      </div>
    </div>
  )
}
