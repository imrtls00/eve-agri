# Analytics Dashboard Design System Documentation

This document provides a comprehensive overview of the design system for the Analytics Dashboard. The system is built on top of modern web technologies including Tailwind CSS, shadcn/ui, and custom component libraries, and is styled entirely for **light mode**: a soft warm beige canvas with cherry red as the single accent color.

**Layout philosophy takes precedence over decoration.** The interface is a collection of *connected panels* sharing borders on a strict grid, not a set of floating rounded cards. Where any instruction below about spacing, radius, or card separation would conflict with the [Page Layout](#page-layout) section, the Page Layout section wins — it is the source of truth for structure.

Think **mission control console / scientific instrument panel**, not SaaS admin template. Primary references are Firecrawl and CCTP for color restraint and typography, but the grid and geometry follow an engineered, blueprint-like discipline: sharp corners, shared borders, zero gaps between sections, high information density.

## Table of Contents

1. [Overview](#overview)
2. [Color System](#color-system)
3. [Tailwind Configuration](#tailwind-configuration)
4. [Page Layout](#page-layout)
5. [Component Architecture](#component-architecture)
6. [Dashboard Assets](#dashboard-assets)
7. [Development Guidelines](#development-guidelines)

## Overview

The design system is organized around a modular component architecture located in the `components/` directory. The system integrates multiple UI libraries and provides a consistent visual language across the dashboard.

### Personality

- Structured
- Connected
- Engineered
- Minimal
- Precise
- Functional
- Modular
- Industrial
- High information density
- Strong alignment
- Sharp geometry
- Intentional whitespace (between groups only, never within them)
- Consistent rhythm

Avoid: rounded modern SaaS styling, floating cards with visible gaps, drop shadows used for elevation, pill-shaped containers, playful motion, colorful illustrations, gradients, glassmorphism, neumorphism. The dashboard should never resemble a Bootstrap admin panel, a generic SaaS template, an AI-generated dashboard, or a collection of independently-floating Tailwind cards.

### Key Technologies

- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **shadcn/ui**: High-quality React components built on Radix UI
- **Custom Components**: Application-specific shared components

### Directory Structure

```
components/
├── ui/                    # Core UI components
│   ├── shadcn/           # shadcn/ui components
│   ├── charts/           # Chart primitives (line, bar, donut, area)
│   └── motion/           # Motion and animation utilities
├── shared/               # Shared application components
│   ├── icons/            # Outlined icon set
│   ├── buttons/          # Primary / secondary / ghost buttons + large action panels
│   ├── panels/           # Grid-connected panel primitives (replaces "cards")
│   ├── badges/           # Status badges (squared, not pill)
│   ├── effects/          # Grid overlays, dot matrices, measuring lines
│   └── layout/           # Header, nav rail, row/grid layout utilities
├── app/                  # Application-specific components
│   ├── dashboard/        # Header, nav, sensor rows, historical + summary column
│   ├── tables/           # Data tables, logs, activity feed
│   └── (settings)/       # Settings and profile pages
└── providers/            # Context providers
```

## Color System

The design system uses a warm, restrained palette defined in `colors.json` / `styles/colors.json`. This dashboard is **light-mode only** — there is no dark theme variant.

### Color Categories

#### Canvas Colors

- `canvas-base` (`#F5F2EC`): Soft warm beige, the primary page background
- `canvas-surface` (`#FFFFFF`): Panels, tables, charts, inputs
- `canvas-hover` (`#EFE9DE`): Soft beige hover state for rows and ghost interactions

#### Accent Colors — Cherry

The single accent color for the entire system, used for active states, primary actions, and emphasis only:

- `cherry-100` (`#C62828`): Primary accent — buttons, active nav, selected states, active dataset in charts
- `cherry-hover` (`#A81F1F`): Hover / pressed state for cherry elements
- `cherry-tint` (`#FCECEC`): Light tint — selected table rows, badge backgrounds, focus rings

Cherry red should occupy **less than 5% of the screen** at any time. It is earned, not sprayed.

#### Border & Divider Colors

Borders now carry the full weight of the layout — they are structural, not decorative. See [Page Layout](#page-layout).

- `border-faint` (`#E7E1D7`): Panel borders, input borders — never use dark borders
- `border-divider` (`#DDD5C9`): Shared edges between adjacent panels, table row dividers

#### Text Colors

- `text-primary` (`#181818`): Almost black, primary text and large numbers
- `text-secondary` (`#666666`): Muted, supporting text and labels
- `text-tertiary` (`#9A9A9A`): Used sparingly — placeholder and disabled text

#### Semantic Status Colors

- `status-success` (`#2E7D32`): Healthy / positive states
- `status-warning` (`#D9822B`): Warning / degraded states
- `status-danger` (`#C62828`): Offline / error states (shares value with `cherry-100`)

### Color Usage

```
<div className="bg-canvas-base text-text-primary">
  Page-level styling
</div>

<div className="border border-border-faint bg-canvas-surface rounded-2">
  Connected panel container
</div>

<button className="bg-cherry-100 hover:bg-cherry-hover text-white rounded-2">
  Primary action
</button>
```

## Tailwind Configuration

### Typography Scale

Primary typeface is **Inter**, falling back to Geist and SF Pro Display. All large metrics use tabular numbers so they line up like a terminal readout. Typography establishes hierarchy **before color does** — a metric panel should be legible in grayscale.

#### Titles

- `title-display`: 40–56px, weight 700, letter-spacing -2% — hero KPI numbers
- `title-h1`: 28px, weight 600 — section titles
- `title-h2`: 18px, weight 600 — panel titles

#### Body Text

- `body-large`: 16px, regular
- `body-medium`: 15px, regular
- `label-medium`: 13px, weight 500, optional uppercase, tracking +2%

#### Numbers (Tabular)

- `metric-large`: Hero and panel metrics — e.g. `98.2%`, `4.6M`, `28.4ms`, `16,204`, `$2.8M`. Always `font-variant-numeric: tabular-nums`.

### Font Families

- **Sans**: Inter (primary), Geist, SF Pro Display, sans-serif
- **Mono**: Geist Mono — engineering labels, coordinate marks, device IDs, firmware versions

### 🚨 Critical: Spacing Is Literal Pixels

**This design system uses a custom sizing system where numeric values equal literal pixels, not rem units like standard Tailwind.**

```
const sizes = Array.from({ length: 200 }, (_, i) => i).reduce(
  (acc, curr) => {
    acc[curr] = `${curr}px`; // 4 = "4px", 24 = "24px", 96 = "96px"
    return acc;
  },
  {}
);
```

Applied to `spacing`, `width`, `height`, `size`, and `inset`.

```
4   8   12   16   24   32   48   64   96
```

**This scale is for internal padding and content rhythm only — it is not used as a gap between top-level panels.** See [Spacing Rules](#spacing-rules) below; adjacent panels touch, they do not sit apart with margin.

### Border Radius System — 2px Everywhere

This overrides any general-purpose rounded-corner scale used elsewhere. Per the Layout Specification (authoritative for geometry):

```
rounded-2    // 2px — outer container, every panel, every button, every badge
```

Do not use `rounded-6`, `rounded-12`, `rounded-16`, or `rounded-full` anywhere in the dashboard shell, sensor panels, buttons, or badges. Squared corners only. If a badge shape genuinely requires a slight softening, `rounded-2` is still the ceiling — never a pill.

❌ **Avoid:**

```
<div className="rounded-lg rounded-xl rounded-full" />
```

✅ **Correct:**

```
<div className="rounded-2" />
```

### Shadow System — Not Used for Elevation

No drop shadows anywhere. Adjacent panels are distinguished by their **shared 1px border**, not by floating with a shadow above the canvas. If a genuinely floating element is unavoidable (e.g. a dropdown menu, a modal), use the faintest possible separation and still prefer a border over a shadow:

```
shadow-none   // default for all panels
border-1 border-border-faint   // does the separation work instead
```

### Opacity System — Decorative Layer Only

```
opacity-2   // 2%  — faint grid backgrounds
opacity-5   // 5%  — dot matrices, technical patterns
```

### Transition System

```
transition-timing-function: ease-out
duration-200   // quick — hover states
duration-350   // moderate — value updates, chart drawing
```

Motion should feel mechanical, not playful. Avoid bounce and elastic easing entirely.

### Animations

```
animate-fade-in         // Fade in on mount
animate-count-up        // Numeric counter animation for metrics
animate-chart-draw      // Line/bar chart draw-in
animate-gauge-sweep     // Needle/marker movement on gauge panels
animate-shimmer         // Skeleton loading shimmer, soft beige
```

### Grid System

- 12-column grid, strict alignment — every panel snaps to a column boundary, nothing is arbitrarily positioned.
- **Zero external gutter between top-level sections.** Panels within a row share edges; rows share edges with the rows above and below them.
- The internal pixel spacing scale (`4 8 12 16 24 32 48 64 96`) governs padding *inside* a panel, not the gap *between* panels.
- Equal heights within a row are mandatory — no panel in a row may be taller or shorter than its neighbors.

### Responsive Breakpoints

```
screens: {
  sm: { min: "576px" },
  md: { min: "768px" },
  lg: { min: "996px" },
  xl: { min: "1200px" },
  "2xl": { min: "1600px" }  // max content width, centered
}
```

## Page Layout

This section is authoritative. Where anything elsewhere in this document (radius, spacing, card styling) conflicts with what follows, follow this section.

### Overall Structure

The dashboard is one continuous application shell, not a collection of floating cards. There are **no visible gaps between sections**. Components touch each other naturally, separated only by their own 1px borders and internal padding — architectural rooms sharing walls, not independent floating objects.

```
┌──────────────────────────────────────────────────────────────┐
│ Header                                                       │
├──────┬───────────────────────────────────────────────────────┤
│      │                                                       │
│ Nav  │ Main Dashboard                                        │
│      │                                                       │
└──────┴───────────────────────────────────────────────────────┘
```

### Header

A full-width information bar divided into multiple equal, bordered sections, each a distinct container that shares an edge with the next:

- Dashboard title
- Short project description
- Last update information
- Connectivity status
- Device status
- Battery status
- Menu action

Everything aligns perfectly to the same grid the rest of the page uses.

### Left Navigation

A fixed vertical navigation rail, full page height, containing:

- Brand / logo
- Primary navigation icons
- Secondary actions
- Logout / exit action at the bottom

### Main Content — Stacked Rows

Each row spans the same grid width and aligns edge-to-edge with the rows above and below it.

#### Row 1 — Live Sensor + Status Strip

Five equal-height, equal-width panels sharing borders:

```
┌──────┬──────┬──────┬──────┬──────┐
│Soil  │pH    │TDS 1 │TDS 2 │Status│
└──────┴──────┴──────┴──────┴──────┘
```

Each metric panel follows the same [Information Hierarchy](#information-hierarchy). The final panel summarizes device status: device status, sensor status, upload status, memory usage, signal strength.

#### Row 2 — Historical Data + Summary Column

Two columns, unequal width, sharing a border down the middle:

```
┌──────────────────────────────┬───────────────┐
│ Historical Data              │ Summary       │
│                              │               │
├──────────────────────────────┤               │
│                              │               │
└──────────────────────────────┴───────────────┘
```

**Left (majority width):** time range selector; multiple sensor histories plotted together on a shared time axis.

**Right (narrow column):** three stacked panels of identical width —
1. Field health / overall condition, human-readable explanation
2. Rule-based recommendation — actionable advice, primary call-to-action
3. Active alerts — recent warnings, timestamps, link to the full alert log

#### Row 3 — Action Panels

Two large panels, not traditional small buttons — large clickable containers:

```
┌────────────────────┬────────────────────┐
│ Action             │ Action             │
└────────────────────┴────────────────────┘
```

Used for configuration, data export, and other secondary actions.

### Bottom Status Bar

A thin, full-width footer with horizontally distributed metadata: copyright, device ID, firmware version, uptime.

### Information Hierarchy

Every metric panel follows the same order, top to bottom:

1. Label
2. Primary value
3. Unit
4. Status badge
5. Supporting information (e.g. normal operating range)
6. Historical reference (previous reading)
7. Small trend visualization (sparkline)

The eye should move naturally from value → interpretation.

### Alignment Rules

- Equal heights within every row
- Shared vertical edges
- Shared horizontal edges
- Consistent internal padding
- No arbitrary positioning — every component snaps to the grid, and expands only while preserving alignment with its neighbors

### Spacing Rules

No external spacing between panels.

- Panels directly touch neighboring panels
- Borders define separation, not margin or gap
- Internal padding (from the pixel spacing scale) provides breathing room *inside* each panel
- Whitespace separates groups of rows, never individual components within a row

## Component Architecture

### UI Components (`components/ui/`)

#### shadcn/ui Components

- Form controls: `Button`, `Input`, `Select`, `Switch`
- Layout: `Dialog`, `Tabs`
- Feedback: `Toast`, `Badge`, `Progress`
- Data: `Table`, `DataTable`

#### Chart Components (`ui/charts/`)

Clean, no chart junk, faint grid lines, rounded tooltips (tooltips are the one place a small radius on a floating element is acceptable, since they are transient overlays, not structural panels):

- `LineChart`: 2px stroke, gray by default, cherry red on active dataset only
- `BarChart`: Square bars (2px radius), minimal spacing
- `DonutChart`: Preferred over pie charts for proportional data
- `AreaChart`: Faint fill, cherry red only for highlighted series
- `GaugeBar`: Horizontal range gauge with zoned coloring and a marker — the primary primitive for bounded-range readings

### Shared Components (`components/shared/`)

#### Icons (`shared/icons/`)

Simple outlined icons only, no fill, no color unless indicating state. Stroke: 1.75px. Consistent size: 20px.

#### Buttons (`shared/buttons/`)

```
export { PrimaryButton } from './primary-button';   // Cherry red, white text, 44px height, rounded-2
export { SecondaryButton } from './secondary-button'; // White, bordered, gray text, rounded-2
export { GhostButton } from './ghost-button';         // Transparent, hover: canvas-hover, rounded-2
export { ActionPanel } from './action-panel';         // Row 3 large clickable container, not a small button
```

#### Panels (`shared/panels/`)

Replaces the generic notion of a "card." A `Panel` is a grid-connected primitive, not a floating rounded box:

- `MetricPanel`: label, primary value, unit, status badge, supporting range, previous reading, sparkline — see [Information Hierarchy](#information-hierarchy)
- `StatusPanel`: device/sensor/upload status, memory, signal strength
- `HistoryPanel`: time-range selector + multi-series shared-axis chart
- `SummaryPanel` / `RecommendationPanel` / `AlertPanel`: the three stacked Row 2 right-column panels, identical width

All panels: `border-1 border-border-faint`, `rounded-2`, `bg-canvas-surface`, `shadow-none`, internal `p-16`–`p-24` depending on density. No panel has external margin — placement and separation come entirely from the grid and shared borders.

#### Badges (`shared/badges/`)

Squared status indicators, `rounded-2` (not pill): `Healthy`, `Warning`, `Offline`, `Deploying`.

#### Decorative Effects (`shared/effects/`)

Purely decorative, never interferes with readability, opacity 2–5% — reinforces the blueprint/mission-control read of the interface:

- `grid-overlay`: Faint technical grid background
- `dot-matrix`: Tiny dot pattern
- `measuring-ticks`: Coordinate marks and measurement lines

### Application Components (`components/app/`)

See [Page Layout](#page-layout) for the authoritative structure. Component-level notes:

```
export default function MetricPanel({ label, value, unit, status, range, previous, trend }) {
  return (
    <div className="bg-canvas-surface border-1 border-border-faint rounded-2 p-16">
      <p className="text-label-medium text-text-secondary">{label}</p>
      <h2 className="text-title-display text-text-primary">{value}<span className="text-body-medium text-text-secondary">{unit}</span></h2>
      <StatusBadge status={status} />
      <p className="text-body-medium text-text-tertiary">Normal: {range}</p>
      <p className="text-body-medium text-text-tertiary">Previous: {previous}</p>
      <Sparkline data={trend} />
    </div>
  );
}
```

Note the absence of `shadow-*` and any radius above `rounded-2`, and the absence of any outer `m-*` margin class — separation comes from the parent grid's shared borders.

## Dashboard Assets

### Asset Organization (`public/dashboard/`)

#### Logo Variants

- `logo.svg`: Primary logo for light backgrounds
- `logo-mark.svg`: Icon-only mark for the nav rail

#### Illustration Assets

- `empty-state-icon.svg`: Simple line icon for empty states
- `grid-pattern.svg`: Reusable faint grid background asset

### Asset Usage Guidelines

- Use outlined, single-color icons only — never colorful illustrations
- Never place the logo over a busy chart or grid-overlay background
- Logo sits in the nav rail only — do not duplicate it in the header

## Development Guidelines

### Component Development

#### File Organization

- Place reusable components in `shared/`
- Place page-specific components in `app/`
- Use index files for clean imports
- Group related components in subdirectories

#### Naming Conventions

- PascalCase for component files and exports
- kebab-case for directories
- Descriptive, semantic names — no `Panel1`, `Panel2`

#### Styling Guidelines

- Reason in literal pixels for spacing (see [Critical: Spacing Is Literal Pixels](#-critical-spacing-is-literal-pixels))
- `rounded-2` is the only corner radius used in the shell, panels, buttons, and badges
- Borders replace shadows and replace margin-based separation between panels
- Never introduce gradients, glassmorphism, or neumorphism
- Color is earned: cherry red only for emphasis and interaction, never constant decoration

### Design Principles

1. The grid is the interface — every panel snaps to a shared boundary; nothing is positioned arbitrarily.
2. Borders define structure, not decoration — adjacent panels share an edge instead of floating apart with a shadow.
3. Sharp geometry — `rounded-2` everywhere, no pill shapes, no soft containers.
4. Typography before color — hierarchy is legible in grayscale; color is layered on top.
5. Density with readability — minimal whitespace *between* panels, generous padding *inside* them.
6. Consistent rhythm — equal heights within a row, predictable internal spacing.
7. Data is the visual focus — cherry red stays under 5% of the screen.
8. Every element must belong to the grid, or it doesn't belong on the page.

### Best Practices

#### Accessibility

- Use semantic HTML elements
- Provide proper ARIA labels and roles
- Maintain keyboard navigation support
- Ensure sufficient contrast between `text-primary` (`#181818`) and `canvas-base` (`#F5F2EC`)

#### Performance

- Use dynamic imports for large chart components
- Animate numbers with `animate-count-up` only on mount or data change, not on every render
- Keep decorative grid/dot layers as static SVG, not re-rendered on scroll

#### Consistency

- Follow the established patterns from existing components
- Use design system tokens consistently — never hardcode hex values or arbitrary radius values in components
- Maintain the fixed internal spacing scale (`4 8 12 16 24 32 48 64 96`)
- Follow the [Page Layout](#page-layout) structure exactly — it is the authoritative source for geometry and structure in this system

### Integration with Existing Systems

This design system is light-mode only by design. Do not add a `dark:` variant layer — if a future dark mode is required, it should be treated as a separate design pass, not a toggle bolted onto these tokens.

This design system provides a solid foundation for a dense, engineered, connected-panel analytics dashboard — precise, warm, and quiet, with cherry red doing all the talking when it needs to, and the grid itself doing the rest.