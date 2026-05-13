# DevDen v1 — Build Plan
*Approved plan. Start from scratch on v1 branch.*

---

## What We're Building

A multi-agent AI software factory. You describe what you want built. The system plans it, builds it feature by feature, validates it end to end, and delivers a working codebase. You watch it happen in a live studio UI.

**Three agents. Proven by Factory.ai in production.**

---

## The Three Hermes Profiles

### `orchestrator`
- Scopes the mission with the user
- Queries GBrain for past decisions on similar projects
- Writes `VALIDATION-CONTRACT.md` — defines what "done" means **before any code**
- Breaks work into milestones (groups of features)
- Spawns a Worker per feature via handoff file
- After each milestone: reviews validator result, either advances or creates follow-up features
- When all milestones pass: uses GStack `/ship` to push to GitHub

### `worker`
- Spawned **once per feature** — fresh context every time, no accumulated baggage
- Reads only its feature spec
- Uses GStack skills: `/investigate` before building, `/review` + `/cso` before handoff
- `git commit` after implementation
- Writes structured 5-field handoff then exits:
  1. What was completed
  2. What was left undone
  3. Commands run + exit codes
  4. Issues discovered
  5. Did it follow the spec

### `validator`
- Mode is set in the spawn prompt — one profile, two modes:
- **Scrutiny mode** — tests, linting, type check, fresh code review agents per feature. Never seen the implementation, only the contract + committed code.
- **User-testing mode** — runs the app, browser automation, validates real user flows against `VALIDATION-CONTRACT.md` assertions
- Writes pass/fail result back as handoff to orchestrator

---

## Folder Structure

```
DevDen/                              ← repo root (v1 branch)
├── info/                            ← research library (done)
├── studio/                          ← Next.js app
│   ├── app/
│   │   ├── page.tsx                 ← Mission dashboard (home)
│   │   ├── canvas/page.tsx          ← Factory view (drill-down)
│   │   ├── missions/[id]/page.tsx   ← Mission detail
│   │   └── api/
│   │       ├── missions/            ← CRUD + scaffold
│   │       ├── jobs/                ← Job queue status
│   │       ├── agents/              ← Active sessions
│   │       └── stream/              ← SSE push channel
│   ├── lib/
│   │   ├── db.ts                    ← better-sqlite3 singleton + schema
│   │   ├── db-store.ts              ← all reads/writes
│   │   ├── fs-sync.ts               ← file watcher → syncs agent writes to DB
│   │   ├── job-queue.ts             ← durable SQLite job queue
│   │   ├── supervisor.ts            ← spawns Hermes, uses job-queue
│   │   └── sse.ts                   ← SSE event bus
│   └── components/
│       ├── dashboard/               ← Mission list home screen
│       ├── canvas/                  ← 3-node factory view
│       ├── mission/                 ← Detail: tasks, handoffs, logs, artifacts
│       └── DynamicIsland.tsx        ← From OpenSwarm (MIT) — live notifications
├── missions/
│   └── active/MISSION-NNN-name/
│       ├── MISSION.md
│       ├── VALIDATION-CONTRACT.md   ← Orchestrator writes this first
│       ├── milestones/
│       │   ├── M1-feature-spec.md
│       │   └── M2-feature-spec.md
│       ├── handoffs/
│       ├── app/                     ← Workers build and commit here
│       └── ACTIVITY.md
├── .agents/
│   ├── orchestrator/CLAUDE.md
│   ├── worker/CLAUDE.md
│   └── validator/CLAUDE.md
└── .db/
    └── devden.sqlite

~/.hermes/profiles/
├── orchestrator/SOUL.md + config.yaml
├── worker/SOUL.md + config.yaml
└── validator/SOUL.md + config.yaml
```

---

## Database Schema

```sql
missions    — id, name, folder, phase, version, brief, goal, created_at, shipped_at
tasks       — id, mission_id, title, assignee, status, priority, milestone
jobs        — id, role, mission_id, feature, status, pid, retry_count, created_at
activity    — id, mission_id, role, event, detail, created_at
validations — id, mission_id, milestone, mode, verdict, score, ndjson_path, created_at
```

---

## What Each External Tool Does

| Tool | Role in v1 |
|---|---|
| **GStack** | `./setup --host hermes` — Workers get `/investigate`, `/review`, `/cso`. Orchestrator gets `/ship`. |
| **GBrain** | Orchestrator queries at planning time. After ship: imports contract + handoffs for future missions. |
| **gbrain-evals pattern** | Validator uses LLM-as-judge (Haiku, XML contract, Pass ≥ 3.5) against sealed `VALIDATION-CONTRACT.md` |
| **OpenSwarm** | `DynamicIsland.tsx` for live milestone notifications. `WebSocketManager.ts` for streaming logs. |

---

## Build Phases

| Phase | What gets built |
|---|---|
| **1 — Profiles** | 3 SOUL.md files + config.yaml for orchestrator, worker, validator |
| **2 — Database** | `db.ts` schema + `db-store.ts` + `job-queue.ts` |
| **3 — Supervisor** | `fs-sync.ts` + `supervisor.ts` — watches handoffs, spawns via job queue |
| **4 — Mission scaffold** | `VALIDATION-CONTRACT.md` template + milestone folder structure |
| **5 — Studio UI** | Dashboard home + canvas (3 nodes) + mission detail + DynamicIsland |
| **6 — Streaming** | `sse.ts` + `/api/stream` — replaces polling |
| **7 — GStack** | `./setup --host hermes` + wire skills into worker prompt |
| **8 — GBrain** | MCP wired to orchestrator profile |
| **9 — Validator** | LLM-as-judge + browser automation for user-testing mode |
| **10 — Ship** | GStack `/ship` → GitHub push on orchestrator milestone completion |
