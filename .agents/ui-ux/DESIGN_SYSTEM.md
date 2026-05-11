# DevDen Design System — Factory Palettes
Authored by: UI/UX Engineer  
Applies to: All missions. One palette per product.

---

## How Palettes Work

Every SaaS DevDen ships uses exactly one of five palettes. The palette is chosen
during mission intake based on the product's personality and user. It is then
customised with a brand accent colour and confirmed typographic choices before SE starts.

The full specifications for each palette live in `docs/palettes/`. This file is the
index and selection guide.

---

## Palette Selection Guide

| Signal in the brief | Recommended palette |
|--------------------|---------------------|
| "Fintech", "B2B", "enterprise", "compliance", "payment", "healthcare" | **Nordic** |
| "Note-taking", "wiki", "writing tool", "knowledge base", "CMS", "warm" | **Canvas** |
| "Dev tool", "admin dashboard", "analytics", "dark mode first" | **Zinc** |
| "Engineering tool", "project management", "precision", "developer productivity" | **Apollo** |
| "General SaaS", "MVP", "startup", "dashboard", "no strong signal" | **Base** |
| No strong signal | **Nordic** (default) |

**When in doubt, use Nordic.** It is the most universally trusted palette — professional
without being sterile, and works for fintech, B2B SaaS, healthcare, and enterprise equally.
Dark palettes (Zinc, Apollo) require a clear brief signal — most users default to light mode.

---

## Palette Index

| Palette | Mode | Personality | Inspired by | Full spec |
|---------|------|-------------|-------------|-----------|
| **Nordic** | Light | Trustworthy, precise, calm | Stripe + Nord Health | `docs/palettes/nordic.md` |
| **Canvas** | Light | Warm, readable, human | Notion | `docs/palettes/canvas.md` |
| **Base** | Light | Neutral, versatile, brand-ready | Saas UI + Chakra UI | `docs/palettes/base.md` |
| **Zinc** | Dark | Neutral, professional, brandable | shadcn/ui zinc theme | `docs/palettes/zinc.md` |
| **Apollo** | Dark | Engineered, exact, precise | Linear | `docs/palettes/apollo.md` |

---

## Global Component Defaults

These rules apply across **all five palettes** and override any palette-level component spec.
UI/UX Engineer must carry these into every mission DESIGN_SYSTEM.md without exception.

---

### Buttons — Outlined Style

Every button variant uses an outlined style. No solid filled backgrounds except on explicit
destructive actions.

| Variant | Border | Background | Text | Hover |
|---------|--------|------------|------|-------|
| Primary | 1.5px `accent` | transparent | `accent` | Fill `accent`, text white |
| Secondary | 1.5px `border-strong` | transparent | `text-primary` | Fill `background-subtle`, border `accent`, text `accent` |
| Ghost | none | transparent | `text-secondary` | Background `background-subtle`, text `text-primary` |
| Destructive | 1.5px `destructive` | transparent | `destructive` | Fill `destructive`, text white |

> **Why outlined:** Visual consistency across all palettes. Outlined buttons read clearly
> on both light and dark backgrounds, reduce visual weight, and keep the UI from feeling
> crowded when multiple actions appear together.

---

### Inputs — Underline Style

Input fields use a bottom border only — no all-sides box border.

```css
/* Applied to all text inputs, selects, textareas */
border: none;
border-bottom: 1.5px solid var(--border);
border-radius: 0;
background: transparent;
padding: 8px 0;

/* Focus */
border-bottom-color: var(--accent);
box-shadow: none; /* no focus ring — the border colour change is the signal */
outline: none;

/* Error */
border-bottom-color: var(--destructive);
```

Labels sit above the field. Placeholder text uses `text-tertiary`. Helper/error text
sits below the field at `xs` size.

> **Why underline:** Form fields feel lighter and less like UI widgets — closer to
> a paper form. Reduces visual noise when multiple fields stack vertically.

---

### Edit Pattern — Inline Pencil → Accept / Cancel

Wherever a field or row is editable in place, use this pattern:

**View mode:**
- Field displays as static text
- Pencil icon (`Lucide: Pencil`, 14px, `text-tertiary`) appears to the right of the value
- On row hover: pencil shifts to `text-secondary`
- Clicking pencil activates edit mode

**Edit mode:**
- Field becomes an underline input (see above)
- Two icon buttons appear inline to the right:
  - Accept: `Lucide: Check`, 16px, `success` colour — saves the change
  - Cancel: `Lucide: X`, 16px, `text-secondary` — discards and returns to view mode
- Pressing `Enter` = Accept. Pressing `Escape` = Cancel.
- No modal. No separate save button. No page reload.

```
View:   Annual Revenue    $240,000  ✏
Edit:   Annual Revenue    [240000_________]  ✓  ✗
```

> **Why this pattern:** Minimal disruption. The user never leaves context. The pencil
> signals editability without cluttering the default view. Accept/Cancel are immediately
> obvious because they use universal icons.

---

## What UI/UX Produces Per Mission

For each mission, UI/UX delivers one file:
```
missions/active/MISSION-NNN/DESIGN_SYSTEM.md
```

This file takes the chosen palette as its base and specifies every design token,
component style, and tone note for this specific product. SE reads this file and builds
from it — no design decisions are left open.
