# DevDen — Objective & Path

---

## The Main Objective

Build a self-running SaaS factory where a team of AI agents can take any product brief from idea to shipped, production-quality software — **autonomously, repeatably, and with quality gates at every step**.

The owner's job is direction: pick the mission, set the standard, review the output. Every implementation decision, code review, bug fix, architecture choice, and design call is handled by the agent team.

**The end state**: give DevDen a brief on Monday, have a deployed SaaS by Friday — without writing a single line of code yourself.

---

## Why This Matters

Most AI coding tools are pair programmers. They help you build faster but still require you to drive every decision. DevDen is something different: a factory you own but don't operate. The agents are the operators. You are the product owner.

This is a bet on the idea that **autonomous multi-agent teams, with the right structure and protocols, can fully replace a junior-to-mid engineering org** for SaaS development — while remaining correctable and auditable through the file system.

---

## The Path We Chose

### 1. Stateless, File-Driven Agents

Every agent is stateless by design. All mission context — architecture decisions, task state, design specs, agent memory, bug logs, handoffs — lives in markdown files in the repo. No databases, no hidden state, no agent-to-agent secrets.

This means:
- Any agent can be cold-started on any machine and immediately pick up where it left off
- A human can read, override, or correct any decision by editing a file
- The factory's state is always auditable via `git log`

**Key files every agent reads on boot:**
- `HEARTBEAT.md` — factory pulse (current missions, agent status, red flags)
- `missions/active/MISSION-NNN/TASK-REGISTRY.md` — current work board
- `missions/active/MISSION-NNN/.agents/[agent]/MEMORY.md` — agent's mission memory
- Their own `CLAUDE.md` and `AGENTS.md` — role protocols

### 2. Six Specialized Agents with Hard Separation of Concerns

| Agent | Layer | What They Own |
|-------|-------|---------------|
| CPE | Orchestration | Decision authority, routing, product sense, releases |
| Architect | Constraint | Architecture, exec plans, timeline, deviation detection |
| UI/UX Engineer | Design | Palette selection, design system, visual spec before code |
| Software Engineer | Instruction | All code — build, fix, refactor |
| QA Engineer | Feedback | Test plans, bug reports, quality gates |
| Eval | Memory | Cross-mission performance tracking, agent scoring |

Hard rules enforced by protocol:
- **No direct agent-to-agent communication.** CPE is the hub. All routing goes through CPE handoffs.
- **No code ships without QA sign-off.** The QA loop is mandatory.
- **Eval recommends; CPE decides.** Eval never edits agent `.md` files.
- **Architect plans; CPE assigns.** Architect never creates tasks.
- **SE builds; CPE releases.** SE never deploys.

### 3. CPE as the Coordination Hub

CPE (Chief Product Engineer) is the only agent that talks to all others. It:
- Receives product briefs and creates missions
- Writes handoff files that tell agents exactly what to do
- Routes work through the pipeline: Architect → UI/UX → SE → QA → release
- Maintains HEARTBEAT.md after every session
- Makes all product and priority decisions

Without CPE, agents don't know what to do next. CPE is the factory's brain.

### 4. Mission-Based Work Units

Every project is a **mission** — a self-contained folder in `missions/active/MISSION-NNN-name/` with:
- `MISSION.md` — brief, goal, scope, success criteria
- `TASK-REGISTRY.md` — the full kanban task board (the source of truth)
- `PROGRESS.md` — live status log
- `handoffs/` — CPE-authored routing instructions
- `.agents/` — per-agent work products (architecture docs, design systems, memory, bug logs)

Missions move from `active/` to `completed/` when QA approves and CPE ships.

New missions are created via DevDen Studio (the "+" button in Active Missions) or by dropping a `CLIENT-BRIEF.md` in `missions/intake/`.

### 5. DevDen Studio as the Control Plane

DevDen Studio (`studio/`) is the web UI for the factory — a real-time spatial canvas showing every agent, their status, current tasks, and org-tree relationships. It is the owner's window into what the factory is doing.

**See `CLAUDE.md` → DevDen Studio section for full technical detail.**

Key capabilities built so far:
- Spatial canvas with draggable agent cards, org-tree connector lines
- Real-time status polling (5s on canvas, 3s on panel)
- Task tree panel — hierarchical task view with parent/child relationships
- Agents panel — live agent status, current work, active tasks
- Activity feed — event log from all agents
- New Mission modal — scaffold full mission folder from the browser
- Supervisor loop — auto-wakes agents that have assigned work
- Wake button — manually trigger any agent via Claude CLI

### 6. HEARTBEAT.md as the Synchronization Primitive

Every agent reads `HEARTBEAT.md` at the start of every session. It is the factory's shared clock:
- Which missions are active and what phase they're in
- Which agent is currently working on what
- What handoffs are pending
- What red flags exist
- When agents last checked in

CPE is responsible for keeping HEARTBEAT.md current. Without it, agents would have to re-derive factory state from scratch every session.

---

## What Has Been Built (as of 2026-05-08)

### Factory Infrastructure
- 6 fully-specced agent harnesses in `.agents/`
- Complete protocol files: CLAUDE.md, AGENTS.md, SOUL.md, role-specific references
- Mission template system (`missions/templates/`)
- HEARTBEAT.md factory pulse

### DevDen Studio
- Next.js 15 + Turbopack web app (`studio/`)
- SQLite database via better-sqlite3 (agents, tasks, missions, activity_log tables)
- Task registry sync: reads `TASK-REGISTRY.md` files from disk → SQLite
- REST API: `/api/agents`, `/api/tasks`, `/api/missions`, `/api/activity`, `/api/supervisor`
- Spatial canvas with org-tree lines, drag-to-reposition agent cards
- Detail panel (Tasks tree, Agents status, Feed)
- New Mission creation modal
- Supervisor loop: auto-spawns Claude CLI processes for agents with work
- Activity logging across all API mutations

### Mission-001: Link Vault
- First mission in flight — a link-saving SaaS
- Architect: complete. UI/UX: complete. SE: bugs fixed. QA: re-testing.
- Full task tree visible in Studio

---

## What's Next

1. **Complete Mission-001** — QA sign-off, CPE release
2. **Supervisor reliability** — smarter agent wake logic, process tracking
3. **Studio polish** — mission detail view, agent log viewer, handoff creation UI
4. **Second mission** — run the full pipeline end-to-end on a new brief
5. **Eval cycle** — first cross-mission agent performance report

---

*This file is the north star. When in doubt about a decision, come back here.*
