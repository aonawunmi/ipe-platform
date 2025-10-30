-- =====================================================
-- IPE Platform Database Schema - MVP
-- Information Prediction Exchange
-- Created: October 2025
-- Database: PostgreSQL 15+
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('user', 'creator', 'admin', 'resolver');
CREATE TYPE kyc_tier AS ENUM ('tier_0', 'tier_1', 'tier_2', 'tier_3');
CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected', 'expired');
CREATE TYPE market_status AS ENUM ('draft', 'pending_review', 'active', 'suspended', 'closed', 'resolved', 'cancelled');
CREATE TYPE market_category AS ENUM ('macroeconomics', 'capital_markets', 'public_policy', 'corporate_events', 'entertainment', 'sports', 'technology', 'other');
CREATE TYPE order_side AS ENUM ('yes', 'no');
CREATE TYPE order_status AS ENUM ('pending', 'open', 'partially_filled', 'filled', 'cancelled', 'expired');
CREATE TYPE trade_status AS ENUM ('pending', 'completed', 'failed', 'reversed');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'trade_buy', 'trade_sell', 'settlement', 'fee', 'refund', 'bonus');
CREATE TYPE resolution_outcome AS ENUM ('yes', 'no', 'invalid', 'cancelled');

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'user',

    -- KYC Information
    kyc_tier kyc_tier DEFAULT 'tier_0',
    kyc_status kyc_status DEFAULT 'pending',
    bvn_hash VARCHAR(255), -- Hashed BVN for privacy
    nin_hash VARCHAR(255), -- Hashed NIN
    kyc_verified_at TIMESTAMPTZ,
    kyc_data JSONB, -- Store verification response from VerifyMe

    -- Account Status
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMPTZ,

    -- Security
    two_fa_enabled BOOLEAN DEFAULT false,
    two_fa_secret VARCHAR(255),
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT email_lowercase CHECK (email = LOWER(email))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- WALLETS & LEDGER
-- =====================================================

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    -- Balances in Naira kobo (smallest unit - ₦0.01)
    balance_available BIGINT DEFAULT 0 NOT NULL CHECK (balance_available >= 0),
    balance_locked BIGINT DEFAULT 0 NOT NULL CHECK (balance_locked >= 0),

    -- Daily/Monthly limits (in kobo)
    daily_deposit_limit BIGINT DEFAULT 5000000, -- ₦50,000 for tier 1
    monthly_deposit_limit BIGINT DEFAULT 50000000, -- ₦500,000 for tier 1
    daily_withdrawal_limit BIGINT DEFAULT 5000000,
    monthly_withdrawal_limit BIGINT DEFAULT 50000000,

    -- Tracking
    total_deposits BIGINT DEFAULT 0,
    total_withdrawals BIGINT DEFAULT 0,
    total_trades BIGINT DEFAULT 0,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id)
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);

-- Double-entry ledger for all financial transactions
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    -- Transaction details
    transaction_type transaction_type NOT NULL,
    amount BIGINT NOT NULL, -- Positive for credit, negative for debit
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,

    -- Reference to related entities
    reference_type VARCHAR(50), -- 'order', 'trade', 'market', 'withdrawal', 'deposit'
    reference_id UUID,

    -- Metadata
    description TEXT,
    metadata JSONB, -- Store additional context

    -- Payment provider details (for deposits/withdrawals)
    payment_provider VARCHAR(50), -- 'paystack', 'moniepoint', 'nibss'
    payment_reference VARCHAR(255),

    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    CONSTRAINT valid_balance CHECK (balance_after = balance_before + amount)
);

CREATE INDEX idx_ledger_wallet_id ON ledger_entries(wallet_id);
CREATE INDEX idx_ledger_user_id ON ledger_entries(user_id);
CREATE INDEX idx_ledger_type ON ledger_entries(transaction_type);
CREATE INDEX idx_ledger_reference ON ledger_entries(reference_type, reference_id);
CREATE INDEX idx_ledger_created_at ON ledger_entries(created_at DESC);

