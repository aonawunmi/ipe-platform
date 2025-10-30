--
-- PostgreSQL database dump
--

\restrict Odcf6gkgY5OwYsYGJicBachPiuJxAIikqrzTWOBdZyDeTPSZPELv9nBY5KRxt2S

-- Dumped from database version 18.0 (Postgres.app)
-- Dumped by pg_dump version 18.0 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: kyc_status; Type: TYPE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TYPE public.kyc_status AS ENUM (
    'pending',
    'verified',
    'rejected',
    'expired'
);


ALTER TYPE public.kyc_status OWNER TO "AyodeleOnawunmi";

--
-- Name: kyc_tier; Type: TYPE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TYPE public.kyc_tier AS ENUM (
    'tier_0',
    'tier_1',
    'tier_2',
    'tier_3'
);


ALTER TYPE public.kyc_tier OWNER TO "AyodeleOnawunmi";

--
-- Name: market_category; Type: TYPE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TYPE public.market_category AS ENUM (
    'macroeconomics',
    'capital_markets',
    'public_policy',
    'corporate_events',
    'entertainment',
    'sports',
    'technology',
    'other'
);


ALTER TYPE public.market_category OWNER TO "AyodeleOnawunmi";

--
-- Name: market_status; Type: TYPE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TYPE public.market_status AS ENUM (
    'draft',
    'pending_review',
    'active',
    'suspended',
    'closed',
    'resolved',
    'cancelled'
);


ALTER TYPE public.market_status OWNER TO "AyodeleOnawunmi";

--
-- Name: order_side; Type: TYPE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TYPE public.order_side AS ENUM (
    'yes',
    'no'
);


ALTER TYPE public.order_side OWNER TO "AyodeleOnawunmi";

--
-- Name: order_status; Type: TYPE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'open',
    'partially_filled',
    'filled',
    'cancelled',
    'expired'
);


ALTER TYPE public.order_status OWNER TO "AyodeleOnawunmi";

--
-- Name: resolution_outcome; Type: TYPE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TYPE public.resolution_outcome AS ENUM (
    'yes',
    'no',
    'invalid',
    'cancelled'
);


ALTER TYPE public.resolution_outcome OWNER TO "AyodeleOnawunmi";

--
-- Name: trade_status; Type: TYPE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TYPE public.trade_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'reversed'
);


ALTER TYPE public.trade_status OWNER TO "AyodeleOnawunmi";

--
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TYPE public.transaction_type AS ENUM (
    'deposit',
    'withdrawal',
    'trade_buy',
    'trade_sell',
    'settlement',
    'fee',
    'refund',
    'bonus'
);


ALTER TYPE public.transaction_type OWNER TO "AyodeleOnawunmi";

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'creator',
    'admin',
    'resolver'
);


ALTER TYPE public.user_role OWNER TO "AyodeleOnawunmi";

--
-- Name: generate_market_code(); Type: FUNCTION; Schema: public; Owner: AyodeleOnawunmi
--

CREATE FUNCTION public.generate_market_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.market_code = 'MKT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('market_code_seq')::TEXT, 3, '0');
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_market_code() OWNER TO "AyodeleOnawunmi";

--
-- Name: generate_order_number(); Type: FUNCTION; Schema: public; Owner: AyodeleOnawunmi
--

CREATE FUNCTION public.generate_order_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.order_number = 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_order_number() OWNER TO "AyodeleOnawunmi";

--
-- Name: generate_trade_number(); Type: FUNCTION; Schema: public; Owner: AyodeleOnawunmi
--

CREATE FUNCTION public.generate_trade_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.trade_number = 'TRD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('trade_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.generate_trade_number() OWNER TO "AyodeleOnawunmi";

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: AyodeleOnawunmi
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO "AyodeleOnawunmi";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    action character varying(100) NOT NULL,
    entity_type character varying(50),
    entity_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    request_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO "AyodeleOnawunmi";

