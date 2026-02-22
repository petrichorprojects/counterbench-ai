# Counterbench Design System — Figma Spec (v1)

This is the **source of truth** for Counterbench’s “Black Intelligence Terminal” brand: calm, private, high-stakes.

## 1) Figma File Structure

### Pages
1. **00 — Cover**
   - Brand promise (1 sentence)
   - Type pairing (Lora + Inter)
   - Color chips + usage note (“No decorative color.”)

2. **01 — Foundations**
   - Colors
   - Typography
   - Spacing
   - Radii
   - Elevation
   - Motion

3. **02 — Components**
   - Buttons
   - Inputs
   - Cards
   - Nav
   - Footer
   - Section layouts
   - Lists / bullets
   - KPI blocks

4. **03 — Patterns**
   - Hero pattern
   - Proof row
   - Offer grid (3 cards)
   - Terminal CTA
   - Page header pattern

5. **04 — Pages**
   - Home
   - Advisory
   - Diagnostic
   - Insights
   - Contact

6. **99 — Archive**
   - Deprecated components and old explorations

## 2) Naming Conventions (strict)

- **Foundations:** `FND / Color / bg-0`
- **Text styles:** `TXT / Display / 2XL`, `TXT / Body / LG`
- **Components:** `CMP / Button / Primary`
- **Patterns:** `PTN / Hero / Default`
- **Pages:** `PG / Home`

## 3) Foundations

### Color (Black Terminal)
- `bg-0` #000000
- `bg-1` #0B0B0B
- `bg-2` #111111
- `fg-0` #FFFFFF
- `muted-0` #B3B3B3
- `muted-1` #737373
- `border-0` #1F1F1F

Rule: **One accent max**. If it’s not doing hierarchy or interaction clarity, remove it.

### Typography
- Display: **Lora** (serif) — authority, inevitability
- UI/Body: **Inter** (sans) — precision

Text styles (create these):
- `Display 2XL` 72/76 -0.03
- `Display XL` 56/60 -0.03
- `Display LG` 44/48 -0.02
- `H2` 32/36 -0.02
- `H3` 24/30 -0.01
- `Body LG` 18/28
- `Body` 16/26
- `Body SM` 14/22
- `Label` 12/16 +0.06 (uppercase optional)

### Spacing
Use the editorial scale:
`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120, 160`

Rules:
- Desktop page padding: **64**
- Mobile page padding: **24**
- Section vertical: **120–160**
- Max width: **1120**
- Text measure: **56–64ch**

### Motion (quiet)
- Standard: 180ms ease-out
- Hover: 120ms ease-out
- No bounce. No playful easing.

## 4) Component Specs (minimum set)

### Buttons
- Primary: filled subtle (white @ 6–10% on black), border 1px
- Secondary: transparent, border 1px
- Ghost: text-only, hover to fg

States: default / hover / focus / disabled

### Card
- bg: `bg-1`
- border: `border-0`
- padding: 40–48
- hover: **slight** border lift only (no glow)

### Nav
- Left: logotype
- Right: 3–4 links + 1 CTA
- Mobile: slide-down panel, minimal

### List
- No bullets. Use em-dash lead `—` for quiet rhythm.

## 5) Page Templates

### Home
Hero → Proof → Shift → Offer → Terminal CTA

### Advisory
Page header → “What changes” (2-col) → Engagement (3 cards) → CTA

### Diagnostic
Page header → Deliverables (2-col) → Process (3 cards) → CTA