-- =====================================================
-- MARKETS
-- =====================================================

CREATE TABLE markets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    market_code VARCHAR(50) UNIQUE NOT NULL, -- e.g., MKT-2025-001

    -- Market details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category market_category NOT NULL,
    tags TEXT[], -- ['inflation', 'cbn', 'monetary-policy']

    -- Creator
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),

    -- Timing
    open_at TIMESTAMPTZ NOT NULL, -- When trading opens
    close_at TIMESTAMPTZ NOT NULL, -- When trading closes
    resolution_deadline TIMESTAMPTZ, -- When outcome must be declared

    -- Status
    status market_status DEFAULT 'draft',
    status_reason TEXT, -- Reason for suspension/rejection

    -- Trading parameters
    min_trade_amount BIGINT DEFAULT 100, -- ₦1.00 minimum
    max_trade_amount BIGINT DEFAULT 10000000, -- ₦100,000 maximum

    -- Resolution
    resolution_source TEXT, -- URL or description of data source
    resolution_outcome resolution_outcome,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),

    -- Statistics (denormalized for performance)
    total_volume BIGINT DEFAULT 0, -- Total contracts traded
    yes_volume BIGINT DEFAULT 0,
    no_volume BIGINT DEFAULT 0,
    unique_traders INTEGER DEFAULT 0,

    -- Current prices (last trade price)
    last_yes_price INTEGER, -- Price in basis points (0-10000, representing 0-1)
    last_no_price INTEGER,
    last_trade_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT valid_close_time CHECK (close_at > open_at),
    CONSTRAINT valid_prices CHECK (
        (last_yes_price IS NULL AND last_no_price IS NULL) OR
        (last_yes_price + last_no_price = 10000)
    )
);

CREATE INDEX idx_markets_status ON markets(status);
CREATE INDEX idx_markets_category ON markets(category);
CREATE INDEX idx_markets_created_by ON markets(created_by);
CREATE INDEX idx_markets_close_at ON markets(close_at);
CREATE INDEX idx_markets_code ON markets(market_code);

-- =====================================================
-- ORDERS & TRADES
-- =====================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- ORD-2025-000001

    -- Market and user
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,

    -- Order details
    side order_side NOT NULL, -- 'yes' or 'no'
    price INTEGER NOT NULL CHECK (price >= 0 AND price <= 10000), -- Basis points
    quantity INTEGER NOT NULL CHECK (quantity > 0), -- Number of contracts

    -- Execution tracking
    quantity_filled INTEGER DEFAULT 0 CHECK (quantity_filled >= 0 AND quantity_filled <= quantity),
    quantity_remaining INTEGER GENERATED ALWAYS AS (quantity - quantity_filled) STORED,

    -- Financials
    amount_locked BIGINT NOT NULL, -- Amount locked in wallet
    amount_filled BIGINT DEFAULT 0, -- Amount actually used for filled trades

    -- Status
    status order_status DEFAULT 'pending',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    filled_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),

    CONSTRAINT valid_filled_quantity CHECK (quantity_filled <= quantity)
);

CREATE INDEX idx_orders_market_id ON orders(market_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_side ON orders(side);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_price ON orders(price);

-- Composite index for order book queries
CREATE INDEX idx_orders_active_book ON orders(market_id, side, price, status)
WHERE status IN ('open', 'partially_filled');

CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_number VARCHAR(50) UNIQUE NOT NULL, -- TRD-2025-000001

    -- Market
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE RESTRICT,

    -- Matched orders
    buy_order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    sell_order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,

    -- Parties (denormalized for faster queries)
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    -- Trade details
    side order_side NOT NULL, -- Which side (yes/no) was traded
    price INTEGER NOT NULL CHECK (price >= 0 AND price <= 10000),
    quantity INTEGER NOT NULL CHECK (quantity > 0),

    -- Financials (in kobo)
    total_amount BIGINT NOT NULL,
    buyer_fee BIGINT DEFAULT 0,
    seller_fee BIGINT DEFAULT 0,

    -- Status
    status trade_status DEFAULT 'pending',

    -- Settlement (after market resolution)
    settled BOOLEAN DEFAULT false,
    settlement_amount BIGINT, -- Amount paid to winner
    settled_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT different_parties CHECK (buyer_id != seller_id)
);