--
-- Name: kyc_verifications; Type: TABLE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TABLE public.kyc_verifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    verification_type character varying(50) NOT NULL,
    provider character varying(50) NOT NULL,
    provider_reference character varying(255),
    status public.kyc_status NOT NULL,
    status_message text,
    request_data jsonb,
    response_data jsonb,
    verified_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.kyc_verifications OWNER TO "AyodeleOnawunmi";

--
-- Name: ledger_entries; Type: TABLE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TABLE public.ledger_entries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    wallet_id uuid NOT NULL,
    user_id uuid NOT NULL,
    transaction_type public.transaction_type NOT NULL,
    amount bigint NOT NULL,
    balance_before bigint NOT NULL,
    balance_after bigint NOT NULL,
    reference_type character varying(50),
    reference_id uuid,
    description text,
    metadata jsonb,
    payment_provider character varying(50),
    payment_reference character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT valid_balance CHECK ((balance_after = (balance_before + amount)))
);


ALTER TABLE public.ledger_entries OWNER TO "AyodeleOnawunmi";

--
-- Name: market_code_seq; Type: SEQUENCE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE SEQUENCE public.market_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.market_code_seq OWNER TO "AyodeleOnawunmi";

--
-- Name: market_stats; Type: VIEW; Schema: public; Owner: AyodeleOnawunmi
--

CREATE VIEW public.market_stats AS
SELECT
    NULL::uuid AS id,
    NULL::character varying(50) AS market_code,
    NULL::text AS title,
    NULL::public.market_status AS status,
    NULL::public.market_category AS category,
    NULL::bigint AS unique_traders,
    NULL::bigint AS total_orders,
    NULL::bigint AS total_trades,
    NULL::bigint AS total_volume,
    NULL::integer AS last_yes_price,
    NULL::integer AS last_no_price,
    NULL::timestamp with time zone AS created_at,
    NULL::timestamp with time zone AS close_at;


ALTER VIEW public.market_stats OWNER TO "AyodeleOnawunmi";

--
-- Name: markets; Type: TABLE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TABLE public.markets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    market_code character varying(50) NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category public.market_category NOT NULL,
    tags text[],
    created_by uuid NOT NULL,
    approved_by uuid,
    open_at timestamp with time zone NOT NULL,
    close_at timestamp with time zone NOT NULL,
    resolution_deadline timestamp with time zone,
    status public.market_status DEFAULT 'draft'::public.market_status,
    status_reason text,
    min_trade_amount bigint DEFAULT 100,
    max_trade_amount bigint DEFAULT 10000000,
    resolution_source text,
    resolution_outcome public.resolution_outcome,
    resolution_notes text,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    total_volume bigint DEFAULT 0,
    yes_volume bigint DEFAULT 0,
    no_volume bigint DEFAULT 0,
    unique_traders integer DEFAULT 0,
    last_yes_price integer,
    last_no_price integer,
    last_trade_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT valid_close_time CHECK ((close_at > open_at)),
    CONSTRAINT valid_prices CHECK ((((last_yes_price IS NULL) AND (last_no_price IS NULL)) OR ((last_yes_price + last_no_price) = 10000)))
);


ALTER TABLE public.markets OWNER TO "AyodeleOnawunmi";

--
-- Name: orders; Type: TABLE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_number character varying(50) NOT NULL,
    market_id uuid NOT NULL,
    user_id uuid NOT NULL,
    wallet_id uuid NOT NULL,
    side public.order_side NOT NULL,
    price integer NOT NULL,
    quantity integer NOT NULL,
    quantity_filled integer DEFAULT 0,
    quantity_remaining integer GENERATED ALWAYS AS ((quantity - quantity_filled)) STORED,
    amount_locked bigint NOT NULL,
    amount_filled bigint DEFAULT 0,
    status public.order_status DEFAULT 'pending'::public.order_status,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    filled_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    expires_at timestamp with time zone DEFAULT (now() + '30 days'::interval),
    CONSTRAINT orders_check CHECK (((quantity_filled >= 0) AND (quantity_filled <= quantity))),
    CONSTRAINT orders_price_check CHECK (((price >= 0) AND (price <= 10000))),
    CONSTRAINT orders_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT valid_filled_quantity CHECK ((quantity_filled <= quantity))
);


