# Counterbench Advisory — Website

## Deployment

### Option A: Netlify (Recommended)
```bash
# 1. Push this folder to a GitHub repo
# 2. Connect repo to Netlify
# 3. Build settings: No build command needed (static site)
# 4. Publish directory: / (root)
# 5. Add custom domain: counterbench.com
```

### Option B: Vercel
```bash
# 1. Install Vercel CLI: npm i -g vercel
# 2. From this directory: vercel
# 3. Follow prompts, add custom domain
```

### Option C: Any Static Host (Cloudflare Pages, GitHub Pages, S3+CloudFront)
This is a pure static site. No build step. Just upload the folder.

---

## Pre-Launch Checklist

### Domain & DNS
- [ ] Purchase counterbench.com (Namecheap, Cloudflare, or Google Domains)
- [ ] Point DNS to hosting provider (Netlify/Vercel)
- [ ] SSL auto-provisioned by host

### GTM & Tracking (12 API Keys from Implementation Plan)
- [ ] Create Google Tag Manager container → get GTM-XXXXX
- [ ] Uncomment GTM snippet in all HTML files (search for "GTM-XXXXX")
- [ ] Create GA4 property → add tag in GTM
- [ ] Install Meta Pixel via GTM
- [ ] Install LinkedIn Insight Tag via GTM  
- [ ] Install Google Ads remarketing tag via GTM
- [ ] Configure custom events in GTM (see events list in js/main.js)
- [ ] Set up GA4 conversions: newsletter_subscribe, diagnostic_complete, strategy_call_book

### Email Platform
- [ ] Create Kit (ConvertKit) or Beehiiv account
- [ ] Create signup form → get form action URL
- [ ] Replace newsletter form handler in js/main.js (line ~52)
- [ ] Create email sequences (7-email nurture from Content Playbook)
- [ ] Set up automation: new subscriber → nurture sequence → weekly newsletter
- [ ] Test double opt-in flow

### Calendly
- [ ] Create Calendly account → set up 30-minute "Strategy Call" event
- [ ] Replace placeholder form on contact.html with Calendly embed widget
- [ ] Set intake questions: Name, Firm, Size, Biggest AI Question
- [ ] Connect Calendly webhook to GTM for conversion tracking

### Diagnostic
- [ ] Bundle diagnostic.jsx as standalone React app (npm run build)
- [ ] OR deploy diagnostic as separate subdomain (diagnostic.counterbench.com)
- [ ] Embed in /pages/diagnostic.html (replace placeholder)
- [ ] Test full flow: questions → results → CTA click tracking

### Content
- [ ] Write first 3 insight articles (from Phase 11 content angles)
- [ ] Record podcast Episode 1 (solo intro, 15 minutes)
- [ ] Write first newsletter issue
- [ ] Create OG image (1200x630px) → save as /assets/og-image.jpg
- [ ] Add favicon → /favicon.ico

### Stripe (for paid newsletter)
- [ ] Create Stripe account
- [ ] Create two products: Monthly ($49/mo) and Annual ($399/yr)
- [ ] Generate payment links
- [ ] Replace "#" href on newsletter paid CTA buttons with Stripe payment links

---

## File Structure
```
counterbench/
├── index.html              # Homepage
├── css/
│   └── style.css           # Design system (all styles)
├── js/
│   └── main.js             # Core JS (nav, animations, forms, tracking)
├── pages/
│   ├── advisory.html       # Advisory services + pricing
│   ├── newsletter.html     # The Counterbench (free + paid)
│   ├── diagnostic.html     # AI Readiness Diagnostic
│   ├── insights.html       # Blog/insights index
│   ├── about.html          # About page
│   └── contact.html        # Contact + booking
├── assets/                 # Images, OG images, favicon
├── netlify.toml            # Netlify deploy config + redirects
├── vercel.json             # Vercel deploy config
├── robots.txt              # SEO crawl rules
├── sitemap.xml             # XML sitemap
└── README.md               # This file
```

## Tech Stack
- **Frontend:** Pure HTML/CSS/JS (no framework, no build step)
- **Fonts:** Google Fonts (Playfair Display + DM Sans)
- **Hosting:** Netlify or Vercel (free tier sufficient)
- **Email:** Kit (ConvertKit) or Beehiiv
- **Booking:** Calendly
- **Payments:** Stripe
- **Analytics:** GA4 via GTM
- **Tracking:** Meta Pixel, LinkedIn Insight Tag, Google Ads via GTM
