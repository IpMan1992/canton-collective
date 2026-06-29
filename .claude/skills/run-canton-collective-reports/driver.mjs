#!/usr/bin/env node
// Driver for the Canton Collective weekly report builders.
//
// The "app" here is three dependency-free Node scripts that emit report
// artifacts from hard-coded weekly data. The only visual surface is the HTML
// dashboard, so this driver builds the artifacts, renders the dashboard with
// headless Chrome, takes a screenshot, and sanity-checks every output.
//
// Usage (run from the project root):
//   node .claude/skills/run-canton-collective-reports/driver.mjs          # build + screenshot + verify
//   node .claude/skills/run-canton-collective-reports/driver.mjs build    # run the 3 builders only
//   node .claude/skills/run-canton-collective-reports/driver.mjs shot      # render dashboard -> PNG only
//   node .claude/skills/run-canton-collective-reports/driver.mjs verify    # validate existing artifacts
//
// Override the browser with CHROME=/path/to/chrome if auto-detect fails.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const SHOT = resolve(ROOT, "dashboard_screenshot.png");
const DASHBOARD = resolve(ROOT, "Canton_Collective_Weekly_Dashboard.html");

const BUILDERS = ["build_report.js", "build_xlsx.js", "build_colored.js"];

// Artifacts each builder is expected to write, with a quick validity check.
const ARTIFACTS = [
  { file: "Canton_Collective_Weekly_Dashboard.html", kind: "html" },
  { file: "Canton_Collective_Weekly_Report_May11-Jun28_2026.xls", kind: "xml" },
  { file: "Canton_Collective_Weekly_Report.csv", kind: "text" },
  { file: "Canton_Collective_Weekly_Report.xlsx", kind: "zip" },
  { file: "Canton_Collective_Weekly_Performance_COLOR.xlsx", kind: "zip" },
];

const CHROME_CANDIDATES = [
  process.env.CHROME,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

function findChrome() {
  for (const c of CHROME_CANDIDATES) if (existsSync(c)) return c;
  throw new Error(
    "No Chrome/Edge found. Set CHROME=/path/to/chrome.exe and retry.\nTried:\n  " +
      CHROME_CANDIDATES.join("\n  ")
  );
}

function build() {
  for (const b of BUILDERS) {
    process.stdout.write(`> node ${b}\n`);
    const out = execFileSync("node", [b], { cwd: ROOT, encoding: "utf8" });
    process.stdout.write("  " + out.trim() + "\n");
  }
}

function shot() {
  if (!existsSync(DASHBOARD)) {
    throw new Error(`${DASHBOARD} missing — run the "build" step first.`);
  }
  const chrome = findChrome();
  const profile = resolve(process.env.TEMP || "/tmp", "cc-chrome-prof");
  execFileSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      `--user-data-dir=${profile}`,
      "--window-size=1400,2200",
      `--screenshot=${SHOT}`,
      pathToFileURL(DASHBOARD).href,
    ],
    { cwd: ROOT, stdio: "ignore" }
  );
  if (!existsSync(SHOT) || statSync(SHOT).size < 1000) {
    throw new Error("Screenshot not produced (or suspiciously small).");
  }
  process.stdout.write(`> screenshot -> ${SHOT} (${statSync(SHOT).size} bytes)\n`);
}

function verify() {
  let ok = true;
  for (const { file, kind } of ARTIFACTS) {
    const p = resolve(ROOT, file);
    if (!existsSync(p)) {
      process.stdout.write(`  MISSING  ${file}\n`);
      ok = false;
      continue;
    }
    const buf = readFileSync(p);
    let good = buf.length > 0;
    let note = `${buf.length} bytes`;
    if (kind === "zip") {
      good = buf[0] === 0x50 && buf[1] === 0x4b; // "PK"
      note += good ? " (PK zip ok)" : " (NOT a zip!)";
    } else if (kind === "xml") {
      good = buf.toString("utf8", 0, 64).includes("<?");
      note += good ? " (xml ok)" : " (no xml header!)";
    }
    process.stdout.write(`  ${good ? "OK     " : "BAD    "} ${file}  ${note}\n`);
    ok = ok && good;
  }
  if (!ok) {
    process.stderr.write("verify FAILED\n");
    process.exit(1);
  }
  process.stdout.write("verify OK\n");
}

const cmd = process.argv[2] || "all";
switch (cmd) {
  case "build":
    build();
    break;
  case "shot":
    shot();
    break;
  case "verify":
    verify();
    break;
  case "all":
    build();
    shot();
    verify();
    break;
  default:
    process.stderr.write(`unknown command: ${cmd}\n`);
    process.exit(2);
}
