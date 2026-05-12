# Agent Discipline — Non-Negotiable Exit Rules

Every agent in DevDen MUST follow these rules before ending a session.
Violating them causes the supervisor to loop, burning tokens on re-spawns.

---

## 1. Mark every task you touched to its final status

Before you exit, open `TASK-REGISTRY.md` and update the `- **Status:**` line for every task you worked on:

| What happened | Status to write |
|---|---|
| You completed the work | `done` |
| You built it, needs QA review | `review` |
| Blocked on something | `on-hold` |
| Not started yet | `todo` (leave as-is) |

**Never exit with a task still showing `in-progress`.** If you ran out of time, set it back to `todo`. The supervisor will re-spawn you.

**If you are blocked by an upstream agent** (Architect not done, SE not done, no handoff from CPE): set your tasks to `on-hold`. The supervisor will NOT re-spawn you while tasks are `on-hold`. CPE is responsible for flipping your tasks back to `todo` when the blocker clears — that is what wakes you up.

---

## 2. Write your handoff file before you exit

A handoff file is what triggers the next agent. If you skip it, the chain stops.

### Naming convention (exact, no variations):

| You are | Writing to | File name |
|---|---|---|
| CPE | Architect | `HANDOFF-cpe-to-architect.md` |
| CPE | Software Engineer | `HANDOFF-cpe-to-se.md` |
| CPE | QA Engineer | `HANDOFF-cpe-to-qa.md` |
| CPE | UI/UX Engineer | `HANDOFF-cpe-to-uiux.md` |
| Architect | CPE | `HANDOFF-architect-to-cpe.md` |
| Software Engineer | CPE | `HANDOFF-se-to-cpe.md` |
| QA Engineer | CPE | `HANDOFF-qa-to-cpe.md` |
| UI/UX Engineer | CPE | `HANDOFF-uiux-to-cpe.md` |

Write the file to `missions/active/[mission]/handoffs/[filename]`.

### Minimum handoff content:

```markdown
# [From] → [To] Handoff — [MISSION-NNN]
**Date:** YYYY-MM-DD
**Status:** complete / blocked / needs-review

## What I did
[1-3 sentences]

## What you need to do next
[Exact instruction for the next agent]

## Blockers (if any)
[None — or describe the blocker]
```

---

## 3. Log to ACTIVITY.md before you exit

Append one JSON line so the Studio Logs tab shows your work:

```json
{"id":"<timestamp>-<random4>","agent_id":"<your-id>","event":"session complete","detail":"<what you did>","created_at":"<ISO timestamp>"}
```

Replace `<your-id>` with: `cpe`, `architect`, `software-engineer`, `qa`, or `ui-ux`.

---

## 4. One session, one job

- Only work on tasks assigned to you in TASK-REGISTRY.md
- Do not read files unrelated to your current task
- Do not re-read the same file twice in one session
- When your job is done, exit — do not wait, poll, or loop
