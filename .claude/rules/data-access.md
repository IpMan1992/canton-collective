# Canton Collective — Data Access Rules

## Shopify (MCP, swapped manually)
- Connect the Shopify MCP to Canton Collective each session (disconnect HAE, connect CC).

<store_verification>
**Before ANY Shopify call, verify the store** (get-shop-info) is Canton Collective (cantoncollective.com).
If it returns HAE or anything else, **STOP and ask me to switch.** Never read or write the wrong store.
</store_verification>

- Filter `status:active`. **GMV = total_sales.**
- ShopifyQL: avoid `TIMESERIES`+`LIMIT`; one query per week; product/vendor:
  `GROUP BY product_vendor, product_title LIMIT 30`. **Vendor share is the primary cut.**

### Geography (secondary lens — required each run)
- **Vendor × geography is the standard geo cut.** Dimension = `billing_country` (sales) and
  `session_country` (sessions). Run over a **28-day** window — country splits are too thin at 14d.
- Core queries:
  - `FROM sales SHOW total_sales, orders GROUP BY product_vendor, billing_country ORDER BY total_sales DESC LIMIT 60 SINCE -28d UNTIL today`
  - `FROM sales SHOW total_sales, orders GROUP BY billing_country ORDER BY total_sales DESC LIMIT 15 SINCE -28d UNTIL today` (country totals + AOV)
  - `FROM sessions SHOW sessions, conversion_rate GROUP BY session_country ORDER BY sessions DESC LIMIT 15 SINCE -28d UNTIL today`
- **Read = vendor-mix-by-country indexed vs the US baseline** (US ≈ 74% of GMV and the only statistically
  robust market). A vendor's share in a country minus its US share = the over/under-index that matters.
- **Caveats to state every time:** `billing_country` ≠ shipping; outside the US, order counts are
  single/double digits → directional, not firm; the Meta paid-social blind spot means geo traffic
  cannot be split paid vs organic.

## Klaviyo (CC has an account)
- Metric IDs: Placed Order `RNVshW` · Opened Email `VewGC8` · Clicked Email `XJAT6C` ·
  Viewed Product `RJibWy` · Checkout Started `RbUpFj`.
- Email is currently underutilized (~$744 attributed last window) — opportunity, not a strength.

## Meta
- CC ad account is **SGD and currently UNSETTLED / not queryable.** Treat paid-social spend as a
  **known blind spot** — surface it as unverified, never fabricate numbers.

## Reporting
- The canonical weekly output format is the Google Sheet **"Canton Collective — Weekly Performance"**
  (Drive). Match it. Writing back to that sheet is a gated action (ask first).
