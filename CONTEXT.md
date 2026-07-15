# Smart Agriculture Monitoring System
## Source of Truth (SOT)

> **Repository Structure**
>
> ```
> eve-agri/
> ├── CONTEXT.md          # This file — project specification & source of truth
> ├── dashboard/          # Next.js web application (deployable independently)
> ├── firmware/           # Arduino/C code for ESP32
> │   ├── gateway/        #   ESP32 Gateway (receiver + LCD + upload)
> │   └── sensor-node/    #   Sensor node (LoRa transmitter)
> └── docs/               # Supporting documentation
>     └── DESIGN.md       #   Design system specification
> ```
>
> The `dashboard/` folder is a self-contained Next.js project. To deploy the web app, deploy only this subfolder (e.g., on Vercel).

> **Purpose**
>
> This document is the single source of truth for the Smart Agriculture FYP. It documents the current system, architecture, implementation status, future roadmap, dashboard requirements, and design principles. Any future development should align with this document.

---

# 1. Project Overview

The project is an IoT-based Smart Agriculture Monitoring System that continuously collects environmental and soil data from remote sensor nodes.

Sensor readings are transmitted wirelessly using **LoRa**, received by an **ESP32 Gateway**, displayed locally on a TFT LCD, and uploaded to the internet. A modern web dashboard visualizes the data in real time and provides actionable insights for farmers.

The objective is not only to display sensor values but to help users understand the health of their field.

---

# 2. Current System Architecture

```
Sensor Nodes
(pH, Soil Moisture, TDS)
        │
        │ LoRa
        ▼
ESP32 Gateway
        │
        ├── Display values on TFT LCD
        │
        └── Upload every 10s
                │
                ▼
        Google Apps Script
                │
                ▼
        Google Sheets
```

Current implementation uses Google Sheets as temporary cloud storage.

Future implementation will replace this with a proper backend/database.

---

# 3. Hardware Configuration

Current hardware consists of:

- **1 ESP32 Gateway (Receiver)**
  - Receives LoRa packets
  - Displays data on TFT LCD (ILI9341)
  - Connects to Wi-Fi
  - Dual upload: Google Apps Script (GET) + Dashboard API (POST JSON)

- **1 Sensor Node (LoRa Transmitter)**
  - Collects sensor readings
  - Transmits data to the ESP32 Gateway via LoRa

The current implementation supports a single monitoring node. The software architecture should remain extensible so additional sensor nodes can be added in the future using unique device IDs.

---

## Pin Mapping (ESP32 Gateway)

| Component | Pin | Purpose |
|-----------|-----|---------|
| LoRa SS | GPIO 5 | SPI chip select for LoRa module |
| LoRa RST | GPIO 14 | LoRa reset |
| LoRa DIO0 | GPIO 26 | LoRa interrupt / Rx done |
| TFT CS | GPIO 15 | SPI chip select for ILI9341 |
| TFT DC | GPIO 2 | Data / Command control |
| TFT RST | GPIO 4 | TFT reset |
| Sensor node analog | A0–A3 | Soil moisture, pH, TDS1, TDS2 |

---

# 4. Sensors

Current sensors:

- Soil Moisture
- Soil pH
- TDS Sensor 1
- TDS Sensor 2

Future sensors (optional):

- Temperature
- Humidity
- Rainfall
- Battery Level

Communication:

- LoRa
- 433 MHz

Gateway:

- ESP32

Display:

- ILI9341 TFT LCD

Cloud Upload:

- WiFi
- Google Apps Script
- Google Sheets

Upload Interval:

- Every 10 seconds

---

## LoRa Packet Protocol

The sensor node transmits two alternating packet types. The gateway assembles a complete reading from one of each.

**PH Packet** (even cycles)

```
PH,<pH>,<ignored>,<tds2>
```

Example: `PH,6.8,0,388`

| Field | Type | Description |
|-------|------|-------------|
| pH | float | Soil pH value |
| ignored | int | Reserved (set to 0) |
| tds2 | int | TDS Sensor 2 (ppm) |

**TS Packet** (odd cycles)

```
TS,<tds1>,<moisture>
```

