import { NextRequest, NextResponse } from 'next/server'
import { insertReading, getLatest, getHistory, rowToPayload, cleanupOldReadings } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' },
        { status: 400 }
      )
    }

    await insertReading({
      deviceId: body.deviceId,
      timestamp: body.timestamp ?? new Date().toISOString(),
      soilMoisture: body.soilMoisture,
      ph: body.ph,
      tds1: body.tds1,
      tds2: body.tds2,
      rssi: body.rssi,
      battery: body.battery ?? null,
    })

    await cleanupOldReadings(30)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }
}

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get('deviceId') ?? 'gateway-01'
  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit')) || 200, 1000)

  const latest = await getLatest(deviceId)
  const history = await getHistory(deviceId, limit)

  return NextResponse.json({
    latest: latest ? rowToPayload(latest) : null,
    history: history.map(rowToPayload),
  })
}
