# CPE — Mission Intake Runbook
**Execute this checklist top-to-bottom for every new mission. No improvisation.**

---

## Step 0 — Orient

- [ ] Read `SOUL.md`
- [ ] Read `../../HEARTBEAT.md` — note how many missions are active and what the last mission number was
- [ ] Read the brief: `../../missions/intake/CLIENT-BRIEF-NNN-*.md`

---

## Step 1 — Determine Mission Number

Look at `../../missions/active/` and `../../missions/completed/` for the highest existing MISSION-NNN number.
New mission = that number + 1. If no missions exist, start at `MISSION-001`.

**Mission number:** MISSION-___
**Project name (kebab-case from brief):** ___________________
**Full folder name:** `MISSION-___-project-name`

---

## Step 2 — Create Folder Structure

Create exactly this structure. Every folder and file must exist before moving to Step 3.

```
missions/active/MISSION-NNN-project-name/
├── MISSION.md                          ← fill in Step 3
├── PROGRESS.md                         ← fill in Step 4
├── TASK-REGISTRY.md                    ← copy from missions/templates/TASK-REGISTRY.md
├── handoffs/                           ← empty folder, handoff written in Step 6
└── .agents/
    ├── cpe/
    │   └── MEMORY.md                   ← copy from missions/templates/AGENT-MEMORY-TEMPLATE.md, update header
    ├── architect/
    │   └── MEMORY.md                   ← same
    ├── ui-ux/
    │   └── MEMORY.md                   ← same
    ├── se/
    │   └── MEMORY.md                   ← same
    ├── qa/
    │   └── MEMORY.md                   ← same
    └── eval/
        └── MEMORY.md                   ← same
```

When copying MEMORY.md files: replace `[Agent Name]` with the agent name and `Mission: MISSION-NNN` with the real mission ID.

---

## Step 3 — Fill MISSION.md

Open `missions/templates/MISSION-TEMPLATE.md`. Fill every section using the client brief as source.

**Mapping: CLIENT-BRIEF → MISSION.md**

| MISSION.md Section | Source in Brief |
|--------------------|-----------------|
| Status | Set to `Intake` |
| Started | Today's date |
| Target ship | Brief → Timeline → deadline (or "TBD") |
| Mission type | Brief → About You → company ("Internal" if personal) |
| The Brief | Brief → The Problem + The Product Idea (combine into one paragraph) |
| The Goal | Brief → What "Done" Looks Like → first sentence |
| Client / Context | Brief → About You + Anything Else |
| Constraints | Brief → Budget + Timeline + Technical Context → existing codebase |
| Success Criteria | Brief → What "Done" Looks Like → convert each point to a checkbox |
| Scope — In scope | Brief → The Product Idea → features mentioned |
| Scope — Out of scope | Anything NOT mentioned in the brief. State explicitly what v1 will not have. |
| Tech Stack | Brief → Technical Context → preferred stack (or "TBD — Architect defines") |
| Timeline — milestones | Leave blank — Architect fills this in PLANS.md |
| Agent Assignments | Keep as-is from template |
| Mission Files | Keep as-is from template |

**Do not leave any section blank.** If the brief doesn't answer a section, write "TBD — Architect to define" or "Not specified in brief."

---

## Step 4 — Fill PROGRESS.md

Create `missions/active/MISSION-NNN/PROGRESS.md` with this exact content (fill in the blanks):

```markdown
# MISSION-NNN — [Project Name] — Progress Log
**Current phase:** Intake  
**Last updated:** YYYY-MM-DD  
**Updated by:** CPE

---

## Current Status

**Overall:** 🟡 In Progress  
**Blocker:** None — waiting for Architect to complete ARCHITECTURE.md and PLANS.md

---

## What's Been Done

- YYYY-MM-DD: Mission created by CPE. Client brief processed. Folder structure built. Handoff sent to Architect.

---

## What's Next

- Architect: produce ARCHITECTURE.md + PLANS.md + first ExecPlan
- CPE: review and approve Architect's deliverables
- Once approved: route to UI/UX for design system

---

## Open Questions

- [Any unresolved questions from the brief that affect architecture or scope]

---

## Session Log

| Date | Agent | Action |
|------|-------|--------|
| YYYY-MM-DD | CPE | Mission created. Brief processed. Architect handoff written. |
```

---

## Step 5 — Fill CPE's MEMORY.md

Open `.agents/cpe/MEMORY.md` and fill it:

```markdown
# CPE — Mission Memory
Mission: MISSION-NNN — [Project Name]
Last updated: YYYY-MM-DD

## What I Know So Far
- Client wants: [one sentence from brief]
- Key constraint: [most important constraint from brief]
- Stack: [tech stack from brief or "TBD"]
- Priority order: [1st priority from brief ranking]

## Decisions I've Made
| Date | Decision | Why |
|------|----------|-----|
| YYYY-MM-DD | Created mission as MISSION-NNN | First mission / follows from last mission number |

## Open Questions
- [Any unresolved questions from the brief]

## Handoff State
Last action: Wrote handoff to Architect  
Next action: Wait for Architect's ARCHITECTURE.md + PLANS.md, then review and approve  
Blocked on: Architect delivery
```

