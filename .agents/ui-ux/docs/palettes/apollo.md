# Apollo — Dark Precision
**Mode:** Dark  
**Personality:** Engineered, exact, quietly confident. Every element earns its place.  
**Inspired by:** Linear's production design system — the defining reference for precision dark SaaS in 2024–2025.  
**Best for:** Project management, engineering tools, developer productivity, any product where precision signals trust.

---

## Colours

### Base Tokens
| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#08090A` | Page background |
| `background-subtle` | `#0D0E10` | Sidebar, secondary panels |
| `surface` | `#111213` | Cards, inputs |
| `surface-raised` | `#1A1B1E` | Elevated cards, context menus |
| `border` | `#2A2B2D` | Dividers, input borders |
| `border-strong` | `#3D3F42` | Focus, emphasis |
| `text-primary` | `#E8E8E8` | Body, headings |
| `text-secondary` | `#8A8F98` | Labels, subtext |
| `text-tertiary` | `#62666D` | Disabled, hints |
| `text-inverse` | `#08090A` | Text on light surfaces |

### Accent — Linear Purple (customise per mission)
| Token | Hex | Usage |
|-------|-----|-------|
| `accent` | `#5E6AD2` | Primary buttons, active nav, links |
| `accent-hover` | `#8FA4FF` | Hover state |
| `accent-bright` | `#8FA4FF` | Highlighted text, badges |
| `accent-subtle` | `#1E2040` | Tinted accent backgrounds |
| `accent-foreground` | `#FFFFFF` | Text on accent |

> **Mission customisation:** Swap `#5E6AD2` for the product brand colour.  
> Apollo reads as premium with any mid-saturation colour: slate `#64748B`, teal `#0D9488`, violet `#7C3AED`.  
> Keep accent subtle — this palette is about precision, not loudness.

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#89D196` | Completed, positive |
| `success-subtle` | `rgba(137,209,150,0.1)` | Success tint |
| `warning` | `#FFC47C` | In progress, caution |
| `warning-subtle` | `rgba(255,196,124,0.1)` | Warning tint |
| `info` | `#55CDFF` | Informational |
| `info-subtle` | `rgba(85,205,255,0.1)` | Info tint |
| `destructive` | `#CF5959` | Errors — desaturated red, less alarming |
| `destructive-subtle` | `rgba(207,89,89,0.1)` | Error tint |
| `muted` | `#2A2B2D` | Disabled |
| `muted-foreground` | `#62666D` | Disabled text |

---

## Typography

**Font:** Inter Variable (`@fontsource-variable/inter`)  
**Display:** Inter Display for headings at 32px+ (heavier optical weight)  
**Code:** Berkeley Mono (preferred) or JetBrains Mono  
**Fallback:** `ui-sans-serif, system-ui, -apple-system, sans-serif`

### Type Scale
| Step | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| `xs` | 11px | 400 | 1.5 | 0.01em | Tiny labels, timestamps |
| `sm` | 13px | 400 | 1.5 | 0 | Secondary text, table cells |
| `base` | 15px | 400 | 1.6 | 0 | Body — slightly smaller than typical |
| `lg` | 18px | 500 | 1.4 | -0.01em | Card titles |
| `xl` | 20px | 600 | 1.3 | -0.02em | Section headings |
| `2xl` | 24px | 700 | 1.2 | -0.02em | Page headings |
| `3xl` | 40px | 800 | 1.1 | -0.03em | Display |
| `display` | 64px | 800 | 1.0 | -0.04em | Landing hero |

> Apollo uses 15px as base body size (vs the standard 16px) — tighter information density without feeling cramped.

---

## Spacing

**Base unit:** 4px. Apollo uses denser spacing than other palettes — information density is a feature.

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |
| `space-16` | 64px |

---

## Border Radius

Subtle rounded — consistent across all elements.

| Element | Value |
|---------|-------|
| Buttons | 6px |
| Inputs | 6px |
| Cards | 8px |
| Modals | 10px |
| Badges | 4px |
| Avatars | 50% |
| Context menus | 8px |

---

## Shadows

Apollo uses very subtle shadows — depth comes from border contrast, not shadows.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.6)` | Minimal lift |
| `shadow-md` | `0 4px 8px rgba(0,0,0,0.7)` | Dropdowns |
| `shadow-lg` | `0 8px 20px rgba(0,0,0,0.8)` | Modals |
| `shadow-focus` | `0 0 0 2px rgba(94,106,210,0.4)` | Focus rings |

---

## Buttons

### Primary
- Background: `accent` · Text: white · Radius: 6px · Font: sm/500
- Hover: `accent-hover` · Active: scale(0.98)

### Secondary
- Background: `surface-raised` · Border: 1px `border-strong` · Text: `text-primary`
- Hover: border `accent`

### Ghost
- Background: transparent · Text: `text-secondary`
- Hover: background `surface`, text `text-primary`

### Destructive
- Background: `destructive` · Text: white

### Sizes
| Size | Padding | Font |
|------|---------|------|
| sm | `4px 10px` | 12px |
| md | `6px 14px` | 13px |
| lg | `8px 18px` | 15px |

> Note: Apollo buttons are intentionally compact. This is a productivity tool — screen space matters.

---

## Inputs

- Background: `surface` · Border: 1px `border` · Radius: 6px
- Padding: `6px 10px` · Font: sm/400 · Text: `text-primary`
- Placeholder: `text-tertiary`
- Focus: border `accent`, `box-shadow: shadow-focus`

---

## Icons

**Library:** Lucide Icons · Stroke: 1.5px  
**Sizes:** 12 / 14 / 16 / 20px  
> Apollo uses smaller icons than most — 14px is the workhorse size.

---

## Motion

| Property | Value |
|----------|-------|
| Duration | 120ms (faster than standard — feels snappy) |
| Easing | `cubic-bezier(0.25, 1, 0.5, 1)` |

Minimal animation. Only what communicates state change. No decorative motion.

---

## Tone & Voice

Terse. Functional. Respects the user's intelligence.  
No onboarding hand-holding. No excitement. Labels describe exactly what they do.  
Error messages cite the specific cause. Success messages are single words ("Saved", "Done").
