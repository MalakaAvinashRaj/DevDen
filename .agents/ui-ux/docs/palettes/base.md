# Base — Neutral Light
**Mode:** Light  
**Personality:** Balanced, versatile, brand-ready. The palette that gets out of the way and lets the product speak.  
**Inspired by:** Saas UI + Chakra UI design systems — production defaults used across thousands of light-mode SaaS products.  
**Best for:** General SaaS dashboards, admin panels, startup MVPs, any product without a strong mood directive.

---

## Colours

### Base Tokens
| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#F9FAFA` | Page background — off-white, not stark |
| `background-subtle` | `#F1F3F5` | Sidebar, secondary panels |
| `surface` | `#FFFFFF` | Cards, inputs — white floats above background |
| `surface-raised` | `#FFFFFF` | Elevated cards — depth from shadow |
| `border` | `#E7E7E8` | Dividers, input borders |
| `border-strong` | `#CDCED0` | Focus states, table lines |
| `text-primary` | `#171A1D` | Body, headings — near-black, neutral |
| `text-secondary` | `#6C7074` | Labels, subtext |
| `text-tertiary` | `#A8AAAD` | Disabled, hints |
| `text-inverse` | `#FFFFFF` | Text on dark backgrounds |

> **Key principle:** Base uses true neutral grays — no warm tint, no cool tint.  
> Pure neutrals are the most brandable foundation: any accent colour snaps cleanly against them.

### Accent (customise per mission)
| Token | Hex | Usage |
|-------|-----|-------|
| `accent` | `#8952E0` | Links, buttons, focus — default violet |
| `accent-hover` | `#7340C8` | Hover |
| `accent-subtle` | `#F3EDFD` | Tinted accent backgrounds |
| `accent-foreground` | `#FFFFFF` | Text on accent |

> **Mission customisation:** Base's neutral foundation accepts any accent colour cleanly.  
> The default violet distinguishes it from the blue-heavy fintech space.  
> Easy swaps: `#3B82F6` (blue), `#10B981` (emerald), `#F59E0B` (amber), `#EF4444` (red-action).  
> Avoid muted pastels — they disappear against near-white backgrounds.

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#16A34A` | Positive states |
| `success-subtle` | `#F0FDF4` | Success tint |
| `warning` | `#D97706` | Caution |
| `warning-subtle` | `#FFFBEB` | Warning tint |
| `destructive` | `#DC2626` | Errors, destructive actions |
| `destructive-subtle` | `#FEF2F2` | Error tint |
| `muted` | `#F1F3F5` | Disabled backgrounds |
| `muted-foreground` | `#A8AAAD` | Disabled text |

---

## Typography

**Font:** Inter Variable (`@fontsource-variable/inter`)  
**Fallback:** `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif`  
**Code:** `JetBrains Mono, Menlo, monospace`

### Type Scale
| Step | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| `xs` | 12px | 400 | 1.5 | 0 | Captions, timestamps |
| `sm` | 14px | 400 | 1.5 | 0 | Labels, table cells |
| `base` | 16px | 400 | 1.6 | 0 | Body text |
| `lg` | 18px | 500 | 1.4 | -0.01em | Card headings |
| `xl` | 20px | 600 | 1.3 | -0.01em | Section headings |
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
| `space-24` | 96px |

---

## Border Radius

Moderate rounding — approachable without being playful.

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

Standard elevation system — visible but not dramatic.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)` | Card default |
| `shadow-md` | `0 4px 8px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.05)` | Dropdowns |
| `shadow-lg` | `0 8px 20px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05)` | Modals |
| `shadow-focus` | `0 0 0 3px rgba(137,82,224,0.2)` | Focus ring — matches accent |

---

## Buttons

### Primary
- Background: `accent` · Text: white · Radius: 6px · Font: sm/500
- Hover: `accent-hover` · Active: scale(0.98)
- Disabled: `muted`, `muted-foreground`

### Secondary
- Background: `surface` · Border: 1.5px `border-strong` · Text: `text-primary`
- Hover: border `accent`, text `accent`

### Ghost
- Background: transparent · Text: `text-secondary`
- Hover: background `background-subtle`, text `text-primary`

### Destructive
- Background: `destructive` · Text: white

### Sizes
| Size | Padding | Font |
|------|---------|------|
| sm | `6px 12px` | 13px |
| md | `8px 16px` | 14px |
| lg | `10px 20px` | 16px |

---

## Inputs

- Background: `surface` · Border: 1.5px `border` · Radius: 6px
- Padding: `8px 12px` · Font: base/400 · Text: `text-primary`
- Placeholder: `text-tertiary`
- Focus: border `accent`, `box-shadow: shadow-focus`
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

Helpful. Clear. Professional without being stiff.  
Guides users through tasks with minimum friction. Empty states invite action.  
Error messages are specific — tell the user what went wrong and what to do next.
