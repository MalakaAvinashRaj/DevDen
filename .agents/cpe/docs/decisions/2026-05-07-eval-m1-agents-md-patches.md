# AGENTS.md Patches — Eval M1 Cycle Findings
Date: 2026-05-07
Status: Active

## Context

Eval agent completed the M1 cycle evaluation for MISSION-001 (Link Vault). The report identified 6 issues and recommended specific patches to SE AGENTS.md, CPE AGENTS.md, and Architect AGENTS.md. This log records what was changed and why, per CPE protocol (never apply without logging).

Eval report: `.agents/eval/docs/eval-reports/active/20260507-cycle-m1-eval-report.md`

## Changes Made

### SE AGENTS.md — §Session Start / §Self-Verification Checklist / §Architecture Compliance / §Boundaries

**What changed:**
1. Added in-session MEMORY.md update triggers (during blockers, architecture deviations, surprises) — not just at session close
2. Added mandatory self-verify step: run `npm run dev` + make one call per endpoint before signaling complete
3. Added new §Architecture Compliance section: any ExecPlan deviation requires MEMORY.md log + CPE signal + downstream impact flag
4. Updated Boundaries to include MEMORY.md during build phase and "Ask First" for architecture deviations

**Why:** SE's M1 session had empty MEMORY.md, undocumented SQLite deviation from PostgreSQL spec, and Prisma build error not caught before signaling complete. These are process gaps that will recur without explicit protocol gates.

**Eval issues addressed:** Issues 1 (MEMORY.md blank), 2 (SQLite deviation), 6 (self-verify gap)

### CPE AGENTS.md — §Milestone Sign-Off Protocol / §Blocker Resolution

**What changed:**
1. Added §Milestone Sign-Off Protocol: before routing to QA, verify all PLANS.md acceptance criteria; if deviation forced (e.g., local QA before production deploy), document explicitly in PROGRESS.md and scope QA's test window
2. Added §Blocker Resolution: when CPE fixes a technical issue directly, requires three-step paper trail: decision log + SE MEMORY.md update + bug ticket closure

**Why:** CPE routed QA to test localhost without Vercel production deploy (M1 acceptance criterion). CPE also directly fixed the Prisma config issue without logging a decision, updating SE MEMORY.md, or closing the P1 bug ticket. Both patterns will recur on aggressive timelines.

**Eval issues addressed:** Issues 3 (M1 marked complete without production deploy), 4 (CPE boundary crossing), 5 (resolved bug left open)

## Options Considered

**Option A: Patch immediately** — Eval provided explicit, targeted recommendations grounded in observed behavior. Patch without delay.

**Option B: Wait for next mission cycle** — Only patch after seeing whether issues recur.

## Decision

Option A — patch immediately. Eval recommendations are specific and grounded. Waiting lets the gaps persist into M2.

## Rationale

All three SE issues are first-occurrence but structurally likely to recur: MEMORY.md blanks will happen whenever SE's context window resets without a completed close; architecture deviations happen when ExecPlans don't address local dev setup; self-verify gaps happen when verification is implicit rather than explicit. Patching now prevents M2 recurrence.

## Implications

- SE must now explicitly run the dev server before signaling complete (catch Prisma-class errors before QA)
- SE must log architecture deviations in MEMORY.md before proceeding (no more silent SQLite switches)
- CPE must check all PLANS.md criteria before routing to QA (prevents QA testing wrong environment)
- CPE must leave a paper trail for all direct technical fixes (prevents ghost bugs and memory gaps)

## Revisit Trigger

After M2 completion, Eval should check whether: (1) SE MEMORY.md is populated, (2) any architecture deviations were properly logged, (3) CPE verified all acceptance criteria before routing to QA.
