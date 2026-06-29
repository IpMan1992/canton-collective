---
name: cc-trend-radar
description: Research current GenZ/Y2K women's fashion trends for Canton Collective — a multi-brand curation platform that BUYS from indie sub-brands (does not design) — and match every trend against the existing catalog and recent sales movers to tell the team exactly which products to put promotion weight behind now, and which rising aesthetics to position early. Weighted to five sub-brand aesthetics — 1Jinn Studio (Y2K/alt/coquette), Delete-Ex (dark romantic/grunge), MAMC (romantic/floral climber), 2TH Desire (deconstructed soft rebellion), and Outtheblue. Social-velocity-first signal model (TikTok, Instagram, Pinterest, Reddit). Every trend carries an evidence/proof block for a team audience. Appends to the shared trend ledger at memory/ledgers/trend.md. Runs Deep Dive by default. Use whenever the user asks about Canton Collective trends, what CC should promote/prioritize, which products to push, what's trending for GenZ/Y2K, trend radar, or product-focus strategy for CC. Do NOT use for HAE — that is a separate skill (hae-trend-radar).
---

# Canton Collective Trend Radar

Connects live GenZ/Y2K trend signals to Canton Collective's existing catalog and sales movers, and outputs which products to promote now — with team-grade evidence, written into the shared trend ledger.

**This skill is for Canton Collective ONLY. HAE has its own radar (hae-trend-radar). Never let the two cross — different customer, different aesthetic, different signal model.**

## Required reading before generating

1. `references/cc-brand-lens.md` — the five weighted sub-brand aesthetics, customer profile, markets, and the relevance filter.
2. `references/research-protocol.md` — social-velocity-first signal hierarchy, sources, lifecycle scoring, and the evidence-block standard.

## Core job

CC holds hundreds of products and buys (does not design). The radar's primary value is **prioritization**: of everything in stock, what deserves promotion weight this week, and why. Every trend MUST be matched to catalog + recent sales before it becomes a recommendation. "X is trending" is not an output; "X is peaking, you hold these N SKUs, two are already climbing — push here" is.

## Modes

**Deep Dive (default — use unless user says "pulse"/"quick"):** full sweep across all dimensions and the five weighted sub-brands, both action lanes, full evidence blocks, catalog matching, ~12–18 searches.
**Pulse (on request):** lighter — only what shifted since last ledger + the top push-now calls, ~6–8 searches.

Given CC's current performance focus, default to Deep Dive.

## The two action lanes (lifecycle-based)

| Lane | Trend lifecycle position | Action | Why it's safe |
|---|---|---|---|
| **PUSH NOW** | Peaking / near-peak | Promote matching in-stock products hard — ads, TikTok, homepage, email | No lead-time risk: product already in stock, just directing spend |
| **POSITION EARLY** | Rising, not yet peaked | Feature matching products now before the crest; flag for buying conversations with the sub-brand | Runway exists by definition |
| **CLEAR ONLY** | Past peak / fading | Push existing stock to clear; do not lean in or reorder | Avoid arriving late holding cooling inventory |

The lane is carried into the ledger's **Directive** column (the ledger's own status icons ▲▶▼🆕 capture momentum separately — see Step 6).

## Workflow

### Step 0 — Verify store + retrieve memory
1. Verify the connected store is Canton Collective (shop query / get-shop-info). If it returns HAE or another store, STOP and tell the user to switch the connector — this skill must not run against the wrong catalog.
2. Load the shared trend ledger. The canonical ledger is a plain markdown file in the user's repo at `memory/ledgers/trend.md` ("Canton Collective — Trend Ledger, append-only, PER LABEL"). Read it if accessible (uploaded, in-project, or via connected filesystem/Drive). It is the single source of truth — this skill APPENDS to it, it does not maintain a separate ledger. If unreachable this session, fall back to conversation_search for `Canton Collective Trend Ledger`, and tell the user continuity is partial because the canonical file couldn't be read. If nothing exists, note baseline.
3. Parse the most recent run block for prior Signal/Status/Δ per label so this run computes deltas.

### Step 1 — Signal gathering (social-velocity-first)
Per `references/research-protocol.md`. Use today's date. Signal weight order (inverse of HAE):
1. **Social velocity** (highest) — TikTok, Instagram, Pinterest, Reddit: what's accelerating in GenZ/Y2K/alt fashion communities. Distinguish styling/wear content (real adoption) from one-off virality.
2. **Aesthetic-community & search momentum** — named -cores, Pinterest Predicts, search breakouts, Depop/resale heat.
3. **Loose comps** — Dolls Kill, I AM GIA, indie/Asian-forward labels as confirmation ("are they moving too?"), not primary signal.
4. **Asian street/social scenes** — C-fashion / J-fashion / K-fashion often lead Y2K microtrends; CC's AU + Japan customers make these doubly relevant.

Cover: colors, prints/patterns, silhouettes, details/trims (bows, hardware, lacing, charms), aesthetic movements/-cores, styling behaviors, category heat. Map each to which of the weighted sub-brands it fits.

### Step 2 — Sub-brand relevance filter
Score each trend against the FIVE weighted aesthetics (1Jinn, Delete-Ex, MAMC, 2TH Desire, Outtheblue) per `references/cc-brand-lens.md`. A trend can fit multiple. Trends fitting none = Skip (one-line note). Do not deep-score First Floor (deprioritized — gets a one-line ledger row per Step 6). Ignore UMAMIISM entirely — discontinued, no row.