Example: `TS,421,54`

| Field | Type | Description |
|-------|------|-------------|
| tds1 | int | TDS Sensor 1 (ppm) |
| moisture | int | Soil moisture (%) |

The sensor node alternates every 10 seconds. The gateway updates the display when either packet arrives and uploads a complete reading once both have been received.

---

## Upload Mechanism

The ESP32 Gateway performs a dual upload every 10 seconds:

1. **Google Apps Script (GET)** — legacy path, keeps the existing Sheets-based system working
2. **Dashboard API (POST JSON)** — new path, sends the CONTEXT.md §13 payload format

Both paths fire simultaneously. The dashboard should read from the new API; the old GAS sheet can be retired once the database is stable.

---

# 5. Current ESP32 Responsibilities

The ESP32 Gateway currently:

- Receives LoRa packets
- Parses incoming sensor data
- Displays latest readings on TFT LCD
- Connects to WiFi
- Uploads readings to cloud
- Handles communication between sensor node and internet

---

# 6. Existing Dashboard

The current dashboard already contains:

- Live sensor cards
- Connection status
    - WiFi
    - LoRa
- Demo Mode
- Current readings
- Historical charts
- Alert section
- Export history
- Threshold settings

The dashboard currently focuses on displaying raw values.

---

# 7. Current Problems

## Google Sheets

Although functional, Google Sheets introduces several limitations.

Problems include:

- Not designed as a real database
- Website sometimes fails to refresh latest data
- Requires polling/caching workarounds
- Limited scalability
- Difficult to build richer features

---

## Dashboard

Current dashboard:

- Looks AI-generated
- Generic visual design
- Displays numbers without meaning
- Limited user guidance
- Not differentiated from typical AI-generated dashboards

---

# 8. Vision

The project should evolve from

> "Showing sensor values"

to

> "Helping farmers make decisions."

The dashboard should answer three questions:

1. What is happening?
2. Should I worry?
3. What should I do?

---

# 9. Dashboard Philosophy

The dashboard should prioritize clarity over technical complexity.

Every screen should answer:

1. What is happening?
2. Is there a problem?
3. What action should the farmer take?

Raw sensor values should always be accompanied by a short explanation or recommendation whenever possible.

---

# 10. Future Architecture

```
Sensor Nodes
        │
        ▼
LoRa
        │
        ▼
ESP32 Gateway
        │
        ▼
REST API
        │
        ▼
Database
        │
        ▼
Next.js Dashboard
```

Google Sheets should eventually be removed.

---

# 11. Technology Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

---

## Backend

Next.js API Routes

---

## Database

Preferred:

- Supabase PostgreSQL

Alternative:

- SQLite (development)

---

## Deployment

Preferred:

- Vercel

---

# 12. Development Strategy

The dashboard should be developed independently from the hardware.

## Development Mode

Use mock sensor data.

No ESP32 required.

This allows:

- UI development
- Chart development
- Testing
- Responsive layouts
- Authentication
- Animations

---

## Production Mode

Replace mock data with actual ESP32 API.

The frontend should require minimal changes.

---

# 13. API Design

The frontend should communicate only with a single API.

Example:

POST

```
/api/readings
```

Payload

```json
{
  "deviceId": "gateway-01",
  "timestamp": "2026-07-13T18:30:00Z",
  "soilMoisture": 54,
  "ph": 6.8,
  "tds1": 421,
  "tds2": 388,
  "rssi": -64,
  "battery": null
}
```

Even if battery isn't available today, keep the field. It makes the API future-proof.

---

# 14. Recommended Database Schema

## Devices

```
id
name
location
created_at
```

---

## Readings

```
id
device_id
soil
ph
tds1
tds2
battery
rssi
created_at
```

This schema supports:

- Multiple devices
- Historical data
- Charts
- Future expansion

---

# 15. MVP Dashboard

- Live Sensor Cards (gauge + value + status pill per metric)
- Crop Selector (dropdown with presets that adjust ideal ranges)
- Ideal vs Actual Comparison Table
- Farmer Recommendations (translates values to advice per crop)
- Field Health Summary (one-card overview)
- Device Status (Wi-Fi / LoRa / Last Updated / RSSI)
- 24-hour Trend Charts (one per metric)
- Alert Banner (actionable out-of-range warnings)
- Demo Mode (Mock Data toggle)

