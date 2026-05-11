# Architect — Performance Log
DevDen · Eval Agent maintains this document

Agent: Architect
Harness layer: Constraint
Eval dimensions: Accuracy · Protocol Adherence · Output Quality · Velocity

---

## Dimension Weights for Architect

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Accuracy | 35% | Plan accuracy vs. actual progress; architecture decisions that hold up under implementation |
| Protocol Adherence | 20% | Check-in schedule, deviation report format (options not just problems), ExecPlan living-doc maintenance |
| Output Quality | 30% | ExecPlan quality — self-contained? Novice-navigable? Observable acceptance criteria? |
| Velocity | 15% | Turnaround on plans and deviation reports; not blocking SE work |

---

## Performance History

> Append a cycle block after each eval cycle.

## Cycle: MISSION-001 M1 — 2026-05-07
Accuracy:           4/5 — Architecture, plan, and ExecPlan all proved accurate and held up under implementation. Minor gap: ExecPlan didn't specify local dev database setup explicitly, which allowed SE to deviate to SQLite without a protocol check.
Protocol Adherence: 5/5 — All three required deliverables produced (ARCHITECTURE.md, PLANS.md, ExecPlan). MEMORY.md properly updated. Signaled CPE correctly. No steps skipped or reordered.
Output Quality:     4/5 — ExecPlan is self-contained with shell commands, decision log, and acceptance criteria. Two gaps: no explicit local dev database guidance (led to SQLite deviation), no pinned dependency versions (Prisma version mismatch caused a P1 blocker).
Velocity:           5/5 — All deliverables delivered same session as handoff (2026-05-07). Zero blocking of downstream SE or UI/UX work.
Overall:            4.35/5
Trend:              → (first cycle, baseline established)
Key finding:        ExecPlan quality is high overall. The one gap — not specifying local dev database setup and dependency versions — had a downstream cost (SQLite deviation, Prisma version blocker). Adding version pins and local dev database guidance to ExecPlan standards will prevent this class of issue.
Plan accuracy rate: 1 milestone planned — M1 target was 2026-05-10, delivered 2026-05-07/08 (ahead of schedule).
Deviation catch rate: 0 deviations caught proactively (none occurred yet; SQLite deviation was not visible to Architect).
Recommendation:     Patch AGENTS.md §ExecPlan Standards: specify local dev database setup and pin critical dependency versions (ORM, database driver).
CPE action taken:   Architect recommendation actioned by CPE in the M1 eval session. Architect AGENTS.md was updated to include explicit ExecPlan standards: specify local dev database setup and pin critical dependency versions. Decision logged at docs/decisions/2026-05-07-eval-m1-agents-md-patches.md.

<!--
## Cycle: [Sprint N / Milestone M] — YYYY-MM-DD
Accuracy:           [X]/5 — [rationale]
Protocol Adherence: [X]/5 — [rationale]
Output Quality:     [X]/5 — [rationale]
Velocity:           [X]/5 — [rationale]
Overall:            [weighted]/5
Trend:              Improving / Stable / Degrading
Key finding:        [most important observation]
Plan accuracy rate: [milestones hit on time / total milestones] — [assessment]
Deviation catch rate: [deviations caught proactively vs. discovered reactively]
Recommendation:     [specific CLAUDE.md change, or "None"]
CPE action taken:   [what CPE did in response, or "Pending"]
-->

---

## What to Watch for Architect

**High-signal indicators:**
- ExecPlan self-containment: can SE implement from the plan without asking clarifying questions?
  — Every clarifying question SE sends back to CPE is an ExecPlan quality failure
- Plan accuracy: how often do timeline estimates prove accurate within 20%?
- Deviation proactivity: does Architect catch deviations before they become blockers,
  or only report them after the fact?
- Architecture drift catch rate: does Architect flag implementation that violates ARCHITECTURE.md,
  or does it slip through to QA?

**The constraint layer health check:**
The Architect sets the boundaries within which SE operates. If ExecPlan quality is low,
SE makes bad architectural decisions — which compounds into QA bugs, tech debt, and
architectural drift that becomes expensive to fix later.
ExecPlan quality is the highest-leverage metric for Architect.
