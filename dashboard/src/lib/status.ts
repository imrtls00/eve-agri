import type { Thresholds, SensorReading } from '@/types'
import type { CheckResult, StatusLevel } from './metrics'

export function evaluateReading(
  label: string,
  value: number,
  min: number,
  max: number
): CheckResult {
  const inRange = value >= min && value <= max
  const range = max - min || 1
  const far = value < min - range * 0.5 || value > max + range * 0.5

  let severity: StatusLevel
  if (far) {
    severity = 'critical'
  } else if (!inRange) {
    severity = 'warning'
  } else {
    severity = 'healthy'
  }

  return { label, value, min, max, inRange, severity }
}

export function evaluateAll(
  reading: SensorReading,
  thresholds: Thresholds
): CheckResult[] {
  return [
    evaluateReading('Soil Moisture', reading.soilMoisture, thresholds.moist.min, thresholds.moist.max),
    evaluateReading('Soil pH', reading.ph, thresholds.ph.min, thresholds.ph.max),
    evaluateReading('TDS Sensor 1', reading.tds1, thresholds.tds.min, thresholds.tds.max),
    evaluateReading('TDS Sensor 2', reading.tds2, thresholds.tds.min, thresholds.tds.max),
  ]
}

export function getOverallStatus(checks: CheckResult[]): {
  level: StatusLevel
  description: string
} {
  const critical = checks.filter((c) => c.severity === 'critical')
  const warning = checks.filter((c) => c.severity === 'warning')

  if (critical.length > 0) {
    const names = critical.map((c) => c.label).join(', ')
    return {
      level: 'critical',
      description: `${names} ${critical.length === 1 ? 'is' : 'are'} significantly outside the recommended range.`,
    }
  }

  if (warning.length > 0) {
    const names = warning.map((c) => c.label).join(', ')
    return {
      level: 'warning',
      description: `${names} ${warning.length === 1 ? 'is' : 'are'} outside the ideal range.`,
    }
  }

  return {
    level: 'healthy',
    description: 'All parameters are within the recommended range.',
  }
}

export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}
