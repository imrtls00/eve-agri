export interface SensorReading {
  deviceId: string
  timestamp: string
  soilMoisture: number
  ph: number
  tds1: number
  tds2: number
  rssi: number
  battery: number | null
}

export interface MetricConfig {
  key: 'soilMoisture' | 'ph' | 'tds1' | 'tds2'
  label: string
  unit: string
  icon: string
  color: string
  displayMax: number
  decimals?: number
}

export interface CropPreset {
  label: string
  ph: { min: number; max: number }
  moist: { min: number; max: number }
  tds: { min: number; max: number }
}

export type CropKey = 'tomato' | 'rice' | 'wheat' | 'maize' | 'potato'

export interface Thresholds {
  ph: { min: number; max: number }
  moist: { min: number; max: number }
  tds: { min: number; max: number }
}
