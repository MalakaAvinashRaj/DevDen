# System Architecture — DevDen
**Authored and maintained by:** Architect  
**Status:** Active  
Last updated: 2026-05-07

> This is the authoritative system architecture document. Architect edits it.
> CPE, Software Engineer, and QA read it.

---

## System Overview

DevDen is an AI-powered SaaS factory. It takes on projects as **missions** and ships each one as a deployed SaaS product. The factory is a team of six AI agents, each mapped to a distinct engineering layer, collaborating through explicit file-based handoffs orchestrated by CPE. The system is entirely file-based — there is no runtime, no database, no API. State lives in markdown files. Communication happens through written handoff documents. The factory is not a product — it is the infrastructure that builds products.

---

## Domain Map

| Domain | Owns | Does NOT Own | Primary Location |
|--------|------|--------------|-----------------|
| Orchestration | Mission lifecycle, agent routing, release authority, task registry | Implementation, architecture design, testing | `CPE/` |
| Constraint | System architecture per mission, ExecPlans, timeline, risk | Code implementation, visual design, testing | `Architect/` |
| Design | Palette selection, design system, all visual decisions before code | Implementation, copy/content decisions | `ui-ux/` |
| Instruction | All code implementation, tests, bug fixes | Deployment, architectural decisions, design decisions | `software-engineer/` |
| Feedback | Feature testing, bug reports, QA sign-off | Bug fixing, test implementation in code | `QA/` |
| Memory | Agent performance monitoring, scoring, improvement recommendations | Modifying AGENTS.md files, assigning work | `Eval/` |
| Mission State | All active and completed project work | Agent-level instructions | `missions/` |
| Skills | Reusable capability modules available to all agents | Agent identity or role definition | `~/.agents/skills/` |

---

## The 6-Layer Harness Model

The six agents map to six harness engineering layers. Dependencies in routing flow through Orchestration only.

```
                    ┌─────────────────────────┐
                    │   ORCHESTRATION (CPE)   │  Routes all work. Final authority.
                    └───────────┬─────────────┘
          ┌──────────┬──────────┼───────────┬──────────┐
          ↓          ↓          ↓           ↓          ↓
    ┌──────────┐ ┌────────┐ ┌───────┐ ┌─────────┐ ┌────────┐
    │CONSTRAINT│ │DESIGN  │ │INSTR. │ │FEEDBACK │ │MEMORY  │
    │Architect │ │UI/UX   │ │  SE   │ │  QA     │ │ Eval   │
    └──────────┘ └────────┘ └───────┘ └─────────┘ └────────┘
```

**Routing rule:** Every agent communicates only with CPE. No direct agent-to-agent communication. This is structural — not a preference. Direct agent-to-agent creates untracked state and conflicting decisions.

**Layer function:**
- **Orchestration** — how all layers stitch together; only CPE assigns work
- **Constraint** — what the system is allowed to do; Architect sets the boundaries SE must stay inside
- **Design** — what the product looks like; UI/UX decides every visual question before SE starts
- **Instruction** — how work gets executed; SE builds from Architect's plan and UI/UX's design system
- **Feedback** — how errors flow back; QA is the only gate between SE output and production
- **Memory** — what persists and improves; Eval monitors and recommends, CPE decides and patches

---

## Mission Flow — How Work Moves Through the Factory

### Standard Feature Development
```
1. CLIENT-BRIEF.md dropped in missions/intake/
2. CPE reads brief → creates missions/active/MISSION-NNN/ from template
   CPE creates TASK-REGISTRY.md → populates initial task board
3. CPE → Architect (HANDOFF): design the system architecture
   Architect fills ARCHITECTURE.md + PLANS.md for this mission
4. CPE approves architecture → CPE → UI/UX (HANDOFF): produce design system
   UI/UX selects palette, writes missions/active/MISSION-NNN/DESIGN_SYSTEM.md
5. CPE approves design system → CPE → SE (HANDOFF): build per ExecPlan + DESIGN_SYSTEM.md
6. SE signals complete → CPE → QA (HANDOFF): test the feature
7. QA finds bugs → CPE → SE (HANDOFF): fix BUG-NNN, BUG-NNN
   Loop repeats until QA sends "APPROVED"
8. QA approved → CPE releases → mission status → Shipped
```

### Bug Found in Production
```
Bug reported → CPE assigns P0/P1 priority
CPE → SE: fix BUG-NNN (ID + severity + expected vs actual + repro)
SE fixes → CPE → QA: verify fix + regression test
QA approved → CPE hotfix release
```

### Eval Improvement Loop
```
Eval detects pattern in agent behaviour
→ Instance finding: CPE patches the agent's AGENTS.md
→ Pattern finding: CPE updates agent-development skill (~/.agents/...)
→ Applies globally to all future systems via the skill
```

---

## File-Based State Model

DevDen has no runtime. All system state lives in files. This is intentional.

