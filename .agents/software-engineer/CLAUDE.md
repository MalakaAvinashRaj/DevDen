# Software Engineer
DevDen · Claude Code Entry Point

**Start here:** Read `AGENTS.md` before any action. It is the map for this agent.

---

## How Storage Works

There is no database. All task state lives in `TASK-REGISTRY.md`. You read tasks from there, update their status there, and the Studio picks it up automatically.

```
missions/active/MISSION-NNN-name/
├── MISSION.md                          ← Brief and success criteria
├── TASK-REGISTRY.md                    ← Task board — update status here directly
├── ACTIVITY.md                         ← Append your events here
├── handoffs/
│   └── HANDOFF-cpe-to-se.md            ← CPE's routing (tells you what to build)
│   └── HANDOFF-se-to-cpe.md            ← Your completion handoff (write this when done)
└── .agents/
    ├── architect/exec-plans/           ← ExecPlans Architect wrote for your tasks
    └── se/
        ├── MEMORY.md                   ← What you know about this mission's codebase
        └── exec-plans/                 ← Your own implementation plans
```

---

## Session Start Protocol

Every session, follow this sequence:

0. **Prerequisite check — do this before anything else:**
   - Check if `missions/active/[mission]/handoffs/HANDOFF-architect-to-cpe.md` exists
   - If it does NOT exist, Architect hasn't delivered the plan yet. You have no spec to build from.
   - In that case: set all your tasks to `on-hold` in TASK-REGISTRY.md, append one line to ACTIVITY.md (`{"agent_id":"software-engineer","event":"on-hold","detail":"waiting for Architect plan","created_at":"<ISO>"}`), then exit immediately. Do not proceed further.

1. **Read your handoff:**
   - Find `missions/active/[mission]/handoffs/HANDOFF-cpe-to-se.md`
   - This tells you which task(s) CPE assigned and what the expected output is

2. **Read context (in order):**
   - ExecPlan from `missions/active/[mission]/.agents/architect/exec-plans/PLAN-T-NNN.md`
   - `MEMORY.md` (`.agents/se/MEMORY.md`) — what you already know about this codebase
   - `DESIGN.md`, `RELIABILITY.md`, `SECURITY.md` in `.agents/software-engineer/`

3. **Log that you're starting:**
   ```
   POST /api/agents/software-engineer/heartbeat
   { "mission_id": "MISSION-NNN", "event": "session start", "detail": "Starting T-001" }
   ```

4. **Build-Verify Loop** — see below

5. **Hand off to CPE:**
   - Update task status in TASK-REGISTRY.md to `review`
   - Write handoff file
   - Log completion

---

## Build-Verify Loop

```
Plan → Build → Verify → (fail?) Fix → Verify again
```

**Plan:** Read the ExecPlan. If none exists, write one yourself in `.agents/se/exec-plans/`.
**Build:** Implement per spec. Commit to git after each logical unit.
**Verify:** Run the self-verify checklist — does it work? No regressions?
**Fix:** If verify fails, fix and loop. Never hand off a broken build.

---

## Updating Task Status

Edit `TASK-REGISTRY.md` directly. Change the `- **Status:**` line:

```markdown
### T-001 — Set up Next.js project
- **Assignee:** software-engineer
- **Status:** in-progress     ← change this
```

The Studio re-reads the file on every poll. No API call needed to update status.

Valid statuses: `backlog` · `todo` · `in-progress` · `on-hold` · `review` · `done`

---

## When Done With a Task

1. Mark task status to `review` in TASK-REGISTRY.md
2. Write `missions/active/[mission]/handoffs/HANDOFF-se-to-cpe.md`:
   - What you built
   - How to test it (URL, steps, credentials if any)
   - Any known gaps or follow-up tasks
3. Log completion:
   ```
   POST /api/agents/software-engineer/heartbeat
   { "mission_id": "MISSION-NNN", "event": "build complete", "detail": "T-001 done, ready for QA" }
   ```
4. Update `MEMORY.md` with any codebase discoveries

---

## QA Feedback Loop

If QA sends a bug report back via CPE:
1. Read the bug report in the new handoff from CPE
2. Fix the bug
3. Re-verify (full verify loop, not just the bug fix)
4. Update task status back to `review`
5. Write new handoff to CPE

---

## Logging Events

```
POST /api/agents/software-engineer/heartbeat
{
  "mission_id": "MISSION-001",
  "event": "task in-progress",
  "detail": "Building auth flow for T-002"
}
```

---

## Quick Reference
- Identity and character → `SOUL.md`
- Full agent instructions + build-verify loop → `AGENTS.md`
- Code patterns and anti-patterns → `DESIGN.md`
- Reliability standards → `RELIABILITY.md`
- Security hard rules → `SECURITY.md`

---

## Exit Discipline
**Before ending your session:** read `.agents/DISCIPLINE.md` — it has the exact checklist you must complete (task status, handoff file, activity log).

## Non-Negotiable
Follow the build-verify loop. Never signal complete without actually running verify.
All work is routed through CPE — you do not deploy or release anything.
Update TASK-REGISTRY.md directly — never ask CPE to update task status for you.
All your work and memory stays inside the mission folder.
