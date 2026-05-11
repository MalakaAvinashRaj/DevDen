# Task Registry — MISSION-NNN
**Owner:** CPE  
**Last updated:** YYYY-MM-DD  
**Mission:** [mission name]

---

## Status Reference

| Status | Kanban Column | Meaning |
|--------|---------------|---------|
| `backlog` | Backlog | Exists, not yet ready to start |
| `todo` | Todo | Prioritized, assignee can pick up now |
| `in-progress` | In Progress | Actively being worked |
| `on-hold` | On Hold | Has incomplete subtasks · or blocked by dependency |
| `review` | Review | Built, awaiting QA or CPE approval |
| `done` | Done | Complete and approved |

> **Auto-hold rule:** If a task has subtasks and any subtask is not `done`,
> the task status is treated as `on-hold` by the board — regardless of the value set here.
> CPE must not manually set a parent to `in-progress` while subtasks are open.

---

## Priority Reference

| Level | Label | Meaning |
|-------|-------|---------|
| `P0` | Critical | Blocks the entire mission or is a production incident |
| `P1` | High | Blocks another agent or another task |
| `P2` | Normal | Standard work item |
| `P3` | Low | Nice-to-have, parked until higher priority is clear |

---

## Tasks

<!--
TASK SCHEMA (copy this block to add a task):

### T-NNN — Task Title
- **Status:** backlog | todo | in-progress | on-hold | review | done
- **Assignee:** cpe | architect | ui-ux | software-engineer | qa | eval
- **Priority:** P0 | P1 | P2 | P3
- **Milestone:** M1 | M2 | ...
- **Depends on:** T-NNN, T-NNN (tasks that must be done before this starts)
- **Parallel with:** T-NNN, T-NNN (tasks that can run at the same time as this)
- **Created:** YYYY-MM-DD
- **Updated:** YYYY-MM-DD

**Description:** One sentence — what this task produces.

**Definition of done:**
- [ ] Criterion one
- [ ] Criterion two

**Subtasks:**
| ID | Title | Assignee | Status |
|----|-------|----------|--------|
| T-NNN-a | Subtask title | software-engineer | todo |
| T-NNN-b | Subtask title | software-engineer | todo |

> ⚠️ Parent is on-hold until all subtasks are done.
-->

---

### T-001 — Example Task (delete this)
- **Status:** on-hold
- **Assignee:** software-engineer
- **Priority:** P1
- **Milestone:** M1
- **Depends on:** —
- **Parallel with:** —
- **Created:** YYYY-MM-DD
- **Updated:** YYYY-MM-DD

**Description:** Example showing the parent-holds pattern.

**Definition of done:**
- [ ] All subtasks complete
- [ ] QA verified

**Subtasks:**
| ID | Title | Assignee | Status |
|----|-------|----------|--------|
| T-001-a | Set up project scaffold | software-engineer | done |
| T-001-b | Build the feature | software-engineer | in-progress |
| T-001-c | Write tests | software-engineer | todo |

> ⚠️ Parent is on-hold until all subtasks are done.

---

## Dependency Graph

<!--
Update this when tasks have dependencies. Helps CPE see the critical path at a glance.
Format: T-NNN → T-NNN (reads as "NNN must complete before NNN can start")
-->

```
T-001 → T-002 → T-004
T-003 ──────────↗
```

---

## Milestone Map

| Milestone | Goal | Tasks | Target |
|-----------|------|-------|--------|
| M1 | [goal] | T-001, T-002 | YYYY-MM-DD |
| M2 | [goal] | T-003, T-004 | YYYY-MM-DD |
