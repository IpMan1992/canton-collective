---
name: run-canton-collective-reports
description: Build, run, render, and screenshot the Canton Collective weekly performance report builders (HTML dashboard, .xlsx, .xls, .csv). Use when asked to run, build, generate, preview, or screenshot the Canton Collective weekly report or dashboard.
---

# Run: Canton Collective weekly report builders

The "app" in this project root is three dependency-free Node scripts that turn
hard-coded weekly KPI data into report artifacts:

| Script | Emits |
|---|---|
| `build_report.js`  | `Canton_Collective_Weekly_Dashboard.html` (the visual dashboard) + `..._May11-Jun14_2026.xls` + `Canton_Collective_Weekly_Report.csv` |
| `build_xlsx.js`    | `Canton_Collective_Weekly_Report.xlsx` + `xlsx_base64.txt` |
| `build_colored.js` | `Canton_Collective_Weekly_Performance_COLOR.xlsx` + `color_b64.txt` |

The only thing you can *look at* is the HTML dashboard. The driver builds every
artifact, renders that dashboard with headless Chrome, screenshots it, and
validates each output.

**Paths below are relative to the project root** (`Product Upload-Canton Collective/`).
There is no `package.json` and no `npm install` step — the scripts use only Node
built-ins (`fs`, `zlib`).

## Prerequisites

- Node.js (verified on **v25.2.1**). `node --version` should print something.
- Google Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe`
  (the driver also auto-detects Edge and a `CHROME` env override).

No package installs are required.

## Run (agent path) — use the driver

From the project root:

```powershell
node ".claude\skills\run-canton-collective-reports\driver.mjs"
```

That runs all three builders, renders the dashboard, writes
`dashboard_screenshot.png`, then prints a per-artifact validity report. Expected
tail of the output:

```
> screenshot -> ...\dashboard_screenshot.png (156109 bytes)
  OK      Canton_Collective_Weekly_Dashboard.html  12843 bytes
  OK      Canton_Collective_Weekly_Report_May11-Jun14_2026.xls  27012 bytes (xml ok)
  OK      Canton_Collective_Weekly_Report.csv  4502 bytes
  OK      Canton_Collective_Weekly_Report.xlsx  11494 bytes (PK zip ok)
  OK      Canton_Collective_Weekly_Performance_COLOR.xlsx  8993 bytes (PK zip ok)
verify OK
```

Then **open `dashboard_screenshot.png`** — you should see five cards (one per
week) with colored verdict banners (WORSE / WORSE marginal / FLAT / BETTER /
FLAT), GMV/Orders/Sessions tiles, a per-vendor share table, and a cross-period
footer. Blank or error page = not done.

Subcommands when you only want one stage:

```powershell
node ".claude\skills\run-canton-collective-reports\driver.mjs" build    # 3 builders only
node ".claude\skills\run-canton-collective-reports\driver.mjs" shot      # render + screenshot only
node ".claude\skills\run-canton-collective-reports\driver.mjs" verify    # validate existing artifacts
```

## Run (human path) — builders directly

If you just want the artifacts without the screenshot/validation wrapper:

```powershell
node build_report.js
node build_xlsx.js
node build_colored.js
```

Each prints a one-line byte count, e.g. `OK xls 26937 csv 4411 html 12752`.
To preview the dashboard, open `Canton_Collective_Weekly_Dashboard.html` in a
browser (headless, there's nothing to interact with — it's a static page).

## Changing the report

The data is **baked into each builder** as JS arrays at the top of the file
(`kpi`, `decomp`, `funnel`, `traffic`, `vendors`, `products`, `email`, `yoy`).
Re-running a builder just re-emits the same May 11 – Jun 14 2026 report. To
produce a different week, edit those arrays and re-run. Numbers are duplicated
across the three builders — change all three to keep them consistent.

## Gotchas

- **`--headless` (old mode) produces no screenshot file** and exits without an
  error — the run looks like it "worked" but nothing is written. Use
  `--headless=new` with a writable `--user-data-dir`, which is what the driver
  does. This was the single biggest trap.
- **Don't `2>$null` Chrome in PowerShell** to debug a missing screenshot — the
  problem was headless mode, not stderr noise. The driver runs Chrome with
  `stdio: "ignore"` and checks the PNG exists + is >1 KB instead.
- The `.xlsx` files are hand-assembled ZIPs (no library). `verify` checks the
  `PK` signature; if a builder is edited and emits malformed XML, the file can
  still "exist" but be a broken workbook — open it to be sure after edits.
- This is **not** the Shopify theme. The `shopify theme/` subfolder is a separate
  Liquid theme that needs the Shopify CLI + store auth to run; it is out of
  scope for this skill.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `No Chrome/Edge found` | Set `CHROME=C:\path\to\chrome.exe` and re-run, or install Chrome to the default location. |
| `... missing — run the "build" step first` (from `shot`) | Run the default/`build` command first; `shot` needs the dashboard HTML to exist. |
| Screenshot is blank/tiny | Stale or zero-byte HTML — re-run `build`, then `shot`. The driver already rejects PNGs under 1 KB. |
| `verify FAILED` with `NOT a zip!` | A builder emitted a corrupt `.xlsx`; re-run that builder, or revert recent edits to its ZIP-writing section. |
