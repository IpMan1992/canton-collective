# Canton Collective — Project Memory

Operating harness for **Canton Collective** (cantoncollective.com) only. Keep short; detail in `.claude/rules/`.

## 0. The firewall — read first
<firewall>
- Canton Collective **exclusively**. Never read, write, or reference **HAE** (hae-us.com) from this project.
- HAE is a separate brand in a separate project — different audience, different aesthetic, different store.
  No shared memory, rules, or connectors. If a task needs HAE, **STOP and say so.**
- Before any Shopify call, confirm the connected store is Canton Collective (see `.claude/rules/data-access.md`).
</firewall>

## 1. What Canton Collective is
- A **multi-brand curation platform** for Asian indie designer labels — a house of distinct sub-brands,
  not one label.
- **Audience: Gen-Z** (late-teens to mid-20s), online-native, aesthetic-driven, **fast trend cycles**.
- Register: alt / Y2K / coquette / subculture — expressive, editorial, of-the-moment. The opposite of
  HAE's calm minimalism.
- Each sub-brand has its **own** aesthetic — see `.claude/rules/aesthetic.md`. Never blur them together.

## 2. How to reach data — MCP-first, manual swap
<store_verification>
**Before ANY Shopify call, verify the store.** Confirm it's Canton Collective (cantoncollective.com).
If it returns HAE or anything else, **STOP and ask me to switch.** This is the firewall in practice.
</store_verification>
- Filter `status:active`. **GMV = total_sales.**
- ShopifyQL: avoid `TIMESERIES`+`LIMIT`; per-week queries; `GROUP BY product_vendor, product_title LIMIT 30`.
- **Klaviyo:** CC **has** a Klaviyo account (email underutilized). Metric IDs in `data-access.md`.
- **Meta:** the CC ad account (SGD) is currently **UNSETTLED / not queryable** — treat paid-social spend
  as a known blind spot; never fabricate it.

## 3. Analytics convention
- GMV = total_sales. **Verdict** vs trailing 4-week avg: within ±5% = FLAT, above = BETTER, below = WORSE.
- **Vendor (sub-brand) GMV share is the primary lens** — CC is multi-brand, so who is gaining or ceding
  share matters more than store-level totals. **Flag any vendor share move of ±3pp.**
- **Geography is the standard secondary lens** — vendor × `billing_country` over a 28-day window, indexed
  vs the US baseline. The zeitgeist is usually a US/UK truth; Japan/Korea/AU convert on alt/Y2K (1Jinn),
  Germany on quiet-luxury (First Floor). Details + queries in `.claude/rules/data-access.md`.

## 4. Agents (`.claude/agents/`) — hub-and-spoke, communicate via shared files
- **store-manager** — weekly performance, vendor-share first. *(built)*
- **trend** — per-sub-brand trend radar, Gen-Z Asian indie. *(built)*
- **coordinator / media / content / seo / merchandising / visual** — *(planned)*

## 5. Memory (`memory/`) — three tiers + learning loop
- `store-state.md` (shared snapshot) · `ledgers/` (append-only history) · `knowledge/what-works.md`
  (curated) · `decisions-log.md` (approved/rejected + outcome — read before proposing; the Reflexion loop).

## 6. The loop + finding format
**Read** (ledger + store-state + decisions-log) → **pull** live → **analyze** with why + evidence →
**append** ledger + **update** store-state → **hand** to Coordinator. Propose only.

<finding_format>
<finding>
  <what>one-line finding</what>
  <evidence>data + source</evidence>
  <implication>cross-functional / cross-label angle</implication>
  <action>recommended action + owning agent</action>
  <confidence>high | med | low</confidence>
</finding>
</finding_format>

## 7. Approval gates
<approval_gates>
Draft freely. **Sign-off required to:** publish/alter live listings or metadata · send any Klaviyo
campaign/flow · change any Meta spend · write to the live store · overwrite the Google Sheet report.
</approval_gates>
