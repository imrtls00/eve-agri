import { NextResponse } from 'next/server'

interface ReadingPayload {
  deviceId: string
  timestamp?: string
  soilMoisture?: number
  ph?: number
  tds1?: number
  tds2?: number
  rssi?: number
  battery?: number | null
}

// In-memory store (replace with database later)
let latestReading: ReadingPayload | null = null
const history: ReadingPayload[] = []

export async function POST(request: Request) {
  try {
    const body: ReadingPayload = await request.json()

    if (!body.deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' },
        { status: 400 }
      )
    }

    const reading: ReadingPayload = {
      deviceId: body.deviceId,
      timestamp: body.timestamp ?? new Date().toISOString(),
      soilMoisture: body.soilMoisture,
      ph: body.ph,
      tds1: body.tds1,
      tds2: body.tds2,
      rssi: body.rssi,
      battery: body.battery ?? null,
    }

    latestReading = reading
    history.push(reading)
    if (history.length > 1000) history.shift()

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    latest: latestReading,
    history: history.slice(-200),
  })
}
