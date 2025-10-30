-- Production Database Seed Script
-- Run this after importing schema.sql

-- ============================================
-- STEP 1: Create Test Users
-- ============================================

-- Generate password hashes first:
-- node generate-password.js "Password123!"
-- node generate-password.js "Admin123!"

-- Tester Account (Replace <HASH_1> with generated hash)
INSERT INTO users (email, password_hash, full_name, phone_number, role, kyc_status, email_verified)
VALUES (
  'tester@ipe.com',
  '<PASTE_HASH_FOR_Password123!>',
  'Test User',
  '+2348012345678',
  'user',
  'pending',
  true
);

-- Admin Account (Replace <HASH_2> with generated hash)
INSERT INTO users (email, password_hash, full_name, phone_number, role, kyc_status, email_verified)
VALUES (
  'admin@ipe.com',
  '<PASTE_HASH_FOR_Admin123!>',
  'Admin User',
  '+2348087654321',
  'admin',
  'approved',
  true
);

-- ============================================
-- STEP 2: Create Wallets for Test Users
-- ============================================

-- Wallet for tester@ipe.com (₦10,000.00 = 1,000,000 cents)
INSERT INTO wallets (user_id, balance_available, total_deposits)
SELECT id, 1000000, 1000000
FROM users
WHERE email = 'tester@ipe.com';

-- Wallet for admin@ipe.com (₦100,000.00 = 10,000,000 cents)
INSERT INTO wallets (user_id, balance_available, total_deposits)
SELECT id, 10000000, 10000000
FROM users
WHERE email = 'admin@ipe.com';

-- ============================================
-- STEP 3: Seed Initial Markets
-- ============================================

-- Market 1: Nigeria Inflation
INSERT INTO markets (
  market_code, title, description, category, tags,
  created_by, open_at, close_at, resolution_deadline,
  status, min_trade_amount, max_trade_amount,
  last_yes_price, last_no_price
) VALUES (
  'MKT-2025-001',
  'Will Nigeria''s inflation rate fall below 20% by December 2025?',
  'This market resolves YES if Nigeria''s official inflation rate as published by the National Bureau of Statistics falls below 20% by December 31, 2025. Resolution source: NBS official website.',
  'macroeconomics',
  ARRAY['inflation', 'Nigeria', 'economy', 'NBS'],
  (SELECT id FROM users WHERE email = 'admin@ipe.com'),
  NOW(),
  NOW() + INTERVAL '180 days',
  NOW() + INTERVAL '195 days',
  'active',
  100,
  10000000,
  5000,
  5000
);

-- Market 2: NGX All-Share Index
INSERT INTO markets (
  market_code, title, description, category, tags,
  created_by, open_at, close_at, resolution_deadline,
  status, min_trade_amount, max_trade_amount,
  last_yes_price, last_no_price
) VALUES (
  'MKT-2025-002',
  'Will the NGX All-Share Index close above 100,000 points by June 2025?',
  'This market resolves YES if the Nigerian Exchange (NGX) All-Share Index closes at or above 100,000 points on any trading day before June 30, 2025. Resolution source: NGX official website.',
  'capital_markets',
  ARRAY['NGX', 'stock market', 'Nigeria', 'ASI'],
  (SELECT id FROM users WHERE email = 'admin@ipe.com'),
  NOW(),
  NOW() + INTERVAL '180 days',
  NOW() + INTERVAL '195 days',
  'active',
  100,
  10000000,
  5000,
  5000
);

-- Market 3: IMF Loan Agreement
INSERT INTO markets (
  market_code, title, description, category, tags,
  created_by, open_at, close_at, resolution_deadline,
  status, min_trade_amount, max_trade_amount,
  last_yes_price, last_no_price
) VALUES (
  'MKT-2025-003',
  'Will Nigeria sign a new IMF loan agreement in 2025?',
  'This market resolves YES if Nigeria officially signs a new loan or financing agreement with the International Monetary Fund (IMF) at any point during 2025. Resolution source: IMF official announcements or Nigerian Federal Ministry of Finance.',
  'public_policy',
  ARRAY['IMF', 'Nigeria', 'loan', 'policy', 'finance'],
  (SELECT id FROM users WHERE email = 'admin@ipe.com'),
  NOW(),
  NOW() + INTERVAL '365 days',
  NOW() + INTERVAL '380 days',
  'active',
  100,
  10000000,
  5000,
  5000
);

-- Market 4: Naira Exchange Rate
INSERT INTO markets (
  market_code, title, description, category, tags,
  created_by, open_at, close_at, resolution_deadline,
  status, min_trade_amount, max_trade_amount,
  last_yes_price, last_no_price
) VALUES (
  'MKT-2025-004',
  'Will the USD/NGN exchange rate exceed ₦2,000/$1 by March 2025?',
  'This market resolves YES if the official USD to NGN exchange rate reaches or exceeds ₦2,000 per $1 USD at any point before March 31, 2025. Resolution source: CBN official exchange rate.',
  'macroeconomics',
  ARRAY['forex', 'exchange rate', 'Naira', 'USD', 'CBN'],
  (SELECT id FROM users WHERE email = 'admin@ipe.com'),
  NOW(),
  NOW() + INTERVAL '90 days',
  NOW() + INTERVAL '105 days',
  'active',
  100,
  10000000,
  5000,
  5000
);

-- Market 5: Dangote Refinery Production
INSERT INTO markets (
  market_code, title, description, category, tags,
  created_by, open_at, close_at, resolution_deadline,
  status, min_trade_amount, max_trade_amount,
  last_yes_price, last_no_price
) VALUES (
  'MKT-2025-005',
  'Will Dangote Refinery reach 50% production capacity by Q2 2025?',
  'This market resolves YES if Dangote Refinery officially announces or credible sources confirm production at 50% or more of its 650,000 barrels per day capacity before June 30, 2025. Resolution sources: Company announcements, NNPC reports.',
  'corporate_events',
  ARRAY['Dangote', 'refinery', 'oil', 'energy', 'Nigeria'],
  (SELECT id FROM users WHERE email = 'admin@ipe.com'),
  NOW(),
  NOW() + INTERVAL '150 days',
  NOW() + INTERVAL '165 days',
  'active',
  100,
  10000000,
  5000,
  5000
);

-- ============================================
-- Verification Queries
-- ============================================

-- Check users created
SELECT email, full_name, role, kyc_status FROM users;

-- Check wallets created
SELECT
  u.email,
  w.balance_available / 100.0 AS balance_ngn,
  w.balance_locked / 100.0 AS locked_ngn
FROM wallets w
JOIN users u ON w.user_id = u.id;

-- Check markets created
SELECT market_code, title, status, category FROM markets ORDER BY created_at;

-- ============================================
-- Production Database Setup Complete! 🎉
-- ============================================
