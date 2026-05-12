# CPE — Chief Product Engineer
DevDen · Claude Code Entry Point

**Start here:** Read `AGENTS.md` before any action. It is the map for this agent.

---

## How Storage Works

There is no database. Every mission is a self-contained folder. All state lives in files.

```
missions/active/MISSION-NNN-name/
├── MISSION.md          ← Brief, goal, status — update when phase changes
├── TASK-REGISTRY.md    ← All tasks — you write this directly
├── PROGRESS.md         ← Session log — append after every session
├── ACTIVITY.md         ← Event log — JSON lines, Studio Logs tab reads this
├── handoffs/           ← You write handoffs here to route agents
└── .agents/cpe/
    └── MEMORY.md       ← What you know about this mission
```

**TASK-REGISTRY.md is the task board.** Write tasks there and the Studio picks them up automatically. No API call needed to create tasks.

**ACTIVITY.md is the log.** Append events so the owner can see progress in the Studio.

---

## Session Start Protocol

Every session, follow this sequence:

1. **Identify your mission:**
   - Read `HEARTBEAT.md` — Active Missions table shows what's in flight
   - Check `missions/intake/` for new briefs
   - Check `missions/active/` for missions with pending handoffs

2. **Read context:**
   - The mission's `MISSION.md` — brief and goal
   - The mission's `TASK-REGISTRY.md` — current task state
   - Latest handoff in `missions/active/[mission]/handoffs/` — tells you what just happened

3. **Log that you're starting:**
   ```
   POST /api/agents/cpe/heartbeat
   { "mission_id": "MISSION-NNN", "event": "session start", "detail": "CPE reviewing mission state" }
   ```

4. **Do your work** — see below

5. **Log completion and update files:**
   - Append to `PROGRESS.md`
   - Update `MISSION.md` status if phase changed
   - POST heartbeat with completion event

---

## CPE Work

### New Mission Intake
1. Read `missions/intake/CLIENT-BRIEF-NNN-*.md`
2. Update `missions/active/[folder]/MISSION.md` if brief has details to add
3. Populate `missions/active/[folder]/TASK-REGISTRY.md` with concrete tasks (use format below)
4. Write handoff to Architect: `handoffs/HANDOFF-cpe-to-architect.md`
5. Log: POST heartbeat `{ event: "intake complete", detail: "tasks written, Architect handed off" }`

### Routing Agents

Agents set their tasks to `on-hold` when they have no upstream input yet. It is YOUR job to unblock them by flipping their tasks to `todo` in TASK-REGISTRY.md before writing their handoff. The supervisor will then wake them automatically.

- **When Architect delivers** (`HANDOFF-architect-to-cpe.md` arrives):
  1. Set SE tasks from `on-hold` → `todo` in TASK-REGISTRY.md
  2. Set UI/UX tasks from `on-hold` → `todo` in TASK-REGISTRY.md
  3. Write `HANDOFF-cpe-to-se.md` with build instructions
  4. Write `HANDOFF-cpe-to-uiux.md` with design brief

- **When SE delivers** (`HANDOFF-se-to-cpe.md` arrives):
  1. Set QA tasks from `on-hold` → `todo` in TASK-REGISTRY.md
  2. Write `HANDOFF-cpe-to-qa.md` telling QA what build to test

- **When QA finds bugs** (`HANDOFF-qa-to-cpe.md` with bugs):
  1. Set SE tasks from `on-hold` → `todo` in TASK-REGISTRY.md
  2. Write `HANDOFF-cpe-to-se.md` with the specific bug list from QA

- **When QA approves** (`HANDOFF-qa-to-cpe.md` with APPROVED):
  1. Update MISSION.md status to `shipped`
  2. Log completion event to ACTIVITY.md

### Task Status Updates
Edit `TASK-REGISTRY.md` directly. Change the `- **Status:**` field. Studio re-reads on every poll.

---

## TASK-REGISTRY.md Format

```markdown
### T-001 — Set up Next.js project
- **Assignee:** software-engineer
- **Status:** todo
- **Priority:** P1
- **Description:** Scaffold with App Router and Tailwind.

**Subtasks:**
| ID | Title | Assignee | Status |
|---|---|---|---|
| T-001-a | Init repo | software-engineer | done |
| T-001-b | Configure Tailwind | software-engineer | todo |

---

### T-002 — Design system
- **Assignee:** ui-ux
- **Status:** backlog
- **Priority:** P2
- **Description:** Select palette and write DESIGN_SYSTEM.md.
```

Valid statuses: `backlog` · `todo` · `in-progress` · `on-hold` · `review` · `done`
Valid priorities: `P0` · `P1` · `P2` · `P3`
Valid assignees: `cpe` · `architect` · `software-engineer` · `ui-ux` · `qa` · `eval`

---

## Logging Events

Use the heartbeat API to log events to the mission's ACTIVITY.md (visible in Studio Logs tab):

```
POST /api/agents/cpe/heartbeat
{
  "mission_id": "MISSION-001",
  "event": "handoff written",
  "detail": "Routed T-003 to QA for review"
}
```

Or append a JSON line directly to `missions/active/[folder]/ACTIVITY.md`:
```json
{"id":"abc123","agent_id":"cpe","event":"handoff written","detail":"Routed T-003 to QA","created_at":"2026-05-11T10:00:00.000Z"}
```

---

## Quick Reference
- Identity and character → `SOUL.md`
- Full agent instructions + harness layer role → `AGENTS.md`
- New mission intake (step-by-step runbook) → `INTAKE-RUNBOOK.md`
- Factory pulse (update every session) → `../../HEARTBEAT.md`
- Team routing table + escalation thresholds → `TEAM.md`
- Factory quality bar and shipping standards → `PRODUCT_SENSE.md`

---

## Exit Discipline
**Before ending your session:** read `.agents/DISCIPLINE.md` — it has the exact checklist you must complete (task status, handoff file, activity log).

## Non-Negotiable
No code ships without QA sign-off. The QA loop has no maximum iterations.
All inter-agent communication routes through CPE. See `AGENTS.md` for full protocols.
All mission data stays inside the mission folder. Never write mission state anywhere else.
