# Pre-Launch Checklist

## 🔴 CRITICAL BLOCKING ISSUES
**Must complete before hosting live**

### 1. Build Verification
- [ ] Run `npm run build` to verify production build passes
- [ ] Fix any build errors that appear
- [ ] Consider replacing `<img>` with Next.js `<Image>` components (7 warnings found)

### 2. Domain Configuration
Replace all instances of `Simuflux.com` with `Simufluxlab.com`:
- [ ] `next.config.mjs` - Line 9: `const BASE_URL = 'https://Simuflux.com'` → `https://Simufluxlab.com`
- [ ] `app/sitemap.js` - Line 4: `const BASE_URL = 'https://Simuflux.com'` → `https://Simufluxlab.com`
- [ ] `app/robots.js` - Line 2: `const BASE_URL = 'https://Simuflux.com'` → `https://Simufluxlab.com`
- [ ] `app/layout.js` - Line 27: `metadataBase: new URL("https://Simuflux.com")` → `https://Simufluxlab.com`
- [ ] `app/page.js` - Lines 95-97: Schema markup URLs → `https://Simufluxlab.com`

### 3. Contact Information Updates
Update with real business details:
- [ ] `app/page.js` - Line 98: Replace `"+92-XXX-XXXXXXX"` with actual phone
- [ ] `app/page.js` - Line 101: Replace "Karachi, Sindh, Pakistan" with exact address
- [ ] `app/contact/page.js` - Line 53: Update `info@Simuflux.com` → `info@Simufluxlab.com`
- [ ] Update all email references in code to use `@Simufluxlab.com` domain

### 4. WhatsApp Number Verification
Confirm production number is correct (currently: `923463517689`):
- [ ] Update `.env.example` if different
- [ ] Update `.env.local` with production number
- [ ] Verify fallback in components matches production number

### 5. Email Configuration & Troubleshooting
**CRITICAL: Email functionality requires proper Resend setup**

#### Domain Verification (Required for Production)
- [ ] Go to https://resend.com/domains
- [ ] Add domain: `Simufluxlab.com`
- [ ] Add DNS records provided by Resend (TXT, CNAME)
- [ ] Wait for domain verification to complete
- [ ] **Important**: Test mode (`onboarding@resend.dev`) only delivers to your Resend-verified account email

#### Environment Variables Setup
Update `.env.local` with production values:
- [ ] `RESEND_API_KEY` - Your actual Resend API key
- [ ] `RESEND_FROM_EMAIL` - Use verified domain: `Simuflux Academy <academy@Simufluxlab.com>`
- [ ] `ADMIN_EMAIL` - Set to: `info@Simufluxlab.com`

#### Test Email Functionality
Before going live, test email sending:
```bash
curl https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "academy@Simufluxlab.com",
    "to": "info@Simufluxlab.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>"
  }'
```
- [ ] Run test curl command above
- [ ] If test fails, check Resend API key and domain verification
- [ ] If test succeeds, emails should work in the application

#### Email Routes in Application
Emails are sent from these API routes:
- [ ] `app/api/register/route.js` - Registration confirmation + admin notification
- [ ] `app/api/inquiry/route.js` - Inquiry confirmation + admin notification
- [ ] `app/api/contact/route.js` - Contact confirmation + admin notification
- [ ] `app/api/enroll/route.js` - Admin notification only (enrollment inquiry)

#### Troubleshooting
If emails are not being received:
1. Check console logs for Resend errors
2. Verify `RESEND_API_KEY` is set correctly in `.env.local`
3. Confirm domain is verified in Resend dashboard
4. Check that `ADMIN_EMAIL` is set to a valid email address
5. Ensure sender email (`RESEND_FROM_EMAIL`) uses verified domain

## 🟡 MANUAL TESTING REQUIRED
**Test these flows in browser before launch**

### Authentication Flows
- [ ] **Admin session persistence**: Log in as admin, navigate between pages, refresh - confirm session persists
- [ ] **Session expiry**: Let session sit idle for 24 hours, confirm clean logout/redirect
- [ ] **Logout behavior**: Log out, confirm cookie is cleared, test browser back button doesn't show cached content
- [ ] **Session independence**: Log in as regular user, then as admin - confirm sessions don't interfere
- [ ] **Super Admin restrictions**: 
  - Log in as `admin@Simuflux.com`, verify "Create Admin" and "Delete" buttons visible
  - Log in as regular admin, verify these buttons are hidden
  - Attempt to create/delete admin as regular admin - confirm 403 error

### Feature Testing
- [ ] **Single-use registration links**: 
  - Generate link for a course
  - Use link successfully
  - Try to reuse same link - confirm it shows "already used" message
- [ ] **Google Sheets integration**: 
  - Complete a registration
  - Verify data appears in correct Google Sheet tab
  - Confirm per-course routing works

