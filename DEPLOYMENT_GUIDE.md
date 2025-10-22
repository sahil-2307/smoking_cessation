# 🚀 Deployment Guide - Vercel + GitHub

Your PWA changes have been pushed to GitHub and should automatically deploy to Vercel!

---

## ✅ What Just Happened

1. **Committed Changes:**
   - 26 files changed (PWA components, icons, configs)
   - 2,214 insertions

2. **Pushed to GitHub:**
   - Branch: `main`
   - Commit: `2e6bec5`
   - Repository: `sahil-2307/smoking_cessation`

3. **Automatic Deployment:**
   - Vercel detects the push automatically
   - Starts building your PWA
   - Deploys to production URL

---

## 📊 Monitor Deployment

### Option 1: Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your `smoking_cessation` project
3. Click on it to see deployment status
4. Wait for "Building" → "Ready"

### Option 2: GitHub Actions (if enabled)
1. Go to your GitHub repository
2. Click "Actions" tab
3. See the deployment workflow running

### Check Deployment Status:
```bash
# If you have Vercel CLI installed
vercel list

# Or check logs
vercel logs
```

---

## 🔍 What to Check After Deployment

### 1. Visit Your Production URL
Your app should be at: `https://smoking-cessation-[hash].vercel.app`

Or your custom domain if configured.

### 2. Test PWA Installation

**Desktop (Chrome/Edge):**
- [ ] Install button appears in navbar
- [ ] Floating install card shows on dashboard
- [ ] Click "Install" button works
- [ ] App icon appears on desktop
- [ ] App opens in standalone window

**Mobile (iOS - Safari):**
- [ ] Open your production URL in Safari
- [ ] See install instructions card
- [ ] Tap Share → Add to Home Screen
- [ ] App icon appears on home screen
- [ ] Opens fullscreen (no Safari UI)

**Mobile (Android - Chrome):**
- [ ] Install prompt appears automatically
- [ ] Or use "Install App" button
- [ ] App icon on home screen
- [ ] Opens in standalone mode

### 3. Verify PWA Features

- [ ] **Service Worker:** Check DevTools → Application → Service Workers
- [ ] **Manifest:** Check DevTools → Application → Manifest
- [ ] **Icons:** Verify all 8 icon sizes load
- [ ] **Offline:** Disconnect internet, app still works
- [ ] **App Shortcuts:** Long-press icon shows SOS, Log, Check-in

### 4. Check Build Output

In Vercel dashboard, verify:
- [ ] Build succeeded without errors
- [ ] Service worker generated (`sw.js`)
- [ ] All icons deployed
- [ ] Manifest.json accessible

---

## 🔧 Environment Variables

Make sure these are set in Vercel dashboard:

### Required Variables:
1. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Format: `https://[project-id].supabase.co`

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous key
   - Found in Supabase → Settings → API

### How to Set:
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable for Production, Preview, and Development

---

## 🎯 Deployment Configuration

Your `vercel.json` is configured with:

### Build Settings:
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Region:** Mumbai (`bom1`) - optimized for India

### PWA Headers:
- **Service Worker:** No cache, always fresh
- **Manifest:** Cached for 1 week
- **Icons:** Cached for 1 year (immutable)

### Environment:
- Supabase credentials from Vercel secrets
- Automatic injection during build

---

## 🐛 Troubleshooting

### Deployment Failed?

**Check Build Logs:**
1. Vercel Dashboard → Deployments
2. Click failed deployment
3. View build logs

**Common Issues:**
- Missing environment variables → Add in Vercel settings
- TypeScript errors → `typescript.ignoreBuildErrors: true` in next.config.js
- Dependency issues → Clear cache and redeploy

**Fix and Redeploy:**
```bash
# Fix the issue locally
# Commit and push again
git add .
git commit -m "Fix deployment issue"
git push origin main
# Vercel auto-deploys again
```

### PWA Not Working?

**Service Worker Not Registering:**
- Check browser console for errors
- Verify HTTPS (required for PWA)
- Check `sw.js` is accessible at `/sw.js`

**Install Prompt Not Showing:**
- Already installed? Check display mode
- Clear site data and reload
- Check DevTools → Application → Manifest

**Icons Not Loading:**
- Verify `/icons/icon-192x192.png` is accessible
- Check manifest.json references correct paths
- Check Content-Type headers

---

## 📱 Custom Domain (Optional)

### Add Your Domain:
1. Vercel Dashboard → Project → Settings
2. Domains → Add Domain
3. Enter your domain (e.g., `quitsmoking.app`)
4. Follow DNS configuration steps
5. Wait for SSL certificate (automatic)

### Update PWA Manifest:
After adding domain, update `public/manifest.json`:
```json
{
  "start_url": "https://yourdomain.com/dashboard",
  "scope": "https://yourdomain.com/"
}
```

Then commit and push again.

---

## 🔄 Continuous Deployment

Your setup now has **automatic deployments**:

### Every Push to Main:
- Automatically builds and deploys
- Production deployment
- Takes ~2-5 minutes

### Pull Requests:
- Creates preview deployment
- Unique URL for testing
- No impact on production

### Branch Deployments:
- Push to any branch → preview URL
- Test before merging to main

---

## 📊 Monitor Performance

### Vercel Analytics (if enabled):
- Real user metrics
- Core Web Vitals
- Performance scores

### Check PWA Score:
1. Open DevTools → Lighthouse
2. Select "Progressive Web App"
3. Run audit
4. Aim for 90+ score

### Monitor Service Worker:
```javascript
// In browser console
navigator.serviceWorker.getRegistrations()
  .then(regs => console.log(regs));
```

---

## ✅ Post-Deployment Checklist

After successful deployment:

- [ ] Visit production URL
- [ ] Test install on desktop browser
- [ ] Test install on iOS device
- [ ] Test install on Android device
- [ ] Verify offline functionality works
- [ ] Test all app shortcuts
- [ ] Check splash screen appears
- [ ] Verify push notifications (after setup)
- [ ] Run Lighthouse PWA audit (aim for 90+)
- [ ] Share production URL with users!

---

## 🎉 You're Live!

Your QuitSmoking PWA is now deployed and accessible worldwide!

### Share Your App:
- Production URL: Check Vercel dashboard
- Users can install it on any device
- Works offline after first visit
- Native app experience

### Next Steps:
1. Test on real devices
2. Set up push notifications (next task!)
3. Monitor user installations
4. Gather feedback
5. Iterate and improve

---

## 🆘 Need Help?

**Vercel Issues:**
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)

**PWA Issues:**
- Check `PWA_SETUP.md`
- Check browser console
- Test in incognito mode

**GitHub Issues:**
- Check Actions tab for errors
- Verify branch protection rules
- Check repository settings

---

**Your PWA is now deployed! Check your Vercel dashboard to see it live.** 🚀