---

# 16. Sensor Interpretation

The dashboard should translate technical readings into practical advice.

Examples:

Low Soil Moisture
→ Irrigation recommended.

High Soil pH
→ Soil is slightly alkaline. Certain crops may absorb nutrients less efficiently.

High TDS
→ Water quality should be inspected before irrigation.

Healthy Values
→ Field conditions are within the recommended range.

---

## Crop Reference Ranges

The dashboard includes a crop selector that adjusts the ideal thresholds for each metric. The comparison table and recommendations update based on the selected crop.

| Crop | pH Range | Moisture % | TDS (ppm) |
|------|----------|------------|-----------|
| Tomato | 6.0 – 6.8 | 60 – 80 | 350 – 700 |
| Rice | 5.5 – 6.5 | 70 – 90 | 300 – 600 |
| Wheat | 6.0 – 7.5 | 40 – 60 | 300 – 650 |
| Maize (Corn) | 5.8 – 7.0 | 50 – 70 | 300 – 650 |
| Potato | 5.0 – 6.5 | 60 – 80 | 300 – 600 |

When no crop is selected, generic defaults apply:
- pH: 6.0 – 7.5
- Moisture: 30 – 60%
- TDS: 300 – 650 ppm

---

# 17. Field Health Summary

A summary card should always be visible.

Example

```
Field Status

⚠ Warning

Soil moisture is below recommended levels.

Other parameters remain healthy.
```

This gives users an immediate overview.

---

# 18. Alerts

Alerts should be actionable.

Avoid

> TDS outside range

Instead

> High TDS detected.
> Check irrigation water quality.

---

Avoid

> Soil moisture low

Instead

> Soil is dry.
> Irrigation is recommended.

---

# 19. Authentication

Simple login is sufficient.

No complex admin system is required.

Credentials may be stored using environment variables.

---

# 20. Features Not Required for MVP

Do NOT spend time building:

- Admin Dashboard
- Threshold Editor
- User Management
- Advanced Settings
- Analytics Portal
- Complex Role Management

These provide low value during the FYP demonstration.

---

# 21. UI Direction

The dashboard should not resemble a generic AI-generated admin panel.

Instead, it should have its own visual identity built using shadcn/ui.

Goals:

- Modern
- Minimal
- Professional
- Agricultural
- Accessible
- Easy to read outdoors
- Consistent spacing
- Consistent typography
- Clear visual hierarchy

A separate DESIGN.md document should define:

- Color palette
- Typography scale
- Component library
- Grid system
- Icons
- Charts
- Card styles
- Button styles
- Border radius
- Elevation/Shadows

---

# 22. Design Principles

Prioritize

- Readability
- Simplicity
- Consistency

Avoid unnecessary decoration.

Data should remain the primary focus.

---

# 23. Future Enhancements

- Multiple Devices
- GPS Locations
- Weather Integration
- Notifications
- Mobile App
- PDF Reports
- AI Insights

---

# 24. FYP Demonstration Flow

1. Place the sensor in soil or water.
2. Sensor values change.
3. Sensor node transmits data over LoRa.
4. ESP32 Gateway receives the packet.
5. TFT LCD updates immediately.
6. ESP32 uploads the reading to the backend.
7. Dashboard refreshes automatically.
8. Historical chart updates.
9. Dashboard explains what the reading means for the farmer.

This demonstrates the complete end-to-end IoT pipeline, from sensing to actionable insights.

---

# 25. Definition of Success

The project should no longer feel like:

> "A dashboard displaying four numbers."

Instead, it should feel like:

> "A complete smart agriculture monitoring platform that collects, stores, visualizes, and interprets sensor data to help farmers make informed decisions."

---

# 26. Guiding Principles

When making implementation decisions, prioritize:

- High impact
- Low implementation effort
- Clear demonstration value
- Real-world usefulness
- Clean user experience
- Maintainable architecture

Every new feature should improve the value of the project for the end user, not simply increase technical complexity.
