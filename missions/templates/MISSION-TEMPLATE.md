# MISSION-NNN — [Project Name]
**Status:** Intake / Design / Build / QA / Shipped
**Started:** YYYY-MM-DD
**Target ship:** YYYY-MM-DD
**Mission type:** Client Project / Internal Product / Experiment

---

## The Brief

[One paragraph: what is this product? Who uses it? What problem does it solve?
Write this as if briefing someone who has never heard of it. Be concrete.]

---

## The Goal

[One sentence: what does "mission complete" look like?]
Example: "A deployed, QA-approved SaaS that lets [user] do [outcome] without [pain]."

---

## Client / Context

**Client:** [Name, company, or "Internal"]
**Background:** [Relevant context about the client or domain]
**Constraints:** [Budget, timeline pressure, tech stack requirements, non-negotiables]

---

## Success Criteria

How we know the mission is complete and the product is shippable:
- [ ] [Observable criterion 1 — e.g., "User can complete the core flow end-to-end"]
- [ ] [Observable criterion 2]
- [ ] [Observable criterion 3]
- [ ] QA has approved all features
- [ ] No open P0 or P1 bugs
- [ ] CPE has signed off on release

---

## Scope

**In scope:**
- [Feature / capability 1]
- [Feature / capability 2]

**Explicitly out of scope (v1):**
- [What will NOT be built in this mission]
- [What is deferred to a future mission]

---

## Tech Stack

[What the product is built on — framework, database, hosting, key libraries]
Leave blank if not yet decided — Architect will define this in ARCHITECTURE.md.

---

## Timeline

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Architecture + Plan approved | YYYY-MM-DD | — |
| M1: [name] | YYYY-MM-DD | — |
| M2: [name] | YYYY-MM-DD | — |
| QA sign-off | YYYY-MM-DD | — |
| Ship | YYYY-MM-DD | — |

---

## Agent Assignments

| Agent | Role on This Mission |
|-------|---------------------|
| CPE | Orchestration, client communication, release decisions |
| Architect | System design, ExecPlans, timeline tracking |
| UI/UX Engineer | Palette selection, mission design system, visual QA |
| Software Engineer | Full implementation |
| QA | Feature testing, bug reporting |
| Eval | Sprint-end performance review |

---

## Mission Files

**Root of mission folder:**

| File | Author | Purpose |
|------|--------|---------|
| `MISSION.md` | CPE | Brief, goal, scope, success criteria (this file) |
| `TASK-REGISTRY.md` | CPE | Kanban task board — all tasks, subtasks, dependencies |
| `PROGRESS.md` | CPE | Live status, updated each session |
| `handoffs/` | CPE | Agent routing files |

**Agent work products (`.agents/[agent]/`):**

| Path | Author | Purpose |
|------|--------|---------|
| `.agents/cpe/` | CPE | Decisions, product specs, feature briefs |
| `.agents/architect/ARCHITECTURE.md` | Architect | System design for this product |
| `.agents/architect/PLANS.md` | Architect | Milestone plan, critical path |
| `.agents/architect/exec-plans/` | Architect | ExecPlans for complex tasks |
| `.agents/ui-ux/DESIGN_SYSTEM.md` | UI/UX | Palette + full visual spec |
| `.agents/ui-ux/design-decisions/` | UI/UX | Palette selection rationale |
| `.agents/se/exec-plans/` | SE | SE implementation plans |
| `.agents/qa/QUALITY_SCORE.md` | QA | Per-domain quality grades |
| `.agents/qa/test-plans/` | QA | Test plans for this mission |
| `.agents/qa/bug-log/` | QA | active/ + resolved/ bugs |
| `.agents/eval/` | Eval | Mission-specific eval reports |

> CPE creates TASK-REGISTRY.md from `missions/templates/TASK-REGISTRY.md` at mission start.

---

## Notes and Open Questions

[Any unresolved questions, risks, or context that agents need to know before starting]

---

## Mission Log

> Append significant events here as the mission progresses.

| Date | Event | By |
|------|-------|-----|
| YYYY-MM-DD | Mission created | CPE |
