# DevDen System Architecture

Complete specification of the AI-powered SaaS factory.

---

## Core Model

**Five-layer harness** — each layer is an agent:

```
        CPE (Orchestration)
       / | \ \
      /  |  \ \
  Architect | Eval
      |    |
   Software    QA
   Engineer
```

**Each layer's job:**
- **Instruction** (Software Engineer): How work gets executed
- **Constraint** (Architect): What the system is allowed to do
- **Feedback** (QA): How errors flow back
- **Memory** (Eval): What persists and improves over time
- **Orchestration** (CPE): How all layers are stitched together

**Non-negotiable rules:**
1. No code ships without QA sign-off (loop runs until clean)
2. All inter-agent communication routes through CPE only
3. Eval never modifies agent files (recommends; CPE decides)
4. Architect never assigns tasks (plans; CPE assigns)
5. Software Engineer never deploys (builds; CPE releases)

---

## Folder Structure

```
DevDen/
├── .agents/                          ← agent protocols (stateless)
│   ├── cpe/
│   │   ├── CLAUDE.md                 ← entry point for Claude Code
│   │   ├── AGENTS.md                 ← full role spec + protocols
│   │   ├── SOUL.md                   ← identity and character
│   │   ├── INTAKE-RUNBOOK.md         ← mechanical checklist (8 steps)
│   │   ├── MISSIONS.md               ← how missions flow
│   │   ├── TEAM.md                   ← agent routing table
│   │   ├── PRODUCT_SENSE.md          ← quality bar
│   │   ├── DEPLOYMENT.md             ← hosting defaults
│   │   └── docs/
│   ├── architect/ (similar structure)
│   ├── software-engineer/
│   ├── qa/
│   ├── ui-ux/
│   └── eval/
│
├── missions/                         ← all project work
│   ├── intake/                       ← drop CLIENT-BRIEF.md here
│   ├── active/                       ← missions currently in flight
│   │   └── MISSION-NNN-name/
│   │       ├── MISSION.md            ← brief → spec (CPE fills)
│   │       ├── PROGRESS.md           ← live status
│   │       ├── TASK-REGISTRY.md      ← Kanban board (task source of truth)
│   │       ├── handoffs/             ← routing files between agents
│   │       └── .agents/              ← mission-scoped work products
│   │           ├── cpe/
│   │           ├── architect/        ← ARCHITECTURE.md, PLANS.md, exec-plans/
│   │           ├── ui-ux/            ← DESIGN_SYSTEM.md, design-decisions/
│   │           ├── software-engineer/← exec-plans/, code
│   │           ├── qa/               ← test-plans/, bug-log/
│   │           └── eval/             ← mission eval reports
│   ├── completed/                    ← shipped missions (archived)
│   └── templates/
│       ├── CLIENT-BRIEF.md
│       ├── MISSION-TEMPLATE.md
│       ├── TASK-REGISTRY.md
│       ├── HANDOFF-TEMPLATE.md
│       ├── AGENT-MEMORY-TEMPLATE.md
│       └── PLANS-TEMPLATE.md
│
├── studio/                           ← Next.js control plane
│   ├── app/api/                      ← REST API (agents, tasks, missions)
│   ├── components/canvas/            ← spatial canvas UI
│   ├── lib/
│   │   ├── db.ts                     ← SQLite at ~/.devden/studio.db
│   │   ├── task-registry-sync.ts     ← TASK-REGISTRY.md → DB sync
│   │   └── useCanvasControls.ts      ← pan/zoom state
│   └── package.json
│
├── HEARTBEAT.md                      ← factory boot protocol
├── CLAUDE.md                         ← factory identity + structure
├── README.md                         ← full guide
├── QUICKSTART.md                     ← 5-minute walkthrough
├── SYSTEM.md                         ← this file
├── run.sh                            ← launcher script
└── git repository (all tracked)
```

---

## Task Model

**Statuses (Kanban columns):**
- `backlog` — created, not yet ready
- `todo` — ready for agent pickup
- `in-progress` — agent is working on it
- `on-hold` — parent task's subtasks open (auto-hold rule)
- `review` — agent signals complete, waiting for QA/approval
- `done` — QA approved or manual completion

