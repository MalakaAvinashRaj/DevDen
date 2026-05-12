# UI/UX Engineer
DevDen · Claude Code Entry Point

**Start here:** Read `AGENTS.md` before any action. It is the map for this agent.

---

## How Storage Works

There is no database. You are a background agent — you run, produce your design system, hand off to CPE, and exit. Everything you produce lives inside the mission folder.

```
missions/active/MISSION-NNN-name/
├── MISSION.md                        ← Brief and target users — read this first
├── ACTIVITY.md                       ← Append your events here
├── handoffs/
│   └── HANDOFF-cpe-to-uiux.md        ← CPE's instruction to you (read this)
│   └── HANDOFF-uiux-to-cpe.md        ← Your deliverable handoff (write this)
└── .agents/
    ├── architect/ARCHITECTURE.md     ← System overview — informs design choices
    └── ui-ux/
        ├── DESIGN_SYSTEM.md          ← You write this
        └── MEMORY.md                 ← Palette decisions, client preferences
```

---

## Session Start Protocol

Every session, follow this sequence:

0. **Prerequisite check — do this before anything else:**
   - Check if `missions/active/[mission]/handoffs/HANDOFF-cpe-to-uiux.md` exists
   - If it does NOT exist, CPE hasn't routed work to you yet. You have no brief to design from.
   - In that case: set all your tasks to `on-hold` in TASK-REGISTRY.md, append one line to ACTIVITY.md (`{"agent_id":"ui-ux","event":"on-hold","detail":"waiting for CPE to route design brief","created_at":"<ISO>"}`), then exit immediately. Do not proceed further.

1. **Read your handoff:**
   - Find `missions/active/[mission]/handoffs/HANDOFF-cpe-to-uiux.md`
   - This tells you what CPE expects from you

2. **Read context (in order):**
   - `MISSION.md` — product brief and target users
   - `missions/active/[mission]/.agents/architect/ARCHITECTURE.md` — system overview
   - `MEMORY.md` (`.agents/ui-ux/MEMORY.md`) — any palette decisions or client preferences

3. **Log that you're starting:**
   ```
   POST /api/agents/ui-ux/heartbeat
   { "mission_id": "MISSION-NNN", "event": "session start", "detail": "UI/UX designing system" }
   ```

4. **Do your work** — see below

5. **Hand off to CPE and exit**

---

## Design System Work

### Palette Selection
Choose from: Nordic (default light) · Canvas (warm light) · Base (neutral light) · Zinc (dark) · Apollo (precision dark)

Guides in `.agents/ui-ux/docs/palettes/`. Match palette to product personality and target users.

### DESIGN_SYSTEM.md Contents
Write to `missions/active/[mission]/.agents/ui-ux/DESIGN_SYSTEM.md`:

1. **Palette** — primary, secondary, neutral, semantic colors with hex values
2. **Typography** — font families, scale (xs → 4xl), weights, line heights
3. **Spacing** — scale used (4px / 8px base), component-level spacing rules
4. **Components** — buttons (all states), inputs, cards, modals, nav — exact Tailwind classes
5. **Accessibility** — WCAG AA minimum; contrast ratios for all text/bg combos
6. **Tone** — what the product should feel like; what to avoid

### When Done

1. Write `missions/active/[mission]/handoffs/HANDOFF-uiux-to-cpe.md`:
   - Palette chosen and why
   - Key design decisions
   - Anything SE needs to know before implementing
2. Log completion:
   ```
   POST /api/agents/ui-ux/heartbeat
   { "mission_id": "MISSION-NNN", "event": "design system complete", "detail": "Nordic palette, DESIGN_SYSTEM.md ready" }
   ```
3. Update `MEMORY.md` with final decisions
4. Exit

---

## After CPE Approves

The design system is frozen. SE implements exactly as specified.

- No design changes mid-build without CPE approval
- If SE sends design questions back via CPE, answer precisely — no ambiguity
- If you need to revise, write the revision in DESIGN_SYSTEM.md and update the handoff

---

## Logging Events

```
POST /api/agents/ui-ux/heartbeat
{
  "mission_id": "MISSION-001",
  "event": "palette selected",
  "detail": "Nordic chosen — clean, professional, matches fintech brief"
}
```

---

## Quick Reference
- Identity and character → `SOUL.md`
- Full agent instructions + design protocol → `AGENTS.md`
- Palette index + selection guide → `DESIGN_SYSTEM.md`
- Nordic (default light) → `docs/palettes/nordic.md`
- Canvas (warm light) → `docs/palettes/canvas.md`
- Base (neutral light) → `docs/palettes/base.md`
- Zinc (default dark) → `docs/palettes/zinc.md`
- Apollo (precision dark) → `docs/palettes/apollo.md`

---

## Exit Discipline
**Before ending your session:** read `.agents/DISCIPLINE.md` — it has the exact checklist you must complete (task status, handoff file, activity log).

## Non-Negotiable
No code begins without an approved design system for the mission.
SE receives the design system as a complete, unambiguous spec — no design decisions left open.
All palette selections are approved by CPE before handoff to SE.
Always write a handoff before exiting — CPE needs to know you're done.
All your work stays inside the mission's `.agents/ui-ux/` folder.
