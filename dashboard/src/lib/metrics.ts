import type { MetricConfig } from '@/types'

export const METRICS: MetricConfig[] = [
  {
    key: 'soilMoisture',
    label: 'Soil Moisture',
    unit: '%',
    icon: 'Droplets',
    color: '#2E7D32',
    displayMax: 100,
  },
  {
    key: 'ph',
    label: 'Soil pH',
    unit: '',
    icon: 'FlaskConical',
    color: '#666666',
    displayMax: 14,
    decimals: 1,
  },
  {
    key: 'tds1',
    label: 'TDS Sensor 1',
    unit: 'ppm',
    icon: 'Beaker',
    color: '#9A9A9A',
    displayMax: 1000,
  },
  {
    key: 'tds2',
    label: 'TDS Sensor 2',
    unit: 'ppm',
    icon: 'Beaker',
    color: '#D9822B',
    displayMax: 1000,
  },
]

export function tdsAverage(reading: { tds1: number; tds2: number }): number {
  return (reading.tds1 + reading.tds2) / 2
}

export function tdsSpread(reading: { tds1: number; tds2: number }): number {
  return Math.abs(reading.tds1 - reading.tds2)
}

export const CHART_CONFIG = METRICS.map((m) => ({
  title: m.label,
  dataKey: m.key,
  unit: m.unit,
  color: m.color,
}))

export type StatusLevel = 'healthy' | 'warning' | 'critical'

export interface CheckResult {
  label: string
  value: number
  min: number
  max: number
  inRange: boolean
  severity: StatusLevel
}
