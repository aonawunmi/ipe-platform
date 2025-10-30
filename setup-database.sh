#!/bin/bash

# IPE Platform - Database Setup Script for Railway
# This script imports schema and seeds test data

set -e

echo "🗄️  IPE Platform Database Setup"
echo "================================"
echo ""

# Check if Railway CLI is logged in
echo "Step 1: Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway"
    echo "Please run: railway login"
    echo ""
    exit 1
fi

echo "✅ Logged in to Railway"
echo ""

# Change to backend directory
cd "$(dirname "$0")/backend"

echo "Step 2: Importing database schema..."
echo "This will create all tables, constraints, and triggers"
echo ""

if railway run psql \$DATABASE_URL -f schema.sql; then
    echo "✅ Schema imported successfully"
else
    echo "❌ Schema import failed"
    exit 1
fi

echo ""
echo "Step 3: Generating password hashes..."
echo ""

# Generate password hashes
echo "Password for tester@ipe.com (Password123!):"
HASH1=$(node generate-password.js "Password123!" 2>/dev/null | tail -1)
echo "✅ $HASH1"
echo ""

echo "Password for admin@ipe.com (Admin123!):"
HASH2=$(node generate-password.js "Admin123!" 2>/dev/null | tail -1)
echo "✅ $HASH2"
echo ""

echo "Step 4: Creating temporary seed file with hashes..."
# Create a temporary seed file with the generated hashes
cat > temp-seed.sql << EOF
-- Production Database Seed Script (Auto-generated)

-- Create Test Users
INSERT INTO users (email, password_hash, full_name, phone_number, role, kyc_status, email_verified)
VALUES (
  'tester@ipe.com',
  '$HASH1',
  'Test User',
  '+2348012345678',
  'user',
  'pending',
  true
);

INSERT INTO users (email, password_hash, full_name, phone_number, role, kyc_status, email_verified)
VALUES (
  'admin@ipe.com',
  '$HASH2',
  'Admin User',
  '+2348087654321',
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
),
(
  'MKT-2025-004',
  'Will the USD/NGN exchange rate exceed ₦2,000/\$1 by March 2025?',
  'This market resolves YES if the official USD to NGN exchange rate reaches or exceeds ₦2,000 per \$1 USD at any point before March 31, 2025.',
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
),
(
  'MKT-2025-005',
  'Will Dangote Refinery reach 50% production capacity by Q2 2025?',
  'This market resolves YES if Dangote Refinery officially announces or credible sources confirm production at 50% or more of capacity before June 30, 2025.',
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
EOF

echo "Step 5: Seeding database with test data..."
if railway run psql \$DATABASE_URL -f temp-seed.sql; then
    echo "✅ Database seeded successfully"
else
    echo "❌ Seeding failed"
    rm temp-seed.sql
    exit 1
fi

# Clean up
rm temp-seed.sql

echo ""
echo "Step 6: Verifying database setup..."
echo ""

echo "Users created:"
railway run psql \$DATABASE_URL -c "SELECT email, role, kyc_status FROM users;"

echo ""
echo "Wallets created:"
railway run psql \$DATABASE_URL -c "SELECT u.email, w.balance_available/100.0 as balance_ngn FROM wallets w JOIN users u ON w.user_id = u.id;"

echo ""
echo "Markets created:"
railway run psql \$DATABASE_URL -c "SELECT market_code, title, status FROM markets ORDER BY created_at;"

echo ""
echo "================================"
echo "✅ Database Setup Complete!"
echo "================================"
echo ""
echo "🎯 Test Credentials:"
echo "Tester: tester@ipe.com / Password123!"
echo "Admin:  admin@ipe.com / Admin123!"
echo ""
echo "Next: Deploy your frontend to Vercel and add FRONTEND_URL to Railway backend"
echo ""
