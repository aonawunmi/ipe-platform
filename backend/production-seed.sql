-- Create Test Users
INSERT INTO users (email, password_hash, full_name, role, kyc_status, is_email_verified)
VALUES (
  'tester@ipe.com',
  '$2b$10$ZB4AKkaDu7lySPQK6CdRgefbWZyiIAsY6Yef7K3xKfEjbOn23iHOm',
  'Test User',
  'user',
  'pending',
  true
);

INSERT INTO users (email, password_hash, full_name, role, kyc_status, is_email_verified)
VALUES (
  'admin@ipe.com',
  '$2b$10$VBtzv.NTgj98nQ1BdVFoaOH0jAm26cYQkD43OTdvU0i7ELEZ5dDV.',
  'Admin User',
  'admin',
  'approved',
  true
);

-- Create Wallets
INSERT INTO wallets (user_id, balance_available, total_deposits)
SELECT id, 1000000, 1000000 FROM users WHERE email = 'tester@ipe.com';

INSERT INTO wallets (user_id, balance_available, total_deposits)
SELECT id, 10000000, 10000000 FROM users WHERE email = 'admin@ipe.com';

-- Create Markets
INSERT INTO markets (
  market_code, title, description, category, tags,
  created_by, open_at, close_at, resolution_deadline,
  status, min_trade_amount, max_trade_amount,
  last_yes_price, last_no_price
) VALUES
(
  'MKT-2025-001',
  'Will Nigeria''s inflation rate fall below 20% by December 2025?',
  'This market resolves YES if Nigeria''s official inflation rate as published by the National Bureau of Statistics falls below 20% by December 31, 2025.',
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
),
(
  'MKT-2025-002',
  'Will the NGX All-Share Index close above 100,000 points by June 2025?',
  'This market resolves YES if the Nigerian Exchange (NGX) All-Share Index closes at or above 100,000 points on any trading day before June 30, 2025.',
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
),
(
  'MKT-2025-003',
  'Will Nigeria sign a new IMF loan agreement in 2025?',
  'This market resolves YES if Nigeria officially signs a new loan or financing agreement with the IMF at any point during 2025.',
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
