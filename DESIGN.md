# Design System — prevuiw

## Product Context
- **What this is:** URL-based visual review platform for dev teams
- **Who it's for:** Developers, designers, PMs who need fast UI feedback
- **Space/industry:** Developer tools, design collaboration (Vercel Preview, Figma Comments)
- **Project type:** Web app (review tool) + minimal marketing landing

## Aesthetic Direction
- **Direction:** Brutally Minimal
- **Decoration level:** Minimal — typography does all the work
- **Mood:** Professional, fast, precise. Like opening a well-made dev tool that respects your time.
- **Reference sites:** vercel.com, linear.app, figma.com

## Typography
- **Display/Hero:** Geist Sans 700-800 — Vercel's own typeface, perfect for this category
- **Body:** Geist Sans 400 — clean readability at all sizes
- **UI/Labels:** Geist Sans 500
- **Data/Tables:** Geist Mono 400 (tabular-nums) — URLs, version names, timestamps
- **Code:** Geist Mono 500
- **Loading:** Google Fonts CDN (`family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500;600`)
- **Scale:** 11px (caption) / 13px (small) / 15px (body) / 18px (large) / 24px (h3) / 32px (h2) / 42px (h1)

## Color
- **Approach:** Restrained — 1 accent + neutrals, color is rare and meaningful
- **Primary:** #3B82F6 (blue) — active/open comments, primary actions
- **Semantic green:** #22C55E — resolved comments
- **Semantic yellow:** #F59E0B — area selection, warnings
- **Semantic red:** #EF4444 — errors, destructive actions
- **Neutrals (dark):** #0A0A0A (bg), #141414 (surface), #1A1A1A (surface-2), #FAFAFA (text), #A1A1A1 (secondary), #666 (muted)
- **Neutrals (light):** #FFFFFF (bg), #FAFAFA (surface), #F5F5F5 (surface-2), #0A0A0A (text), #666 (secondary), #999 (muted)
- **Border:** rgba(255,255,255,0.08) dark / rgba(0,0,0,0.08) light
- **Dark mode:** Default. Surfaces get progressively lighter (#0A → #14 → #1A). Accent saturation unchanged.

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64)

## Layout
- **Approach:** Grid-disciplined
- **Grid:** 12 columns (desktop), 8 (tablet), 4 (mobile)
- **Max content width:** 1200px
- **Border radius:** sm:6px, md:8px, lg:10px, xl:12px, full:9999px
- **Review page:** Full viewport, sidebar 260-300px, collapsible

## Motion
- **Approach:** Minimal-functional
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms)
- **What animates:** Comment pin appearance, sidebar open/close, tooltip fade, button hover states
- **What doesn't:** Page transitions, decorative animations, scroll effects

## Brand Identity — The Pin System
The comment pin colors ARE the brand:
- **Blue (#3B82F6):** Active, open, needs attention
- **Green (#22C55E):** Resolved, done, confirmed
- **Yellow (#F59E0B):** Area selection, in-progress, warning

These three colors appear in pins, badges, borders, and subtle backgrounds throughout the app. They're the only strong colors in an otherwise monochrome UI.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-29 | Initial design system | Created by /design-consultation. Vercel-inspired minimal, Geist typography, pin color system as brand identity |
| 2026-03-29 | Dark default theme | Developer tool standard, matches target audience expectations |
| 2026-03-29 | Geist font family | Vercel ecosystem alignment, excellent monospace variant for URLs/data |
| 2026-03-29 | Restrained color | Pin colors carry meaning, not decoration. Makes resolved/open instantly scannable |
