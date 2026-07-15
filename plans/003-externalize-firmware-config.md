# Plan 003: Externalize firmware config to gitignored header

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 4e2fdfb..HEAD -- firmware/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `4e2fdfb`, 2026-07-15

## Why this matters

The ESP32 gateway firmware currently hardcodes WiFi credentials and API URLs
as string literals in `gateway.ino`. Anyone with access to the source can read
them, and any change requires editing the main sketch. Separating config into
a gitignored header file keeps secrets out of version control and makes
per-environment configuration (dev vs. demo vs. production) straightforward.

## Current state

- **`firmware/gateway/gateway.ino:22-31`** — all config is inline:
  ```cpp
  const char* WIFI_SSID = "YOUR_SSID";
  const char* WIFI_PASS = "YOUR_PASSWORD";
  const String GAS_URL =
    "https://script.google.com/macros/s/YOUR_GAS_ID/exec";
  const String API_URL =
    "http://your-dashboard/api/readings";
  const String DEVICE_ID = "gateway-01";
  ```

- **`.gitignore`** — does not exist at the repo root. No ignore rules.

- **`firmware/gateway/`** directory structure:
  ```
  firmware/gateway/gateway.ino
  ```

Repo conventions:
- The project root has no `.gitignore` yet.
- The firmware directory is `firmware/gateway/` for the receiver sketch,
  `firmware/sensor-node/` for the transmitter.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Verify git status | `git status` | clean (no unintended changes) |

No build commands apply — Arduino sketches are compiled in the Arduino IDE,
not from the CLI.

## Scope

**In scope** (the only files you should modify):
- `firmware/gateway/gateway.ino` — remove inline config, add `#include "config.h"`
- `firmware/gateway/config.h` — create with the same constants
- `firmware/gateway/config.example.h` — create with placeholder values (safe to commit)
- `.gitignore` — create at repo root, add `config.h` entries

**Out of scope** (do NOT touch):
- `firmware/sensor-node/` — this sketch has no network config to externalize
- `dashboard/` — no changes
- `docs/` — no changes
- Any other file outside the in-scope list

## Steps

### Step 1: Create `.gitignore` at the repo root

Create `eve-agri/.gitignore`:

```
# Ignore firmware config files with real credentials
firmware/gateway/config.h
firmware/sensor-node/config.h

# Node.js
node_modules/
.next/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
```

**Verify**: `git status` shows `.gitignore` as an untracked file

### Step 2: Create `config.example.h` (safe to commit)

Create `firmware/gateway/config.example.h`:

```cpp
/*
 * Gateway Configuration
 *
 * Copy this file to config.h and fill in your values.
 * config.h is gitignored — do not commit real credentials.
 */

#pragma once

// Wi-Fi
#define WIFI_SSID "your_wifi_ssid"
#define WIFI_PASS "your_wifi_password"

// Google Apps Script deployment URL (from Extensions > Apps Script > Deploy)
#define GAS_URL "https://script.google.com/macros/s/YOUR_GAS_ID/exec"

// Dashboard API endpoint (e.g., http://localhost:3000/api/readings)
#define API_URL "http://localhost:3000/api/readings"

// Unique identifier for this gateway
#define DEVICE_ID "gateway-01"
```

**Verify**: `cat firmware/gateway/config.example.h` — file exists with content

### Step 3: Create `config.h` (gitignored, with safe defaults)

Create `firmware/gateway/config.h`:

```cpp
/*
 * Gateway Configuration — local copy
 *
 * This file is gitignored. Fill in your real values.
 * See config.example.h for the template.
 */

#pragma once

// Wi-Fi
#define WIFI_SSID "YOUR_SSID"
#define WIFI_PASS "YOUR_PASSWORD"

// Google Apps Script
#define GAS_URL "https://script.google.com/macros/s/YOUR_GAS_ID/exec"

// Dashboard API
#define API_URL "http://localhost:3000/api/readings"

// Device identity
#define DEVICE_ID "gateway-01"
```

**Verify**:
- `git status` shows `config.h` as untracked (gitignored)
- `git check-ignore firmware/gateway/config.h` prints the path (confirming it's ignored)

### Step 4: Update `gateway.ino` to use the config header

Edit `firmware/gateway/gateway.ino`:

1. Add `#include "config.h"` after the other includes (around line 19).
2. Remove lines 22–31 (the inline config block with `WIFI_SSID`, `WIFI_PASS`,
   `GAS_URL`, `API_URL`, `DEVICE_ID`).

The includes section should look like:

```cpp
#include <SPI.h>
#include <LoRa.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "config.h"
```

All references to the config constants (`WIFI_SSID`, `WIFI_PASS`, `GAS_URL`,
`API_URL`, `DEVICE_ID`) in the rest of the file remain unchanged — they now
resolve via the `#define` macros in `config.h`.

**Verify**:
- `grep -n 'const char\* WIFI_SSID' firmware/gateway/gateway.ino` returns no matches
- `grep -n '#include "config.h"' firmware/gateway/gateway.ino` returns a match
- The sketch still uses `WIFI_SSID`, `WIFI_PASS`, `GAS_URL`, `API_URL`, `DEVICE_ID`
  in the body (grep for each)

### Step 5: Run verification

```bash
git status
```

Expected output:
```
Untracked files:
  .gitignore
  firmware/gateway/config.example.h
```

`config.h` should NOT appear (it's gitignored). `gateway.ino` should show as
modified.

## Test plan

No automated tests apply to Arduino firmware. Manual verification:

1. Open `firmware/gateway/gateway.ino` in the Arduino IDE.
2. Verify the sketch compiles without errors.
3. Copy `config.example.h` to `config.h`, fill in real credentials, verify it
   compiles and runs on the ESP32.

## Done criteria

ALL must hold:

- [ ] `.gitignore` exists at the repo root
- [ ] `firmware/gateway/config.example.h` exists (safe to commit, placeholders only)
- [ ] `firmware/gateway/config.h` exists (gitignored, with placeholder defaults)
- [ ] `git check-ignore firmware/gateway/config.h` prints the path
- [ ] `gateway.ino` no longer has inline `WIFI_SSID`, `WIFI_PASS`, `GAS_URL`,
      `API_URL`, or `DEVICE_ID` declarations
- [ ] `gateway.ino` includes `#include "config.h"`
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the locations in "Current state" doesn't match the excerpts
  (the codebase has drifted since this plan was written).
- `gateway.ino` has been substantially restructured (e.g. the config block
  moved or was refactored into a class) — report and we'll rewrite the plan.
- An Arduino IDE compilation error occurs because `#include "config.h"` can't
  be resolved — the file must be in the same directory as the `.ino` file
  (it is: `firmware/gateway/config.h` next to `firmware/gateway/gateway.ino`).

## Maintenance notes

- When adding new environment-specific settings (e.g. LoRa frequency, upload
  interval, slave ID), add them to both `config.example.h` and `config.h`.
- The `config.h` file should never be committed. If it accidentally is, rotate
  any real credentials it contained immediately.
- The sensor-node sketch (`firmware/sensor-node/sensor-node.ino`) currently
  has no network config (it's LoRa-only). If it gains WiFi in the future,
  follow the same pattern.
