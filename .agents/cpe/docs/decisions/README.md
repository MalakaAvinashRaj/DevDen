# Decision Log — CPE
DevDen · Major product and process decisions

---

## How to Log a Decision

Create a new file: `YYYY-MM-DD-topic.md`

Required content:
```markdown
# [Decision Title]
Date: YYYY-MM-DD
Status: Active / Superseded

## Context
[Why this decision needed to be made. What was the situation?]

## Options Considered
Option A: [description] — [tradeoff]
Option B: [description] — [tradeoff]

## Decision
[What was decided. Be specific.]

## Rationale
[Why this option over the others. What mattered most in the tradeoff?]

## Implications
[What changes because of this decision. What it rules out. What it enables.]

## Revisit Trigger
[Under what conditions should this decision be re-examined?]
```

---

## When to Log a Decision

Log a decision when it:
- Changes scope, timeline, or agent responsibilities
- Overrides a recommendation from Architect, Eval, or QA
- Establishes a new pattern that future agents should follow
- Resolves a conflict between two principles or priorities

Do not log routine task routing or task status updates — those belong in `PLANS.md`.

---

## Decision Index

> Add a row here when creating a new decision file.

| File | Date | Topic | Status |
|------|------|-------|--------|
| 2026-05-07-eval-m1-agents-md-patches.md | 2026-05-07 | AGENTS.md patches from Eval M1 cycle (SE + CPE) | Active |
| 2026-05-07-eval-m1-agent-development-skill-update.md | 2026-05-07 | agent-development skill — 3 anti-patterns added from Eval M1 patterns | Active |
