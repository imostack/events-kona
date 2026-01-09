# Quick Deploy Guide: Admin Dashboard → Vercel

## 🚀 Fast Track (5 Minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Admin panel ready for deployment"
git push
```

### Step 2: Create Vercel Project
1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Import your repository
4. **CRITICAL:** Set **Root Directory** to `admin`
5. Click **"Deploy"**

### Step 3: Add Domain
1. In your new admin project: **Settings → Domains**
2. Click **"Add Domain"**
3. Enter: `admin-dash.appguts.com`
4. Click **"Add"**

### Step 4: Configure DNS
Since `appguts.com` is on Vercel:
- Vercel will **automatically configure** the subdomain
- Wait 2-5 minutes for propagation
- Done! Visit: `https://admin-dash.appguts.com`

## ✅ Login Credentials
- **Email:** admin@appguts.com
- **Password:** admin123

## 🎯 What You Get
- ✅ Modern admin dashboard
- ✅ User management
- ✅ Event management
- ✅ Analytics with charts
- ✅ Responsive design
- ✅ Dark mode ready

## 🔒 Before Going Live
Replace mock authentication:
1. Connect to real database
2. Implement JWT/session auth
3. Add 2FA
4. Enable rate limiting

## 📝 Full Documentation
See [ADMIN_DEPLOYMENT.md](../ADMIN_DEPLOYMENT.md) for complete guide.

## 🆘 Troubleshooting

**Build fails?**
- Ensure Root Directory is `admin` (not empty, not `/admin`)
- Check Vercel build logs

**Domain not working?**
- Wait 5-10 minutes
- Check DNS: `nslookup admin-dash.appguts.com`
- Verify domain added in Vercel

**404 errors?**
- Verify Root Directory setting
- Redeploy after changing root directory

## 📊 Architecture
```
appguts.com (Main Vercel Project)
    ↓
admin-dash.appguts.com (Separate Vercel Project)
    ↓ Root Directory: admin/
    ↓ Builds: /admin folder only
```

---

**That's it!** Your admin panel will be live at `admin-dash.appguts.com` 🎉