**Auto-Hold Parent Rule:**
A parent task with subtasks automatically enters `on-hold` status until all subtasks are `done`.
CPE manually advances parent to next status when all subtasks complete.

**Priority:** P0 (immediate), P1 (today), P2 (sprint), P3 (backlog)

**Database schema (SQLite):**
```sql
agents (id, name, role, layer, status, working_on, mission_id, canvas_x, canvas_y, ...)
missions (id, name, folder, phase, active_agent, blocker, created_at)
tasks (id, mission_id, title, description, assignee, status, parent_id, depends_on, priority, ...)
handoffs (id, mission_id, from_agent, to_agent, file_path, written_at, acknowledged_at)
```

---

## Session Start Protocol

**Every agent, every session:**

1. Read `SOUL.md` (`.agents/[agent]/SOUL.md`) — who am I?
2. Read `AGENTS.md` (`.agents/[agent]/AGENTS.md`) — what's my role?
3. Read `../../HEARTBEAT.md` — what's assigned to me?
4. Read `missions/active/MISSION-NNN/MISSION.md` — what are we building?
5. Read `missions/active/MISSION-NNN/.agents/[agent]/MEMORY.md` — what did I know last session?
6. Read `missions/active/MISSION-NNN/TASK-REGISTRY.md` — what's the current state?
7. Begin work

**HEARTBEAT.md is the ping mechanism:**
```
Agent Status table shows: Mission, Working On
Agent checks HEARTBEAT on boot
If assigned: reads handoff file, oriented from HEARTBEAT context
If idle: scans for `todo` tasks in TASK-REGISTRY matching their ID
```

---

## API Reference

All running at `http://localhost:3001/api/` (when studio is running):

### Agents
```
GET    /agents                        — list all agents
GET    /agents/[id]                   — get agent detail
PATCH  /agents/[id]                   — update status, working_on, canvas position
POST   /agents/[id]/wake              — wake agent (sends Hermes message)
POST   /agents/[id]/heartbeat         — agent heartbeat check-in + get assignments
```

### Tasks
```
GET    /tasks?assignee=architect&status=todo  — filter tasks
GET    /tasks/[id]                    — get single task
POST   /tasks                         — create task
PATCH  /tasks/[id]                    — update task
DELETE /tasks/[id]                    — delete task
```

### Missions
```
GET    /missions                      — list all missions + sync from disk
POST   /missions                      — create mission
```

---

## Mission Lifecycle

```
1. CLIENT-BRIEF.md arrives
   → Dropped in missions/intake/

2. CPE INTAKE (mechanical, INTAKE-RUNBOOK.md):
   → Create missions/active/MISSION-NNN-name/
   → Create folder structure, agent MEMORY.md files
   → Fill MISSION.md, PROGRESS.md, TASK-REGISTRY.md
   → Create first handoff to Architect
   → Update HEARTBEAT.md

3. ARCHITECT DESIGN:
   → Read handoff, MISSION.md
   → Design ARCHITECTURE.md (system design, tech stack, constraints)
   → Write PLANS.md (milestones, critical path, risk register)
   → Write ExecPlans for complex features
   → Update MEMORY.md
   → Signal CPE complete

4. CPE APPROVES:
   → Review ARCHITECTURE.md + PLANS.md
   → Approve or request changes
   → If approved: route to UI/UX for design system

5. UI/UX SPECIFIES:
   → Choose palette from 5 factory options
   → Write DESIGN_SYSTEM.md (colors, typography, spacing, components)
   → Signal CPE complete

6. SE IMPLEMENTS:
   → Read ExecPlans from Architect
   → Read DESIGN_SYSTEM.md from UI/UX
   → Build feature per spec
   → Run self-verify checklist
   → Signal CPE complete

7. QA TESTS (THE LOOP NEVER BREAKS):
   → CPE routes to QA with context
   → Happy path → edge cases → failure modes → regression
   → Bugs found?
       → CPE routes back to SE with P0/P1/P2/P3 severity
       → SE fixes → CPE routes to QA for re-test
       → Loop repeats (no iteration limit)
   → No bugs?
       → QA signals "APPROVED"

8. CPE SHIPS:
   → Verify all tasks done
   → Verify QA sign-off
   → Move mission to missions/completed/
   → Tag release
   → Ready for deployment

9. EVAL MONITORS:
   → End-of-mission analysis
   → Cross-mission performance trends
   → Recommendations for agent improvements
```

