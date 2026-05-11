# Software Engineer — Performance Log
DevDen · Eval Agent maintains this document

Agent: Software Engineer
Harness layer: Instruction
Eval dimensions: Accuracy · Protocol Adherence · Output Quality · Velocity · Self-Verification

---

## Dimension Weights for Software Engineer

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Accuracy | 35% | Does the implementation satisfy the spec and acceptance criteria? |
| Protocol Adherence | 20% | Build-verify loop, ExecPlan updates, acknowledgment, bug fix protocol |
| Output Quality | 25% | Code quality, test coverage, clarity of completion notification |
| Velocity | 10% | Task completion efficiency, doom loop avoidance |
| Self-Verification | 10% | Does SE catch its own bugs before QA? |

---

## Performance History

> Append a cycle block after each eval cycle.

## Cycle: MISSION-001 M1 — 2026-05-07
Accuracy:           3/5 — All 7 API endpoints implemented correctly with proper error handling. Missing: Vercel production deployment (QA testing on localhost, not production as required by M1 acceptance criteria). Tags schema deviated from spec (String instead of String[]).
Protocol Adherence: 2/5 — SE MEMORY.md left completely blank despite encountering a build blocker and making an undocumented architecture deviation. No SE-authored exec-plans in .agents/se/. Architecture deviation (SQLite) not logged or signaled. CPE had to step in to fix the Prisma build blocker rather than SE resolving it.
Output Quality:     3/5 — Code quality is clean and consistent (error handling, JSON serialization, HTTP status codes all correct). Output is usable but incomplete: no Vercel deployment URL, SQLite schema means tags field differs from production target.
Velocity:           3/5 — Endpoints built ahead of 2026-05-10 target. However, a build blocker stalled progress and required CPE intervention; self-resolution was not attempted before escalation.
Self-Verification:  2/5 — Prisma v7 adapter error (server fails to start) would have been caught by running `npm run dev` before signaling M1 complete. Build-verify loop was not fully completed pre-submission.
Overall:            2.70/5
Trend:              → (first cycle, baseline established)
Key finding:        Protocol adherence is the primary concern: blank MEMORY.md, no SE exec-plans, undocumented deviation, and a build blocker escalated to CPE without first attempting resolution. Code craft is solid — this is a protocol discipline issue, not a coding quality issue.
Bug recurrence rate: 1 pre-QA blocker (Prisma config), fixed by CPE. QA has not started; no QA bugs to report yet.
Recommendation:     Patch AGENTS.md §Build Phase Protocol (MEMORY.md update requirement), §Architecture Compliance (deviation logging), and §Self-Verification Checklist (add explicit server start + one API call per endpoint).
CPE action taken:   All 3 SE recommendations actioned within same session: SE AGENTS.md patched (MEMORY.md update requirement during build phase, architecture compliance deviation gate, self-verify checklist with mandatory `npm run dev` + API call per endpoint). SE MEMORY.md updated directly with SQLite/Prisma context.

## Cycle: MISSION-001 M1 QA Loop — 2026-05-08
Accuracy:           4/5 — All three bugs (BUG-002/004/005) fixed correctly in a single session per QA analysis. Verify curl commands documented and passing. Corrupted "Final Verify" test record from BUG-002 repro proactively deleted (clean up after yourself — correct behavior). One gap: BUG-003 was silently fixed during an earlier verify pass without CPE notification (fix was correct; communication was missing).
Protocol Adherence: 4/5 — MEMORY.md fully populated (major improvement from M1 baseline 2/5). AGENTS.md patches being followed: server running verified, curl commands documented in completion signal. One protocol gap: self-caught fix (BUG-003) not communicated to CPE before QA began testing.
Output Quality:     4/5 — Clean TypeScript. Correct HTTP 400 responses for validation errors (tags not array, malformed body, empty body). Default GET correctly returns only active links. All fix rationale documented in completion signal.
Velocity:           5/5 — All three bugs fixed and verified in a single session. No doom loops observed. Completion signal detailed and immediately actionable.
Self-Verification:  4/5 — Caught and fixed BUG-003 proactively during own verify pass before QA tested (intended behavior of the self-verify loop). Dev server running verified. All endpoints checked via curl per new protocol. Gap: the self-catch wasn't communicated — communication discipline, not detection discipline.
Overall:            4.10/5
Trend:              ↑ Improving (from 2.70 baseline in M1)
Key finding:        Protocol turnaround from M1 is significant — every patched behavior is now being followed. The remaining gap is mid-cycle communication: when SE self-catches and fixes a bug outside a formal bug-fix cycle, CPE is not notified, leaving QA to discover the fix during re-test instead of skipping it.
Bug recurrence rate: 0/3 — all three BUG-002/004/005 fixes appear correct per analysis (pending QA final confirmation). Zero bug recurrence from M1 class of errors.
Recommendation:     Patch SE AGENTS.md §Self-Verification Checklist: "If you discover and fix a bug during a verify pass (outside a formal bug-fix cycle), signal CPE with a brief note before the next agent begins testing. Do not leave fixes undocumented in the communication chain."
CPE action taken:   Pending

<!--
## Cycle: [Sprint N / Milestone M] — YYYY-MM-DD
Accuracy:           [X]/5 — [rationale]
Protocol Adherence: [X]/5 — [rationale]
Output Quality:     [X]/5 — [rationale]
Velocity:           [X]/5 — [rationale]
Self-Verification:  [X]/5 — [rationale]
Overall:            [weighted]/5
Trend:              Improving / Stable / Degrading
Key finding:        [most important observation]
Bug recurrence rate: [X bugs returned by QA / X total bugs found] — [assessment]
Recommendation:     [specific CLAUDE.md change, or "None"]
CPE action taken:   [what CPE did, or "Pending"]
-->

---

## What to Watch for Software Engineer

**High-signal indicators:**
- Bug recurrence rate: same class of bug appearing in multiple cycles = systemic issue
- QA bug catch rate: what % of QA bugs were catchable via self-review? High % = build-verify loop not followed
- Root cause quality: are bugs fixed at the root, or are patches showing up later as new bugs?
- ExecPlan maintenance: are living docs being updated as work proceeds, or left as original intent?

**Doom loop pattern:**
If the same file is being edited 5+ times in a row without progress, flag immediately to CPE.
This is the most common failure mode for coding agents.

**Self-verification trend:**
If SE self-verify score is declining while QA bug rate is increasing, the build-verify loop
is breaking down. This is a direct harness issue — update `software-engineer/AGENTS.md`.
