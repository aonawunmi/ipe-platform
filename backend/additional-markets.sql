-- Additional Markets for IPE Platform
-- Creating 12 diverse prediction markets across different categories

INSERT INTO markets (
  market_code, title, description, category, tags,
  created_by, open_at, close_at, resolution_deadline,
  status, min_trade_amount, max_trade_amount,
  last_yes_price, last_no_price
)
SELECT
  market_data.market_code,
  market_data.title,
  market_data.description,
  market_data.category::market_category,
  market_data.tags,
  (SELECT id FROM users WHERE email = 'tester@ipe.com' LIMIT 1) as created_by,
  market_data.open_at,
  market_data.close_at,
  market_data.resolution_deadline,
  market_data.status::market_status,
  market_data.min_trade_amount,
  market_data.max_trade_amount,
  market_data.last_yes_price,
  market_data.last_no_price
FROM (
  VALUES
    -- Macroeconomics Markets
    (
      'MKT-2025-002',
      'Will the Naira trade below ₦1,000/$1 by June 2025?',
      'This market resolves YES if the official CBN exchange rate falls below ₦1,000 to $1 at any point before June 30, 2025. Resolution source: Central Bank of Nigeria official rates.',
      'macroeconomics',
      ARRAY['naira', 'exchange rate', 'CBN', 'dollar'],
      NOW(),
      NOW() + INTERVAL '180 days',
      NOW() + INTERVAL '195 days',
      'active',
      100,
      10000000,
      4500,
      5500
    ),
    (
      'MKT-2025-003',
      'Will Nigeria&apos;s GDP growth exceed 3.5% in 2025?',
      'This market resolves YES if Nigeria&apos;s official GDP growth rate for 2025 exceeds 3.5% as published by the National Bureau of Statistics. Resolution source: NBS annual GDP report.',
      'macroeconomics',
      ARRAY['GDP', 'Nigeria', 'economy', 'growth'],
      NOW(),
      NOW() + INTERVAL '365 days',
      NOW() + INTERVAL '400 days',
      'active',
      100,
      10000000,
      5200,
      4800
    ),
    (
      'MKT-2025-004',
      'Will crude oil prices exceed $100/barrel by September 2025?',
      'This market resolves YES if Brent Crude oil prices exceed $100 per barrel on any trading day before September 30, 2025. Resolution source: ICE Brent Crude futures closing prices.',
      'macroeconomics',
      ARRAY['oil', 'crude', 'energy', 'commodities'],
      NOW(),
      NOW() + INTERVAL '270 days',
      NOW() + INTERVAL '285 days',
      'active',
      100,
      10000000,
      3800,
      6200
    ),

    -- Capital Markets
    (
      'MKT-2025-005',
      'Will Dangote Cement share price reach ₦400 by December 2025?',
      'This market resolves YES if Dangote Cement (DANGCEM) share price reaches or exceeds ₦400 on the Nigerian Exchange at any point before December 31, 2025. Resolution source: NGX official data.',
      'capital_markets',
      ARRAY['Dangote', 'stocks', 'NGX', 'cement'],
      NOW(),
      NOW() + INTERVAL '365 days',
      NOW() + INTERVAL '380 days',
      'active',
      100,
      10000000,
      5500,
      4500
    ),
    (
      'MKT-2025-006',
      'Will any Nigerian bank complete an IPO in H1 2025?',
      'This market resolves YES if any commercial bank licensed in Nigeria successfully completes an Initial Public Offering before June 30, 2025. Resolution source: SEC Nigeria and NGX announcements.',
      'capital_markets',
      ARRAY['IPO', 'banking', 'Nigeria', 'listing'],
      NOW(),
      NOW() + INTERVAL '180 days',
      NOW() + INTERVAL '195 days',
      'active',
      100,
      10000000,
      2800,
      7200
    ),
    (
      'MKT-2025-007',
      'Will NGX market capitalization exceed ₦60 trillion by August 2025?',
      'This market resolves YES if the Nigerian Exchange total market capitalization exceeds ₦60 trillion at any daily close before August 31, 2025. Resolution source: NGX official market reports.',
      'capital_markets',
      ARRAY['NGX', 'market cap', 'Nigeria', 'stocks'],
      NOW(),
      NOW() + INTERVAL '240 days',
      NOW() + INTERVAL '255 days',
      'active',
      100,
      10000000,
      6100,
      3900
    ),

    -- Public Policy
    (
      'MKT-2025-008',
      'Will Nigeria implement new crypto regulations by Q3 2025?',
      'This market resolves YES if the Central Bank of Nigeria or Securities and Exchange Commission publishes formal cryptocurrency regulations before September 30, 2025. Resolution source: Official CBN/SEC publications.',
      'public_policy',
      ARRAY['crypto', 'regulation', 'CBN', 'blockchain'],
      NOW(),
      NOW() + INTERVAL '270 days',
      NOW() + INTERVAL '285 days',
      'active',
      100,
      10000000,
      4200,
      5800
    ),
    (
      'MKT-2025-009',
      'Will petrol subsidy be fully removed in Nigeria by June 2025?',
      'This market resolves YES if the Nigerian government officially announces complete removal of petroleum subsidy before June 30, 2025. Resolution source: Federal Ministry of Finance and NNPC announcements.',
      'public_policy',
      ARRAY['subsidy', 'petrol', 'NNPC', 'policy'],
      NOW(),
      NOW() + INTERVAL '180 days',
      NOW() + INTERVAL '195 days',
      'active',
      100,
      10000000,
      6500,
      3500
    ),
    (
      'MKT-2025-010',
      'Will AfCFTA trade volume exceed $50 billion in 2025?',
      'This market resolves YES if the African Continental Free Trade Area reports total intra-African trade volume exceeding $50 billion for 2025. Resolution source: AfCFTA Secretariat official reports.',
      'public_policy',
      ARRAY['AfCFTA', 'trade', 'Africa', 'economics'],
      NOW(),
      NOW() + INTERVAL '365 days',
      NOW() + INTERVAL '400 days',
      'active',
      100,
      10000000,
      3500,
      6500
    ),

    -- Corporate Events
    (
      'MKT-2025-011',
      'Will MTN Nigeria announce dividend payout exceeding ₦10/share in 2025?',
      'This market resolves YES if MTN Nigeria announces total dividend per share exceeding ₦10 for the 2025 financial year. Resolution source: MTN Nigeria official investor relations announcements.',
      'corporate_events',
      ARRAY['MTN', 'dividend', 'telecoms', 'stocks'],
      NOW(),
      NOW() + INTERVAL '365 days',
      NOW() + INTERVAL '400 days',
      'active',
      100,
      10000000,
      5800,
      4200
    ),
    (
      'MKT-2025-012',
      'Will Dangote Refinery achieve 500,000 bpd capacity by July 2025?',
      'This market resolves YES if Dangote Refinery officially announces or confirms daily refining capacity of 500,000 barrels per day or more before July 31, 2025. Resolution source: Dangote Group official statements.',
      'corporate_events',
      ARRAY['Dangote', 'refinery', 'oil', 'capacity'],
      NOW(),
      NOW() + INTERVAL '210 days',
      NOW() + INTERVAL '225 days',
      'active',
      100,
      10000000,
      7200,
      2800
    ),
    (
      'MKT-2025-013',
      'Will any Nigerian fintech achieve unicorn status ($1B valuation) in 2025?',
      'This market resolves YES if any Nigerian fintech company (e.g., Flutterwave, Paystack, OPay) achieves or announces a valuation of $1 billion or more before December 31, 2025. Resolution source: Official company announcements or credible funding round reports.',
      'corporate_events',
      ARRAY['fintech', 'unicorn', 'startup', 'valuation'],
      NOW(),
      NOW() + INTERVAL '365 days',
      NOW() + INTERVAL '380 days',
      'active',
      100,
      10000000,
      4800,
      5200
    )
) AS market_data(
  market_code, title, description, category, tags,
  open_at, close_at, resolution_deadline,
  status, min_trade_amount, max_trade_amount,
  last_yes_price, last_no_price
);
