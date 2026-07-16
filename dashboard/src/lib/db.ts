import { createClient } from "@libsql/client"

const url = process.env.TURSO_DATABASE_URL

const client = url
  ? createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
  : createClient({ url: "file:./data/readings.db" })

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

const INIT_SQL = `CREATE TABLE IF NOT EXISTS readings (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id     TEXT    NOT NULL,
  timestamp     TEXT    NOT NULL,
  ph            REAL,
  soil_moisture REAL,
  tds1          REAL,
  tds2          REAL,
  rssi          REAL,
  battery       REAL
);
CREATE INDEX IF NOT EXISTS idx_device_ts ON readings(device_id, timestamp DESC);`

let initialized = false

async function ensureDb() {
  if (initialized) return
  await client.batch(INIT_SQL.split(";").filter(Boolean))
  initialized = true
}

export async function insertReading(payload: ReadingPayload): Promise<void> {
  await ensureDb()
  await client.execute({
    sql: `INSERT INTO readings (device_id, timestamp, ph, soil_moisture, tds1, tds2, rssi, battery)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      payload.deviceId,
      payload.timestamp ?? new Date().toISOString(),
      payload.ph ?? null,
      payload.soilMoisture ?? null,
      payload.tds1 ?? null,
      payload.tds2 ?? null,
      payload.rssi ?? null,
      payload.battery ?? null,
    ],
  })
}

export async function getLatest(deviceId: string): Promise<ReadingRow | null> {
  await ensureDb()
  const { rows } = await client.execute({
    sql: "SELECT * FROM readings WHERE device_id = ? ORDER BY timestamp DESC LIMIT 1",
    args: [deviceId],
  })
  return (rows[0] as unknown as ReadingRow) ?? null
}

export async function getHistory(deviceId: string, limit = 200): Promise<ReadingRow[]> {
  await ensureDb()
  const { rows } = await client.execute({
    sql: "SELECT * FROM readings WHERE device_id = ? ORDER BY timestamp DESC LIMIT ?",
    args: [deviceId, limit],
  })
  return rows as unknown as ReadingRow[]
}

export async function cleanupOldReadings(maxAgeDays = 30): Promise<void> {
  await ensureDb()
  await client.execute({
    sql: "DELETE FROM readings WHERE timestamp < datetime('now', ?)",
    args: [`-${maxAgeDays} days`],
  })
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