ALTER TABLE public.orders OWNER TO "AyodeleOnawunmi";

--
-- Name: order_book; Type: VIEW; Schema: public; Owner: AyodeleOnawunmi
--

CREATE VIEW public.order_book AS
 SELECT m.id AS market_id,
    m.title AS market_title,
    o.side,
    o.price,
    sum(o.quantity_remaining) AS total_quantity,
    count(*) AS order_count,
    min(o.created_at) AS oldest_order_at
   FROM (public.orders o
     JOIN public.markets m ON ((m.id = o.market_id)))
  WHERE ((o.status = ANY (ARRAY['open'::public.order_status, 'partially_filled'::public.order_status])) AND (m.status = 'active'::public.market_status) AND (o.expires_at > now()))
  GROUP BY m.id, m.title, o.side, o.price
  ORDER BY m.id, o.side, o.price DESC;


ALTER VIEW public.order_book OWNER TO "AyodeleOnawunmi";

--
-- Name: order_number_seq; Type: SEQUENCE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE SEQUENCE public.order_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_number_seq OWNER TO "AyodeleOnawunmi";

--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TABLE public.payment_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    wallet_id uuid NOT NULL,
    transaction_type public.transaction_type NOT NULL,
    amount bigint NOT NULL,
    provider character varying(50) NOT NULL,
    provider_reference character varying(255),
    provider_response jsonb,
    status character varying(50) DEFAULT 'pending'::character varying,
    status_message text,
    bank_code character varying(10),
    account_number character varying(20),
    account_name character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    failed_at timestamp with time zone,
    CONSTRAINT payment_transactions_amount_check CHECK ((amount > 0))
);


ALTER TABLE public.payment_transactions OWNER TO "AyodeleOnawunmi";

--
-- Name: resolution_evidence; Type: TABLE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TABLE public.resolution_evidence (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    market_id uuid NOT NULL,
    source_name character varying(255) NOT NULL,
    source_url text,
    evidence_type character varying(50),
    evidence_data jsonb,
    evidence_file_url text,
    submitted_by uuid NOT NULL,
    verified_by uuid,
    verified_at timestamp with time zone,
    verification_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.resolution_evidence OWNER TO "AyodeleOnawunmi";

--
-- Name: resolution_votes; Type: TABLE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TABLE public.resolution_votes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    market_id uuid NOT NULL,
    resolver_id uuid NOT NULL,
    outcome public.resolution_outcome NOT NULL,
    rationale text NOT NULL,
    confidence_score integer,
    evidence_ids uuid[],
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT resolution_votes_confidence_score_check CHECK (((confidence_score >= 0) AND (confidence_score <= 100)))
);


ALTER TABLE public.resolution_votes OWNER TO "AyodeleOnawunmi";

--
-- Name: trade_number_seq; Type: SEQUENCE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE SEQUENCE public.trade_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trade_number_seq OWNER TO "AyodeleOnawunmi";

--
-- Name: trades; Type: TABLE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TABLE public.trades (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    trade_number character varying(50) NOT NULL,
    market_id uuid NOT NULL,
    buy_order_id uuid NOT NULL,
    sell_order_id uuid NOT NULL,
    buyer_id uuid NOT NULL,
    seller_id uuid NOT NULL,
    side public.order_side NOT NULL,
    price integer NOT NULL,
    quantity integer NOT NULL,
    total_amount bigint NOT NULL,
    buyer_fee bigint DEFAULT 0,
    seller_fee bigint DEFAULT 0,
    status public.trade_status DEFAULT 'pending'::public.trade_status,
    settled boolean DEFAULT false,
    settlement_amount bigint,
    settled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT different_parties CHECK ((buyer_id <> seller_id)),
    CONSTRAINT trades_price_check CHECK (((price >= 0) AND (price <= 10000))),
    CONSTRAINT trades_quantity_check CHECK ((quantity > 0))
);


ALTER TABLE public.trades OWNER TO "AyodeleOnawunmi";

