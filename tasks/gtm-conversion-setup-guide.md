# GTM Conversion Tracking Setup Guide

**GTM Container:** GTM-K8KVFZKG
**GA4 Property:** G-RSECPPZQ56
**Google Ads Account:** AW-18012490848

This guide walks through setting up conversion tracking for the 4 dataLayer events already firing in CounterbenchAI code:

| Event Name | Fires When |
|---|---|
| `newsletter_subscribe` | User submits any newsletter email form |
| `guide_download` | User clicks a tracked download link |
| `strategy_call_book` | User submits the advisory briefing form |
| `cta_click` | User clicks any element with `data-track` attribute |

---

## Prerequisites

- Access to [Google Tag Manager](https://tagmanager.google.com) — container GTM-K8KVFZKG
- Access to [Google Analytics 4](https://analytics.google.com) — property G-RSECPPZQ56
- Access to [Google Ads](https://ads.google.com) — account AW-18012490848

---

## Part 1: Create Custom Event Triggers in GTM

Open GTM at https://tagmanager.google.com and select container **GTM-K8KVFZKG**.

### Trigger 1: newsletter_subscribe

1. Click **Triggers** in the left sidebar
2. Click **New** (top right)
3. Name it: `CE - newsletter_subscribe`
4. Click **Trigger Configuration** (the pencil icon or center area)
5. Choose trigger type: **Custom Event**
6. Set these fields:
   - **Event name:** `newsletter_subscribe`
   - **This trigger fires on:** `All Custom Events`
7. Click **Save**

### Trigger 2: guide_download

1. Click **Triggers** > **New**
2. Name it: `CE - guide_download`
3. Click **Trigger Configuration**
4. Choose trigger type: **Custom Event**
5. Set these fields:
   - **Event name:** `guide_download`
   - **This trigger fires on:** `All Custom Events`
6. Click **Save**

### Trigger 3: strategy_call_book

1. Click **Triggers** > **New**
2. Name it: `CE - strategy_call_book`
3. Click **Trigger Configuration**
4. Choose trigger type: **Custom Event**
5. Set these fields:
   - **Event name:** `strategy_call_book`
   - **This trigger fires on:** `All Custom Events`
6. Click **Save**

### Trigger 4: cta_click

1. Click **Triggers** > **New**
2. Name it: `CE - cta_click`
3. Click **Trigger Configuration**
4. Choose trigger type: **Custom Event**
5. Set these fields:
   - **Event name:** `cta_click`
   - **This trigger fires on:** `All Custom Events`
6. Click **Save**

---

## Part 2: Create Data Layer Variables in GTM

These variables capture the extra parameters sent with each event so they pass through to GA4.

### Variable 1: dlv - email_source

1. Click **Variables** in the left sidebar
2. Under **User-Defined Variables**, click **New**
3. Name it: `dlv - email_source`
4. Click **Variable Configuration**
5. Choose variable type: **Data Layer Variable**
6. Set these fields:
   - **Data Layer Variable Name:** `email_source`
   - **Data Layer Version:** `Version 2`
7. Click **Save**

### Variable 2: dlv - guide_slug

1. Click **Variables** > **New** (under User-Defined Variables)
2. Name it: `dlv - guide_slug`
3. Click **Variable Configuration**
4. Choose variable type: **Data Layer Variable**
5. Set these fields:
   - **Data Layer Variable Name:** `guide_slug`
   - **Data Layer Version:** `Version 2`
6. Click **Save**

### Variable 3: dlv - file_label

1. Click **Variables** > **New**
2. Name it: `dlv - file_label`
3. Click **Variable Configuration**
4. Choose variable type: **Data Layer Variable**
5. Set these fields:
   - **Data Layer Variable Name:** `file_label`
   - **Data Layer Version:** `Version 2`
6. Click **Save**

### Variable 4: dlv - booking_source

1. Click **Variables** > **New**
2. Name it: `dlv - booking_source`
3. Click **Variable Configuration**
4. Choose variable type: **Data Layer Variable**
5. Set these fields:
   - **Data Layer Variable Name:** `booking_source`
   - **Data Layer Version:** `Version 2`
6. Click **Save**

### Variable 5: dlv - cta_text

1. Click **Variables** > **New**
2. Name it: `dlv - cta_text`
3. Click **Variable Configuration**
4. Choose variable type: **Data Layer Variable**
5. Set these fields:
   - **Data Layer Variable Name:** `cta_text`
   - **Data Layer Version:** `Version 2`
6. Click **Save**

### Variable 6: dlv - cta_location

1. Click **Variables** > **New**
2. Name it: `dlv - cta_location`
3. Click **Variable Configuration**
4. Choose variable type: **Data Layer Variable**
5. Set these fields:
   - **Data Layer Variable Name:** `cta_location`
   - **Data Layer Version:** `Version 2`
6. Click **Save**

---

## Part 3: Create GA4 Event Tags in GTM

### Tag 1: GA4 - newsletter_subscribe

1. Click **Tags** in the left sidebar
2. Click **New**
3. Name it: `GA4 - newsletter_subscribe`
4. Click **Tag Configuration**
5. Choose tag type: **Google Analytics: GA4 Event**
6. Set these fields:
   - **Measurement ID:** `G-RSECPPZQ56`
   - **Event Name:** `newsletter_subscribe`
7. Expand **Event Parameters** and click **Add Row**:
   - **Parameter Name:** `email_source` | **Value:** `{{dlv - email_source}}`
8. Click **Triggering** (bottom section)
9. Select: `CE - newsletter_subscribe`
10. Click **Save**

### Tag 2: GA4 - guide_download

1. Click **Tags** > **New**
2. Name it: `GA4 - guide_download`
3. Click **Tag Configuration**
4. Choose tag type: **Google Analytics: GA4 Event**
5. Set these fields:
   - **Measurement ID:** `G-RSECPPZQ56`
   - **Event Name:** `guide_download`
6. Expand **Event Parameters** and add 2 rows:
   - Row 1 — **Parameter Name:** `guide_slug` | **Value:** `{{dlv - guide_slug}}`
   - Row 2 — **Parameter Name:** `file_label` | **Value:** `{{dlv - file_label}}`
7. Click **Triggering**
8. Select: `CE - guide_download`
9. Click **Save**

### Tag 3: GA4 - strategy_call_book

1. Click **Tags** > **New**
2. Name it: `GA4 - strategy_call_book`
3. Click **Tag Configuration**
4. Choose tag type: **Google Analytics: GA4 Event**
5. Set these fields:
   - **Measurement ID:** `G-RSECPPZQ56`
   - **Event Name:** `strategy_call_book`
6. Expand **Event Parameters** and click **Add Row**:
   - **Parameter Name:** `booking_source` | **Value:** `{{dlv - booking_source}}`
7. Click **Triggering**
8. Select: `CE - strategy_call_book`
9. Click **Save**

### Tag 4: GA4 - cta_click

1. Click **Tags** > **New**
2. Name it: `GA4 - cta_click`
3. Click **Tag Configuration**
4. Choose tag type: **Google Analytics: GA4 Event**
5. Set these fields:
   - **Measurement ID:** `G-RSECPPZQ56`
   - **Event Name:** `cta_click`
6. Expand **Event Parameters** and add 2 rows:
   - Row 1 — **Parameter Name:** `cta_text` | **Value:** `{{dlv - cta_text}}`
   - Row 2 — **Parameter Name:** `cta_location` | **Value:** `{{dlv - cta_location}}`
7. Click **Triggering**
8. Select: `CE - cta_click`
9. Click **Save**

---

## Part 4: Create Google Ads Conversion Actions

### Step 4A: Create Conversions in Google Ads

Go to https://ads.google.com and make sure you're in account **AW-18012490848**.

#### Conversion 1: Newsletter Subscribe

1. Click **Goals** in the left sidebar
2. Click **Conversions** > **Summary**
3. Click **+ New conversion action**
4. Select **Website**
5. Enter your website URL: `counterbench.ai` and click **Scan**
6. Click **+ Add a conversion action manually**
7. Fill in:
   - **Conversion name:** `Newsletter Subscribe`
   - **Goal and action optimization:** `Subscribe` (under Engagement)
   - **Value:** Select `Don't use a value for this conversion action`
   - **Count:** `One` (one per user session)
   - **Click-through conversion window:** `30 days`
   - **Attribution model:** `Data-driven`
8. Click **Done**, then **Save and continue**
9. Select **Use Google Tag Manager**
10. **Copy the Conversion ID and Conversion Label** — you'll need these in Part 5
    - The page will show something like: Conversion ID: `18012490848`, Conversion label: `XXXXXXX`
    - Write these down as `Newsletter Subscribe Label`

#### Conversion 2: Guide Download

1. Click **+ New conversion action** > **Website** > **Scan** > **+ Add manually**
2. Fill in:
   - **Conversion name:** `Guide Download`
   - **Goal and action optimization:** `Submit lead form` (under Engagement)
   - **Value:** `Don't use a value`
   - **Count:** `Every` (each download counts)
   - **Click-through conversion window:** `30 days`
   - **Attribution model:** `Data-driven`
3. Click **Done** > **Save and continue** > **Use Google Tag Manager**
4. Copy the **Conversion ID** and **Conversion Label** — write them down as `Guide Download Label`

#### Conversion 3: Strategy Call Book

1. Click **+ New conversion action** > **Website** > **Scan** > **+ Add manually**
2. Fill in:
   - **Conversion name:** `Strategy Call Book`
   - **Goal and action optimization:** `Book appointment` (under Engagement)
   - **Value:** `Don't use a value` (or set a value if you know the avg deal size)
   - **Count:** `One`
   - **Click-through conversion window:** `90 days`
   - **Attribution model:** `Data-driven`
3. Click **Done** > **Save and continue** > **Use Google Tag Manager**
4. Copy the **Conversion ID** and **Conversion Label** — write them down as `Strategy Call Label`

#### Conversion 4: CTA Click

1. Click **+ New conversion action** > **Website** > **Scan** > **+ Add manually**
2. Fill in:
   - **Conversion name:** `CTA Click`
   - **Goal and action optimization:** `Other` (under Engagement)
   - **Value:** `Don't use a value`
   - **Count:** `Every`
   - **Click-through conversion window:** `30 days`
   - **Attribution model:** `Data-driven`
3. Click **Done** > **Save and continue** > **Use Google Tag Manager**
4. Copy the **Conversion ID** and **Conversion Label** — write them down as `CTA Click Label`

---

## Part 5: Create Google Ads Conversion Linker + Conversion Tags in GTM

### Step 5A: Conversion Linker Tag (do this once)

1. Back in GTM (container GTM-K8KVFZKG)
2. Click **Tags** > **New**
3. Name it: `Google Ads - Conversion Linker`
4. Click **Tag Configuration**
5. Choose tag type: **Conversion Linker**
6. Leave all settings at default
7. Click **Triggering**
8. Select: **All Pages**
9. Click **Save**

### Step 5B: Google Ads Conversion Tags

For each conversion, you'll need the **Conversion ID** and **Conversion Label** you copied in Part 4.

The **Conversion ID** is the same for all 4: `AW-18012490848`
(In GTM, enter just the numeric part or the full AW- prefixed ID as shown on the setup page.)

#### Tag: Google Ads - Newsletter Subscribe

1. Click **Tags** > **New**
2. Name it: `Google Ads - Newsletter Subscribe`
3. Click **Tag Configuration**
4. Choose tag type: **Google Ads Conversion Tracking**
5. Set these fields:
   - **Conversion ID:** (paste from your Google Ads setup — numeric ID from the conversion page)
   - **Conversion Label:** (paste the label you copied for Newsletter Subscribe)
6. Click **Triggering**
7. Select: `CE - newsletter_subscribe`
8. Click **Save**

#### Tag: Google Ads - Guide Download

1. Click **Tags** > **New**
2. Name it: `Google Ads - Guide Download`
3. Click **Tag Configuration**
4. Choose tag type: **Google Ads Conversion Tracking**
5. Set these fields:
   - **Conversion ID:** (paste from your Google Ads setup)
   - **Conversion Label:** (paste the label you copied for Guide Download)
6. Click **Triggering**
7. Select: `CE - guide_download`
8. Click **Save**

#### Tag: Google Ads - Strategy Call Book

1. Click **Tags** > **New**
2. Name it: `Google Ads - Strategy Call Book`
3. Click **Tag Configuration**
4. Choose tag type: **Google Ads Conversion Tracking**
5. Set these fields:
   - **Conversion ID:** (paste from your Google Ads setup)
   - **Conversion Label:** (paste the label you copied for Strategy Call Book)
6. Click **Triggering**
7. Select: `CE - strategy_call_book`
8. Click **Save**

#### Tag: Google Ads - CTA Click

1. Click **Tags** > **New**
2. Name it: `Google Ads - CTA Click`
3. Click **Tag Configuration**
4. Choose tag type: **Google Ads Conversion Tracking**
5. Set these fields:
   - **Conversion ID:** (paste from your Google Ads setup)
   - **Conversion Label:** (paste the label you copied for CTA Click)
6. Click **Triggering**
7. Select: `CE - cta_click`
8. Click **Save**

---

## Part 6: Mark Events as Conversions in GA4

1. Go to https://analytics.google.com
2. Select property **G-RSECPPZQ56**
3. Click **Admin** (gear icon, bottom left)
4. Under **Data display**, click **Events**
5. If the events already appear in the list (they will after they fire at least once):
   - Find `newsletter_subscribe` and toggle **Mark as conversion** ON
   - Find `guide_download` and toggle **Mark as conversion** ON
   - Find `strategy_call_book` and toggle **Mark as conversion** ON
   - Find `cta_click` and toggle **Mark as conversion** ON
6. If the events don't appear yet:
   - Click **Create event** > **Create**
   - **Custom event name:** `newsletter_subscribe`
   - **Matching conditions:** Event name equals `newsletter_subscribe`
   - Click **Create**, then mark it as a conversion
   - Repeat for the other 3 events

---

## Part 7: Test Everything

### Step 7A: GTM Preview Mode

1. In GTM, click **Preview** (top right)
2. Enter your site URL: `https://counterbench.ai`
3. Click **Connect** — a new tab opens with your site and GTM debug panel
4. On the site, trigger each event:
   - Submit a newsletter email form -> check that `newsletter_subscribe` appears in the debug panel
   - Click a tracked download link -> check that `guide_download` appears
   - Submit the advisory briefing form -> check that `strategy_call_book` appears
   - Click any element with a CTA tracker -> check that `cta_click` appears
5. For each event in the debug panel:
   - Click the event name on the left
   - Verify under **Tags Fired** that the corresponding GA4 tag AND Google Ads tag both fired
   - Verify under **Variables** that the data layer variables have correct values

### Step 7B: GA4 DebugView

1. Go to https://analytics.google.com
2. Select property **G-RSECPPZQ56**
3. Click **Admin** > **DebugView** (under Data display)
4. While GTM Preview is still connected, trigger events on the site
5. You should see each event appear in the DebugView timeline in real-time:
   - `newsletter_subscribe` with `email_source` parameter
   - `guide_download` with `guide_slug` and `file_label` parameters
   - `strategy_call_book` with `booking_source` parameter
   - `cta_click` with `cta_text` and `cta_location` parameters
6. Click on each event to verify the parameters are passing correctly

### Step 7C: Google Ads Conversion Verification

1. Go to https://ads.google.com > **Goals** > **Conversions** > **Summary**
2. Each conversion action will show status:
   - **Unverified** — tag hasn't fired yet (expected before first real conversion)
   - **No recent conversions** — tag is verified but no conversions recorded yet
   - **Recording conversions** — working correctly
3. After testing, it may take up to 24 hours for test conversions to appear

---

## Part 8: Publish GTM Changes

Only after all tests pass:

1. In GTM, click **Submit** (top right)
2. Set **Version Name:** `Conversion tracking - 4 events (GA4 + Google Ads)`
3. Add description: `Added GA4 event tags and Google Ads conversion tags for: newsletter_subscribe, guide_download, strategy_call_book, cta_click. Includes data layer variables and conversion linker.`
4. Click **Publish**

---

## Summary: What You Created

| GTM Item | Count |
|---|---|
| Custom Event Triggers | 4 |
| Data Layer Variables | 6 |
| GA4 Event Tags | 4 |
| Google Ads Conversion Tags | 4 |
| Conversion Linker Tag | 1 |
| **Total GTM items** | **19** |

| Google Ads Conversions | Count |
|---|---|
| Conversion Actions | 4 |

| GA4 Conversions | Count |
|---|---|
| Events marked as conversions | 4 |

---

## Troubleshooting

**Event not appearing in GTM Preview:**
- Check that the dataLayer push is actually executing. Open browser console and type `dataLayer` to inspect.
- Make sure the event name in the trigger exactly matches the string in the code (case-sensitive).

**GA4 tag fired but event not in DebugView:**
- Confirm the Measurement ID is exactly `G-RSECPPZQ56` (no typos).
- DebugView only shows events from debug-mode sessions. Make sure GTM Preview is connected.

**Google Ads conversion stuck on "Unverified":**
- It can take up to 24 hours. If still unverified after 48 hours, re-check the Conversion ID and Label.
- Make sure the Conversion Linker tag is firing on All Pages.

**Parameters showing as "(not set)" in GA4:**
- Check that the data layer variable names match exactly (case-sensitive).
- In the GA4 tag, verify the parameter value uses the correct variable: `{{dlv - variable_name}}`.
