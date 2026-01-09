# Admin Dashboard Deployment Guide

This guide explains how to deploy the EventsKona Admin Dashboard to `admin-dash.appguts.com`.

## Architecture

EventsKona uses a **multi-application architecture**:

- **Main App**: `appguts.com` (in root `/app` directory)
- **Admin Dashboard**: `admin-dash.appguts.com` (in `/admin` directory)

Both are separate Next.js applications sharing the same monorepo but deployed independently.

## Deployment Options

### Option 1: Vercel (Recommended)

#### Step 1: Deploy Main Application (Already Done)
Your main app is already deployed at `appguts.com`.

#### Step 2: Deploy Admin Dashboard

1. **Create New Vercel Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository: `Events-Kona`
   - Name it: `eventskona-admin` (or any name you prefer)

2. **🔥 CRITICAL: Configure Root Directory**
   - **BEFORE deploying**, click "Edit" next to Root Directory
   - Set **Root Directory** to: `admin`
   - This tells Vercel to build ONLY the admin folder
   - Framework Preset: Next.js (auto-detected)
   - Leave other settings as default

3. **Deploy**
   - Click "Deploy" button
   - Wait for initial deployment (2-3 minutes)

4. **Add Custom Domain**
   - After deployment, go to **Project Settings → Domains**
   - Click "Add Domain"
   - Enter: `admin-dash.appguts.com`
   - Click "Add"

#### Step 3: Configure DNS

Since you're using Vercel for `appguts.com`, add this subdomain:

**If appguts.com DNS is managed by Vercel:**
1. Go to your main `appguts.com` Vercel project
2. Settings → Domains
3. Click on `appguts.com` → "Edit"
4. Vercel should automatically recognize the subdomain

**If DNS is external (Cloudflare, Namecheap, etc):**
Add a CNAME record:

```
Type: CNAME
Name: admin-dash
Value: cname.vercel-dns.com
TTL: Auto or 3600
```

#### Step 4: Environment Variables (Optional for MVP)

The admin panel currently uses mock data. When ready for production, add these in Vercel Project Settings → Environment Variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.appguts.com

# Authentication (when implementing real auth)
NEXTAUTH_URL=https://admin-dash.appguts.com
NEXTAUTH_SECRET=your-random-secret-here
ADMIN_JWT_SECRET=your-jwt-secret

# Database (when connecting to real DB)
DATABASE_URL=your-postgresql-url
```

**Generate secrets:**
```bash
openssl rand -base64 32
```

### Option 2: Self-Hosted (VPS/Docker)

#### Using Docker

1. **Create Dockerfile** (in `/admin` directory):

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3001
CMD ["node", "server.js"]
```

2. **Build and Run**:

```bash
cd admin
docker build -t eventskona-admin .
docker run -p 3001:3001 eventskona-admin
```

3. **Nginx Reverse Proxy**:

```nginx
server {
    listen 80;
    server_name admin-dash.eventskona.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Local Development

### Running Both Apps Simultaneously

**Terminal 1 - Main App:**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Admin Dashboard:**
```bash
cd admin
npm run dev
# Runs on http://localhost:3001
```

## Security Checklist (Before Production)

- [ ] Replace mock authentication with real JWT/OAuth
- [ ] Enable 2FA for all admin accounts
- [ ] Implement rate limiting on login endpoints
- [ ] Add IP whitelisting for admin access
- [ ] Enable HTTPS only (no HTTP)
- [ ] Set secure cookie flags
- [ ] Implement CSRF protection
- [ ] Add session timeout (15 minutes idle)
- [ ] Store audit logs in database (not localStorage)
- [ ] Add password requirements (min 12 chars, special chars)
- [ ] Enable security headers (CSP, HSTS, X-Frame-Options)
- [ ] Set up monitoring and alerts
- [ ] Add backup admin access method
- [ ] Document disaster recovery process

## CI/CD Setup

### GitHub Actions (Optional)

Create `.github/workflows/deploy-admin.yml`:

```yaml
name: Deploy Admin Dashboard

on:
  push:
    branches: [main]
    paths:
      - 'admin/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        working-directory: ./admin
        run: npm ci
      - name: Build
        working-directory: ./admin
        run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.ADMIN_PROJECT_ID }}
          working-directory: ./admin
```

## Monitoring

### Recommended Tools

1. **Vercel Analytics** (if using Vercel)
2. **Sentry** for error tracking
3. **LogRocket** for session replay
4. **Uptime Robot** for downtime alerts

### Health Check Endpoint

Create `admin/app/api/health/route.ts`:

```typescript
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

Monitor: `https://admin-dash.eventskona.com/api/health`

## Troubleshooting

### Issue: 404 on subdomain
- **Solution**: Verify DNS CNAME record is pointing correctly
- Wait up to 48 hours for DNS propagation

### Issue: Build fails on Vercel
- **Solution**: Ensure Root Directory is set to `admin`
- Check that all dependencies are in `admin/package.json`

### Issue: Styles not loading
- **Solution**: Verify `tailwind.config.js` exists in `admin/` directory
- Check that `globals.css` is imported in `admin/app/layout.tsx`

### Issue: Can't access from main domain
- **Solution**: This is expected - admin should ONLY be accessible via `admin-dash.eventskona.com`
- Never expose admin routes on the main application

## Next Steps After Deployment

1. Test all functionality on production subdomain
2. Create admin user accounts for your team
3. Set up monitoring and alerts
4. Document admin procedures for your team
5. Plan migration from mock data to real backend API
6. Implement database for persistent storage
7. Set up automated backups
8. Create admin user onboarding documentation

## Support

For deployment issues, contact:
- App Guts Development Team
- Email: dev@appguts.com

---

**Last Updated**: January 2025