### Console Error Check
- [ ] Open browser DevTools console
- [ ] Navigate through all pages (home, courses, services, contact, about)
- [ ] Check for any JavaScript errors or warnings
- [ ] Fix any console errors found

## 🟢 PLACEHOLDER CONTENT TO REPLACE
**Non-blocking but should be updated for production**

### Images
- [ ] Replace service images in `data/services.js`:
  - `/images/services/cfd.jpg`
  - `/images/services/fea.jpg`
  - `/images/services/cad.jpg`
  - `/images/services/product-design.jpg`
  - `/images/services/consultancy.jpg`
- [ ] Add real project photos for `WorkSampleImage` component
- [ ] Add real logo file (currently using text fallback in Footer)
- [ ] Add CFD demo video to `/public/videos/cfd-demo.mp4` (optional)

### Business Metrics
- [ ] Update `components/home/StatsBar.jsx` with real numbers:
  - Students trained (currently: "500+")
  - Projects delivered (currently: "80+")

### Schema Markup
- [ ] Update LocalBusiness schema in `app/page.js` with:
  - Real phone number
  - Exact office address
  - Real business hours (if available)

## 🔧 ENVIRONMENT VARIABLES SETUP
**Configure in Vercel dashboard**

### Required Variables
- [ ] `NEXTAUTH_URL` - Production domain URL
- [ ] `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `RESEND_API_KEY` - Resend API key
- [ ] `RESEND_FROM_EMAIL` - Verified domain email (switch from onboarding@resend.dev)
- [ ] `ADMIN_EMAIL` - Admin notification email
- [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Google Cloud service account
- [ ] `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` - Service account private key
- [ ] `GOOGLE_SHEET_ID` - Production Google Sheet ID
- [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare Turnstile site key
- [ ] `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret key
- [ ] `ADMIN_WHATSAPP_PHONE` - WhatsApp number (international format)
- [ ] `NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE` - Same as above
- [ ] `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` - Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Production-Specific Notes
- [ ] Ensure Resend domain is verified before switching from `onboarding@resend.dev`
- [ ] Use production Google Sheets account (not test)
- [ ] Use production Cloudinary account (not test)
- [ ] Remove Turnstile development bypass by ensuring `TURNSTILE_SECRET_KEY` is set

## 🎨 UI/UX IMPROVEMENTS (Optional)
**Rate against 2026 standards after visual inspection**

### Typography
- [ ] Review font choices and sizes
- [ ] Check line heights and readability
- [ ] Verify heading hierarchy

### Spacing/Whitespace
- [ ] Review padding and margins consistency
- [ ] Check for adequate breathing room

### Color Usage
- [ ] Verify contrast ratios meet accessibility standards
- [ ] Check color palette consistency

### Card Design
- [ ] Review card shadows and borders
- [ ] Check hover states and interactions

### Form Design
- [ ] Review form field styling
- [ ] Check validation feedback UX

### Mobile Responsiveness
- [ ] Test on various screen sizes
- [ ] Check touch targets are adequate
- [ ] Verify mobile navigation

### Animation/Motion
- [ ] Review animation timing and smoothness
- [ ] Check for motion accessibility (respect prefers-reduced-motion)

## 📋 VERCEL DEPLOYMENT CHECKLIST
**Before deploying to production**

### Domain Setup
- [ ] Add custom domain in Vercel dashboard
- [ ] Configure DNS records (A or CNAME)
- [ ] Wait for SSL certificate to provision

### Environment Variables
- [ ] Add all required environment variables in Vercel project settings
- [ ] Do NOT add `.env.local` to git
- [ ] Verify no secrets in client-side code

### Build Configuration
- [ ] Ensure `next.config.mjs` is production-ready
- [ ] Verify security headers are appropriate for production
- [ ] Check image optimization settings

### Post-Deployment
- [ ] Test all forms work in production
- [ ] Verify email sending works
- [ ] Check Google Sheets integration
- [ ] Test image uploads to Cloudinary
- [ ] Verify Turnstile CAPTCHA works
- [ ] Check admin authentication flows
- [ ] Test registration link generation and usage

## 🔒 SECURITY FINAL CHECKS
- [ ] Verify all admin API routes have role checks
- [ ] Confirm Super Admin restrictions work
- [ ] Check XSS sanitization is applied to all user inputs
- [ ] Verify file upload validation is enforced
- [ ] Ensure Turnstile is active in production
- [ ] Check no secrets exposed in client-side code
- [ ] Verify MongoDB connection uses SSL
- [ ] Check rate limiting is appropriate (if implemented)

## 📝 NOTES
- Session duration is configured to 24 hours (reasonable for admin panel)
- Race conditions are prevented using atomic MongoDB operations
- Pricing calculations are centralized and server-side
- All security headers are properly configured
- Sitemap and robots.txt are dynamically generated

---
**Last Updated**: 2026-07-15
**Status**: Ready for manual testing and deployment
