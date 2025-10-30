# IPE Platform - Production Deployment Guide

## Overview
This guide covers deploying the Information Prediction Exchange (IPE) platform to production:
- **Backend**: NestJS API deployed to Railway/Render
- **Database**: PostgreSQL managed database
- **Frontend**: Next.js app deployed to Vercel

---

## Prerequisites
- [Railway](https://railway.app) or [Render](https://render.com) account
- [Vercel](https://vercel.com) account
- GitHub repository (recommended for auto-deployment)
- Production-ready environment variables

---

## Part 1: Backend Deployment (Railway)

### Step 1: Build Backend Locally (Test)
```bash
cd backend
npm run build
```

Verify the build completes without errors. The compiled output will be in the `dist/` directory.

### Step 2: Create Railway Project

1. **Sign in to Railway**: https://railway.app
2. **Create New Project**: Click "New Project"
3. **Add PostgreSQL**:
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will provision a managed PostgreSQL instance
4. **Note Database Credentials**: Click on PostgreSQL service to view:
   - `DATABASE_HOST`
   - `DATABASE_PORT`
   - `DATABASE_USER`
   - `DATABASE_PASSWORD`
   - `DATABASE_NAME`

### Step 3: Deploy Backend to Railway

**Option A: GitHub Integration (Recommended)**
1. Push your code to GitHub
2. In Railway, click "+ New" → "GitHub Repo"
3. Select your repository
4. Railway will auto-detect Node.js and deploy

**Option B: Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Step 4: Configure Environment Variables

In Railway Dashboard → Your Backend Service → Variables, add:

```env
DATABASE_HOST=<from PostgreSQL service>
DATABASE_PORT=5432
DATABASE_USER=<from PostgreSQL service>
DATABASE_PASSWORD=<from PostgreSQL service>
DATABASE_NAME=<from PostgreSQL service>

JWT_SECRET=<generate-strong-random-string>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<generate-different-random-string>
JWT_REFRESH_EXPIRES_IN=30d

NODE_ENV=production
PORT=3000

FRONTEND_URL=https://your-app.vercel.app
```

**Generate Secure JWT Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 5: Run Database Migrations

Connect to your Railway PostgreSQL database:

```bash
PGPASSWORD=<password> psql -h <host> -U <user> -d <database> -p <port>
```

Run your database schema setup (paste your SQL schema):

```sql
-- Paste the entire schema from your local database
-- or use a migration tool
```

**Export Local Schema:**
```bash
pg_dump -h localhost -U postgres -d ipe_platform --schema-only > schema.sql
```

Then import to Railway:
```bash
PGPASSWORD=<railway-password> psql -h <railway-host> -U <railway-user> -d <railway-db> -p <railway-port> -f schema.sql
```

### Step 6: Verify Backend Deployment

Railway will provide a public URL (e.g., `https://your-app.up.railway.app`)

Test the API:
```bash
curl https://your-app.up.railway.app/
curl https://your-app.up.railway.app/markets
curl https://your-app.up.railway.app/api/docs
```

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Update Frontend Environment Variables

Create/update `frontend/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
```

### Step 2: Test Production Build Locally

```bash
cd frontend
npm run build
npm run start
```

Verify the app works correctly at http://localhost:3001

### Step 3: Deploy to Vercel

**Option A: Vercel Dashboard (Recommended)**
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your Git repository
4. Vercel auto-detects Next.js configuration
5. Set **Root Directory**: `frontend`
6. Add **Environment Variables**:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend.up.railway.app`
7. Click "Deploy"

**Option B: Vercel CLI**
```bash
npm install -g vercel
cd frontend
vercel --prod
```

### Step 4: Update Backend CORS

After getting your Vercel URL (e.g., `https://ipe-platform.vercel.app`), update Railway backend environment:

```env
FRONTEND_URL=https://ipe-platform.vercel.app
```

---

## Part 3: Post-Deployment Setup

### 1. Create Test Users

Connect to production database and create test accounts:

```sql
-- User 1: Tester Account
INSERT INTO users (email, password_hash, full_name, role, kyc_status)
VALUES (
  'tester@ipe.com',
  -- Use bcrypt to hash 'Password123!'
  '$2b$10$...',
  'Test User',
  'user',
  'pending'
);

-- Create wallet for test user
INSERT INTO wallets (user_id, balance_available)
SELECT id, 1000000
FROM users
WHERE email = 'tester@ipe.com';

-- User 2: Admin Account
INSERT INTO users (email, password_hash, full_name, role, kyc_status)
VALUES (
  'admin@ipe.com',
  '$2b$10$...',
  'Admin User',
  'admin',
  'approved'
);

INSERT INTO wallets (user_id, balance_available)
SELECT id, 10000000
FROM users
WHERE email = 'admin@ipe.com';
```

**Generate Password Hashes:**
```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('Password123!', 10).then(console.log);
```

### 2. Seed Initial Markets

Insert 3-5 test prediction markets for testers to explore:

```sql
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
  ARRAY['inflation', 'Nigeria', 'economy'],
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
-- Add more markets...
```

### 3. Configure Custom Domain (Optional)

**Vercel Custom Domain:**
1. Go to Vercel Project Settings → Domains
2. Add your domain (e.g., `ipe.com`)
3. Update DNS records as instructed
4. SSL certificate auto-provisions

**Railway Custom Domain:**
1. Go to Railway Project Settings → Networking
2. Add custom domain (e.g., `api.ipe.com`)
3. Update DNS CNAME record
4. SSL auto-provisions

### 4. Update CORS Again (if using custom domains)

```env
FRONTEND_URL=https://ipe.com,https://www.ipe.com
```

---

## Part 4: Testing Checklist

### Backend API Tests

- [ ] **Health Check**: `GET /` returns 200
- [ ] **Markets List**: `GET /markets` returns array
- [ ] **Market Detail**: `GET /markets/{id}` returns market data
- [ ] **Order Book**: `GET /markets/{id}/orderbook` returns bids/asks
- [ ] **API Docs**: `/api/docs` loads Swagger UI
- [ ] **User Registration**: `POST /auth/register` creates account
- [ ] **User Login**: `POST /auth/login` returns JWT token
- [ ] **Authenticated Endpoints**: Bearer token works

### Frontend Tests

- [ ] **Homepage** loads without errors
- [ ] **Markets Page** displays list of markets
- [ ] **Market Detail** page shows trading interface
- [ ] **User Registration** flow works
- [ ] **User Login** flow works
- [ ] **Order Placement** creates orders successfully
- [ ] **Wallet Page** shows balance and transactions
- [ ] **Portfolio Page** displays user orders
- [ ] **Navigation** works between all pages

### Integration Tests

- [ ] **Order Matching**: Place YES + NO orders, verify filling
- [ ] **Balance Locking**: Verify funds lock when placing orders
- [ ] **Transaction History**: Check ledger entries appear
- [ ] **Market Statistics**: Verify prices update after trades
- [ ] **Error Handling**: Test insufficient balance scenarios
- [ ] **CORS**: Verify no CORS errors in browser console

---

## Part 5: Monitoring & Maintenance

### Railway Monitoring

1. **Logs**: Railway Dashboard → Your Service → Logs
2. **Metrics**: CPU, Memory, Network usage visible in dashboard
3. **Alerts**: Configure alerts for service downtime
4. **Database Backups**: Railway auto-backs up PostgreSQL

### Vercel Monitoring

1. **Analytics**: Vercel Dashboard → Analytics
2. **Logs**: Real-time function logs
3. **Performance**: Core Web Vitals monitoring
4. **Alerts**: Email notifications for build failures

### Database Maintenance

**Regular Tasks:**
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('database_name'));

-- Vacuum analyze (optimize performance)
VACUUM ANALYZE;

-- Check active connections
SELECT count(*) FROM pg_stat_activity;
```

**Backup Strategy:**
- Railway provides automated daily backups
- Manual backup: `pg_dump` via Railway CLI
- Retention: 7 days on free tier, 30+ days on paid

---

## Part 6: Troubleshooting

### Common Issues

**Issue 1: 500 Internal Server Error on Backend**
- Check Railway logs for error details
- Verify all environment variables are set
- Ensure database migrations ran successfully
- Check database connection string

**Issue 2: CORS Errors**
- Verify `FRONTEND_URL` in backend matches Vercel URL exactly
- Include both `www` and non-`www` versions if needed
- Check browser console for specific CORS error message

**Issue 3: Order Placement Fails**
- Verify user has wallet with sufficient balance
- Check database constraints (e.g., `valid_prices`)
- Review matching engine logs
- Test with smaller amounts first

**Issue 4: Database Connection Timeouts**
- Check Railway PostgreSQL service status
- Verify connection pool settings in TypeORM config
- Consider upgrading Railway plan if hitting connection limits

**Issue 5: Build Failures**
- Check Node.js version compatibility
- Verify all dependencies in package.json
- Review build logs for specific error
- Clear build cache and retry

---

## Production Credentials

### Test Account for Testers

**Email**: tester@ipe.com
**Password**: Password123!
**Initial Balance**: ₦10,000.00

**Admin Account**

**Email**: admin@ipe.com
**Password**: Admin123!
**Initial Balance**: ₦100,000.00

---

## Cost Estimation

### Railway (Backend + Database)
- **Hobby Plan**: $5/month (500 hours execution, 8GB RAM, 100GB bandwidth)
- **Developer Plan**: $10/month (unlimited execution)
- **PostgreSQL**: Included in plan

### Vercel (Frontend)
- **Hobby Plan**: Free (100GB bandwidth, unlimited sites)
- **Pro Plan**: $20/month (1TB bandwidth, advanced features)

**Total Monthly Cost (Starting)**: $5-15/month

---

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Set up PostgreSQL database and run migrations
3. ✅ Deploy frontend to Vercel
4. ✅ Create test users and seed markets
5. ✅ Share production URL with testers
6. 📊 Collect feedback and monitor errors
7. 🚀 Iterate and improve based on testing

---

## Support & Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **NestJS Docs**: https://docs.nestjs.com
- **Next.js Docs**: https://nextjs.org/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## Security Checklist

Before sharing with testers:

- [ ] Strong JWT secrets generated and set
- [ ] Database password is secure (auto-generated by Railway)
- [ ] CORS restricted to frontend domain only
- [ ] API rate limiting configured (if high traffic expected)
- [ ] SQL injection protection via TypeORM (already handled)
- [ ] XSS protection via React (already handled)
- [ ] HTTPS enforced (automatic on Railway + Vercel)
- [ ] Environment variables never committed to Git
- [ ] Test accounts have limited balance

---

**Deployment Completed! 🎉**

Your IPE Platform is now live and ready for testing.
