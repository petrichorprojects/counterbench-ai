# Counterbench Design Tokens (v1.0)

Source of truth: `design-system/counterbench-design-tokens.json`

These mirror the CSS variables in `public/css/style.css` (and a few app-level tokens in `app/globals.css`).

## Color
Dark (default):
- `--bg` `#0d0f12`
- `--bg2` `#111827`
- `--bg3` `#1f2937`
- `--fg` `#f9fafb`
- `--muted` `#9ca3af`
- `--muted-2` `#6b7280`
- `--border` `#374151`

Light (`html[data-theme="light"]`):
- `--bg` `#ffffff`
- `--bg2` `#f9fafb`
- `--bg3` `#f3f4f6`
- `--fg` `#111827`
- `--muted` `#6b7280`
- `--muted-2` `#9ca3af`
- `--border` `#e5e7eb`

Accent (links and subtle emphasis):
- `--teal` (dark) `#aab9d1` (light) `#3a4c6c`

## Typography
- `--serif`: New York (fallback Georgia)
- `--sans`: SF Pro Display (system fallbacks)

## Layout
- Max container: 1120px
- Desktop padding: 64px
- Mobile padding: 24px
- Section vertical: 120–160px

## Radii
- Card: 12px
- Pill: 999px

## Motion
- 120–200ms transitions
- ease-out
- no bounce

## Accessibility
- Focus outline color: `#3b82f6` (see `app/globals.css`)
