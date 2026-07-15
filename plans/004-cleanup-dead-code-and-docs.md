# Plan 004: Clean up dead code, deduplicate threshold logic, populate DESIGN.md

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 4e2fdfb..HEAD -- dashboard/src/ docs/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt, docs
- **Planned at**: commit `4e2fdfb`, 2026-07-15

## Why this matters

Four small maintenance issues, each trivial to fix, that together reduce noise:
- Unused variables produce lint warnings that hide real issues.
- The `dynamic` export in a `'use client'` file is dead code that misleads
  readers.
- The threshold check (`value >= min && value <= max`) is duplicated across
  5 components; extracting it prevents drift and makes the test from plan 001
  more useful.
- `docs/DESIGN.md` is an empty skeleton — the CONTEXT.md §21 references it but
  populating it gives the project a documented design baseline.

## Current state

### Unused variables

- **`dashboard/src/app/page.tsx:3`** — `useCallback` imported but never used:
  ```tsx
  import { useState, useEffect, useCallback } from 'react'
  ```
  (Plan 002 may have already removed this import. Check before changing.)

- **`dashboard/src/components/field-summary.tsx:30,33`** — `healthy` and `mid`
  assigned but never used:
  ```tsx
  const healthy = checks.every((c) => c.value >= c.min && c.value <= c.max)
  // ...
  const mid = (c.min + c.max) / 2
  ```

- **`dashboard/src/components/farmer-insight.tsx:16`** — `unit` parameter
  received but never used:
  ```tsx
  function insightFor(
    label: string, value: number, min: number, max: number, unit: string
  )
  ```

### Dead segment config

- **`dashboard/src/app/page.tsx:5`** — `export const dynamic = 'force-dynamic'`
  is placed between imports. This segment config export has no effect in a
  `'use client'` page file. (Plan 002 may have removed this line already.)

### Duplicated threshold logic

The same `value >= min && value <= max` check is written inline in:

| File | Lines |
|------|-------|
| `metric-card.tsx` | 36 |
| `farmer-insight.tsx` | 18, 25, 84 |
| `field-summary.tsx` | 31 |
| `ideal-vs-actual.tsx` | 71 |

### Empty DESIGN.md

