# Plan 001: Establish test baseline with Vitest

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
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `4e2fdfb`, 2026-07-15

## Why this matters

The dashboard has zero tests and no test framework installed. Every subsequent
plan (especially plan 002 which rewrites the data fetching layer) risks
regressions that can't be caught automatically. This plan installs Vitest,
writes characterization tests for the existing pure functions (mock data
generation, crop preset logic, threshold computation, insight generation),
and establishes the pattern that all future plans follow.

## Current state

- **`package.json`** — no `test` script, no test dependencies.
- **`dashboard/src/lib/mock-data.ts`** — two exports: `generateMockReading()` and
  `generateHistory()`. Both are pure functions (modulo the module-level `let t`
  variable).
- **`dashboard/src/lib/crop-presets.ts`** — exports `CROP_PRESETS`, `DEFAULT_THRESHOLDS`,
  and `getThresholds(crop)`. Pure functions, no side effects.
- **`dashboard/src/types/index.ts`** — shared TypeScript interfaces.
- **`dashboard/src/tsconfig.json`** — `strict: true`, `"moduleResolution": "bundler"`.

Conventions to follow:
- The repo uses `@/` path alias for `src/` (see `tsconfig.json:22`).
- Components are `'use client'` functional components in `src/components/`.
- Utils are in `src/lib/`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom` | exit 0 |
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |
| Tests | `npx vitest run` | exit 0, all tests pass |
| Lint | `npm run lint` | exit 0 |

## Scope

**In scope** (the only files you should modify):
- `dashboard/package.json` — add test script + dev dependencies
- `dashboard/vitest.config.ts` — create Vitest configuration
- `dashboard/src/lib/__tests__/mock-data.test.ts` — create
- `dashboard/src/lib/__tests__/crop-presets.test.ts` — create
- `dashboard/src/lib/__tests__/thresholds.test.ts` — create (utility test for the threshold check pattern)

**Out of scope** (do NOT touch):
- `dashboard/src/components/` — component tests are deferred to a future plan
- `dashboard/src/app/` — page-level tests are out of scope
- `firmware/` — Arduino code, no JS test runner applies
- `dashboard/next.config.ts` — no changes needed

## Steps

### Step 1: Install Vitest and configure

Install the test runner:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

Create `dashboard/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Add a `test` script to `dashboard/package.json` (in the `"scripts"` section):

```json
"test": "vitest run",
"test:watch": "vitest"
```

**Verify**: `npx vitest run` → exits 0 (no tests yet, but reports "No test files found")

### Step 2: Write characterization tests for crop-presets

Create `dashboard/src/lib/__tests__/crop-presets.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { CROP_PRESETS, DEFAULT_THRESHOLDS, getThresholds } from '@/lib/crop-presets'

describe('crop-presets', () => {
  it('exports all five crop presets', () => {
    expect(Object.keys(CROP_PRESETS)).toEqual([
      'tomato', 'rice', 'wheat', 'maize', 'potato',
    ])
  })

  it('each preset has label, ph, moist, and tds ranges', () => {
    for (const [key, preset] of Object.entries(CROP_PRESETS)) {
      expect(preset.label).toBeTruthy()
      expect(preset.ph.min).toBeLessThan(preset.ph.max)
      expect(preset.moist.min).toBeLessThan(preset.moist.max)
      expect(preset.tds.min).toBeLessThan(preset.tds.max)
    }
  })

  it('getThresholds returns DEFAULT_THRESHOLDS for null crop', () => {
    expect(getThresholds(null)).toEqual(DEFAULT_THRESHOLDS)
  })

  it('getThresholds returns the correct preset for tomato', () => {
    const t = getThresholds('tomato')
    expect(t.ph.min).toBe(6.0)
    expect(t.ph.max).toBe(6.8)
    expect(t.moist.min).toBe(60)
    expect(t.moist.max).toBe(80)
    expect(t.tds.min).toBe(350)
    expect(t.tds.max).toBe(700)
  })

  it('getThresholds returns the correct preset for rice', () => {
    const t = getThresholds('rice')
    expect(t.ph.min).toBe(5.5)
    expect(t.moist.min).toBe(70)
    expect(t.tds.min).toBe(300)
  })
})
```

**Verify**: `npx vitest run` → all 5+ tests pass

### Step 3: Write characterization tests for mock-data

