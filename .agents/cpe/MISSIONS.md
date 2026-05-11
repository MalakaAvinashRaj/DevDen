# Mission Control — CPE
DevDen · How projects flow through the factory

---

## The Factory Model

DevDen is a SaaS factory. Projects come in as missions. The output is shipped SaaS.
The five agents are reusable machinery that runs every mission.

```
PROJECT BRIEF
      ↓
CPE reviews + creates mission folder in missions/active/
      ↓
Architect designs ARCHITECTURE.md + PLANS.md for this mission
      ↓
CPE approves — SE is cleared to start
      ↓
SE builds → QA gates → CPE releases [loop per feature]
      ↓
Eval runs at end of each sprint
      ↓
All success criteria met + QA signed off
      ↓
CPE ships → mission moves to missions/completed/
```

---

## CPE's Role in Mission Management

### Intake — When a New Project Arrives

**Step 0 — Client Brief**  
Client fills in `missions/templates/CLIENT-BRIEF.md` and drops it in `missions/intake/`.

**Step 1 — CPE converts brief to mission**
1. Read the brief in `missions/intake/`
2. Create `missions/active/MISSION-NNN-project-name/`
3. Fill `MISSION.md` from `missions/templates/MISSION-TEMPLATE.md` using the brief as source
4. Create the mission folder structure:
   ```
   missions/active/MISSION-NNN/
   ├── MISSION.md
   ├── PROGRESS.md
   ├── TASK-REGISTRY.md     ← copy from missions/templates/TASK-REGISTRY.md
   ├── handoffs/
   └── .agents/
       ├── cpe/
       │   └── MEMORY.md    ← copy from missions/templates/AGENT-MEMORY-TEMPLATE.md
       ├── architect/
       │   └── MEMORY.md
       ├── ui-ux/
       │   └── MEMORY.md
       ├── se/
       │   └── MEMORY.md
       ├── qa/
       │   └── MEMORY.md
       └── eval/
           └── MEMORY.md
   ```

**Step 2 — Route to Architect**
5. Write first handoff: `handoffs/YYYYMMDD-CPE-Architect-system-design.md`
   Use `missions/templates/HANDOFF-TEMPLATE.md`
6. Do NOT clear SE to start until Architect's ARCHITECTURE.md and PLANS.md are approved

### During a Mission
- All task routing follows normal protocols (see `TEAM.md`)
- Update `missions/active/MISSION-NNN/PROGRESS.md` each session with current state
- All agent work products live in `missions/active/MISSION-NNN/.agents/[agent-name]/`
  - Architect: `.agents/architect/` — ARCHITECTURE.md, PLANS.md, exec-plans/
  - SE: `.agents/se/` — exec-plans/, generated schema, references
  - QA: `.agents/qa/` — test-plans/, bug-log/, QUALITY_SCORE.md
  - UI/UX: `.agents/ui-ux/` — DESIGN_SYSTEM.md, design-decisions/
  - CPE: `.agents/cpe/` — decisions, product specs

### Shipping
- CPE approves release only when: QA signed off + zero open P0/P1 bugs + success criteria met
- After ship: move `missions/active/MISSION-NNN/` to `missions/completed/`
- Update `missions/README.md` completed table
- Trigger Eval for a mission retrospective

---

## Running Multiple Missions

DevDen can run multiple missions in parallel. CPE manages priority across missions.

Rules for parallel missions:
- Each mission has its own folder — no cross-contamination of artifacts
- Priority conflicts → CPE decides which mission gets SE time first
- A P0 bug on any active mission overrides all other work
- Eval covers all active missions in its cycle, scoring per-mission where relevant

---

## Mission Priority Levels

| Level | Description | CPE Action |
|-------|-------------|------------|
| P0 — Critical | Blocking a ship date or production issue | All hands; pause other missions if needed |
| P1 — High | Active mission, current sprint | Normal cadence, no interruptions |
| P2 — Standard | Active mission, next sprint | Scheduled; lower priority than P1 missions |
| P3 — Parked | Mission paused, awaiting input | No active agent work until unparked by CPE |

---

## Active Missions Index → see `missions/README.md`

---

## Mission Naming Convention

`MISSION-NNN-kebab-case-project-name`

Examples:
- `MISSION-001-invoice-automation-saas`
- `MISSION-002-ai-hiring-tool`
- `MISSION-003-client-portal-rebuild`

NNN increments from the last mission number regardless of status (active or completed).