| State Type | Lives In | Owned By |
|-----------|---------|---------|
| Mission status | `missions/active/MISSION-NNN/PROGRESS.md` | CPE |
| Task board | `missions/active/MISSION-NNN/TASK-REGISTRY.md` | CPE |
| System architecture (mission) | `missions/active/MISSION-NNN/ARCHITECTURE.md` | Architect |
| Visual spec (mission) | `missions/active/MISSION-NNN/DESIGN_SYSTEM.md` | UI/UX |
| Agent routing | `missions/active/MISSION-NNN/handoffs/` | CPE |
| Build plan | `missions/active/MISSION-NNN/exec-plans/active/` | Architect/SE |
| Bug log | `missions/active/MISSION-NNN/qa/bug-log/` | QA |
| Agent performance | `Eval/docs/agent-scores/` | Eval |
| Factory quality grades | `CPE/QUALITY_SCORE.md`, `QA/QUALITY_SCORE.md` | QA/CPE |
| Engineering decisions | `CPE/docs/decisions/` | CPE |

**Session continuity rule:** Every agent session begins by reading `PROGRESS.md` and the latest handoff file. State is never assumed from memory — it is read from files.

---

## Key Invariants — Non-Negotiable

- **All inter-agent communication routes through CPE.** No agent assigns work to another agent directly.
- **No code ships without QA sign-off.** The QA loop has no maximum iterations — it runs until QA approves.
- **SE never deploys.** CPE is the only agent that releases. SE builds; CPE ships.
- **No design decision is left open for SE.** UI/UX produces a complete, unambiguous DESIGN_SYSTEM.md before SE starts. If a question is open, SE sends it to CPE, not UI/UX directly.
- **Eval recommends; CPE decides.** Eval never modifies AGENTS.md files — it sends findings to CPE, which decides what to patch.
- **Architect plans; CPE assigns.** Architect never tasks SE directly — it writes ExecPlans and hands them to CPE.
- **Every handoff is a written file.** Verbal or implied handoffs do not exist in this system.

---

## Handoff Protocol

The handoff is the unit of inter-agent communication.

```
CPE writes HANDOFF.md → missions/active/MISSION-NNN/handoffs/YYYYMMDD-from-to-task.md
Receiving agent reads it as first action of their session
Receiving agent acknowledges in PROGRESS.md
Agent completes work → signals in PROGRESS.md
CPE reads → routes next handoff
```

**Required fields in every HANDOFF.md:**
- From / To / Mission / Date / Type
- What I Need You To Do (clear, one paragraph)
- Context You Need (file paths + why they matter)
- What happened before this handoff
- Constraints (decisions already made — do not re-open)
- Definition of Done (checkboxes)
- Priority (P0 / P1 / P2 / P3)

---

## Task Registry — Kanban Layer

Every active mission has a `TASK-REGISTRY.md` that is the data layer for the Kanban board. CPE owns it. Status values map 1:1 to Kanban columns: `backlog → todo → in-progress → on-hold → review → done`.

**Auto-hold rule:** A parent task with subtasks is `on-hold` until all subtasks reach `done`. CPE enforces this when updating the registry; the board enforces it visually.

→ Full schema and lifecycle: see `CPE/AGENTS.md` §Task Registry

---

## Design System Protocol

Before SE writes a single line of code for a mission, UI/UX delivers `DESIGN_SYSTEM.md` to the mission folder. It is complete and unambiguous — SE has zero visual decisions to make.

**Global component defaults (apply to all missions regardless of palette):**
- Buttons: outlined style (transparent background, coloured border + text)
- Inputs: underline style (bottom border only, no box)
- Edit pattern: pencil icon → inline accept/cancel (no modals)

**The 5 production palettes:**

| Palette | Mode | Default? | Best For |
|---------|------|----------|----------|
| Nordic | Light | ✅ Yes | Fintech, B2B, enterprise, compliance |
| Canvas | Light | No | Note-taking, wikis, writing tools |
| Base | Light | No | General SaaS, MVPs, no strong signal |
| Zinc | Dark | No | Dev tools, admin dashboards, analytics |
| Apollo | Dark | No | Engineering tools, developer productivity |

→ Full specs: `ui-ux/docs/palettes/`

---

## Deployment Defaults

SE never asks "where does this go?" — the answer is already decided.

| Layer | Default | Override via |
|-------|---------|-------------|
| Frontend | Vercel (auto-deploy from `main`) | Mission ARCHITECTURE.md |
| Backend / API | Railway | Mission ARCHITECTURE.md |
| Database | Railway Postgres | Mission ARCHITECTURE.md |
| Auth | Clerk or Supabase Auth | Mission ARCHITECTURE.md |
| CI/CD | GitHub Actions (lint + typecheck + test on PR) | `.github/workflows/ci.yml` |

**Pattern A** (full-stack): Vercel frontend + Railway API + Railway Postgres  
**Pattern B** (API only): Railway service + Railway Postgres  
**Pattern C** (static): Vercel only

→ Full deployment spec: `CPE/DEPLOYMENT.md`

---

## What This Document Does NOT Cover

- Per-mission system architecture → `missions/active/MISSION-NNN/ARCHITECTURE.md`
- API endpoint reference → see OpenAPI spec per mission
- Implementation details → in code and ExecPlans
- Historical design decisions → `CPE/docs/decisions/` and ExecPlan Decision Logs

---

## Architecture Change Protocol

1. Observe discrepancy between this document and actual system behaviour
2. Create a design doc in `Architect/docs/design-docs/` with options and tradeoffs
3. Report to CPE — Architect never self-approves architectural changes
4. CPE approves/rejects → Architect updates this file
5. Append to Change Log below

---

## Change Log

- 2026-05-07 — Initial architecture document written — DevDen factory: 6-agent harness, file-based state, mission system, task registry, design system, deployment defaults
