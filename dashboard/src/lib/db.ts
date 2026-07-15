import Database from 'better-sqlite3'
import path from 'path'

let db: Database.Database | null = null

function getDb(): Database.Database {
  if (!db) {
    db = new Database(path.join(process.cwd(), 'data', 'readings.db'))
    db.pragma('journal_mode = WAL')
    db.pragma('synchronous = NORMAL')
    db.exec(`
      CREATE TABLE IF NOT EXISTS readings (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id  TEXT    NOT NULL,
        timestamp  TEXT    NOT NULL,
        ph         REAL,
        soil_moisture REAL,
        tds1       REAL,
        tds2       REAL,
        rssi       REAL,
        battery    REAL
      );
      CREATE INDEX IF NOT EXISTS idx_device_ts
        ON readings(device_id, timestamp DESC);
    `)
  }
  return db
}

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

export function insertReading(payload: ReadingPayload): void {
  const d = getDb()
  const stmt = d.prepare(`
    INSERT INTO readings (device_id, timestamp, ph, soil_moisture, tds1, tds2, rssi, battery)
    VALUES (@device_id, @timestamp, @ph, @soil_moisture, @tds1, @tds2, @rssi, @battery)
  `)
  stmt.run({
    device_id: payload.deviceId,
    timestamp: payload.timestamp ?? new Date().toISOString(),
    ph: payload.ph ?? null,
    soil_moisture: payload.soilMoisture ?? null,
    tds1: payload.tds1 ?? null,
    tds2: payload.tds2 ?? null,
    rssi: payload.rssi ?? null,
    battery: payload.battery ?? null,
  })
}

export function getLatest(deviceId: string): ReadingRow | null {
  return (getDb()
    .prepare('SELECT * FROM readings WHERE device_id = ? ORDER BY timestamp DESC LIMIT 1')
    .get(deviceId) as ReadingRow | null) ?? null
}

export function getHistory(deviceId: string, limit = 200): ReadingRow[] {
  return getDb()
    .prepare('SELECT * FROM readings WHERE device_id = ? ORDER BY timestamp DESC LIMIT ?')
    .all(deviceId, limit) as ReadingRow[]
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

export function cleanupOldReadings(maxAgeDays = 30): void {
  getDb()
    .prepare("DELETE FROM readings WHERE timestamp < datetime('now', ?)")
    .run(`-${maxAgeDays} days`)
}