---

## Step 6 — Write First Handoff to Architect

Create `missions/active/MISSION-NNN/handoffs/YYYYMMDD-CPE-Architect-mission-design.md`

Fill it with this content (replace all placeholders):

```markdown
# Handoff: CPE → Architect
**Mission:** MISSION-NNN — [Project Name]
**Date:** YYYY-MM-DD
**From:** CPE
**To:** Architect
**Type:** Task Assignment

---

## What I Need You To Do

Design the system architecture for this mission and produce a milestone plan.
This is a greenfield [type] product. The client brief has been processed into MISSION.md.
You are cleared to start. SE does NOT start until CPE approves your deliverables.

---

## Context You Need

**Mission folder:** `missions/active/MISSION-NNN-project-name/`

**Read these first (in order):**
1. `missions/active/MISSION-NNN-project-name/MISSION.md` — full brief, scope, success criteria
2. `missions/active/MISSION-NNN-project-name/.agents/architect/MEMORY.md` — your working memory (empty for now)
3. `missions/active/MISSION-NNN-project-name/TASK-REGISTRY.md` — task board (empty for now)
4. `Architect/ARCHITECTURE.md` — DevDen factory architecture (how this system works)
5. `Architect/RELIABILITY.md` — reliability standards to design into the system
6. `Architect/SECURITY.md` — security requirements to bake in from the start

**What happened before this handoff:**
Brief received, processed, and mission folder created. No architecture or plan exists yet.
Tech stack from brief: [stack or "no preference — you decide"].
Key constraints: [list from brief].

---

## What I Need Back

Produce these three deliverables in `missions/active/MISSION-NNN-project-name/.agents/architect/`:

**1. ARCHITECTURE.md** — system design for this product. Must include:
- System overview (what this product is and how it works)
- Domain map (what each part owns)
- Tech stack decision with rationale
- Key architectural decisions and why
- What SE must stay inside (constraints)
- Security and reliability considerations

**2. PLANS.md** — milestone plan. Copy from `missions/templates/PLANS-TEMPLATE.md`. Must include:
- Milestones with target dates (M1, M2, etc.)
- Critical path
- Risk register (top 3 risks minimum)
- Definition of done for each milestone

**3. exec-plans/YYYYMMDD-[first-feature].md** — ExecPlan for the first SE task (if it is L/XL complexity)

---

## Constraints and Watch-Outs

- [Key constraint from brief — e.g., "free tier hosting only", "no auth in v1", "must integrate with X"]
- Do not define work for SE until ARCHITECTURE.md and PLANS.md are approved by CPE
- If you need to make a significant tech stack choice, note the tradeoff in the Decision Log

---

## Definition of Done

- [ ] `ARCHITECTURE.md` written and complete
- [ ] `PLANS.md` written with milestones, critical path, and risk register
- [ ] You have signalled CPE: "Architect complete — ARCHITECTURE.md and PLANS.md ready for review"
- [ ] MEMORY.md updated with key decisions and open questions

**Signal completion:** Write one line in `PROGRESS.md` under Session Log, then tell CPE directly:
"Architect complete — ARCHITECTURE.md and PLANS.md ready for review in .agents/architect/"

**Priority:** P1
```

---

## Step 7 — Update HEARTBEAT.md

Open `../../HEARTBEAT.md` and update all four sections:

**⚡ Agent Assignments** — this is the ping that wakes Architect:
- Architect row: Status → `ASSIGNED`, Mission → `MISSION-NNN`, Handoff File → filename from Step 6, Assigned → today

**Active Missions:**
- Add row: Mission = `MISSION-NNN`, Folder = `missions/active/MISSION-NNN-name/`, Phase = `Architecture`, Active Agent = `Architect`, Blocker = none

**Agent Status:**
- CPE: `Active — intake complete, handoff sent to Architect`
- Architect: `Assigned — awaiting session start`

**Session Log:**
- Add row: today's date, CPE, "MISSION-NNN created. Brief processed. Architect assigned."

---

## Step 8 — Move Brief to Processed

Rename the brief file in `missions/intake/` by adding a `PROCESSED-` prefix:
`missions/intake/PROCESSED-CLIENT-BRIEF-NNN-*.md`

This marks it as handled without deleting it.

---

## Intake Complete ✓

The mission is live. Architect has everything they need. You are waiting.
Next action: When Architect signals complete, review ARCHITECTURE.md and PLANS.md → approve or request changes → route to UI/UX.