---

## The QA Loop (Non-Negotiable)

```
Software Engineer signals complete
  ↓
CPE routes to QA with context (ExecPlan, environment, expected behavior)
  ↓
QA tests:
  1. Happy path — expected behavior works
  2. Edge cases — boundary conditions
  3. Failure modes — error states
  4. Regression — didn't break previous features
  ↓
QA finds bugs?
  YES → File bug report (P0/P1/P2/P3, severity, repro steps, expected vs actual)
        ↓
        CPE routes bug back to SE with all context
        ↓
        SE fixes the bug
        ↓
        CPE routes back to QA for re-test
        ↓
        (Loop repeats — no limit on iterations)
  
  NO  → QA signals "APPROVED"
        ↓
        CPE releases feature
```

**This loop never skips. Not for deadlines, not for pressure, not for any reason.**

---

## HEARTBEAT.md (Boot Protocol)

Read-only checklist. NOT a data store.

```markdown
# DevDen — Factory Heartbeat

How to use this file:
1. Read your agent row in Agent Status table
2. Check your `Working On` column
3. If assigned: read the handoff file
4. If idle: scan TASK-REGISTRY for your ID + status=todo
5. Update your row to IN-PROGRESS when you start
```

Tables:
- **Agent Status** — current role, mission, status
- **Active Missions** — what's in flight
- **Open Handoffs** — routing files pending acknowledgment
- **Red Flags** — what CPE is watching
- **Session Log** — who did what today

---

## INTAKE-RUNBOOK.md (Mechanical)

CPE's 8-step checklist. Zero improvisation.

```
Step 0: Orient
Step 1: Determine mission number
Step 2: Create folder structure
Step 3: Fill MISSION.md
Step 4: Fill PROGRESS.md
Step 5: Fill CPE's MEMORY.md
Step 6: Write first handoff to Architect
Step 7: Update HEARTBEAT.md
Step 8: Move brief to PROCESSED-

↓ Mission is live. Architect assigned.
```

---

## ExecPlan Format

Every complex feature gets an ExecPlan.

**Sections:**
1. **Purpose** — why this matters from user's perspective
2. **Progress** — checkbox list with timestamps
3. **Surprises & Discoveries** — unexpected behaviors, bugs, insights
4. **Decision Log** — significant decisions: what, why, date
5. **Outcomes & Retrospective** — what was achieved, lessons learned
6. **Context and Orientation** — current state, file paths, terms defined
7. **Plan of Work** — prose description of changes in sequence
8. **Concrete Steps** — exact commands, working directories, expected outputs
9. **Validation and Acceptance** — observable behaviors proving success
10. **Idempotence and Recovery** — how to safely retry or roll back
11. **Interfaces and Dependencies** — libraries, types, function signatures

ExecPlans are **living documents** — updated as discoveries occur.

---

## Agent MEMORY.md (Mission-Scoped)

Each agent has a MEMORY.md in `missions/active/MISSION-NNN/.agents/[agent]/`.

**This memory is NOT persistent across missions.** It lives with the mission and disappears when the mission ships.

Sections:
- **What I Know So Far** — key facts about this mission
- **Decisions I've Made** — decisions with dates and reasoning
- **Surprises & Discoveries** — unexpected findings
- **Open Questions** — unresolved questions affecting this mission
- **Watch Out For** — known gotchas, constraints, risks
- **Handoff State** — last action, next action, what's blocking

---

## Stateless Agent Model

**Agent folders (`/.agents/[agent]/`) contain protocols only.** No mission data.

**Mission data lives in `missions/active/MISSION-NNN/.agents/[agent]/`:**
- `.agents/cpe/` — CPE decisions, product notes, MEMORY.md
- `.agents/architect/` — ARCHITECTURE.md, PLANS.md, exec-plans/, MEMORY.md
- `.agents/ui-ux/` — DESIGN_SYSTEM.md, design-decisions/, MEMORY.md
- `.agents/software-engineer/` — exec-plans/, code, MEMORY.md
- `.agents/qa/` — test-plans/, bug-log/, MEMORY.md
- `.agents/eval/` — evaluation reports, MEMORY.md

