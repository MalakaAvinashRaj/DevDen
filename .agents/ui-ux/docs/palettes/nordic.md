# Nordic — Clean Light Professional
**Mode:** Light  
**Personality:** Trustworthy, precise, calm. The palette that signals reliability before the user reads a word.  
**Inspired by:** Stripe Elements + Nord Health design systems — two of the most rigorous light SaaS token sets in production.  
**Default palette for all DevDen missions.**  
**Best for:** Fintech, B2B SaaS, healthcare, enterprise tools, compliance-heavy products, payment flows.

---

## Colours

### Base Tokens
| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#F6F9FC` | Page background — not pure white, reduces harshness |
| `background-subtle` | `#EEF2F7` | Sidebar, secondary sections |
| `surface` | `#FFFFFF` | Cards, inputs — white floats above background |
| `surface-raised` | `#FFFFFF` | Same — depth comes from shadow, not colour |
| `border` | `#D8DEE4` | Dividers, input borders |
| `border-strong` | `#B8C4CF` | Focus emphasis, table headers |
| `text-primary` | `#30313D` | Body, headings — off-black, softer than #000 |
| `text-secondary` | `#667680` | Labels, subtext |
| `text-tertiary` | `#98A5AF` | Disabled, hints |
| `text-inverse` | `#FFFFFF` | Text on dark surfaces |

### Accent (customise per mission)
| Token | Hex | Usage |
|-------|-----|-------|
| `accent` | `#0570DE` | Primary buttons, links, focus rings |
| `accent-hover` | `#0258B8` | Hover state |
| `accent-subtle` | `#EBF5FF` | Tinted accent backgrounds |
| `accent-foreground` | `#FFFFFF` | Text on accent |

> **Mission customisation:** Nordic's blue is an institution. For non-financial products,  
> it can be swapped for: forest green `#0F7B6C`, slate `#3559C7`, warm teal `#0E7C7B`.  
> Keep it cool-toned — warm accents fight this palette's character.

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#1D8633` | Confirmed, completed |
| `success-subtle` | `#F0FFF4` | Success tint |
| `warning` | `#B7791F` | Caution — darker amber for contrast on light |
| `warning-subtle` | `#FFFBEB` | Warning tint |
| `destructive` | `#DF1B41` | Errors, destructive actions |
| `destructive-subtle` | `#FFF5F5` | Error tint |
| `muted` | `#EEF2F7` | Disabled backgrounds |
| `muted-foreground` | `#98A5AF` | Disabled text |

---

## Typography

**Font:** Inter (variable) — primary  
**Fallback:** `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`  
**Code:** `JetBrains Mono, Menlo, monospace`

### Type Scale
| Step | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| `xs` | 12px | 400 | 1.5 | 0 | Captions, fine print |
| `sm` | 14px | 400 | 1.5 | 0 | Labels, table cells |
| `base` | 16px | 400 | 1.6 | 0 | Body text |
| `lg` | 18px | 500 | 1.4 | -0.01em | Card headings |
| `xl` | 20px | 600 | 1.3 | -0.01em | Section headings |
| `2xl` | 24px | 700 | 1.2 | -0.02em | Page subheadings |
| `3xl` | 32px | 700 | 1.1 | -0.02em | Page headings |
| `display` | 48px | 800 | 1.0 | -0.03em | Hero, landing |

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

Sharp — trust-signalling precision. Stripe and Nord both deliberately avoid soft corners.

| Element | Value |
|---------|-------|
| Buttons | 4px |
| Inputs | 4px |
| Cards | 6px |
| Modals | 8px |
| Badges | 3px |
| Avatars | 50% |
| Tooltips | 4px |

---

## Shadows

Light, precise shadows — elevation is functional, not decorative.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-none` | none | Flat |
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` | Card default |
| `shadow-md` | `0 4px 8px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` | Dropdowns |
| `shadow-lg` | `0 8px 16px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)` | Modals |
| `shadow-focus` | `0 0 0 3px rgba(5,112,222,0.25)` | Focus ring |

---

## Buttons

### Primary
- Background: `accent` · Text: white · Radius: 4px · Font: sm/600
- Hover: `accent-hover` · Active: scale(0.99)
- Disabled: `muted`, `muted-foreground`

### Secondary
- Background: `surface` · Border: 1.5px `border` · Text: `text-primary`
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

- Background: `surface` · Border: 1.5px `border` · Radius: 4px
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

Conservative motion — only transitions that communicate state. Nothing decorative.

---

## Tone & Voice

Measured. Clear. Authoritative without being cold.  
Confirms actions with specifics ("Payment of $240 saved" not "Success!").  
Error messages include what went wrong and what to do. No exclamation marks.
