# DevDen — AI-Powered SaaS Factory

A harness for shipping products with five specialized agents. Each mission is a SaaS product.

---

## Quick Start

**1. Start the studio (control plane):**
```bash
cd studio
npm run dev
```
Open `http://localhost:3001` — see all 6 agents on the spatial canvas, their status, active tasks, and ability to wake them.

**2. Create a new mission:**
```bash
cp missions/templates/CLIENT-BRIEF.md missions/intake/CLIENT-BRIEF-001-myproject.md
# Fill in the brief (project description, requirements, timeline)
```

**3. CPE processes the brief:**
```bash
cd .agents/cpe
hermes
# Follow INTAKE-RUNBOOK.md step by step (mechanical, no improvisation)
```

CPE will:
- Create `missions/active/MISSION-001-myproject/`
- Wire folder structure, agent MEMORY.md files
- Create MISSION.md (spec), PROGRESS.md (status), TASK-REGISTRY.md (Kanban board)
- Write first handoff to Architect
- Update HEARTBEAT.md

**4. Architect designs the system:**
```bash
cd .agents/architect
hermes
# Read the handoff, design ARCHITECTURE.md + PLANS.md, write ExecPlans
```

**5. Studio shows everything live:**
- Canvas updates as agents change status and pick up tasks
- `wake ↑` button pings agents via Hermes
- Task progress synced from TASK-REGISTRY.md automatically

---

## The Five Agents

| Agent | Layer | Role | Folder |
|-------|-------|------|--------|
| **CPE** | Orchestration | Mission intake, team lead, final approval | `.agents/cpe/` |
| **Architect** | Constraint | System design, milestones, ExecPlans | `.agents/architect/` |
| **Software Engineer** | Instruction | Implementation, build-verify-fix loop | `.agents/software-engineer/` |
| **UI/UX** | Design | Visual spec, palettes, components | `.agents/ui-ux/` |
| **QA** | Feedback | Testing, quality gate, bug reports | `.agents/qa/` |
| **Eval** | Memory | Cross-mission performance monitoring | `.agents/eval/` |

All agents live in `.agents/` with their protocols (AGENTS.md, SOUL.md, etc.).  
Mission work lives in `missions/active/MISSION-NNN/.agents/[agent]/`.

---

## Key Files

### Factory-Level (Root)
- **`HEARTBEAT.md`** — Boot protocol. Every session, agents read this to find their assignment.
- **`CLAUDE.md`** — Factory structure, agent roster, non-negotiable rules.
- **`studio/`** — Next.js control plane. REST API + spatial canvas.

### Per-Mission (missions/active/MISSION-NNN/)
- **`MISSION.md`** — Brief, goal, scope, success criteria. CPE fills from CLIENT-BRIEF.
- **`TASK-REGISTRY.md`** — Kanban task board. CPE creates tasks; canvas syncs automatically.
- **`PROGRESS.md`** — Live status. Updated by each agent at end of session.
- **`.agents/`** — Mission-scoped work products:
  - `.agents/cpe/` — Product decisions, MEMORY.md
  - `.agents/architect/` — ARCHITECTURE.md, PLANS.md, exec-plans/, MEMORY.md
  - `.agents/ui-ux/` — DESIGN_SYSTEM.md, design-decisions/, MEMORY.md
  - `.agents/software-engineer/` — exec-plans/, code, MEMORY.md
  - `.agents/qa/` — test-plans/, bug-log/, MEMORY.md
  - `.agents/eval/` — evaluation reports, MEMORY.md

### Templates
- **`missions/templates/CLIENT-BRIEF.md`** — Non-technical intake form (client fills this)
- **`missions/templates/MISSION-TEMPLATE.md`** — Copy to create MISSION.md
- **`missions/templates/TASK-REGISTRY.md`** — Copy to create task board
- **`missions/templates/AGENT-MEMORY-TEMPLATE.md`** — Copy to create agent MEMORY.md

---

## How Tasks Work