### Step 3 — Catalog & sales matching (the core step)
For each surviving trend:
1. Search the catalog (search_products, or GraphQL `products(query:...)` — there are NO aesthetic tags, so search by descriptive keywords: silhouette, print, detail, color, and reason over titles, product types, vendor, and descriptions/images for true aesthetic fit, not just keyword hits).
2. Pull recent sales movers (run-analytics-query over the last 2–4 weeks; if that tool is unavailable, reconstruct directionally from orders or state the velocity layer is pending) to see if matching products are ALREADY climbing — a trend whose matches are already moving is the highest-confidence push.
3. Record: matching SKU count, which sub-brands, stock signal, and whether any are in the recent climber/winner list.

A trend with strong external signal but zero catalog matches → POSITION EARLY + buying-conversation flag, not Push Now.

### Step 3.5 — Geographic conversion read (required)
Pull vendor × geography and place the trend findings on a map per `references/research-protocol.md` ("Geographic conversion read") and the queries in `.claude/rules/data-access.md`. The point: the store-wide zeitgeist is usually a US/UK truth, while Japan/Korea/AU convert on a different aesthetic (1Jinn Y2K/coquette/acubi over-indexes; MAMC romantic florals under-index there) and Germany is the lone quiet-luxury/First Floor pocket. Compute each vendor's share **within** each major market indexed vs the US baseline, then map vendor → trend lane → so each market's over-indexing vendor reveals its converting trend. Carry the result into the ledger's geo block (Step 6) and into any "lead this region with X" directive.

### Step 4 — Lifecycle placement + lane assignment
Place each trend on the lifecycle (rising / peaking / fading) from the signal evidence, assign a lane, momentum, and confidence (High = social velocity + community + comp confirmation agree).

### Step 5 — Evidence blocks (team-grade — required for every recommended trend)
Each PUSH NOW / POSITION EARLY trend gets a proof block the team can act on without re-researching:
- **Signal**: named platforms/sources + specifically what's happening, dated. Not "it's trending."
- **Why it's moving**: the driver (celebrity/show/season/cultural moment) where identifiable.
- **Lifecycle + runway**: rising/peaking/fading + estimated remaining window.
- **CC opportunity & proof**: matching SKUs (count + names + sub-brand), whether already climbing in sales data, and the specific action.
- **Sourcing note** (Position Early): what to raise with the sub-brand for the next drop.

### Step 6 — Output + ledger append
First render a clean visual dashboard (visualize: read_me chart+mockup, then show_widget) organized by lane (Push Now first): trend, sub-brand(s), matching SKU count, lifecycle, confidence. Below it, the ranked action list + full evidence blocks in prose (teams need the proof).

Then **append a new run block to `memory/ledgers/trend.md` in its EXACT existing format** — do not invent a new structure. Match the file's conventions precisely:
- Newest on top; insert the new run block ABOVE prior runs at the `<!-- next run appends ABOVE -->` marker (append-only — never edit or delete prior runs).
- Run header: `## Run YYYY-MM-DD (baseline if first)` plus the two header fields the file uses — **Cross-label pattern:** and **Highest-leverage opportunity:**.
- One section PER LABEL in the file's order: `### 1Jinn Studio`, `### MAMC`, then `### 2TH Desire · Delete-Ex · First Floor · Outtheblue`.
- Each label section is a table with the file's columns: `Signal | Status | Δ | Why (evidence) | Inventory (status:active) | Directive`.
  - **Status** uses the file's icon vocabulary: ▲ Accelerating · ▶ Steady · ▼ Cooling · 🆕 New.
  - **Δ** = change vs the previous run's status for that signal (or 🆕 if new).
  - **Inventory** = matching active SKUs (count + key names).
  - **Directive** = the action, prefixed with the lane (PUSH NOW / POSITION EARLY / CLEAR ONLY).
- Because First Floor is deprioritized, still give it a one-line "deprioritized — low coverage" row rather than deep analysis (keeps the file complete). UMAMIISM is discontinued — omit it entirely, no row.
- **Geo block (required):** after the per-label sections, add a `### Geographic conversion read` block — a vendor × country share table (US, AU, JP, UK, DE, KR when present) with the over/under-index vs US, the trend×geo "lead each region with X" synthesis, and the standard caveats (`billing_country` ≠ shipping; small non-US order counts = directional; Meta paid-social blind spot). Track geo-share movement vs the prior run where the data allows.
- If the file couldn't be read in Step 0, output the correctly-formatted run block in chat for the user to paste into the file, and say so.

If editing the actual file isn't possible this session (no write access), produce the exact append block as a copy-paste artifact in the file's format.

## Quality rules

- Every recommended trend cites ≥2 independent social/community signals + at least one catalog/sales fact. Single viral video = Position Early at most, never Push Now.
- No recommendation without a catalog match check — prioritization is the whole point.
- Date-stamp signals; separate "peaking now" from "building."
- Infrastructure note when relevant: CC products lack aesthetic tags — recommend tagging (coquette/grunge/Y2K/etc.) to make future matching sharper.
- Call out reversals from the prior ledger run explicitly (team accountability).
- Keep sub-brand attribution accurate — never assign a grunge trend to a coquette-leaning line.
- Append-only ledger discipline: never rewrite history; each run is a new dated block on top.
