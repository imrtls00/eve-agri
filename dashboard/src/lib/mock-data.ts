import type { SensorReading } from '@/types'

function rand(min: number, max: number, decimals = 1): number {
  const val = Math.random() * (max - min) + min
  return parseFloat(val.toFixed(decimals))
}

let t = 0

const BASE_MOIST = 52
const BASE_PH = 6.7
const BASE_TDS1 = 440
const BASE_TDS2 = 380

export function generateMockReading(): SensorReading {
  t += 10
  return {
    deviceId: 'gateway-01',
    timestamp: new Date(Date.now() - t * 1000).toISOString(),
    soilMoisture: Math.max(0, Math.min(100, BASE_MOIST + rand(-8, 8, 0))),
    ph: Math.max(0, Math.min(14, BASE_PH + rand(-0.3, 0.3))),
    tds1: Math.max(0, BASE_TDS1 + rand(-40, 40, 0)),
    tds2: Math.max(0, BASE_TDS2 + rand(-35, 35, 0)),
    rssi: rand(-75, -50, 0),
    battery: null,
  }
}

export function generateHistory(hours = 24): SensorReading[] {
  t = 0
  const points = hours * 6
  return Array.from({ length: points }, () => generateMockReading())
}

function readingAt(minutesAgo: number, dayOffset: number): SensorReading {
  const hour = (24 - minutesAgo / 60 + dayOffset * 24) % 24
  const isDaytime = hour >= 6 && hour <= 18

  const moisture = Math.max(0, Math.min(100,
    BASE_MOIST
    + (isDaytime ? -8 : 6)
    + Math.sin(minutesAgo / 240) * 4
    + rand(-3, 3, 0)
  ))

  const ph = Math.max(0, Math.min(14,
    BASE_PH
    + Math.sin(minutesAgo / 720) * 0.15
    + rand(-0.1, 0.1)
  ))

  const tds1 = Math.max(0,
    BASE_TDS1 + dayOffset * 8
    + Math.sin(minutesAgo / 1440) * 20
    + rand(-15, 15, 0)
  )

  const tds2 = Math.max(0,
    BASE_TDS2 + dayOffset * 5
    + Math.sin(minutesAgo / 1440) * 18
    + rand(-12, 12, 0)
  )

  return {
    deviceId: 'gateway-01',
    timestamp: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
    soilMoisture: moisture,
    ph: parseFloat(ph.toFixed(1)),
    tds1: Math.round(tds1),
    tds2: Math.round(tds2),
    rssi: rand(-75, -50, 0),
    battery: null,
  }
}

export function generateMultiDayHistory(days = 3): SensorReading[] {
  const readings: SensorReading[] = []
  const totalMinutes = days * 24 * 60
  for (let m = totalMinutes; m >= 0; m -= 10) {
    const dayOffset = Math.floor((totalMinutes - m) / (24 * 60))
    readings.push(readingAt(m, dayOffset))
  }
  return readings
}

export function findReadingNear(
  history: SensorReading[],
  minutesAgo: number
): SensorReading | null {
  if (history.length === 0) return null
  const target = Date.now() - minutesAgo * 60 * 1000
  let best = history[0]
  let bestDiff = Math.abs(new Date(best.timestamp).getTime() - target)

  for (const r of history) {
    const diff = Math.abs(new Date(r.timestamp).getTime() - target)
    if (diff < bestDiff) {
      bestDiff = diff
      best = r
    }
  }

  return best
}
