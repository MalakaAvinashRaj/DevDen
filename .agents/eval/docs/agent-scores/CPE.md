# CPE — Performance Log
DevDen · Eval Agent maintains this document

Agent: Chief Product Engineer
Harness layer: Orchestration
Eval dimensions: Accuracy · Protocol Adherence · Output Quality · Velocity

---

## Dimension Weights for CPE

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Accuracy | 30% | Routing decisions that produce the right outcome |
| Protocol Adherence | 30% | QA loop enforcement, decision logging, acknowledgment speed |
| Output Quality | 25% | Clarity of task routing, bug re-routing context, Eval action |
| Velocity | 15% | Decision latency, unblocking speed |

---

## Performance History

> Append a cycle block after each eval cycle.

## Cycle: MISSION-001 M1 — 2026-05-07
Accuracy:           4/5 — All routing decisions correct (Architect first → parallel UI/UX + SE → QA). One accuracy gap: M1 approved and routed to QA without verifying Vercel production deployment was complete (PLANS.md requires it).
Protocol Adherence: 3/5 — Three protocol gaps: (1) Fixed Prisma build blocker directly rather than routing back to SE; (2) No decision log entry in docs/decisions/ for the Prisma fix; (3) Resolved P1 bug left in bug-log/active/ as OPEN after resolution.
Output Quality:     4/5 — All four handoffs (Architect, UI/UX, SE, QA) are comprehensive and immediately actionable with context, test protocol, and success criteria. QA handoff is the strongest: 4-phase test plan with shell commands and clear sign-off criteria.
Velocity:           5/5 — Same-day Architect approval, parallel launch of UI/UX and SE, Prisma blocker unblocked in the same session. No decision latency observed.
Overall:            3.85/5
Trend:              → (first cycle, baseline established)
Key finding:        CPE's coordination quality is high — routing is clear, handoffs are thorough, decision speed is excellent. The gap is boundary discipline: two instances of crossing into implementation territory (fixing code, not closing bug tickets) that, if repeated, will degrade the build-verify loop and create invisible gaps in the team's institutional memory.
Recommendation:     Patch AGENTS.md §Milestone Sign-Off Protocol (verify all acceptance criteria before routing to QA) and §Blocker Resolution (paper trail for CPE-resolved technical issues).
CPE action taken:   All 6 Eval recommendations actioned within same session: SE AGENTS.md patched (MEMORY.md protocol, architecture compliance, self-verify), CPE AGENTS.md patched (milestone sign-off, blocker resolution), decision log created (docs/decisions/2026-05-07-eval-m1-agents-md-patches.md), agent-development skill updated with 3 anti-patterns. SE MEMORY.md updated directly.

## Cycle: MISSION-001 M1 QA Loop — 2026-05-08
Accuracy:           4/5 — Correct routing: QA bugs triaged, SE handoff v2 written with all three open bugs (BUG-002/004/005). BUG-003 correctly identified as resolved. Two ghost entries remain in bug-log/active/ (BUG-003 + original P1 Prisma) — expected normal latency; watch for closure before M2.
Protocol Adherence: 4/5 — 100% Eval recommendation action rate from M1 report (all 6 recommendations actioned same session). Minor: BUG-003 and Prisma P1 not yet moved to bug-log/resolved/ per §Bug Log Hygiene patch — CPE is expected to close these next session.
Output Quality:     5/5 — SE handoff v2 (20260508-CPE-SE-m1-bug-fixes-v2.md) explicitly lists all three bugs with repro steps and priority. QA re-test handoff (20260508-CPE-QA-m1-retest-v2.md) clear and scoped. Clean chain.
Velocity:           5/5 — QA report received → SE handoff written → QA re-test handoff written all within same session. Zero decision latency.
Overall:            4.40/5
Trend:              ↑ Improving (from 3.85 baseline in M1)
Key finding:        The Eval→CPE feedback loop is functioning as designed: 100% recommendation action rate, same-session turnaround. The only open gap is two ghost bug-log entries (BUG-003 + original P1) that need to be moved to resolved/. If this resolves before M2, no further scoring impact.
Recommendation:     Monitor bug-log/active/ closure before M2. No new AGENTS.md patch needed.
CPE action taken:   N/A (Eval is the reporter; CPE response to this cycle pending)

<!--
## Cycle: [Sprint N / Milestone M] — YYYY-MM-DD
Accuracy:           [X]/5 — [rationale]
Protocol Adherence: [X]/5 — [rationale]
Output Quality:     [X]/5 — [rationale]
Velocity:           [X]/5 — [rationale]
Overall:            [weighted]/5
Trend:              Improving / Stable / Degrading
Key finding:        [most important observation]
Recommendation:     [specific CLAUDE.md change, or "None"]
CPE action taken:   [what CPE did in response, or "Pending"]
-->

---

## What to Watch for CPE

**High-signal indicators:**
- QA loop enforcement: did every completed task go through QA before release? Any exceptions?
- Bug re-routing quality: when routing bugs back to SE, does CPE include ID, severity, expected vs actual, repro, and priority?
- Decision logging: are major scope/priority/timeline decisions appearing in `docs/decisions/`?
- Eval action rate: what percentage of Eval's recommendations did CPE act on?

**Low-signal (ignore for scoring purposes):**
- Response time on low-priority messages
- Number of tasks assigned (velocity is about unblocking, not volume)
