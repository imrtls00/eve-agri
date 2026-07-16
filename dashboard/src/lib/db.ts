import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface ReadingRow {
  id: number
  device_id: string
  timestamp: string
  ph: number | null
  soil_moisture: number | null
  tds1: number | null
  tds2: number | null
  rssi: number | null
  battery: number | null
}

export interface ReadingPayload {
  deviceId: string
  timestamp?: string
  ph?: number
  soilMoisture?: number
  tds1?: number
  tds2?: number
  rssi?: number
  battery?: number | null
}

export async function insertReading(payload: ReadingPayload): Promise<void> {
  const { error } = await supabase
    .from('readings')
    .insert({
      device_id: payload.deviceId,
      timestamp: payload.timestamp ?? new Date().toISOString(),
      ph: payload.ph ?? null,
      soil_moisture: payload.soilMoisture ?? null,
      tds1: payload.tds1 ?? null,
      tds2: payload.tds2 ?? null,
      rssi: payload.rssi ?? null,
      battery: payload.battery ?? null,
    })

  if (error) throw error
}

export async function getLatest(deviceId: string): Promise<ReadingRow | null> {
  const { data } = await supabase
    .from('readings')
    .select('*')
    .eq('device_id', deviceId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data as unknown as ReadingRow | null
}

export async function getHistory(deviceId: string, limit = 200): Promise<ReadingRow[]> {
  const { data } = await supabase
    .from('readings')
    .select('*')
    .eq('device_id', deviceId)
    .order('timestamp', { ascending: false })
    .limit(limit)

  return (data ?? []) as unknown as ReadingRow[]
}

export function rowToPayload(row: ReadingRow): ReadingPayload {
  return {
    deviceId: row.device_id,
    timestamp: row.timestamp,
    ph: row.ph ?? undefined,
    soilMoisture: row.soil_moisture ?? undefined,
    tds1: row.tds1 ?? undefined,
    tds2: row.tds2 ?? undefined,
    rssi: row.rssi ?? undefined,
    battery: row.battery ?? null,
  }
}