CREATE INDEX idx_trades_market_id ON trades(market_id);
CREATE INDEX idx_trades_buyer_id ON trades(buyer_id);
CREATE INDEX idx_trades_seller_id ON trades(seller_id);
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX idx_trades_settled ON trades(settled) WHERE settled = false;

-- =====================================================
-- PAYMENTS (Deposits & Withdrawals)
-- =====================================================

CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,

    -- Transaction details
    transaction_type transaction_type NOT NULL,
    amount BIGINT NOT NULL CHECK (amount > 0),

    -- Payment provider
    provider VARCHAR(50) NOT NULL, -- 'paystack', 'moniepoint', 'nibss'
    provider_reference VARCHAR(255) UNIQUE, -- Provider's transaction ID
    provider_response JSONB, -- Full webhook/API response

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'reversed'
    status_message TEXT,

    -- Bank details (for withdrawals)
    bank_code VARCHAR(10),
    account_number VARCHAR(20),
    account_name VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payments_provider_ref ON payment_transactions(provider_reference);
CREATE INDEX idx_payments_status ON payment_transactions(status);
CREATE INDEX idx_payments_created_at ON payment_transactions(created_at DESC);

-- =====================================================
-- RESOLUTION & EVIDENCE
-- =====================================================

CREATE TABLE resolution_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,

    -- Evidence details
    source_name VARCHAR(255) NOT NULL, -- 'NBS', 'NSE', 'INEC', etc.
    source_url TEXT,
    evidence_type VARCHAR(50), -- 'api_data', 'pdf', 'screenshot', 'manual'

    -- Data
    evidence_data JSONB, -- Structured data from APIs
    evidence_file_url TEXT, -- S3/storage URL for documents

    -- Verification
    submitted_by UUID NOT NULL REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resolution_market_id ON resolution_evidence(market_id);
CREATE INDEX idx_resolution_submitted_by ON resolution_evidence(submitted_by);

CREATE TABLE resolution_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    resolver_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

    -- Vote
    outcome resolution_outcome NOT NULL,
    rationale TEXT NOT NULL,
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),

    -- Evidence references
    evidence_ids UUID[],

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(market_id, resolver_id) -- One vote per resolver per market
);

CREATE INDEX idx_resolution_votes_market_id ON resolution_votes(market_id);