**Task Lifecycle:**
```
CPE creates task (backlog)
  → CPE sets to todo when ready
  → Agent picks up (in-progress)
  → Agent signals done (review)
  → QA tests → CPE approves or routes bug back
  → CPE marks done
```

**TASK-REGISTRY.md example:**
```markdown
### T-001 – Design auth system
**Assignee:** architect  
**Status:** todo  
**Priority:** P1

- [ ] OAuth provider selection
- [ ] Token storage strategy
- [ ] Rate limiting design
```

Canvas reads TASK-REGISTRY.md automatically — all tasks sync to SQLite, shown on agent nodes.

---

## The QA Loop (Non-Negotiable)

```
SE signals complete
  → CPE routes to QA with context
  
  QA finds bugs?
    YES → QA sends bug report to CPE
          CPE routes back to SE: ID, severity (P0/P1/P2/P3), repro, expected vs. actual
          SE fixes → CPE routes to QA for re-test
          Loop repeats — no iteration limit
    NO  → QA sends "APPROVED"
          CPE releases the feature
```

**This loop never breaks early. Not for deadlines. Not for any reason.**

---

## Studio API

All running at `http://localhost:3001/api/`:

### Agents
- `GET /agents` — List all agents
- `GET /agents/[id]` — Get agent status
- `PATCH /agents/[id]` — Update agent (status, working_on, canvas position)
- `POST /agents/[id]/wake` — Wake agent via Hermes (optional message in body)
- `POST /agents/[id]/heartbeat` — Agent heartbeat + get assigned tasks

### Tasks
- `GET /tasks?assignee=architect&status=todo` — Filter tasks
- `GET /tasks/[id]` — Get single task
- `POST /tasks` — Create task
- `PATCH /tasks/[id]` — Update task
- `DELETE /tasks/[id]` — Delete task

### Missions
- `GET /missions` — List all missions
- `POST /missions` — Create mission

---

## Key Principles

1. **No code ships without QA sign-off.** The loop runs until clean.
2. **All inter-agent communication routes through CPE.** No direct agent-to-agent tasking.
3. **Eval never edits agent files.** It recommends; CPE decides.
4. **Architect never assigns work.** It plans; CPE assigns.
5. **Software Engineer never deploys.** It builds; CPE releases after QA.
6. **Tasks are the truth.** TASK-REGISTRY.md is the Kanban board. The canvas syncs from it.
7. **Agents are stateless across missions.** MEMORY.md is mission-scoped and disappears when the mission ships.

---

## Ship a Product

```bash
# 1. Submit brief
cp missions/templates/CLIENT-BRIEF.md missions/intake/CLIENT-BRIEF-001-coolapp.md
# … fill it out, save

# 2. CPE processes
cd .agents/cpe && hermes
# Follow INTAKE-RUNBOOK.md — creates mission, assigns to Architect

# 3. Architect designs
cd .agents/architect && hermes
# Reads handoff, writes ARCHITECTURE.md + PLANS.md + ExecPlans

# 4. CPE approves
hermes profile cpe
# Review Architect's deliverables, approve, route to SE and UI/UX

# 5. UI/UX specifies design
cd .agents/ui-ux && hermes
# Chooses palette, writes DESIGN_SYSTEM.md

# 6. SE builds
cd .agents/software-engineer && hermes
# Implements per ExecPlan, signals complete when ready for QA

# 7. QA tests
cd .agents/qa && hermes
# Tests every scenario, sends bug reports to CPE until clean

# 8. CPE ships
hermes profile cpe
# Approves QA sign-off, moves mission to completed/, tags release

# 9. Monitor (ongoing)
cd .agents/eval && hermes
# Watches agent performance, reports improvements needed
```

---

## What's Next

- Run `studio/` and watch the canvas as agents work
- Create a test mission (e.g., Link Vault — personal link vault)
- Have each agent boot and work on it
- See tasks flow through the Kanban board automatically
- Monitor on the canvas

The factory is ready. Ship something.