--
-- Name: users; Type: TABLE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    phone character varying(20),
    role public.user_role DEFAULT 'user'::public.user_role,
    kyc_tier public.kyc_tier DEFAULT 'tier_0'::public.kyc_tier,
    kyc_status public.kyc_status DEFAULT 'pending'::public.kyc_status,
    bvn_hash character varying(255),
    nin_hash character varying(255),
    kyc_verified_at timestamp with time zone,
    kyc_data jsonb,
    is_active boolean DEFAULT true,
    is_email_verified boolean DEFAULT false,
    email_verified_at timestamp with time zone,
    two_fa_enabled boolean DEFAULT false,
    two_fa_secret character varying(255),
    last_login_at timestamp with time zone,
    last_login_ip inet,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    CONSTRAINT email_lowercase CHECK (((email)::text = lower((email)::text)))
);


ALTER TABLE public.users OWNER TO "AyodeleOnawunmi";

--
-- Name: wallets; Type: TABLE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TABLE public.wallets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    balance_available bigint DEFAULT 0 NOT NULL,
    balance_locked bigint DEFAULT 0 NOT NULL,
    daily_deposit_limit bigint DEFAULT 5000000,
    monthly_deposit_limit bigint DEFAULT 50000000,
    daily_withdrawal_limit bigint DEFAULT 5000000,
    monthly_withdrawal_limit bigint DEFAULT 50000000,
    total_deposits bigint DEFAULT 0,
    total_withdrawals bigint DEFAULT 0,
    total_trades bigint DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT wallets_balance_available_check CHECK ((balance_available >= 0)),
    CONSTRAINT wallets_balance_locked_check CHECK ((balance_locked >= 0))
);


ALTER TABLE public.wallets OWNER TO "AyodeleOnawunmi";

--
-- Name: user_wallet_summary; Type: VIEW; Schema: public; Owner: AyodeleOnawunmi
--

CREATE VIEW public.user_wallet_summary AS
 SELECT u.id AS user_id,
    u.email,
    u.full_name,
    u.kyc_tier,
    w.balance_available,
    w.balance_locked,
    (w.balance_available + w.balance_locked) AS total_balance,
    w.total_deposits,
    w.total_withdrawals,
    w.total_trades,
    count(DISTINCT o.id) AS active_orders,
    count(DISTINCT t.id) AS completed_trades
   FROM (((public.users u
     LEFT JOIN public.wallets w ON ((w.user_id = u.id)))
     LEFT JOIN public.orders o ON (((o.user_id = u.id) AND (o.status = ANY (ARRAY['open'::public.order_status, 'partially_filled'::public.order_status])))))
     LEFT JOIN public.trades t ON ((((t.buyer_id = u.id) OR (t.seller_id = u.id)) AND (t.status = 'completed'::public.trade_status))))
  GROUP BY u.id, u.email, u.full_name, u.kyc_tier, w.balance_available, w.balance_locked, w.total_deposits, w.total_withdrawals, w.total_trades;


ALTER VIEW public.user_wallet_summary OWNER TO "AyodeleOnawunmi";

--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: kyc_verifications kyc_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.kyc_verifications
    ADD CONSTRAINT kyc_verifications_pkey PRIMARY KEY (id);


--
-- Name: ledger_entries ledger_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_pkey PRIMARY KEY (id);


--
-- Name: markets markets_market_code_key; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.markets
    ADD CONSTRAINT markets_market_code_key UNIQUE (market_code);


--
-- Name: markets markets_pkey; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.markets
    ADD CONSTRAINT markets_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_provider_reference_key; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_provider_reference_key UNIQUE (provider_reference);


--
-- Name: resolution_evidence resolution_evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.resolution_evidence
    ADD CONSTRAINT resolution_evidence_pkey PRIMARY KEY (id);


--
-- Name: resolution_votes resolution_votes_market_id_resolver_id_key; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.resolution_votes
    ADD CONSTRAINT resolution_votes_market_id_resolver_id_key UNIQUE (market_id, resolver_id);


--
-- Name: resolution_votes resolution_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.resolution_votes
    ADD CONSTRAINT resolution_votes_pkey PRIMARY KEY (id);