-- =====================================================
-- ADMIN & COMPLIANCE
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),

    -- Action details
    action VARCHAR(100) NOT NULL, -- 'user.login', 'market.create', 'order.place', etc.
    entity_type VARCHAR(50), -- 'user', 'market', 'order', 'trade'
    entity_id UUID,

    -- Change tracking
    old_values JSONB,
    new_values JSONB,

    -- Context
    ip_address INET,
    user_agent TEXT,
    request_id UUID,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Verification attempt
    verification_type VARCHAR(50) NOT NULL, -- 'bvn', 'nin', 'liveness', 'document'
    provider VARCHAR(50) NOT NULL, -- 'verifyme', 'smileid'
    provider_reference VARCHAR(255),

    -- Status
    status kyc_status NOT NULL,
    status_message TEXT,

    -- Data
    request_data JSONB,
    response_data JSONB,

    -- Results
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kyc_user_id ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_status ON kyc_verifications(status);
CREATE INDEX idx_kyc_created_at ON kyc_verifications(created_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON markets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate order numbers
CREATE SEQUENCE order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_order_number_trigger
BEFORE INSERT ON orders
FOR EACH ROW
WHEN (NEW.order_number IS NULL)
EXECUTE FUNCTION generate_order_number();

-- Auto-generate trade numbers
CREATE SEQUENCE trade_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_trade_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.trade_number = 'TRD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('trade_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_trade_number_trigger
BEFORE INSERT ON trades
FOR EACH ROW
WHEN (NEW.trade_number IS NULL)
EXECUTE FUNCTION generate_trade_number();

-- Auto-generate market codes
CREATE SEQUENCE market_code_seq START 1;

CREATE OR REPLACE FUNCTION generate_market_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.market_code = 'MKT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('market_code_seq')::TEXT, 3, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_market_code_trigger
BEFORE INSERT ON markets
FOR EACH ROW
WHEN (NEW.market_code IS NULL)
EXECUTE FUNCTION generate_market_code();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Order book view (active orders by market and side)
CREATE VIEW order_book AS
SELECT
    m.id as market_id,
    m.title as market_title,
    o.side,
    o.price,
    SUM(o.quantity_remaining) as total_quantity,
    COUNT(*) as order_count,
    MIN(o.created_at) as oldest_order_at
FROM orders o
JOIN markets m ON m.id = o.market_id
WHERE o.status IN ('open', 'partially_filled')
    AND m.status = 'active'
    AND o.expires_at > NOW()
GROUP BY m.id, m.title, o.side, o.price
ORDER BY m.id, o.side, o.price DESC;

-- Market statistics view
CREATE VIEW market_stats AS
SELECT
    m.id,
    m.market_code,
    m.title,
    m.status,
    m.category,
    COUNT(DISTINCT o.user_id) as unique_traders,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT t.id) as total_trades,
    COALESCE(SUM(t.quantity), 0) as total_volume,
    m.last_yes_price,
    m.last_no_price,
    m.created_at,
    m.close_at
FROM markets m
LEFT JOIN orders o ON o.market_id = m.id
LEFT JOIN trades t ON t.market_id = m.id
GROUP BY m.id;

-- User wallet summary
CREATE VIEW user_wallet_summary AS
SELECT
    u.id as user_id,
    u.email,
    u.full_name,
    u.kyc_tier,
    w.balance_available,
    w.balance_locked,
    w.balance_available + w.balance_locked as total_balance,
    w.total_deposits,
    w.total_withdrawals,
    w.total_trades,
    COUNT(DISTINCT o.id) as active_orders,
    COUNT(DISTINCT t.id) as completed_trades
FROM users u
LEFT JOIN wallets w ON w.user_id = u.id
LEFT JOIN orders o ON o.user_id = u.id AND o.status IN ('open', 'partially_filled')
LEFT JOIN trades t ON (t.buyer_id = u.id OR t.seller_id = u.id) AND t.status = 'completed'
GROUP BY u.id, u.email, u.full_name, u.kyc_tier, w.balance_available, w.balance_locked, w.total_deposits, w.total_withdrawals, w.total_trades;

-- =====================================================
-- SEED DATA (Development)
-- =====================================================

-- Create admin user (password: 'admin123' - change in production!)
INSERT INTO users (email, password_hash, full_name, role, kyc_tier, kyc_status, is_active, is_email_verified)
VALUES (
    'admin@ipenigeria.com',
    '$2b$10$rXH8qXqJY7tN/vKqZx.HK.fZQJ3wN8L0Zm7Y5Qx.YqYxZxZxZxZxZ', -- Placeholder hash
    'IPE Administrator',
    'admin',
    'tier_3',
    'verified',
    true,
    true
);

-- Create admin wallet
INSERT INTO wallets (user_id, balance_available, daily_deposit_limit, monthly_deposit_limit)
SELECT id, 0, 1000000000, 10000000000 FROM users WHERE email = 'admin@ipenigeria.com';

COMMENT ON DATABASE ipe_platform IS 'Information Prediction Exchange - MVP Database';
