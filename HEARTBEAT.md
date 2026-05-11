# DevDen — Factory Heartbeat
**Read this first every session. It tells you where to go next.**

---

## Agent Boot Protocol

Every session, agents follow this sequence:

1. **Read your handoff:**
   - Scan `missions/active/[mission]/handoffs/` for a file addressed to you
   - That file tells you exactly what to do this session
   - If no handoff exists, check `missions/intake/` for new briefs (CPE) or wait (other agents)

2. **Read context files:**
   - `MISSION.md` — full project brief and success criteria
   - `TASK-REGISTRY.md` — current task board (agents write status here directly)
   - Your `MEMORY.md` at `missions/active/[mission]/.agents/[agent]/MEMORY.md`

3. **Log your session start:**
   ```
   POST /api/agents/[id]/heartbeat
   { "mission_id": "MISSION-NNN", "event": "session start", "detail": "..." }
   ```

4. **Do your work and hand off:**
   - Background agents (Architect, UI/UX): write your deliverable, write a handoff to CPE, exit
   - Canvas agents (CPE, SE, QA): work your task, update TASK-REGISTRY.md, write handoff when done

**Source of truth — everything lives in the mission folder:**
- **Tasks:** `missions/active/MISSION-NNN/TASK-REGISTRY.md`
- **Activity:** `missions/active/MISSION-NNN/ACTIVITY.md` (JSON lines — Studio Logs tab)
- **Agent work:** `missions/active/MISSION-NNN/.agents/[agent]/`
- **No database.** No shared state. Each mission is fully isolated.

---

## Factory Status

**Overall:** 🟢 Factory idle — no active missions  
**Last updated:** 2026-05-11  
**Updated by:** System reset — all missions cleared

---

## Agent Status

Real-time running status is visible in DevDen Studio (`http://localhost:3000`).
Studio shows live status based on which Hermes processes are running.

| Agent | Role | Canvas |
|-------|------|--------|
| CPE | Chief Product Engineer | ✓ visible |
| Architect | System Planner | background (auto-exits after task) |
| UI/UX | Design | background (auto-exits after task) |
| Software Engineer | Implementation | ✓ visible |
| QA | Quality Gate | ✓ visible |
| Eval | Performance Monitor | background (30-min timer) |

---

## Active Missions

None. Factory is ready for a new mission.

To start: click **+** in DevDen Studio or drop a `CLIENT-BRIEF.md` in `missions/intake/`.

---

## Open Handoffs

None.

---

## Red Flags

None.

---

## Session Log

| Date | Agent | Action |
|------|-------|--------|
| 2026-05-11 | System | Factory reset. All missions cleared. SQLite removed. Switched to pure filesystem architecture. |
