# 🚀 Deployment Guide

This guide covers multiple deployment options for the AI Roadmap Planner, from simple static hosting to full CI/CD pipelines.

## 🎯 Quick Start Options

### Option 1: Vercel (Recommended)

**One-Click Deploy:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/AIRoadmapPlanner)

**Manual Deploy:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 2: Netlify

**Drag & Drop:**
1. Run `pnpm build`
2. Drag `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)

**CLI Deploy:**
```bash
npm i -g netlify-cli
pnpm build
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages

```bash
# Install gh-pages
npm i -g gh-pages

# Build and deploy
pnpm build
gh-pages -d dist
```

## 🔧 Platform-Specific Setup

### Vercel Configuration

Create `vercel.json` in project root:
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Netlify Configuration

Create `netlify.toml` in project root:
```toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Cloudflare Pages

**Build Settings:**
- Build command: `pnpm build`
- Build output directory: `dist`
- Root directory: `/`
- Node.js version: `20`

**Environment Variables:**
- `NODE_VERSION`: `20`
- `PNPM_VERSION`: `latest`

## 🔐 Security Headers Setup

### Content Security Policy

Add to your hosting platform's header configuration:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://generativelanguage.googleapis.com; img-src 'self' data: blob:; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
```

### Additional Security Headers

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## 🤖 CI/CD Setup

### GitHub Actions

The repository includes `.github/workflows/deploy.yml` for automated deployment. 

**Required Secrets:**

For Vercel:
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID  
- `VERCEL_PROJECT_ID`: Your Vercel project ID

For Netlify:
- `NETLIFY_AUTH_TOKEN`: Your Netlify API token
- `NETLIFY_SITE_ID`: Your Netlify site ID

### Workflow Features

✅ **Multi-platform testing** (Node.js 18, 20)
✅ **Code linting** with ESLint
✅ **Security auditing** with pnpm audit
✅ **Performance testing** with Lighthouse
✅ **Automated deployment** to multiple platforms
✅ **Build artifact caching** for faster deploys

## 🌍 Environment Variables

### Production Environment

```bash
# Optional: Custom API endpoint (if hosting backend separately)
VITE_API_URL=https://your-api-domain.com

# Optional: Enable/disable features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_OFFLINE_MODE=true

# Optional: Build optimizations
VITE_BUILD_SOURCEMAP=false
VITE_BUILD_MINIFY=true
```

### Development Environment

```bash
# Development server port
VITE_PORT=5173

# Enable hot module replacement
VITE_HMR=true

# Development API endpoint
VITE_API_URL=http://localhost:3000
```

## 🔍 Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
pnpm build
npx vite-bundle-analyzer dist

# Pre-compression
pnpm build && gzip -k dist/**/*.{js,css,html}
```

### CDN Configuration

**Vercel**: Automatic global CDN
**Netlify**: Automatic global CDN  
**Cloudflare**: Automatic global CDN with additional optimizations

### Caching Strategy

```javascript
// Service Worker (optional)
const CACHE_NAME = 'ai-roadmap-planner-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];
```

## 📊 Monitoring Setup

### Performance Monitoring

1. **Lighthouse CI**: Automated in GitHub Actions
2. **Vercel Analytics**: Enable in Vercel dashboard
3. **Google PageSpeed**: Monitor manually

### Error Tracking (Optional)

```bash
# Install Sentry
pnpm add @sentry/react @sentry/tracing

# Configure in main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
});
```

## 🐛 Troubleshooting

### Common Deployment Issues

**Build Failures:**
```bash
# Clear cache and rebuild
rm -rf node_modules .pnpm-store dist
pnpm install
pnpm build
```

**Routing Issues (SPA):**
- Ensure redirects are configured for your platform
- Check that `index.html` is served for all routes

**API Connection Issues:**
- Verify CORS settings if backend deployed separately
- Check CSP headers allow connections to AI API

### Platform-Specific Issues

**Vercel:**
- Check function timeout limits (10s on hobby plan)
- Ensure proper redirects in `vercel.json`

**Netlify:**
- Check build logs for dependency issues
- Verify `_redirects` file for SPA routing

**GitHub Pages:**
- Enable Pages in repository settings
- Set correct source branch (usually `gh-pages`)

## 📋 Deployment Checklist

Before deploying:

- [ ] Run `pnpm build` successfully
- [ ] Test production build locally with `pnpm preview`
- [ ] Verify all environment variables are set
- [ ] Check API key instructions are clear for users
- [ ] Test responsive design on mobile devices
- [ ] Verify offline functionality works
- [ ] Run security audit: `pnpm audit`
- [ ] Test with different browsers
- [ ] Validate accessibility with screen readers
- [ ] Set up error monitoring (optional)

After deploying:

- [ ] Test all major user flows
- [ ] Verify API integration works
- [ ] Check loading performance
- [ ] Test theme switching
- [ ] Verify export functionality
- [ ] Test offline capabilities
- [ ] Monitor error logs
- [ ] Set up performance monitoring

## 🚀 Advanced Deployment

### Multi-Environment Setup

```bash
# Staging environment
vercel --target staging

# Production environment  
vercel --target production
```

### Docker Deployment (Optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 4173
CMD ["pnpm", "preview", "--host", "0.0.0.0"]
```

### Backend Deployment

If deploying backend separately:

```bash
# Railway
railway deploy

# Render
render deploy

# Heroku
git push heroku main
```

---

Need help with deployment? Check the [main README](README.md) or open an issue on GitHub!
