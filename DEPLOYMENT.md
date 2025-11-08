# Deployment Guide - Vercel

## Quick Deploy to Vercel

### Method 1: One-Click Deploy (Easiest)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js configuration

### Method 2: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

## Environment Variables Setup

You only need to set **ONE** environment variable in Vercel:

### Required Environment Variable:

```
NEXTAUTH_SECRET=<your-generated-secret>
```

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

## Database Setup (Vercel Postgres)

### Steps:

1. **In your Vercel project dashboard:**
   - Click on the "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose your preferred region
   - Click "Create"

2. **Vercel automatically adds `DATABASE_URL`:**
   - No manual configuration needed
   - The environment variable is automatically injected

3. **Run database migrations:**

   After deploying, connect to your project and run:
   ```bash
   # Install Vercel CLI if you haven't
   npm i -g vercel

   # Link your project
   vercel link

   # Run migrations on production database
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

   Alternatively, use the Vercel dashboard to run this command:
   ```bash
   npx prisma migrate deploy
   ```

## Complete Setup Summary

### 1. GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/budget-tracker.git
git push -u origin main
```

### 2. Vercel Dashboard
- Import repository
- Add environment variable: `NEXTAUTH_SECRET`
- Create Postgres database in Storage tab

### 3. Deploy
- Vercel automatically deploys
- Run `npx prisma migrate deploy` after first deployment

## Post-Deployment

### Access Your App
- Your app will be live at: `https://your-project-name.vercel.app`
- Default language: Hungarian (https://your-project-name.vercel.app/hu)
- English: https://your-project-name.vercel.app/en

### First User
- Navigate to sign up page
- Create your first account
- Start managing your budget!

## Troubleshooting

### Issue: Database connection error
**Solution:** Make sure Vercel Postgres is created and linked to your project

### Issue: Build fails
**Solution:** Check environment variables are set correctly

### Issue: Authentication not working
**Solution:** Verify `NEXTAUTH_SECRET` is set in Vercel environment variables

## Custom Domain

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Updates

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically redeploy your changes!
