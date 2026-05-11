# agent-development Skill Update — Eval M1 Pattern Findings
Date: 2026-05-07
Status: Active

## Context

Eval's M1 cycle report identified two structural failure modes that will recur on any future agent system, not just MISSION-001. Per CPE protocol, pattern findings require updating the `agent-development` skill so the patterns are baked into all future harness designs.

Eval report: `.agents/eval/docs/eval-reports/active/20260507-cycle-m1-eval-report.md`  
Skill location: `~/.agents/skills/agent-development/agent-development/SKILL.md` (canonical)

## Patterns Added

### Pattern 1: ExecPlan database setup ambiguity causes schema drift
**Added to:** §11 — Anti-Patterns table

ExecPlan specifies production database (PostgreSQL) without addressing local dev strategy. SE defaults to pragmatic workaround (SQLite) that creates schema mismatch between dev and production. The plan must answer: "What do you run locally — does it match production exactly? If not, state differences and reconciliation steps."

**Root cause observed in M1:** The ExecPlan said "Create Railway PostgreSQL database (free tier)" without addressing local dev. SE chose SQLite + Prisma v5 (sensible) but schema field changed from `String[]` (PG native) to `String` (JSON string) — undocumented deviation requiring a reconciliation step at Vercel deploy.

### Pattern 2: CPE technical interventions create invisible gaps
**Added to:** §11 — Anti-Patterns table

When the orchestration agent resolves a technical issue directly (outside the standard build-verify-fix loop), the fix exists in production but not in the team's institutional memory. The implementation agent doesn't learn the fix, the bug ticket stays open, and no decision record exists.

**Root cause observed in M1:** CPE downgraded Prisma from v7 to v5 directly, without: (1) writing a decision log entry, (2) updating SE MEMORY.md, or (3) closing the P1 bug ticket. On restart, SE had no record of the fix and QA found an OPEN P1 that was already resolved.

### Pattern 3: Build-phase MEMORY.md updates deferred to session close
**Added to:** §11 — Anti-Patterns table

SE hit a blocker (Prisma adapter error), made an architecture deviation (SQLite), and discovered surprising behavior — none of it logged until (or in this case, not at all before) session close. The trigger for MEMORY.md updates must be mid-build events, not just session end.

## Options Considered

Option A: Log only in Eval reports (already done).  
Option B: Add to AGENTS.md only (instance-level, only affects current agents).  
Option C: Add to agent-development skill + AGENTS.md (pattern-level, affects all future harnesses).

## Decision

Option C — add to both. AGENTS.md patches fix the current agents. Skill update ensures future harnesses are built with these lessons baked in from day one.

## Implications

- Any future factory built with this skill will have explicit ExecPlan database setup standards
- CPE agents in future systems will have explicit paper trail requirements for direct technical fixes
- SE agents in future systems will have explicit mid-build MEMORY.md update triggers

## Revisit Trigger

If these anti-patterns appear in a different factory or mission (not MISSION-001), review whether the skill language is specific enough.