--
-- Name: trades trades_pkey; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_pkey PRIMARY KEY (id);


--
-- Name: trades trades_trade_number_key; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_trade_number_key UNIQUE (trade_number);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_user_id_key; Type: CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_logs_entity; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: idx_kyc_created_at; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_kyc_created_at ON public.kyc_verifications USING btree (created_at DESC);


--
-- Name: idx_kyc_status; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_kyc_status ON public.kyc_verifications USING btree (status);


--
-- Name: idx_kyc_user_id; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_kyc_user_id ON public.kyc_verifications USING btree (user_id);


--
-- Name: idx_ledger_created_at; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_ledger_created_at ON public.ledger_entries USING btree (created_at DESC);


--
-- Name: idx_ledger_reference; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_ledger_reference ON public.ledger_entries USING btree (reference_type, reference_id);


--
-- Name: idx_ledger_type; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_ledger_type ON public.ledger_entries USING btree (transaction_type);


--
-- Name: idx_ledger_user_id; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_ledger_user_id ON public.ledger_entries USING btree (user_id);


--
-- Name: idx_ledger_wallet_id; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_ledger_wallet_id ON public.ledger_entries USING btree (wallet_id);


--
-- Name: idx_markets_category; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_markets_category ON public.markets USING btree (category);


--
-- Name: idx_markets_close_at; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_markets_close_at ON public.markets USING btree (close_at);


--
-- Name: idx_markets_code; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_markets_code ON public.markets USING btree (market_code);


--
-- Name: idx_markets_created_by; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_markets_created_by ON public.markets USING btree (created_by);


--
-- Name: idx_markets_status; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_markets_status ON public.markets USING btree (status);


--
-- Name: idx_orders_active_book; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_orders_active_book ON public.orders USING btree (market_id, side, price, status) WHERE (status = ANY (ARRAY['open'::public.order_status, 'partially_filled'::public.order_status]));


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);


--
-- Name: idx_orders_market_id; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_orders_market_id ON public.orders USING btree (market_id);


--
-- Name: idx_orders_price; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_orders_price ON public.orders USING btree (price);


--
-- Name: idx_orders_side; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_orders_side ON public.orders USING btree (side);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: idx_payments_created_at; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_payments_created_at ON public.payment_transactions USING btree (created_at DESC);


--
-- Name: idx_payments_provider_ref; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_payments_provider_ref ON public.payment_transactions USING btree (provider_reference);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_payments_status ON public.payment_transactions USING btree (status);


--
-- Name: idx_payments_user_id; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_payments_user_id ON public.payment_transactions USING btree (user_id);


--
-- Name: idx_resolution_market_id; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_resolution_market_id ON public.resolution_evidence USING btree (market_id);


--
-- Name: idx_resolution_submitted_by; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_resolution_submitted_by ON public.resolution_evidence USING btree (submitted_by);


--
-- Name: idx_resolution_votes_market_id; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_resolution_votes_market_id ON public.resolution_votes USING btree (market_id);


--
-- Name: idx_trades_buyer_id; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_trades_buyer_id ON public.trades USING btree (buyer_id);


--
-- Name: idx_trades_created_at; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_trades_created_at ON public.trades USING btree (created_at DESC);


--
-- Name: idx_trades_market_id; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_trades_market_id ON public.trades USING btree (market_id);


--
-- Name: idx_trades_seller_id; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_trades_seller_id ON public.trades USING btree (seller_id);


--
-- Name: idx_trades_settled; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_trades_settled ON public.trades USING btree (settled) WHERE (settled = false);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_kyc_status; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_users_kyc_status ON public.users USING btree (kyc_status);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_wallets_user_id; Type: INDEX; Schema: public; Owner: AyodeleOnawunmi
--

CREATE INDEX idx_wallets_user_id ON public.wallets USING btree (user_id);


--
-- Name: market_stats _RETURN; Type: RULE; Schema: public; Owner: AyodeleOnawunmi
--

