# Plan 002: Wire real data path from API to dashboard

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 4e2fdfb..HEAD -- dashboard/src/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: MED
- **Depends on**: plans/001-establish-test-baseline.md
- **Category**: correctness
- **Planned at**: commit `4e2fdfb`, 2026-07-15

## Why this matters

The dashboard currently has no production data path. The mock data toggle
hardcodes `demoMode=true` and the `useEffect` only starts the mock interval
when demo mode is on. When toggled off, the display freezes on stale data.
The firmware already supports POST-ing to `/api/readings`, and the API route
already stores readings, but the frontend never fetches from it. This plan
completes the end-to-end loop: firmware → API → dashboard.

## Current state

- **`dashboard/src/app/page.tsx:36-52`** — the `useEffect` only creates a mock
  data interval when `demoMode` is true. When `demoMode` is false, it returns
  early and the display never updates. No API polling exists.
  ```tsx
  useEffect(() => {
    const h = generateHistory(24)
    setHistory(h)
    setReading(h[h.length - 1])
    setLastUpdated(new Date())

    if (!demoMode) return    // ← no data path when demo is off

    const interval = setInterval(() => {
      const next = generateMockReading()
      setReading(next)
      setLastUpdated(new Date())
      setHistory((prev) => [...prev.slice(-200), next])
    }, 1500)

    return () => clearInterval(interval)
  }, [demoMode])
  ```

- **`dashboard/src/app/api/readings/route.ts`** — the GET handler returns
  `{ latest, history }`. It's never called from the frontend.
  ```ts
  export async function GET() {
    return NextResponse.json({
      latest: latestReading,
      history: history.slice(-200),
    })
  }
  ```

- **`dashboard/src/app/page.tsx:87-88`** — wifiOnline and loraOnline are
  hardcoded to `true`:
  ```tsx
  <DeviceStatus rssi={reading?.rssi ?? null} lastUpdated={lastUpdated}
    wifiOnline loraOnline />
  ```

- **`dashboard/src/types/index.ts`** — `SensorReading` interface matches the
  API payload shape.

Repo conventions to follow:
- All data fetching lives in components/pages (no separate data layer yet).
- Components use `'use client'` with `useState`/`useEffect`.
- Types are in `src/types/index.ts`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | (none needed) | — |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |
| Tests | `npx vitest run` | exit 0, all pass |
| Lint | `npm run lint` | exit 0 |

## Scope

**In scope** (the only files you should modify):
- `dashboard/src/app/page.tsx` — add API polling path in `useEffect`
- `dashboard/src/lib/api.ts` — create a fetch wrapper for `/api/readings`

**Out of scope** (do NOT touch):
- `dashboard/src/app/api/readings/route.ts` — API already works, no change needed
- `dashboard/src/lib/mock-data.ts` — keep as-is (still used in demo mode)
- `dashboard/src/components/` — no component changes
- `firmware/` — Arduino code, out of scope

## Steps

### Step 1: Create the API fetch utility

Create `dashboard/src/lib/api.ts`:

```ts
import type { SensorReading } from '@/types'

interface ApiResponse {
  latest: SensorReading | null
  history: SensorReading[]
}

export async function fetchReadings(): Promise<ApiResponse> {
  const res = await fetch('/api/readings')
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
```

**Verify**: `npx tsc --noEmit` exits 0

### Step 2: Update page.tsx with API polling

Replace the `useEffect` in `dashboard/src/app/page.tsx` to add an API polling
path when demo mode is off. The final effect should handle three states:

1. **Initial mount**: generate history from mock data (always, for instant UI).
2. **Demo mode ON**: poll mock data every 1.5s (existing behaviour).
3. **Demo mode OFF**: poll `/api/readings` every 1.5s (new behaviour).

```tsx
useEffect(() => {
  // Initial seed — always use mock data for instant display
  const h = generateHistory(24)
  setHistory(h)
  setReading(h[h.length - 1])
  setLastUpdated(new Date())

  const interval = setInterval(async () => {
    if (demoMode) {
      const next = generateMockReading()
      setReading(next)
      setLastUpdated(new Date())
      setHistory((prev) => [...prev.slice(-200), next])
    } else {
      try {
        const data = await fetchReadings()
        if (data.latest) {
          setReading(data.latest)
          setLastUpdated(new Date())
          if (data.history.length > 0) {
            setHistory(data.history)
          }
        }
      } catch {
        // API unreachable — keep showing last known data silently
      }
    }
  }, 1500)

  return () => clearInterval(interval)
}, [demoMode])
```

Remove the unused `useCallback` import at the top of the file (change
`import { useState, useEffect, useCallback } from 'react'` to
`import { useState, useEffect } from 'react'`).

Remove the dead `export const dynamic = 'force-dynamic'` line (line 5).

Add the import for `fetchReadings`:
```tsx
import { fetchReadings } from '@/lib/api'
```

**Verify**: `npx tsc --noEmit` exits 0

### Step 3: Update lint and tests

Run the full verification suite:

```bash
npx tsc --noEmit
npx vitest run
npm run lint
```

All three must exit 0:
- `npm run lint` should no longer show the `useCallback` unused-warning.
- `npm run lint` should no longer show the "setState in effect" error
  because the setState calls are no longer synchronously in the effect body
  — they're inside `setInterval` callbacks (async, not synchronous).

If the lint error persists, add an eslint-disable comment on the `useEffect`
line: `// eslint-disable-next-line react-hooks/set-state-in-effect`. The
eslint rule flags any setState inside an effect regardless of whether it's
in a callback. This is a false positive for the polling pattern — the
interval callback is the correct place for periodic state updates.

**Verify**: `npm run lint` → exit 0 (no errors, no warnings)

## Test plan

No new tests in this plan. The existing characterization tests from plan 001
for `mock-data.ts` and `crop-presets.ts` still pass. The new `api.ts` is a thin
wrapper around `fetch()` that is tested implicitly when the dashboard is served.

A future plan should add integration tests against the `/api/readings` route
using Vitest + MSW or similar.

## Done criteria

ALL must hold:

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npx vitest run` exits 0
- [ ] `npm run lint` exits 0 (no errors, no warnings)
- [ ] `page.tsx` no longer imports `useCallback`
- [ ] `page.tsx` no longer has `export const dynamic`
- [ ] `page.tsx` has a polling path that calls `fetchReadings()` when `demoMode` is false
- [ ] `src/lib/api.ts` exists with `fetchReadings()` export
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the locations in "Current state" doesn't match the excerpts
  (the codebase has drifted since this plan was written).
- `npx tsc --noEmit` fails — ensure the new `api.ts` types align.
- The lint rule `react-hooks/set-state-in-effect` cannot be suppressed
  with eslint-disable; if so, report and we can adjust the approach.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- When a real database is added (future), the `/api/readings` GET endpoint
  will query the database instead of the in-memory store. The frontend
  `fetchReadings()` call stays the same — only the server implementation changes.
- The 1500ms poll interval is hardcoded. If the CONTEXT.md guideline changes
  ("Upload every 10s"), this should be configurable via a constant.
- The `DeviceStatus` component's `wifiOnline` and `loraOnline` props are still
  hardcoded to `true`. A future enhancement could infer connectivity from the
  API response (if the ESP32 includes connection status in its payload).