- **`docs/DESIGN.md`** — every section says "To be defined" or is empty.
  The actual color palette and design tokens have already been defined in
  `dashboard/src/app/globals.css` (the dark green oklch theme).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npx tsc --noEmit` | exit 0, no errors |
| Tests | `npx vitest run` | exit 0, all pass |
| Lint | `npm run lint` | exit 0 |

## Scope

**In scope**:
- `dashboard/src/app/page.tsx` — clean up unused imports, remove dead config
- `dashboard/src/components/field-summary.tsx` — remove unused variables
- `dashboard/src/components/farmer-insight.tsx` — remove unused parameter
- `dashboard/src/lib/threshold.ts` — create shared `isInRange` utility
- `dashboard/src/components/metric-card.tsx` — import and use shared utility
- `dashboard/src/components/farmer-insight.tsx` — import and use shared utility
- `dashboard/src/components/field-summary.tsx` — import and use shared utility
- `dashboard/src/components/ideal-vs-actual.tsx` — import and use shared utility
- `docs/DESIGN.md` — populate with actual values from globals.css

**Out of scope**:
- `firmware/` — no changes
- `dashboard/src/app/api/` — no changes
- `dashboard/src/lib/crop-presets.ts` — no changes

## Steps

### Step 1: Remove unused variables

**`page.tsx`**: If `useCallback` is imported but unused (check — plan 002
may have already removed it), change the import to:
```tsx
import { useState, useEffect } from 'react'
```

**`field-summary.tsx`**: Remove lines 30 and 33:
- Remove `const healthy = checks.every(...)` — line 30
- Remove `const mid = (c.min + c.max) / 2` — line 33
- Keep `const range = c.max - c.min` — line 34 (this IS used)

**`farmer-insight.tsx`**: Remove the `unit` parameter from `insightFor`:
```diff
- function insightFor(
-   label: string, value: number, min: number, max: number, unit: string
- ): ... {
+ function insightFor(
+   label: string, value: number, min: number, max: number
+ ): ... {
```
Also update the call site to pass one fewer argument:
```diff
- const insight = insightFor(item.label, item.value, item.min, item.max, item.unit)
+ const insight = insightFor(item.label, item.value, item.min, item.max)
```

**Verify**: `npm run lint` — should show 3 fewer warnings than before

### Step 2: Remove dead segment config

If `page.tsx` still has `export const dynamic = 'force-dynamic'` (plan 002
may have removed it), delete that line.

**Verify**: `grep -n 'force-dynamic' src/app/page.tsx` returns no matches

### Step 3: Create shared threshold utility

Create `dashboard/src/lib/threshold.ts`:

```ts
/**
 * Check whether a value falls within a range (inclusive).
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}
```

**Verify**: `npx tsc --noEmit` exits 0

### Step 4: Replace inline threshold checks with shared utility

**`metric-card.tsx`**: Replace:
```tsx
const inRange = value >= min && value <= max
```
With:
```tsx
import { isInRange } from '@/lib/threshold'
const inRange = isInRange(value, min, max)
```

**`farmer-insight.tsx`**: The `insightFor` function does the same check
internally. Replace the inline checks:
```diff
+ import { isInRange } from '@/lib/threshold'
  // ...
  if (value < min) { ... }
  if (value > max) { ... }
```
And replace the `allNormal` computation:
```diff
- const allNormal = items.every((i) => i.value >= i.min && i.value <= i.max)
+ const allNormal = items.every((i) => isInRange(i.value, i.min, i.max))
```

**`field-summary.tsx`**: Replace `checks.every(...)` and `checks.some(...)`:
```diff
+ import { isInRange } from '@/lib/threshold'
- const healthy = checks.every((c) => c.value >= c.min && c.value <= c.max)
  // (just remove `healthy` — it was already unused)
- const warning = checks.some((c) => c.value < c.min || c.value > c.max)
+ const warning = checks.some((c) => !isInRange(c.value, c.min, c.max))
```

**`ideal-vs-actual.tsx`**: Replace:
```diff
+ import { isInRange } from '@/lib/threshold'
- const inRange = r.value >= r.min && r.value <= r.max
+ const inRange = isInRange(r.value, r.min, r.max)
```

**Verify**: `npx tsc --noEmit` exits 0

### Step 5: Update the thresholds test to import the real utility

Edit `dashboard/src/lib/__tests__/thresholds.test.ts` (created in plan 001).
Replace the local `isInRange` function with an import from `@/lib/threshold`:

```diff
- function isInRange(value: number, min: number, max: number): boolean {
-   return value >= min && value <= max
- }
+ import { isInRange } from '@/lib/threshold'
```

**Verify**: `npx vitest run` → all tests pass (the same test cases now run
against the real exported function)

### Step 6: Populate DESIGN.md from the actual design tokens

Replace `docs/DESIGN.md` with content extracted from
`dashboard/src/app/globals.css`:

```markdown
# Design System

This document defines the visual identity for the Smart Agriculture Monitoring
dashboard. Values match the CSS custom properties in `src/app/globals.css`.

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Background | `oklch(0.13 0.02 160)` | Dark green page background |
| Foreground | `oklch(0.95 0.005 120)` | Primary text |
| Card | `oklch(0.16 0.025 155)` | Card and surface backgrounds |
| Card foreground | `oklch(0.95 0.005 120)` | Text on cards |
| Primary | `oklch(0.65 0.2 150)` | Accent green — buttons, links, active states |
| Muted | `oklch(0.2 0.02 155)` | Subtle backgrounds |
| Muted foreground | `oklch(0.65 0.02 140)` | Secondary text, labels |
| Destructive | `oklch(0.65 0.25 25)` | Error states, out-of-range badges |
| Border | `oklch(1 0 0 / 10%)` | Subtle borders |

### Metric Colors

| Metric | Color | Hex approx |
|--------|-------|------------|
| Soil Moisture | `#24d97e` | Green |
| Soil pH | `#4d9eff` | Blue |
| TDS Sensor 1 | `#ffb020` | Amber |
| TDS Sensor 2 | `#ff5c66` | Red |

## Typography

- Font: **Geist** (sans-serif) via `next/font/google`
- Monospace: **Geist Mono** for numeric values (tabular-nums)
- Scale: `text-xs` (labels), `text-sm` (body), `text-lg`/`text-2xl` (headings)
- Headings: font-semibold or font-bold, uppercase + wide tracking for section titles

## Component Library

Built on shadcn/ui with @base-ui/react primitives. Components used:

- Card, Button, Badge, Alert
- Progress (gauge bar per metric)
- Select (crop selector dropdown)
- Switch (demo toggle)
- Table (ideal vs actual comparison)
- Separator, Skeleton

## Grid System

- Max container: `max-w-6xl` (1180px)
- Metric cards: 2-column grid (`grid-cols-1 sm:grid-cols-2`)
- Trend charts: 2-column grid (`grid-cols-1 sm:grid-cols-2`)
- Device status: 4-column grid (`grid-cols-2 sm:grid-cols-4`)
- Padding: responsive (`p-4 sm:p-6 lg:p-8`)

## Icons

- Library: **Lucide** (ships with shadcn/ui)
- Emoji: used sparingly for metric icons (💧🧪⚗️)

## Charts

- Library: **Recharts** (`LineChart` component)
- All charts are 24-hour line charts (`h-48`)
- Gradient fills: not used (solid line + grid)
- X-axis: time labels (`interval="preserveStartEnd"`)
- Y-axis: auto-scaled

## Card Styles

- Border radius: `0.75rem` (12px)
- Background: `oklch(0.16 0.025 155)` (slightly lighter than page bg)
- Border: `oklch(1 0 0 / 10%)`
- Padding: `p-4` (16px)
- Hover: `translateY(-3px)` effect on metric cards

## Elevation / Shadows

Defined by shadcn/ui defaults. No custom shadow tokens. Modals use
`shadow-md` on the popover content.
```

**Verify**: `cat docs/DESIGN.md | head -5` — shows the file with content
(not "To be defined")

### Step 7: Run full verification suite

```bash
npx tsc --noEmit
npx vitest run
npm run lint
```

All three must exit 0.

## Test plan

- The existing `thresholds.test.ts` from plan 001 is updated in step 5 to
  import the real `isInRange` from `@/lib/threshold`. All existing test cases
  must still pass — this validates the extraction is correct.
- No new tests needed.

## Done criteria

ALL must hold:

- [ ] `npm run lint` exits 0 (zero warnings — the 4 unused-variable warnings are gone)
- [ ] `npx tsc --noEmit` exits 0
- [ ] `npx vitest run` exits 0
- [ ] `src/lib/threshold.ts` exists with exported `isInRange`
- [ ] No file imports `useCallback` unused from React
- [ ] No file contains `export const dynamic` (the dead line is gone)
- [ ] `field-summary.tsx` has no unused `healthy` or `mid` variables
- [ ] `farmer-insight.tsx` `insightFor` function has no `unit` parameter
- [ ] `docs/DESIGN.md` is fully populated with color tokens, typography, grid, etc.
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the locations in "Current state" doesn't match the excerpts
  (the codebase has drifted since this plan was written).
- Plan 002 already modified `page.tsx` substantially and the `dynamic` export
  or `useCallback` import are already gone — skip those substeps.
- A step's verification fails twice after a reasonable fix attempt.
- Any of the 4 unused-variable warnings cannot be resolved (e.g. if a variable
  is used in a way ESLint doesn't detect) — report and we'll add eslint-disable.

## Maintenance notes

- When adding new components that check values against thresholds, import
  `isInRange` from `@/lib/threshold` instead of inlining the comparison.
- The DESIGN.md should be kept in sync with globals.css. If new CSS custom
  properties are added for the design system, update DESIGN.md.
- If `shadcn` CLI dependency is still in `dependencies` instead of
  `devDependencies`, run: `npm uninstall shadcn && npm install --save-dev shadcn`
