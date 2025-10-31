-- Create 3 new test accounts: 1 admin + 2 traders

-- 1. ADMIN USER
INSERT INTO users (email, password_hash, full_name, role, kyc_status, is_email_verified, is_active)
VALUES (
  'admin@ipe.com',
  '$2b$10$pH9.b9giyuFZxBlBeY.97OXI4EFw4byk8Ai2G0N4iiHt1TXsKEd52',
  'Admin User',
  'admin',
  'verified',
  true,
  true
);

-- Create wallet for admin with ₦5,000,000
INSERT INTO wallets (user_id, balance_available, balance_locked, total_deposits)
SELECT id, 500000000, 0, 500000000
FROM users
WHERE email = 'admin@ipe.com';

-- 2. TRADER 1 (Moderate Balance)
INSERT INTO users (email, password_hash, full_name, role, kyc_status, is_email_verified, is_active)
VALUES (
  'trader1@ipe.com',
  '$2b$10$k//XhwDas/P5x7mIDVQ68OkA2ZisfWekduksTCxnK5beVZ0KADuP6',
  'Trader One',
  'user',
  'verified',
  true,
  true
);

-- Create wallet for trader1 with ₦500,000
INSERT INTO wallets (user_id, balance_available, balance_locked, total_deposits)
SELECT id, 50000000, 0, 50000000
FROM users
WHERE email = 'trader1@ipe.com';

-- 3. TRADER 2 (High Balance)
INSERT INTO users (email, password_hash, full_name, role, kyc_status, is_email_verified, is_active)
VALUES (
  'trader2@ipe.com',
  '$2b$10$mSrv7XGmVXn85z7l0y5G5uarNDhdDL2t/c2E9ZQMEK71kenPyHz0W',
  'Trader Two',
  'user',
  'verified',
  true,
  true
);

-- Create wallet for trader2 with ₦2,000,000
INSERT INTO wallets (user_id, balance_available, balance_locked, total_deposits)
SELECT id, 200000000, 0, 200000000
FROM users
WHERE email = 'trader2@ipe.com';

-- Verify accounts created
SELECT
  u.email,
  u.full_name,
  u.role,
  u.kyc_status,
  w.balance_available / 100 as balance_naira
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
WHERE u.email IN ('admin@ipe.com', 'trader1@ipe.com', 'trader2@ipe.com')
ORDER BY u.role DESC, u.email;
