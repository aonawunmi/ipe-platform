-- Create a realistic mix of market timelines
-- Current date: October 31, 2025 (effectively November 1, 2025)

-- URGENT MARKETS (Closing within 2 weeks)
-- 1. Oil prices - closing in 5 days
UPDATE markets SET
  open_at = '2025-10-01 00:00:00',
  close_at = '2025-11-05 23:59:59',
  resolution_deadline = '2025-11-10 23:59:59',
  title = 'Will crude oil prices exceed $100/barrel by November 5, 2025?',
  description = 'This market resolves YES if Brent Crude oil prices exceed $100 per barrel on any trading day before November 5, 2025. Resolution source: ICE Brent Crude futures closing prices.'
WHERE market_code = 'MKT-2025-004';

-- 2. Naira exchange rate - closing in 10 days
UPDATE markets SET
  open_at = '2025-10-01 00:00:00',
  close_at = '2025-11-10 23:59:59',
  resolution_deadline = '2025-11-15 23:59:59',
  title = 'Will the Naira trade below ₦1,000/$1 by November 10, 2025?',
  description = 'This market resolves YES if the official CBN exchange rate falls below ₦1,000 to $1 at any point before November 10, 2025. Resolution source: Central Bank of Nigeria official rates.'
WHERE market_code = 'MKT-2025-002';

-- 3. Dangote Refinery - closing in 14 days
UPDATE markets SET
  open_at = '2025-10-01 00:00:00',
  close_at = '2025-11-14 23:59:59',
  resolution_deadline = '2025-11-20 23:59:59',
  title = 'Will Dangote Refinery achieve 500,000 bpd capacity by November 14, 2025?',
  description = 'This market resolves YES if Dangote Refinery officially announces or confirms daily refining capacity of 500,000 barrels per day or more before November 14, 2025. Resolution source: Dangote Group official statements.'
WHERE market_code = 'MKT-2025-012';

-- MEDIUM-TERM MARKETS (1-3 months)
-- 4. Petrol subsidy - closing in 1 month
UPDATE markets SET
  open_at = '2025-10-01 00:00:00',
  close_at = '2025-11-30 23:59:59',
  resolution_deadline = '2025-12-05 23:59:59',
  title = 'Will petrol subsidy be fully removed in Nigeria by November 2025?',
  description = 'This market resolves YES if the Nigerian government officially announces complete removal of petroleum subsidy before November 30, 2025. Resolution source: Federal Ministry of Finance and NNPC announcements.'
WHERE market_code = 'MKT-2025-009';

-- 5. NGX market cap - closing in 2 months
UPDATE markets SET
  open_at = '2025-10-01 00:00:00',
  close_at = '2025-12-31 23:59:59',
  resolution_deadline = '2026-01-07 23:59:59',
  title = 'Will NGX market capitalization exceed ₦60 trillion by December 31, 2025?',
  description = 'This market resolves YES if the Nigerian Exchange total market capitalization exceeds ₦60 trillion at any daily close before December 31, 2025. Resolution source: NGX official market reports.'
WHERE market_code = 'MKT-2025-007';

-- 6. Inflation rate - closing in 2 months
UPDATE markets SET
  open_at = '2025-09-01 00:00:00',
  close_at = '2025-12-31 23:59:59',
  resolution_deadline = '2026-01-15 23:59:59'
WHERE market_code = 'MKT-2025-001';

-- 7. Crypto regulations - closing in 3 months
UPDATE markets SET
  open_at = '2025-09-01 00:00:00',
  close_at = '2026-01-31 23:59:59',
  resolution_deadline = '2026-02-10 23:59:59',
  title = 'Will Nigeria implement new crypto regulations by January 2026?',
  description = 'This market resolves YES if the Central Bank of Nigeria or Securities and Exchange Commission publishes formal cryptocurrency regulations before January 31, 2026. Resolution source: Official CBN/SEC publications.'
WHERE market_code = 'MKT-2025-008';

-- LONG-TERM MARKETS (4+ months)
-- 8. Bank IPO - closing in 4 months
UPDATE markets SET
  open_at = '2025-09-01 00:00:00',
  close_at = '2026-02-28 23:59:59',
  resolution_deadline = '2026-03-15 23:59:59',
  title = 'Will any Nigerian bank complete an IPO by Q1 2026?',
  description = 'This market resolves YES if any commercial bank licensed in Nigeria successfully completes an Initial Public Offering before February 28, 2026. Resolution source: SEC Nigeria and NGX announcements.'
WHERE market_code = 'MKT-2025-006';

-- 9. Dangote Cement - closing in 5 months
UPDATE markets SET
  open_at = '2025-09-01 00:00:00',
  close_at = '2026-03-31 23:59:59',
  resolution_deadline = '2026-04-15 23:59:59',
  title = 'Will Dangote Cement share price reach ₦400 by March 2026?',
  description = 'This market resolves YES if Dangote Cement (DANGCEM) share price reaches or exceeds ₦400 on the Nigerian Exchange at any point before March 31, 2026. Resolution source: NGX official data.'
WHERE market_code = 'MKT-2025-005';

-- 10. MTN dividend - closing in 6 months
UPDATE markets SET
  open_at = '2025-09-01 00:00:00',
  close_at = '2026-04-30 23:59:59',
  resolution_deadline = '2026-05-31 23:59:59',
  title = 'Will MTN Nigeria announce dividend payout exceeding ₦10/share by April 2026?',
  description = 'This market resolves YES if MTN Nigeria announces total dividend per share exceeding ₦10 for the 2025 financial year before April 30, 2026. Resolution source: MTN Nigeria official investor relations announcements.'
WHERE market_code = 'MKT-2025-011';

-- 11. GDP growth - closing in 8 months
UPDATE markets SET
  open_at = '2025-09-01 00:00:00',
  close_at = '2026-06-30 23:59:59',
  resolution_deadline = '2026-08-31 23:59:59',
  title = 'Will Nigeria&apos;s GDP growth exceed 3.5% in 2025?',
  description = 'This market resolves YES if Nigeria&apos;s official GDP growth rate for 2025 exceeds 3.5% as published by the National Bureau of Statistics. Resolution source: NBS annual GDP report (expected mid-2026).'
WHERE market_code = 'MKT-2025-003';

-- 12. AfCFTA trade - closing in 10 months
UPDATE markets SET
  open_at = '2025-09-01 00:00:00',
  close_at = '2026-08-31 23:59:59',
  resolution_deadline = '2026-10-31 23:59:59',
  title = 'Will AfCFTA trade volume exceed $50 billion in 2025?',
  description = 'This market resolves YES if the African Continental Free Trade Area reports total intra-African trade volume exceeding $50 billion for 2025. Resolution source: AfCFTA Secretariat official reports (expected late 2026).'
WHERE market_code = 'MKT-2025-010';

-- 13. Fintech unicorn - closing in 12 months
UPDATE markets SET
  open_at = '2025-09-01 00:00:00',
  close_at = '2026-10-31 23:59:59',
  resolution_deadline = '2026-11-15 23:59:59',
  title = 'Will any Nigerian fintech achieve unicorn status ($1B valuation) by October 2026?',
  description = 'This market resolves YES if any Nigerian fintech company (e.g., Flutterwave, Paystack, OPay) achieves or announces a valuation of $1 billion or more before October 31, 2026. Resolution source: Official company announcements or credible funding round reports.'
WHERE market_code = 'MKT-2025-013';