Create `dashboard/src/lib/__tests__/mock-data.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { generateMockReading, generateHistory } from '@/lib/mock-data'

describe('mock-data', () => {
  it('generateMockReading returns a valid SensorReading', () => {
    const r = generateMockReading()
    expect(r).toHaveProperty('deviceId', 'gateway-01')
    expect(r).toHaveProperty('timestamp')
    expect(r).toHaveProperty('soilMoisture')
    expect(r).toHaveProperty('ph')
    expect(r).toHaveProperty('tds1')
    expect(r).toHaveProperty('tds2')
    expect(r).toHaveProperty('rssi')
    expect(r).toHaveProperty('battery')
  })

  it('soilMoisture is clamped between 0 and 100', () => {
    for (let i = 0; i < 50; i++) {
      const r = generateMockReading()
      expect(r.soilMoisture).toBeGreaterThanOrEqual(0)
      expect(r.soilMoisture).toBeLessThanOrEqual(100)
    }
  })

  it('ph is clamped between 0 and 14', () => {
    for (let i = 0; i < 50; i++) {
      const r = generateMockReading()
      expect(r.ph).toBeGreaterThanOrEqual(0)
      expect(r.ph).toBeLessThanOrEqual(14)
    }
  })

  it('tds1 and tds2 are non-negative', () => {
    for (let i = 0; i < 50; i++) {
      const r = generateMockReading()
      expect(r.tds1).toBeGreaterThanOrEqual(0)
      expect(r.tds2).toBeGreaterThanOrEqual(0)
    }
  })

  it('rssi is negative (typical LoRa RSSI)', () => {
    for (let i = 0; i < 10; i++) {
      const r = generateMockReading()
      expect(r.rssi).toBeLessThan(0)
    }
  })

  it('generateHistory returns the correct number of entries', () => {
    const h = generateHistory(24) // 24 hours × 6 entries/hour = 144
    expect(h.length).toBe(144)
  })

  it('generateHistory entries have incrementing timestamps', () => {
    const h = generateHistory(1)
    for (let i = 1; i < h.length; i++) {
      expect(new Date(h[i].timestamp).getTime()).toBeGreaterThan(
        new Date(h[i - 1].timestamp).getTime()
      )
    }
  })
})
```

**Verify**: `npx vitest run` → all tests pass

### Step 4: Write a utility test for the in-range check pattern

Create `dashboard/src/lib/__tests__/thresholds.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

describe('threshold utility (in-range check)', () => {
  it('returns true when value is at min', () => {
    expect(isInRange(6.0, 6.0, 7.5)).toBe(true)
  })

  it('returns true when value is at max', () => {
    expect(isInRange(7.5, 6.0, 7.5)).toBe(true)
  })

  it('returns true when value is inside range', () => {
    expect(isInRange(6.5, 6.0, 7.5)).toBe(true)
  })

  it('returns false when value is below min', () => {
    expect(isInRange(5.9, 6.0, 7.5)).toBe(false)
  })

  it('returns false when value is above max', () => {
    expect(isInRange(7.6, 6.0, 7.5)).toBe(false)
  })
})
```

**Verify**: `npx vitest run` → all tests pass

### Step 5: Run full verification suite

```bash
npx tsc --noEmit
npx vitest run
npm run lint
```

All three must exit 0 with no errors.

## Test plan

This plan IS the test plan — all new tests are written in steps 2–4. The tests are
characterization tests that capture current behaviour. They provide a regression
safety net for plan 002.

## Done criteria

ALL must hold:

- [ ] `npx vitest run` exits 0 with at least 12 test cases
- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run lint` exits 0
- [ ] `dashboard/vitest.config.ts` exists and is valid
- [ ] `dashboard/package.json` has `"test"` and `"test:watch"` scripts
- [ ] `dashboard/src/lib/__tests__/` contains 3 test files
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `vitest` fails to install or configure (e.g. the `@/` alias doesn't resolve
  in the test runner — try adjusting the `resolve.alias` in `vitest.config.ts`)
- `npx vitest run` shows compilation errors from the tests themselves
- The code at the locations in "Current state" doesn't match the excerpts
- A step's verification fails twice after a reasonable fix attempt
- You discover that `generateMockReading()` or `getThresholds()` have been
  significantly changed since this plan was written

## Maintenance notes

- When new pure functions are added to `src/lib/`, add corresponding test files
  in `src/lib/__tests__/` following the pattern established here.
- If the mock data generator is changed (e.g. to produce more realistic
  variance), update the characterization tests to match.
- When plan 004 adds a shared `isInRange` utility, the function tested in
  `thresholds.test.ts` should be replaced with an import of the real utility.
