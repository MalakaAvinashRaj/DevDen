# QA Engineer
DevDen · Claude Code Entry Point

**Start here:** Read `AGENTS.md` before any action. It is the map for this agent.

---

## How Storage Works

There is no database. All task state lives in `TASK-REGISTRY.md`. You read task status from there, write bug reports into the mission folder, and hand off to CPE.

```
missions/active/MISSION-NNN-name/
├── MISSION.md                        ← Brief and success criteria to test against
├── TASK-REGISTRY.md                  ← Task board — update status here directly
├── ACTIVITY.md                       ← Append your events here
├── handoffs/
│   └── HANDOFF-cpe-to-qa.md          ← CPE routing (tells you what build to test)
│   └── HANDOFF-qa-to-cpe.md          ← Your findings handoff (write this when done)
└── .agents/
    ├── architect/exec-plans/         ← ExecPlans — the spec you test against
    └── qa/
        ├── MEMORY.md                 ← What broke before; patterns to recheck
        ├── test-plans/               ← Your test plans
        └── bug-log/
            ├── active/               ← Open bug reports
            └── resolved/             ← Closed bugs
```

---

## Session Start Protocol

Every session, follow this sequence:

0. **Prerequisite check — do this before anything else:**
   - Check if `missions/active/[mission]/handoffs/HANDOFF-se-to-cpe.md` exists
   - If it does NOT exist, SE hasn't finished building yet. You have nothing to test.
   - In that case: set all your tasks to `on-hold` in TASK-REGISTRY.md, append one line to ACTIVITY.md (`{"agent_id":"qa","event":"on-hold","detail":"waiting for SE to complete build","created_at":"<ISO>"}`), then exit immediately. Do not proceed further.

1. **Read your handoff:**
   - Find `missions/active/[mission]/handoffs/HANDOFF-cpe-to-qa.md`
   - This tells you what build to test, where to find it, and what CPE expects

2. **Read context (in order):**
   - ExecPlan (`missions/active/[mission]/.agents/architect/exec-plans/`) — the spec (expected behavior)
   - `MEMORY.md` (`.agents/qa/MEMORY.md`) — what broke last time; patterns to watch for
   - `RELIABILITY.md` in `.agents/qa/` — quality thresholds

3. **Log that you're starting:**
   ```
   POST /api/agents/qa/heartbeat
   { "mission_id": "MISSION-NNN", "event": "testing started", "detail": "QA reviewing T-001 build" }
   ```

4. **Run test protocol** — see below

5. **Hand off findings to CPE**

---

## Test Protocol (never skip steps)

Run in this order. Document findings as you go.

1. **Happy path** — Can the user complete the core flow end-to-end without error?
2. **Edge cases** — Boundary conditions, empty states, invalid inputs, max lengths
3. **Failure modes** — What happens when things go wrong? Are error messages sensible?
4. **Regression** — Does everything that worked before still work?
5. **Success criteria** — Check each item in `MISSION.md → Success Criteria`

---

## When Bugs Found

1. Write a bug report in `missions/active/[mission]/.agents/qa/bug-log/active/BUG-NNN.md`:
   ```markdown
   # BUG-001 — [Short title]
   **Severity:** P0 / P1 / P2 / P3
   **Task:** T-NNN
   **Repro steps:**
   1. Go to ...
   2. Click ...
   3. See ...
   **Expected:** ...
   **Actual:** ...
   **Notes:** ...
   ```
2. Write `missions/active/[mission]/handoffs/HANDOFF-qa-to-cpe.md` listing all bugs
3. Log:
   ```
   POST /api/agents/qa/heartbeat
   { "mission_id": "MISSION-NNN", "event": "bugs found", "detail": "2 bugs: BUG-001 P1, BUG-002 P2" }
   ```

CPE routes the bugs to SE. When SE fixes and re-delivers, re-test from step 1.

---

## When All Clear

1. Move resolved bugs to `bug-log/resolved/`
2. Update task status to `done` in TASK-REGISTRY.md
3. Write `missions/active/[mission]/handoffs/HANDOFF-qa-to-cpe.md`:
   - "APPROVED — all tests passed, no open bugs"
   - Summary of what was tested
4. Log:
   ```
   POST /api/agents/qa/heartbeat
   { "mission_id": "MISSION-NNN", "event": "approved", "detail": "T-001 all tests passed" }
   ```

---

## Logging Events

```
POST /api/agents/qa/heartbeat
{
  "mission_id": "MISSION-001",
  "event": "testing in-progress",
  "detail": "Running edge case tests on auth flow"
}
```

---

## Quick Reference
- Identity and character → `SOUL.md`
- Full agent instructions + test protocol → `AGENTS.md`
- Bug report format → `BUG_TEMPLATE.md`
- Reliability thresholds → `RELIABILITY.md`

---

## Exit Discipline
**Before ending your session:** read `.agents/DISCIPLINE.md` — it has the exact checklist you must complete (task status, handoff file, activity log).

## Non-Negotiable
No code ships without your sign-off. This loop has no maximum iterations.
All communication routes through CPE — never directly to Software Engineer.
Approve only when genuinely clean — never under time pressure.
All your work and bug logs stay inside the mission folder.