CREATE OR REPLACE VIEW public.market_stats AS
 SELECT m.id,
    m.market_code,
    m.title,
    m.status,
    m.category,
    count(DISTINCT o.user_id) AS unique_traders,
    count(DISTINCT o.id) AS total_orders,
    count(DISTINCT t.id) AS total_trades,
    COALESCE(sum(t.quantity), (0)::bigint) AS total_volume,
    m.last_yes_price,
    m.last_no_price,
    m.created_at,
    m.close_at
   FROM ((public.markets m
     LEFT JOIN public.orders o ON ((o.market_id = m.id)))
     LEFT JOIN public.trades t ON ((t.market_id = m.id)))
  GROUP BY m.id;


--
-- Name: markets generate_market_code_trigger; Type: TRIGGER; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TRIGGER generate_market_code_trigger BEFORE INSERT ON public.markets FOR EACH ROW WHEN ((new.market_code IS NULL)) EXECUTE FUNCTION public.generate_market_code();


--
-- Name: orders generate_order_number_trigger; Type: TRIGGER; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON public.orders FOR EACH ROW WHEN ((new.order_number IS NULL)) EXECUTE FUNCTION public.generate_order_number();


--
-- Name: trades generate_trade_number_trigger; Type: TRIGGER; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TRIGGER generate_trade_number_trigger BEFORE INSERT ON public.trades FOR EACH ROW WHEN ((new.trade_number IS NULL)) EXECUTE FUNCTION public.generate_trade_number();


--
-- Name: markets update_markets_updated_at; Type: TRIGGER; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON public.markets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: trades update_trades_updated_at; Type: TRIGGER; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON public.trades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: wallets update_wallets_updated_at; Type: TRIGGER; Schema: public; Owner: AyodeleOnawunmi
--

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: kyc_verifications kyc_verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.kyc_verifications
    ADD CONSTRAINT kyc_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ledger_entries ledger_entries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: ledger_entries ledger_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: ledger_entries ledger_entries_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.ledger_entries
    ADD CONSTRAINT ledger_entries_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON DELETE RESTRICT;


--
-- Name: markets markets_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.markets
    ADD CONSTRAINT markets_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: markets markets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.markets
    ADD CONSTRAINT markets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: markets markets_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.markets
    ADD CONSTRAINT markets_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id);


--
-- Name: orders orders_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_market_id_fkey FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE RESTRICT;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: orders orders_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON DELETE RESTRICT;


--
-- Name: payment_transactions payment_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: payment_transactions payment_transactions_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON DELETE RESTRICT;


--
-- Name: resolution_evidence resolution_evidence_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.resolution_evidence
    ADD CONSTRAINT resolution_evidence_market_id_fkey FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE CASCADE;


--
-- Name: resolution_evidence resolution_evidence_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.resolution_evidence
    ADD CONSTRAINT resolution_evidence_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);


--
-- Name: resolution_evidence resolution_evidence_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.resolution_evidence
    ADD CONSTRAINT resolution_evidence_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- Name: resolution_votes resolution_votes_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.resolution_votes
    ADD CONSTRAINT resolution_votes_market_id_fkey FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE CASCADE;


--
-- Name: resolution_votes resolution_votes_resolver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.resolution_votes
    ADD CONSTRAINT resolution_votes_resolver_id_fkey FOREIGN KEY (resolver_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: trades trades_buy_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_buy_order_id_fkey FOREIGN KEY (buy_order_id) REFERENCES public.orders(id) ON DELETE RESTRICT;


--
-- Name: trades trades_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: trades trades_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_market_id_fkey FOREIGN KEY (market_id) REFERENCES public.markets(id) ON DELETE RESTRICT;


--
-- Name: trades trades_sell_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_sell_order_id_fkey FOREIGN KEY (sell_order_id) REFERENCES public.orders(id) ON DELETE RESTRICT;


--
-- Name: trades trades_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: wallets wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: AyodeleOnawunmi
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict Odcf6gkgY5OwYsYGJicBachPiuJxAIikqrzTWOBdZyDeTPSZPELv9nBY5KRxt2S

