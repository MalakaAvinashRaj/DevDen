# Project Plan — DevDen
**Authored and maintained by:** Architect
**Status:** [Draft / Active / On Track / At Risk / Blocked]
Last updated: 2026-05-07

> This is the authoritative project plan. Architect maintains it.
> CPE reads it for decision-making. Software Engineer reads it for context.
> A summary lives at `.agents/cpe/PLANS.md` — sync major updates there.

---

## Project Overview

**Product:** [Name]
**Start date:** YYYY-MM-DD
**Target completion:** YYYY-MM-DD
**Current milestone:** [M1 / M2 / etc.]

---

## Milestone Plan

### M1: [Name] — Target: YYYY-MM-DD
**Goal:** What exists at the end of this milestone that did not exist before. State as a user-visible outcome.
**Tasks:**
- [Task description] → Software Engineer — [S/M/L/XL]
- [Task description] → Architect — [S/M/L/XL]
- [QA test cycle] → QA Engineer
**Dependencies:** None
**Acceptance:** [How CPE verifies this milestone is complete — specific and observable]
**ExecPlans:** `docs/exec-plans/active/[plan].md`

### M2: [Name] — Target: YYYY-MM-DD
**Goal:** [...]
**Tasks:** [...]
**Dependencies:** M1 complete + QA approved
**Acceptance:** [...]

---

## Critical Path

Tasks and milestones that cannot slip without affecting the final date:

| Item | Reason It's Critical |
|------|---------------------|
| [M1] | All subsequent milestones depend on its foundation |
| [specific task] | Blocks three downstream tasks |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner | Status |
|------|------------|--------|------------|-------|--------|
| [Risk description] | High/Med/Low | High/Med/Low | [what reduces the risk] | [agent] | Open |

---

## Buffer and Slack

Total buffer built into this plan: [N days / N sprints]
Where buffer is available: [milestone or date range]
Where there is no buffer: [the critical path items above]

---

## Check-in Schedule

| Milestone | Check-in Date | Status |
|-----------|---------------|--------|
| M1 | YYYY-MM-DD | — |
| M2 | YYYY-MM-DD | — |

---

## Tech Debt Tracked During Planning

> Items identified during planning that are known shortcuts or risks:
> Full tracker: `docs/exec-plans/tech-debt-tracker.md`

- [Short description] — [risk level] — [when to address]

---

## Deviation Log

> Append here when plan changes. Every change needs a rationale.
> CPE approval required before implementing a significant deviation.

| Date | What Changed | Why | CPE Decision | New Target |
|------|-------------|-----|--------------|------------|
| — | — | — | — | — |

---

## Retrospective Notes

> Append after each completed milestone.

<!--
### M[N] Complete — [date]
What went well: [...]
What slowed us down: [...]
Adjustment for M[N+1]: [...]
-->