When a mission ships and moves to `missions/completed/`, that agent's work disappears from active memory. The agent is ready for the next mission.

**Exception: Eval.** Eval stores cross-mission performance data at `Eval/docs/agent-scores/`. This is the only agent with persistent state across missions.

---

## Studio Canvas

**Spatial layout:**
- 6 agent nodes, draggable, color-coded by harness layer
- Pan/zoom controls (Alt+drag to pan, scroll to zoom)
- Minimap + controls
- Dot-grid background
- Status bar (top-right): "X working · Y queued"

**Agent node displays:**
- Name + status badge (idle/assigned/in-progress/blocked/complete)
- Layer · Role label
- Working on: [current task]
- Active tasks (up to 3 shown, "+N more" if overflow)
- Task count footer
- `wake ↑` button (fires Hermes message)

**Live updates:**
- Canvas polls `/api/agents`, `/api/tasks`, `/api/missions` every 5 seconds
- Agents can be dragged to new positions (persisted to DB)
- Task status changes appear immediately
- Agent status changes propagate in real-time

---

## Deployment Defaults

See `.agents/cpe/DEPLOYMENT.md`:

- **Framework**: Next.js (default) or Django/Rails/custom per brief
- **Hosting**: Vercel (free tier, default)
- **Database**: PostgreSQL (Railway free tier, default)
- **Auth**: Next.js Auth.js (default) or JWT/OAuth per brief
- **UI Palette**: Nordic (default) or Canvas/Base/Zinc/Apollo
- **CI/CD**: GitHub Actions (boilerplate shipped with every product)

Override in CLIENT-BRIEF.md's Technical Context section.

---

## Quality Standards

See `.agents/cpe/PRODUCT_SENSE.md`:

- **Test Coverage**: Min 70% for shipped code
- **Accessibility**: WCAG 2.1 AA baseline
- **Performance**: Lighthouse 85+ (all categories)
- **Security**: No hardcoded secrets, HTTPS enforced, headers checked
- **Reliability**: 99.9% uptime commitment (or per brief)
- **Latency**: P95 < 200ms for user-facing API calls

QA enforces these standards. No exceptions.

---

## Evaluation & Improvement

End of each mission, Eval analyzes:
- Agent performance (accuracy, velocity, protocol adherence)
- Cross-mission trends
- Recommendations for AGENTS.md patches
- Recommendations for agent-development skill updates

CPE receives findings and decides:
- **Instance findings** (one agent off in this mission) → patch that agent's AGENTS.md
- **Pattern findings** (structural issue recurring) → update agent-development skill

All changes logged in `docs/decisions/`.

---

## Files That Never Change

Agent folders (`/.agents/[agent]/`):
- CLAUDE.md — entry point
- AGENTS.md — full protocol
- SOUL.md — identity
- Docs (RELIABILITY.md, SECURITY.md, etc.)

Root factory files:
- HEARTBEAT.md (boot protocol, not data)
- CLAUDE.md (factory structure)
- README.md (guide)
- QUICKSTART.md (walkthrough)

These are templates and policies, not state. State lives in missions.

---

## Ready to Ship

The factory is complete:
- ✅ Six agents with identity (SOUL.md) and protocol (AGENTS.md)
- ✅ Stateless agent model with mission-scoped MEMORY.md
- ✅ Studio control plane (Next.js, REST API, spatial canvas)
- ✅ Task sync from TASK-REGISTRY.md to SQLite
- ✅ Mechanical intake (INTAKE-RUNBOOK.md, no improvisation)
- ✅ Non-negotiable QA loop (never breaks)
- ✅ Boot protocol (HEARTBEAT.md)
- ✅ Launcher (run.sh) and quick-start guide (QUICKSTART.md)

Next step: create a test mission and run the full loop to prove it works.

**One command to start:**
```bash
./run.sh studio
```

**Navigate to `http://localhost:3001` and watch six agents ready to ship.**
