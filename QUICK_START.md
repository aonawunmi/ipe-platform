# IPE Platform - Quick Deployment Reference

## Pre-Deployment Checklist

✅ Backend builds successfully (`npm run build` completed)
✅ Database schema exported (`schema.sql` created)
✅ Deployment files created (Procfile, .dockerignore)
✅ Seed script prepared (`seed-production.sql`)
✅ Password generator script ready (`generate-password.js`)

---

## Rapid Deployment Steps

### 1. Deploy Backend to Railway (5 minutes)

```bash
# Create account at https://railway.app

# Deploy via GitHub (recommended):
1. Push code to GitHub
2. Railway → New Project → Deploy from GitHub
3. Select repository

# Or use Railway CLI:
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```

**Add PostgreSQL Database:**
- Railway Dashboard → "+ New" → Database → PostgreSQL
- Note the credentials automatically generated

**Set Environment Variables:**
```env
DATABASE_HOST=<from PostgreSQL service>
DATABASE_PORT=5432
DATABASE_USER=<from PostgreSQL service>
DATABASE_PASSWORD=<from PostgreSQL service>
DATABASE_NAME=<from PostgreSQL service>

# Generate these:
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<run again for different value>

JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
NODE_ENV=production
PORT=3000

# Add after frontend deployed:
FRONTEND_URL=https://your-app.vercel.app
```

### 2. Set Up Production Database (5 minutes)

**Connect to Railway PostgreSQL:**
```bash
# Get connection string from Railway PostgreSQL service
# Format: postgresql://user:pass@host:port/database

# Import schema
psql "<RAILWAY_POSTGRES_CONNECTION_STRING>" -f backend/schema.sql

# Generate password hashes
cd backend
node generate-password.js "Password123!"    # Copy hash
node generate-password.js "Admin123!"       # Copy hash

# Edit seed-production.sql and paste hashes
# Then run seed script
psql "<RAILWAY_POSTGRES_CONNECTION_STRING>" -f backend/seed-production.sql
```

**Verify Database:**
```bash
psql "<CONNECTION_STRING>" -c "SELECT email FROM users;"
psql "<CONNECTION_STRING>" -c "SELECT market_code FROM markets;"
```

### 3. Deploy Frontend to Vercel (3 minutes)

```bash
# Create account at https://vercel.com

# Deploy via Vercel Dashboard:
1. Go to https://vercel.com/new
2. Import Git Repository
3. Root Directory: "frontend"
4. Add Environment Variable:
   - NEXT_PUBLIC_API_URL = https://your-backend.up.railway.app
5. Click "Deploy"

# Or use Vercel CLI:
npm install -g vercel
cd frontend
vercel --prod
```

**Update Backend CORS:**
After deployment, add Vercel URL to Railway backend env:
```env
FRONTEND_URL=https://your-app.vercel.app
```

Redeploy backend for CORS changes to take effect.

### 4. Test Production (2 minutes)

**Backend Health Check:**
```bash
curl https://your-backend.up.railway.app/
curl https://your-backend.up.railway.app/markets
```

**Frontend Test:**
Open browser: `https://your-app.vercel.app`
- Register new account
- Login with: tester@ipe.com / Password123!
- View markets list
- Place test order

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| 500 errors | Check Railway logs for error details |
| CORS errors | Verify FRONTEND_URL matches Vercel URL exactly |
| Build fails | Check Node.js version, clear cache, retry |
| Orders fail | Verify user has wallet with balance |
| Database timeout | Check Railway PostgreSQL service status |

---

## Production Credentials

**Test User:**
- Email: tester@ipe.com
- Password: Password123!
- Balance: ₦10,000.00

**Admin User:**
- Email: admin@ipe.com
- Password: Admin123!
- Balance: ₦100,000.00

---

## Important URLs

**Railway:**
- Backend API: https://your-project.up.railway.app
- API Docs: https://your-project.up.railway.app/api/docs
- PostgreSQL: Internal Railway connection

**Vercel:**
- Frontend: https://your-app.vercel.app

**Documentation:**
- Full Guide: `DEPLOYMENT_GUIDE.md`
- Backend Schema: `backend/schema.sql`
- Seed Script: `backend/seed-production.sql`

---

## Cost Estimate

- Railway: $5-10/month (backend + PostgreSQL)
- Vercel: Free (Hobby plan sufficient for testing)
- **Total: ~$5-10/month**

---

## Next Steps After Deployment

1. Share production URL with testers
2. Monitor Railway logs for errors
3. Check Vercel Analytics for traffic
4. Gather feedback from testers
5. Iterate based on feedback

---

## Support Resources

- Railway Discord: https://discord.gg/railway
- Vercel Support: support@vercel.com
- NestJS Docs: https://docs.nestjs.com
- Next.js Docs: https://nextjs.org/docs

---

**Ready to deploy? Follow the numbered steps above! 🚀**
