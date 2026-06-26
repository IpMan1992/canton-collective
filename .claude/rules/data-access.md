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
