# Zinc — Dark Dashboard
**Mode:** Dark  
**Personality:** Neutral, professional, infinitely brandable. The most-deployed dark SaaS palette in the Next.js ecosystem.  
**Inspired by:** shadcn/ui zinc theme — used by hundreds of thousands of production apps.  
**Default dark palette for all DevDen missions.**  
**Best for:** Dev tools, admin dashboards, analytics, B2B SaaS, any product where the user spends hours per day.

---

## Colours

### Base Tokens
| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#09090B` | Page background |
| `background-subtle` | `#0F0F11` | Sidebar, secondary sections |
| `surface` | `#18181B` | Cards, inputs, panels |
| `surface-raised` | `#1F1F23` | Elevated cards, dropdowns |
| `border` | `#27272A` | Dividers, input borders |
| `border-strong` | `#3F3F46` | Focus states, strong separators |
| `text-primary` | `#FAFAFA` | Headings, body |
| `text-secondary` | `#A1A1AA` | Labels, subtext |
| `text-tertiary` | `#52525B` | Disabled, hints |
| `text-inverse` | `#09090B` | Text on light backgrounds |

### Accent (customise per mission)
| Token | Hex | Usage |
|-------|-----|-------|
| `accent` | `#FAFAFA` | Default: white-on-dark. Swap for brand colour. |
| `accent-hover` | `#E4E4E7` | Hover on accent |
| `accent-subtle` | `#27272A` | Tinted accent background |
| `accent-foreground` | `#09090B` | Text on accent |

> **Mission customisation:** Zinc is designed to be neutral so any brand colour works on top.  
> Good accent swaps: `#6366F1` (indigo), `#3B82F6` (blue), `#10B981` (emerald), `#F59E0B` (amber).  
> Avoid warm reds as primary — they read as destructive on dark backgrounds.

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#22C55E` | Positive states |
| `success-subtle` | `rgba(34,197,94,0.1)` | Success tint |
| `warning` | `#F59E0B` | Caution |
| `warning-subtle` | `rgba(245,158,11,0.1)` | Warning tint |
| `destructive` | `#EF4444` | Errors, deletes |
| `destructive-subtle` | `rgba(239,68,68,0.1)` | Error tint |
| `muted` | `#27272A` | Disabled backgrounds |
| `muted-foreground` | `#71717A` | Disabled text |

---

## Typography

**Font:** Inter (variable font preferred — `@fontsource-variable/inter`)  
**Fallback:** `ui-sans-serif, system-ui, -apple-system, sans-serif`  
**Code:** `JetBrains Mono, Menlo, monospace`

### Type Scale
| Step | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| `xs` | 12px | 400 | 1.5 | 0 | Timestamps, badges |
| `sm` | 14px | 400 | 1.5 | 0 | Labels, table cells, secondary |
| `base` | 16px | 400 | 1.6 | 0 | Body text |
| `lg` | 18px | 500 | 1.4 | -0.01em | Section subheadings |
| `xl` | 20px | 600 | 1.3 | -0.01em | Card headings |
| `2xl` | 24px | 600 | 1.2 | -0.02em | Page subheadings |
| `3xl` | 32px | 700 | 1.1 | -0.02em | Page headings |
| `display` | 48px | 700 | 1.0 | -0.03em | Hero |

---

## Spacing

**Base unit:** 4px

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |
| `space-16` | 64px |

---

## Border Radius

shadcn/ui uses `--radius: 0.625rem` (10px) as the base, with derived values.

| Element | Value |
|---------|-------|
| Buttons | 6px |
| Inputs | 6px |
| Cards | 8px |
| Modals | 12px |
| Badges | 4px |
| Avatars | 50% |
| Tooltips | 6px |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.5)` | Subtle lift on dark |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.6)` | Cards, dropdowns |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.7)` | Modals |
| `shadow-xl` | `0 16px 48px rgba(0,0,0,0.8)` | Command palette |

---

## Buttons

### Primary
- Background: `accent` · Text: `accent-foreground` · Radius: 6px · Font: sm/500
- Hover: `accent-hover` · Active: scale(0.98)
- Disabled: `muted` background, `muted-foreground` text

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
| sm | `6px 12px` | 12px |
| md | `8px 16px` | 14px |
| lg | `10px 20px` | 16px |

---

## Inputs

- Background: `background` · Border: 1px `border` · Radius: 6px
- Padding: `8px 12px` · Font: sm/400 · Text: `text-primary`
- Placeholder: `text-tertiary`
- Focus: border `accent`, `box-shadow: 0 0 0 2px rgba(accent, 0.2)`
- Error: border `destructive`

---

## Icons

**Library:** Lucide Icons · Stroke: 1.5px · Sizes: 14 / 16 / 20 / 24px

---

## Motion

| Property | Value |
|----------|-------|
| Duration | 150ms |
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)` |

---

## Tone & Voice

Neutral. Precise. Gets out of the user's way.  
Error messages are informative, not apologetic. Labels are short. CTAs use verbs.
