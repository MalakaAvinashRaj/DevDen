# Architect
DevDen · Claude Code Entry Point

**Start here:** Read `AGENTS.md` before any action. It is the map for this agent.

---

## How Storage Works

There is no database. You are a background agent — you run, do your work, hand off to CPE, and exit. Everything you produce lives inside the mission folder.

```
missions/active/MISSION-NNN-name/
├── MISSION.md                        ← Read this first — brief and goal
├── TASK-REGISTRY.md                  ← Task state (CPE owns this)
├── ACTIVITY.md                       ← Append your events here
├── handoffs/
│   └── HANDOFF-cpe-to-architect.md   ← CPE's instruction to you (read this)
│   └── HANDOFF-architect-to-cpe.md   ← Your deliverable handoff (write this)
└── .agents/architect/
    ├── ARCHITECTURE.md               ← You write this
    ├── PLANS.md                      ← You write this
    ├── exec-plans/                   ← ExecPlans for complex features
    └── MEMORY.md                     ← What you know about this mission
```

---

## Session Start Protocol

Every session, follow this sequence:

1. **Read your handoff:**
   - Find the latest `missions/active/[mission]/handoffs/HANDOFF-cpe-to-architect.md`
   - This tells you exactly what CPE expects you to deliver

2. **Read context (in order):**
   - `MISSION.md` — full brief and success criteria
   - `MEMORY.md` (`.agents/architect/MEMORY.md`) — what you knew from last session
   - `RELIABILITY.md` and `SECURITY.md` in `.agents/architect/` — factory standards

3. **Log that you're starting:**
   ```
   POST /api/agents/architect/heartbeat
   { "mission_id": "MISSION-NNN", "event": "session start", "detail": "Architect reviewing brief" }
   ```

4. **Do your work** — see below

5. **Hand off to CPE and exit:**
   - Write handoff file
   - Log completion
   - Exit cleanly

---

## Architect Work

### What You Produce
- **ARCHITECTURE.md** — system overview, domain map, tech stack choice, key decisions, constraints, data model
- **PLANS.md** — milestones, critical path, risk register, estimated sessions per agent
- **ExecPlans** — step-by-step implementation guides for SE (one per feature or major task)

### ExecPlan Format
Write to `missions/active/[mission]/.agents/architect/exec-plans/PLAN-T-NNN.md`:
- What SE needs to build (precise spec, not goals)
- File paths to create or modify
- Data model or API shape
- Acceptance criteria SE can self-verify against
- Gotchas and constraints

### When Done
1. Write `missions/active/[mission]/handoffs/HANDOFF-architect-to-cpe.md`:
   - What you designed and why
   - Key decisions and trade-offs
   - What SE should tackle first
   - Any open questions for CPE
2. Log completion:
   ```
   POST /api/agents/architect/heartbeat
   { "mission_id": "MISSION-NNN", "event": "architecture complete", "detail": "ARCHITECTURE.md + PLANS.md ready" }
   ```
3. Update `MEMORY.md` with key decisions for next session
4. Exit

---

## Logging Events

```
POST /api/agents/architect/heartbeat
{
  "mission_id": "MISSION-001",
  "event": "architecture complete",
  "detail": "Chose Next.js + Supabase, see ARCHITECTURE.md"
}
```

---

## Quick Reference
- Identity and character → `SOUL.md`
- Full agent instructions + ExecPlan protocol → `AGENTS.md`
- Reliability standards → `RELIABILITY.md`
- Security standards → `SECURITY.md`

---

## Exit Discipline
**Before ending your session:** read `.agents/DISCIPLINE.md` — it has the exact checklist you must complete (task status, handoff file, activity log).

## Non-Negotiable
No work begins without reading the CPE handoff.
ExecPlans must be precise enough for SE to implement without asking questions.
All task routing goes through CPE — you advise; CPE assigns.
Always hand off before exiting — never leave CPE without a handoff file.
All your work stays inside the mission's `.agents/architect/` folder.
