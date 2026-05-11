# Canvas — Warm Light
**Mode:** Light  
**Personality:** Warm, readable, human. Built for long sessions and content-heavy products.  
**Inspired by:** Notion's production design system — the most widely used productivity palette in SaaS.  
**Best for:** Note-taking, wikis, CMS, knowledge bases, writing tools, internal tools, productivity apps.

---

## Colours

### Base Tokens
| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#FFFFFF` | Page background |
| `background-subtle` | `#F7F6F3` | Sidebar, secondary panels — warm gray |
| `surface` | `#F1F1EF` | Cards, code blocks, callouts |
| `surface-raised` | `#FFFFFF` | Elevated cards |
| `border` | `#E8E8E6` | Dividers — warm-tinted, not cool gray |
| `border-strong` | `#D3D3D0` | Table lines, strong separators |
| `text-primary` | `#37352F` | Body, headings — warm near-black, not #000 |
| `text-secondary` | `#9B9A97` | Labels, subtext |
| `text-tertiary` | `#C4C4C0` | Disabled, placeholder |
| `text-inverse` | `#FFFFFF` | Text on dark backgrounds |

> **Key principle:** Canvas uses warm-tinted neutrals throughout — no cool grays.  
> `#37352F` instead of `#111827`. `#F7F6F3` instead of `#F9FAFB`.  
> This warmth reduces eye strain in long reading/writing sessions.

### Accent (customise per mission)
| Token | Hex | Usage |
|-------|-----|-------|
| `accent` | `#2EAADC` | Links, focus, active states |
| `accent-hover` | `#1E8FC2` | Hover |
| `accent-subtle` | `#E5F5FB` | Tinted accent backgrounds, tag highlights |
| `accent-foreground` | `#FFFFFF` | Text on accent |

> **Mission customisation:** Canvas works with any mid-saturation accent.  
> Keep it away from warm oranges/reds — they blend with the warm background tone.  
> Good swaps: sage `#4C8C4A`, warm purple `#9065B0`, slate blue `#3B5998`.

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#2D9E5A` | Positive |
| `success-subtle` | `#F0FFF4` | Success backgrounds |
| `warning` | `#CB9B22` | Caution — warm amber |
| `warning-subtle` | `#FFF8E6` | Warning tint |
| `destructive` | `#D44C47` | Errors — warm red, not alarming |
| `destructive-subtle` | `#FFF2F2` | Error tint |
| `muted` | `#F1F1EF` | Disabled |
| `muted-foreground` | `#C4C4C0` | Disabled text |

---

## Typography

**Font:** System UI stack — Canvas feels native on every OS. No custom font import needed.  
`-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`  
**Heading alternative:** Inter (if cross-platform consistency matters more than native feel)  
**Code:** `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace`

### Type Scale
| Step | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| `xs` | 12px | 400 | 1.5 | 0 | Captions, tags |
| `sm` | 14px | 400 | 1.6 | 0 | Secondary, labels |
| `base` | 16px | 400 | 1.7 | 0 | Body — tall line-height for readability |
| `lg` | 18px | 500 | 1.5 | 0 | Subheadings |
| `xl` | 20px | 600 | 1.4 | -0.01em | Card headings |
| `2xl` | 24px | 600 | 1.3 | -0.01em | Section headings |
| `3xl` | 32px | 700 | 1.2 | -0.02em | Page headings |
| `display` | 48px | 700 | 1.1 | -0.02em | Hero |

> Canvas uses 1.7 line-height for body text — reading comfort is a core value here.

---

## Spacing

**Base unit:** 4px. Canvas uses generous padding — breathing room is part of the design.

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

Subtle rounded — approachable, not overly playful.

| Element | Value |
|---------|-------|
| Buttons | 4px |
| Inputs | 4px |
| Cards | 4px |
| Modals | 8px |
| Badges / Tags | 3px |
| Avatars | 50% |

> Canvas uses very low radius — it reads as calm and editorial, not bubbly.

---

## Shadows

Barely-there shadows — depth comes from background contrast, not shadows.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(55,53,47,0.08)` | Card lift — warm shadow tint |
| `shadow-md` | `0 3px 8px rgba(55,53,47,0.1)` | Dropdowns |
| `shadow-lg` | `0 8px 20px rgba(55,53,47,0.12)` | Modals |

> Shadow colour uses `text-primary` RGB (`55,53,47`) — maintains warmth even in shadows.

---

## Buttons

### Primary
- Background: `accent` · Text: white · Radius: 4px · Font: sm/500
- Hover: `accent-hover`

### Secondary
- Background: `surface` · Border: 1px `border-strong` · Text: `text-primary`
- Hover: background `background-subtle`

### Ghost
- Background: transparent · Text: `text-secondary`
- Hover: background `surface`, text `text-primary`

### Destructive
- Background: `destructive` · Text: white

### Sizes
| Size | Padding | Font |
|------|---------|------|
| sm | `5px 10px` | 13px |
| md | `7px 14px` | 14px |
| lg | `9px 18px` | 16px |

---

## Inputs

- Background: `surface` · Border: 1px `border` · Radius: 4px
- Padding: `8px 12px` · Font: base/400 · Text: `text-primary`
- Placeholder: `text-tertiary`
- Focus: border `accent`, `box-shadow: 0 0 0 2px rgba(46,170,220,0.2)`

---

## Icons

**Library:** Lucide Icons · Stroke: 1.5px · Sizes: 14 / 16 / 20 / 24px

---

## Motion

| Property | Value |
|----------|-------|
| Duration | 150ms |
| Easing | `ease-out` |

Gentle, unobtrusive. Canvas products should feel like paper — no jarring transitions.

---

## Tone & Voice

Warm. Clear. Helpful without being clingy.  
The product is a thinking tool — copy supports thinking, it doesn't interrupt it.  
Empty states encourage without overwhelming. Error messages are calm, not alarming.
