# Railway Setup - Simplified Guide

## ✅ Code Updated: Now supports Railway's DATABASE_URL!

Your backend now works with **one simple variable** instead of 5 separate ones.

---

## 🚂 Step 1: Find PostgreSQL Credentials

### Visual Guide:

1. **Go to Railway Dashboard**: https://railway.app
2. **Click on your Project** (e.g., "ipe-platform")
3. **You'll see cards/boxes for each service**:
   ```
   ┌─────────────┐  ┌─────────────┐
   │  Backend    │  │ PostgreSQL  │ ← Click this one!
   └─────────────┘  └─────────────┘
   ```
4. **Inside PostgreSQL service**, look for tabs at the top:
   ```
   [Deployments] [Variables] [Settings] [Metrics]
                      ↑
                Click here!
   ```
5. **In Variables tab**, you'll see:
   ```
   PGHOST = containers-us-west-123.railway.app
   PGPORT = 5432
   PGUSER = postgres
   PGPASSWORD = veryLongRandomPassword123...
   PGDATABASE = railway
   DATABASE_URL = postgresql://postgres:veryLong...@containers-us-west...
   ```

### Copy DATABASE_URL:
Look for the line that starts with:
```
DATABASE_URL = postgresql://...
```

Copy the **entire value** after the `=` sign.

---

## 🔧 Step 2: Configure Backend Service

1. **Go back to your project dashboard**
2. **Click on your Backend service card**
3. **Go to Variables tab**
4. **Click "+ New Variable"**
5. **Add these variables:**

### Required Variables:

```env
# Database (ONE VARIABLE - Easy!)
DATABASE_URL=<paste the value you copied from PostgreSQL service>

# JWT Secrets (Generate these)
JWT_SECRET=<generate below>
JWT_REFRESH_SECRET=<generate below>

# JWT Expiry
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# App Config
NODE_ENV=production
PORT=3000

# Frontend URL (add after deploying frontend)
FRONTEND_URL=https://your-app.vercel.app
```

### Generate JWT Secrets:

Run these commands locally:
```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET (run again for different value)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste into Railway variables.

---

## 🗄️ Step 3: Setup Database Schema

### Option A: Railway CLI (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Get PostgreSQL connection string
railway variables

# Connect and import schema
railway run psql $DATABASE_URL -f backend/schema.sql

# Generate password hashes
cd backend
node generate-password.js "Password123!"     # Copy output
node generate-password.js "Admin123!"        # Copy output

# Edit seed-production.sql and paste hashes
# Then seed the database
railway run psql $DATABASE_URL -f backend/seed-production.sql
```

### Option B: Direct psql Connection

From Railway PostgreSQL Variables tab, get the DATABASE_URL and use:

```bash
# Import schema
psql "<DATABASE_URL_HERE>" -f backend/schema.sql

# Generate password hashes
cd backend
node generate-password.js "Password123!"
node generate-password.js "Admin123!"

# Edit backend/seed-production.sql with the hashes
# Then run seed script
psql "<DATABASE_URL_HERE>" -f backend/seed-production.sql
```

**Example DATABASE_URL format:**
```
postgresql://postgres:pass123@containers-us-west-123.railway.app:5432/railway
```

### Verify Database:

```bash
# Check users
psql "<DATABASE_URL>" -c "SELECT email, role FROM users;"

# Check markets
psql "<DATABASE_URL>" -c "SELECT market_code, title FROM markets;"

# Check wallets
psql "<DATABASE_URL>" -c "SELECT u.email, w.balance_available/100.0 as balance FROM wallets w JOIN users u ON w.user_id = u.id;"
```

---

## ✅ Step 4: Verify Deployment

Railway will auto-deploy after you add variables.

### Check Backend Logs:

In Railway:
1. Click Backend service
2. Go to "Deployments" tab
3. Click latest deployment
4. View logs - look for:
   ```
   🎯 IPE Platform API Server Running
   📡 API Server: http://...
   ```

### Get Your Backend URL:

In Railway Backend service → Settings → Look for:
```
Domain: your-app.up.railway.app
```

### Test Your API:

```bash
# Health check
curl https://your-app.up.railway.app/

# Markets endpoint
curl https://your-app.up.railway.app/markets

# API docs
open https://your-app.up.railway.app/api/docs
```

---

## 🎯 Quick Reference

### Where to find things in Railway:

| What | Where |
|------|-------|
| PostgreSQL credentials | PostgreSQL service → Variables tab |
| Backend logs | Backend service → Deployments → Click latest |
| Add environment variables | Backend service → Variables → "+ New Variable" |
| Backend URL | Backend service → Settings → Domain section |
| Database connection | PostgreSQL service → Connect tab |

### Environment Variables Checklist:

- [ ] `DATABASE_URL` (copied from PostgreSQL service)
- [ ] `JWT_SECRET` (generated with crypto)
- [ ] `JWT_REFRESH_SECRET` (generated with crypto)
- [ ] `JWT_EXPIRES_IN` = `7d`
- [ ] `JWT_REFRESH_EXPIRES_IN` = `30d`
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3000`
- [ ] `FRONTEND_URL` (add after Vercel deployment)

---

## 🆘 Troubleshooting

### "Can't find PostgreSQL credentials"

**Solution**:
1. Make sure PostgreSQL service is fully deployed (takes 1-2 minutes)
2. Refresh the page
3. Look for the "Variables" tab (not "Settings")

### "Database connection failed"

**Check**:
- DATABASE_URL is copied correctly (entire string)
- PostgreSQL service is running (green indicator)
- No extra spaces in DATABASE_URL

### "Backend build failed"

**Check Railway logs**:
- Backend service → Deployments → Click failed deployment → View logs
- Look for specific error message

### "Can't run psql commands"

**Install PostgreSQL client**:
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Windows
# Download from: https://www.postgresql.org/download/windows/
```

---

## 📝 Summary

**What we simplified:**

❌ **Old way** (5 variables):
```
DATABASE_HOST
DATABASE_PORT
DATABASE_USER
DATABASE_PASSWORD
DATABASE_NAME
```

✅ **New way** (1 variable):
```
DATABASE_URL
```

**Your backend automatically uses DATABASE_URL if available, falls back to individual variables if not!**

---

## Next: Deploy Frontend to Vercel

Once backend is running, follow these steps:

1. Go to https://vercel.com
2. Import your GitHub repository
3. Set Root Directory: `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.up.railway.app`
5. Deploy

Then update Railway backend with:
```
FRONTEND_URL=https://your-app.vercel.app
```

---

**Need help? Share a screenshot of what you're seeing in Railway!**
