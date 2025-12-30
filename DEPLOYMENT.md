# Joyo - Vercel Deployment Guide

This guide covers the complete CI/CD setup for deploying Joyo to Vercel.

---

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Already set up at `thomasveit89/experience-builder`
3. **Supabase Project** - Your existing Supabase instance
4. **API Keys** - Anthropic and Unsplash API keys

---

## Initial Vercel Setup

### 1. Import Your Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select "Import Git Repository"
3. Choose `thomasveit89/experience-builder`
4. Vercel will auto-detect Next.js configuration

### 2. Configure Build Settings

Vercel should auto-detect these settings (verify they're correct):

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install`
- **Node Version**: 20.x (latest LTS)

### 3. Configure Environment Variables

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

#### Required for All Environments

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AI & Media APIs
ANTHROPIC_API_KEY=your-anthropic-api-key
UNSPLASH_ACCESS_KEY=your-unsplash-access-key

# Application URL (update after first deployment)
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

**Important**: After your first deployment, update `NEXT_PUBLIC_APP_URL` with your actual Vercel domain.

#### How to Add Environment Variables

1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. For each variable:
   - Enter the **Name** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter the **Value** (paste your actual value)
   - Select environments: **Production**, **Preview**, and **Development**
   - Click "Add"

### 4. Deploy

Click **Deploy** and Vercel will:
1. Clone your repository
2. Install dependencies
3. Build your Next.js app
4. Deploy to a production URL

---

## GitHub Actions CI Setup

The project includes a GitHub Actions workflow ([.github/workflows/ci.yml](.github/workflows/ci.yml)) that runs on every push and pull request.

### Configure GitHub Secrets

Add these secrets to your GitHub repository for CI builds:

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret" for each:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
UNSPLASH_ACCESS_KEY
```

### What the CI Pipeline Does

The workflow runs two jobs:

1. **Lint and Type Check**
   - Runs ESLint to check code quality
   - Runs TypeScript compiler to verify types

2. **Build**
   - Runs full production build
   - Uploads build artifacts for inspection
   - Only runs if linting and type checking pass

---

## Deployment Workflow

### Automatic Deployments

Vercel automatically deploys:

- **Production**: Every push to `main` branch → Production URL
- **Preview**: Every push to other branches or PRs → Unique preview URL

### Manual Deployments

From Vercel Dashboard:
1. Go to your project
2. Click "Deployments"
3. Click "⋯" menu → "Redeploy"

From CLI:
```bash
npm i -g vercel
vercel --prod
```

---

## Environment-Specific Configurations

### Production
- URL: `https://your-app.vercel.app` (or custom domain)
- Branch: `main`
- Environment Variables: Production values

### Preview (Staging)
- URL: Auto-generated for each PR (e.g., `joyo-git-feature-branch.vercel.app`)
- Branch: Any non-main branch
- Environment Variables: Can use same as production or separate values

### Development (Local)
- URL: `http://localhost:3000`
- Environment Variables: `.env.local` (not committed to git)

---

## Custom Domain Setup (Optional)

1. Go to your Vercel project
2. Navigate to Settings → Domains
3. Add your custom domain (e.g., `joyo.app`)
4. Follow DNS configuration instructions
5. Update `NEXT_PUBLIC_APP_URL` environment variable

---

## Supabase Configuration for Vercel

### Update Allowed URLs in Supabase

1. Go to your Supabase Dashboard
2. Navigate to Authentication → URL Configuration
3. Add these URLs to **Site URL** and **Redirect URLs**:
   - `https://your-vercel-app.vercel.app`
   - `https://your-vercel-app.vercel.app/**` (wildcard for all routes)
   - Your custom domain if you have one

### Database Migrations

Migrations are stored in [supabase/migrations](supabase/migrations).

To apply migrations to production:
```bash
npx supabase db push --db-url "postgresql://postgres:[password]@[host]:5432/postgres"
```

---

## Monitoring & Debugging

### Vercel Dashboard

- **Deployments**: View build logs and deployment history
- **Analytics**: Track page views, performance, and user metrics
- **Logs**: Real-time function logs (useful for debugging server actions)
- **Speed Insights**: Core Web Vitals and performance metrics

### Useful Commands

```bash
# View recent deployments
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Check environment variables
vercel env ls

# Pull environment variables to local
vercel env pull .env.local
```

---

## Performance Optimization

The [vercel.json](vercel.json) includes:

1. **Static Asset Caching**: `_next/static` cached for 1 year
2. **Dynamic Content**: Player pages revalidated on every request
3. **Image Optimization**: Automatic via Next.js Image component

### Additional Optimizations

- **Edge Runtime**: Consider moving server actions to edge for lower latency
- **ISR**: Implement Incremental Static Regeneration for published gifts
- **Analytics**: Enable Vercel Analytics for performance insights

---

## Rollback & Recovery

### Rollback to Previous Deployment

1. Go to Vercel Dashboard → Deployments
2. Find the working deployment
3. Click "⋯" → "Promote to Production"

### Database Rollback

Supabase doesn't support automatic rollbacks. Options:
1. Manually revert migrations
2. Restore from Supabase backups (Settings → Database → Backups)

---

## Troubleshooting

### Build Fails

**Check build logs in Vercel Dashboard**

Common issues:
- Missing environment variables
- TypeScript errors
- Dependency installation failures

Solution: Review logs, fix errors locally, push changes

### Environment Variables Not Working

- Ensure variables are added to correct environment (Production/Preview/Development)
- Redeploy after adding/changing environment variables
- Check variable names match exactly (case-sensitive)

### 404 on Routes After Deployment

- Verify middleware is not blocking routes
- Check Next.js rewrites/redirects in [vercel.json](vercel.json)
- Ensure locale prefixes are correct

### Supabase Auth Issues

- Verify Supabase redirect URLs include your Vercel domain
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ensure `NEXT_PUBLIC_APP_URL` matches your actual deployment URL

---

## CI/CD Pipeline Summary

```
┌─────────────────────────────────────────────────────────────┐
│ Developer pushes to GitHub                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ├─────────────────────────────────────┐
                  │                                     │
                  ▼                                     ▼
┌─────────────────────────────┐   ┌──────────────────────────┐
│ GitHub Actions CI           │   │ Vercel Auto-Deploy       │
│                             │   │                          │
│ 1. Lint code                │   │ 1. Clone repo            │
│ 2. Type check               │   │ 2. Install deps          │
│ 3. Build project            │   │ 3. Build                 │
│ 4. Upload artifacts         │   │ 4. Deploy                │
└─────────────────────────────┘   └──────────────────────────┘
                                              │
                                              ▼
                                  ┌──────────────────────────┐
                                  │ Live on Vercel           │
                                  │                          │
                                  │ Production (main branch) │
                                  │ or Preview (PR/branch)   │
                                  └──────────────────────────┘
```

---

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Rotate API keys regularly** - Update in Vercel dashboard
3. **Use environment-specific keys** - Different keys for preview vs production
4. **Enable Vercel authentication** - Protect preview deployments if needed
5. **Review Supabase RLS policies** - Ensure row-level security is configured

---

## Cost Optimization

### Vercel (Hobby Plan - Free)
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Edge Network

**Upgrade to Pro when needed:**
- Custom domains
- More bandwidth
- Team collaboration
- Advanced analytics

### Supabase (Free Tier)
- 500 MB database
- 1 GB file storage
- 50,000 monthly active users

Monitor usage in Supabase Dashboard → Settings → Billing

---

## Next Steps After Deployment

1. ✅ Verify deployment is successful
2. ✅ Test authentication flow with Vercel URL
3. ✅ Update `NEXT_PUBLIC_APP_URL` environment variable
4. ✅ Update Supabase redirect URLs
5. ✅ Test creating and sharing a gift journey
6. ✅ Set up custom domain (optional)
7. ✅ Enable Vercel Analytics
8. ✅ Monitor build times and performance
9. ✅ Set up team access if needed
10. ✅ Configure email notifications for failed deployments

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Supabase + Vercel**: https://supabase.com/docs/guides/hosting/vercel

---

**Happy Deploying! 🚀**
