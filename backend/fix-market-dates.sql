-- Fix market dates to use actual calendar dates instead of relative NOW() dates
-- Current date: October 31, 2025

-- Update each market with proper dates matching their descriptions

UPDATE markets SET
  open_at = '2025-01-01 00:00:00',
  close_at = '2025-06-30 23:59:59',
  resolution_deadline = '2025-07-15 23:59:59'
WHERE market_code = 'MKT-2025-002'
  AND title LIKE '%June 2025%';  -- Naira exchange rate

UPDATE markets SET
  open_at = '2025-01-01 00:00:00',
  close_at = '2025-12-31 23:59:59',
  resolution_deadline = '2026-02-15 23:59:59'
WHERE market_code = 'MKT-2025-003'
  AND title LIKE '%GDP growth%';  -- GDP growth 2025

UPDATE markets SET
  open_at = '2025-01-01 00:00:00',
  close_at = '2025-09-30 23:59:59',
  resolution_deadline = '2025-10-15 23:59:59'
WHERE market_code = 'MKT-2025-004'
  AND title LIKE '%oil prices%September 2025%';  -- Oil prices

UPDATE markets SET
  open_at = '2025-01-01 00:00:00',
  close_at = '2025-12-31 23:59:59',
  resolution_deadline = '2026-01-15 23:59:59'
WHERE market_code = 'MKT-2025-005'
  AND title LIKE '%Dangote Cement%December 2025%';  -- Dangote Cement

UPDATE markets SET
  open_at = '2025-01-01 00:00:00',
  close_at = '2025-06-30 23:59:59',
  resolution_deadline = '2025-07-15 23:59:59'
WHERE market_code = 'MKT-2025-006'
  AND title LIKE '%bank%IPO%H1 2025%';  -- Bank IPO

UPDATE markets SET
  open_at = '2025-01-01 00:00:00',
  close_at = '2025-08-31 23:59:59',
  resolution_deadline = '2025-09-15 23:59:59'
WHERE market_code = 'MKT-2025-007'
  AND title LIKE '%NGX%August 2025%';  -- NGX market cap

UPDATE markets SET
  open_at = '2025-01-01 00:00:00',
  close_at = '2025-09-30 23:59:59',
  resolution_deadline = '2025-10-15 23:59:59'
WHERE market_code = 'MKT-2025-008'
  AND title LIKE '%crypto regulations%Q3 2025%';  -- Crypto regulations

UPDATE markets SET
  open_at = '2025-01-01 00:00:00',
  close_at = '2025-06-30 23:59:59',
  resolution_deadline = '2025-07-15 23:59:59'
WHERE market_code = 'MKT-2025-009'
  AND title LIKE '%petrol subsidy%June 2025%';  -- Petrol subsidy

UPDATE markets SET
  open_at = '2025-01-01 00:00:00',
  close_at = '2025-12-31 23:59:59',
  resolution_deadline = '2026-02-28 23:59:59'
WHERE market_code = 'MKT-2025-010'
  AND title LIKE '%AfCFTA%2025%';  -- AfCFTA trade volume

UPDATE markets SET
  open_at = '2025-01-01 00:00:00',
  close_at = '2025-12-31 23:59:59',
  resolution_deadline = '2026-03-31 23:59:59'
WHERE market_code = 'MKT-2025-011'
  AND title LIKE '%MTN%dividend%2025%';  -- MTN dividend

UPDATE markets SET
  open_at = '2025-01-01 00:00:00',
  close_at = '2025-07-31 23:59:59',
  resolution_deadline = '2025-08-15 23:59:59'
WHERE market_code = 'MKT-2025-012'
  AND title LIKE '%Dangote Refinery%July 2025%';  -- Dangote Refinery

UPDATE markets SET
  open_at = '2025-01-01 00:00:00',
  close_at = '2025-12-31 23:59:59',
  resolution_deadline = '2026-01-15 23:59:59'
WHERE market_code = 'MKT-2025-013'
  AND title LIKE '%fintech%unicorn%2025%';  -- Fintech unicorn

-- Also update the original market to use proper date
UPDATE markets SET
  open_at = '2025-01-01 00:00:00',
  close_at = '2025-12-31 23:59:59',
  resolution_deadline = '2026-02-15 23:59:59'
WHERE market_code = 'MKT-2025-001'
  AND title LIKE '%inflation%December 2025%';  -- Inflation rate
