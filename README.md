# Information Prediction Exchange (IPE) - MVP

Nigeria's first regulated, Naira-denominated prediction market platform.

## 🎯 Project Overview

IPE enables users to trade on outcomes of real-world events, generating crowd-sourced probability data for policymakers, businesses, and investors.

**MVP Timeline:** 4-6 months
**Target:** 1,000 users, 10 active markets, SEC/CBN sandbox approval

## 🏗️ Architecture

### Tech Stack

**Backend:**
- **Runtime:** Node.js 20+ with TypeScript
- **Framework:** NestJS (modular, scalable architecture)
- **Database:** PostgreSQL 15+ (primary data store)
- **Cache:** Redis 7+ (order books, sessions)
- **API:** REST + WebSockets (real-time prices)

**Frontend:**
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** React Query + Zustand
- **WebSocket:** Socket.io client

**Infrastructure:**
- **Hosting:** AWS (ECS/Fargate)
- **Storage:** S3 (documents, evidence)
- **CDN:** CloudFront
- **Monitoring:** CloudWatch + OpenTelemetry

### Project Structure

```
ipe-platform/
├── backend/           # NestJS API server
│   ├── src/
│   │   ├── auth/       # Authentication & JWT
│   │   ├── users/      # User management
│   │   ├── wallets/    # Wallet & ledger
│   │   ├── markets/    # Market management
│   │   ├── orders/     # Order placement
│   │   ├── trades/     # Trade execution & matching
│   │   ├── payments/   # Paystack integration
│   │   ├── kyc/        # VerifyMe integration
│   │   ├── resolution/ # Market resolution
│   │   └── admin/      # Admin dashboard APIs
│   ├── test/
│   └── package.json
├── frontend/          # Next.js web app
│   ├── app/
│   │   ├── (auth)/     # Login/signup
│   │   ├── (app)/      # Main app routes
│   │   │   ├── markets/    # Market discovery
│   │   │   ├── trade/      # Trading interface
│   │   │   ├── portfolio/  # User positions
│   │   │   └── wallet/     # Deposits/withdrawals
│   │   └── admin/      # Admin console
│   ├── components/
│   ├── lib/
│   └── package.json
├── shared/            # Shared TypeScript types
│   └── types/
├── database/          # Database schemas & migrations
│   ├── schema.sql
│   └── migrations/
└── docs/              # Documentation
    ├── API.md
    ├── DEPLOYMENT.md
    └── TESTING.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- pnpm (recommended) or npm

### Installation

1. **Clone and install dependencies:**
```bash
cd ipe-platform
pnpm install --recursive
```

2. **Set up PostgreSQL database:**
```bash
createdb ipe_platform
psql ipe_platform < database/schema.sql
```

3. **Configure environment variables:**
```bash
# Backend (.env)
cp backend/.env.example backend/.env

# Required:
DATABASE_URL=postgresql://user:pass@localhost:5432/ipe_platform
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
PAYSTACK_SECRET_KEY=sk_test_xxx
VERIFYME_API_KEY=your-verifyme-key
```

4. **Run development servers:**
```bash
# Terminal 1: Backend
cd backend && pnpm dev

# Terminal 2: Frontend
cd frontend && pnpm dev

# Terminal 3: Redis
redis-server
```

## 📋 MVP Features

### Phase 1 (Months 1-2): Foundation

- [x] Database schema design
- [ ] User authentication (JWT)
- [ ] Wallet management (deposits, withdrawals)
- [ ] Paystack integration
- [ ] KYC verification (VerifyMe)
- [ ] Basic admin dashboard

### Phase 2 (Months 3-4): Trading Core

- [ ] Market creation workflow
- [ ] Order placement system
- [ ] Matching engine (FIFO order book)
- [ ] Trade execution
- [ ] Position tracking
- [ ] Real-time price feeds (WebSocket)

### Phase 3 (Months 5-6): Resolution & Polish

- [ ] Manual resolution console
- [ ] Evidence submission
- [ ] Settlement automation
- [ ] Email notifications
- [ ] Mobile-responsive UI
- [ ] SEC/CBN sandbox application

## 🔐 Security Features

- **Authentication:** JWT with refresh tokens
- **Authorization:** Role-based access control (RBAC)
- **Encryption:** AES-256 for sensitive data at rest
- **Transport:** TLS 1.3 for all connections
- **Rate Limiting:** Per-user and per-endpoint
- **Audit Logs:** Immutable transaction history
- **KYC:** Multi-tier verification (₦50k → ₦500k → unlimited)

## 💳 Payment Integration

### Paystack (Primary)

**Deposits:**
- Card payments
- Bank transfers
- Webhook verification

**Withdrawals:**
- Transfer to Nigerian banks
- Automatic reconciliation

### Transaction Limits (MVP)

| Tier | Daily Limit | Monthly Limit | Verification |
|------|-------------|---------------|--------------|
| Tier 0 | ₦0 | ₦0 | Email only |
| Tier 1 | ₦50,000 | ₦500,000 | BVN |
| Tier 2 | ₦500,000 | ₦5,000,000 | NIN |
| Tier 3 | Unlimited | Unlimited | Business registration |

## 🧪 Testing

```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:e2e

# Load testing (order matching)
pnpm test:load
```

## 📊 Database Schema Highlights

**Core Entities:**
- `users` - Authentication & KYC
- `wallets` - Naira balances & limits
- `ledger_entries` - Double-entry accounting
- `markets` - Event markets & metadata
- `orders` - Buy/sell orders (order book)
- `trades` - Matched trades
- `payment_transactions` - Deposits & withdrawals

**Key Features:**
- UUID primary keys
- JSONB for flexible metadata
- Automatic timestamp tracking
- Audit logging built-in
- Views for common queries

## 🚀 Deployment

### MVP Deployment (AWS)

**Components:**
- **ECS Fargate:** Container orchestration
- **RDS PostgreSQL:** Managed database
- **ElastiCache Redis:** Order book cache
- **ALB:** Load balancing + SSL
- **S3:** File storage
- **CloudWatch:** Logging & monitoring

**Estimated Costs:** ~$300/month for MVP load

## 🎯 Success Metrics (MVP)

**User Acquisition:**
- 1,000 registered users
- 300+ KYC-verified users
- 50+ daily active users

**Trading Volume:**
- 10 active markets
- 10,000+ contracts traded
- ₦5M+ total volume

**Technical:**
- 99.5% uptime
- <200ms API latency
- <1s order matching

**Regulatory:**
- SEC sandbox application approved
- Paystack partnership active
- VerifyMe integration live

## 📞 Support & Documentation

- **API Docs:** `http://localhost:3000/api/docs` (Swagger)
- **Database Docs:** See `database/schema.sql` comments
- **Architecture:** See `docs/ARCHITECTURE.md`

## 🤝 Contributing

This is a private MVP project. For questions or contributions, contact the project lead.

## 📜 License

Proprietary - © 2025 Information Prediction Exchange

---

**Built with ❤️ for Nigeria's fintech ecosystem**
