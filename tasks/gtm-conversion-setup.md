# GTM Conversion Tracking — Complete Setup Guide

**Container:** GTM-K8KVFZKG (live, currently v4)
**GA4:** G-RSECPPZQ56
**Google Ads:** AW-18012490848
**Meta Pixel:** 1668034894238924
**GTM account login:** rimmler@petrichorgrowth.com (authuser=3)
**Link:** https://tagmanager.google.com/?authuser=3

---

## What's Already Done

- GTM container is live on production (v4 published)
- GA4 base tag is live
- Google Ads global site tag is live
- Meta Pixel base snippet is live (fires PageView on every page via AnalyticsPixels.tsx)
- All dataLayer.push calls are wired in code — events fire correctly on user actions

## What's Missing (what this guide builds)

1. Data Layer Variables in GTM (7)
2. Custom Event Triggers in GTM (4)
3. GA4 Event Tags in GTM (4)
4. Google Ads Conversion Linker tag (1, fires on all pages)
5. Google Ads Conversion Actions created in Google Ads UI (4)
6. Google Ads Conversion Tags in GTM (4)
7. Meta Pixel Custom Event Tags in GTM (3 priority events)
8. Mark 3 events as conversions in GA4

**Estimated time in UI: ~25 minutes.**

---

## Event Reference (What the Code Actually Fires)

| Event Name | Component | Where It Fires | Parameters |
|---|---|---|---|
| `newsletter_subscribe` | `NewsletterCapture.tsx` | After successful email submit | `email_source: string` |
| `guide_download` | `TrackedDownloadLink.tsx` | On click of any download link in `/guides/[slug]` | `guide_slug`, `file_label`, `file_url` |
| `strategy_call_book` | `TrackedAdvisoryForm.tsx` | On submit of advisory briefing form at `/advisory` | `booking_source: "advisory-briefing-form"` |
| `cta_click` | `TrackedCTA.tsx` | On click of any TrackedCTA on `/advisory` | `cta_text`, `cta_location`, `page` |

---

## Part 1: Create Data Layer Variables

GTM > Variables > User-Defined Variables > New

All 7: Variable Type = Data Layer Variable, Version 2

| Variable Name | Data Layer Variable Name |
|---|---|
| `dlv - email_source` | `email_source` |
| `dlv - guide_slug` | `guide_slug` |
| `dlv - file_label` | `file_label` |
| `dlv - file_url` | `file_url` |
| `dlv - booking_source` | `booking_source` |
| `dlv - cta_text` | `cta_text` |
| `dlv - cta_location` | `cta_location` |

---

## Part 2: Create Custom Event Triggers

GTM > Triggers > New. All: Trigger Type = Custom Event

| Trigger Name | Event Name |
|---|---|
| `CE - newsletter_subscribe` | `newsletter_subscribe` |
| `CE - guide_download` | `guide_download` |
| `CE - strategy_call_book` | `strategy_call_book` |
| `CE - cta_click` | `cta_click` |

---

## Part 3: Create GA4 Event Tags

GTM > Tags > New. All: Tag Type = GA4 Event, Measurement ID = `G-RSECPPZQ56`

### Tag 1: GA4 - newsletter_subscribe
- Event Name: `newsletter_subscribe`
- Parameters: `email_source` → `{{dlv - email_source}}`
- Trigger: `CE - newsletter_subscribe`

### Tag 2: GA4 - guide_download
- Event Name: `guide_download`
- Parameters: `guide_slug` → `{{dlv - guide_slug}}`, `file_label` → `{{dlv - file_label}}`, `file_url` → `{{dlv - file_url}}`
- Trigger: `CE - guide_download`

### Tag 3: GA4 - strategy_call_book
- Event Name: `strategy_call_book`
- Parameters: `booking_source` → `{{dlv - booking_source}}`
- Trigger: `CE - strategy_call_book`

### Tag 4: GA4 - cta_click
- Event Name: `cta_click`
- Parameters: `cta_text` → `{{dlv - cta_text}}`, `cta_location` → `{{dlv - cta_location}}`
- Trigger: `CE - cta_click`

---

## Part 4: Create Conversion Actions in Google Ads

ads.google.com > Goals > Conversions > Summary > + New conversion action > Website

| Conversion Name | Category | Count |
|---|---|---|
| Newsletter Subscribe | Subscribe | One per session |
| Guide Download | Other | Every |
| Strategy Call Book | Book appointment | One |
| CTA Click | Other | Every |

**Copy each Conversion Label — you need them in Part 5.**

---

## Part 5: Google Ads Tags in GTM

### Conversion Linker (do once)
- Tag Type: Conversion Linker
- Trigger: All Pages

### Conversion Tags
All: Tag Type = Google Ads Conversion Tracking, Conversion ID = `AW-18012490848`

| Tag Name | Conversion Label | Trigger |
|---|---|---|
| Google Ads - Newsletter Subscribe | (from Part 4) | `CE - newsletter_subscribe` |
| Google Ads - Guide Download | (from Part 4) | `CE - guide_download` |
| Google Ads - Strategy Call Book | (from Part 4) | `CE - strategy_call_book` |
| Google Ads - CTA Click | (from Part 4) | `CE - cta_click` |

---

## Part 6: Meta Pixel Custom Event Tags

Base pixel already fires via code. Only add custom event tags.

GTM > Tags > New > Custom HTML

### Meta - Lead (newsletter_subscribe)
```html
<script>fbq('track', 'Lead', {content_name: 'Newsletter', content_category: {{dlv - email_source}}});</script>
```
Trigger: `CE - newsletter_subscribe`

### Meta - ViewContent (guide_download)
```html
<script>fbq('track', 'ViewContent', {content_name: {{dlv - file_label}}, content_ids: [{{dlv - guide_slug}}], content_type: 'product'});</script>
```
Trigger: `CE - guide_download`

### Meta - Contact (strategy_call_book)
```html
<script>fbq('track', 'Contact', {content_name: 'Advisory Briefing Request'});</script>
```
Trigger: `CE - strategy_call_book`

Do NOT map cta_click to Meta — too broad, distorts optimization.

---

## Part 7: Mark Events as Conversions in GA4

GA4 > Admin > Data display > Events > Toggle "Mark as conversion" ON for:
- `newsletter_subscribe`
- `guide_download`
- `strategy_call_book`

Do NOT mark `cta_click` — it's behavioral data.

---

## Part 8: Test (GTM Preview + GA4 DebugView)

1. GTM > Preview > enter `https://counterbench.ai` > Connect
2. Walk each action, verify tags fire green, variables populated
3. GA4 > Admin > DebugView — events appear within ~5 seconds

---

## Part 9: Publish

GTM > Submit
- Version Name: `v5 - Conversion tracking (GA4 + Google Ads + Meta)`
- Publish

**Total GTM items: 23** (7 variables, 4 triggers, 4 GA4 tags, 5 Google Ads tags, 3 Meta tags)
