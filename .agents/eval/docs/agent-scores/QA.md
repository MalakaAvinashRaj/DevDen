# QA Engineer — Performance Log
DevDen · Eval Agent maintains this document

Agent: QA Engineer
Harness layer: Feedback
Eval dimensions: Accuracy · Protocol Adherence · Output Quality · Velocity

---

## Dimension Weights for QA

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Accuracy | 40% | Bug detection rate — does QA catch bugs before they reach production? |
| Protocol Adherence | 25% | Test protocol (happy path → edge cases → regression), BUG_TEMPLATE.md format |
| Output Quality | 25% | Bug report quality — are reports specific, reproducible, and actionable? |
| Velocity | 10% | Test cycle efficiency — no unnecessary delays, but never at expense of thoroughness |

---

## Performance History

> Append a cycle block after each eval cycle.

## Cycle: MISSION-001 M1 QA Loop — 2026-05-08
Accuracy:           5/5 — Full 4-phase test protocol executed (happy path → edge cases → failure modes → regression). Caught 4 bugs total (1 P1 data corruption, 3 P2). On re-test: correctly confirmed BUG-003 resolved and BUG-002/004/005 still open — no confusion between "fix present in code" vs "fix deployed to running server" in the first round. Full regression sweep (13 previously-passing tests) all still passing. Zero false negatives observed.
Protocol Adherence: 5/5 — All phases of test protocol executed in correct order. BUG_TEMPLATE.md format followed for all four bug reports. MEMORY.md and PROGRESS.md updated before signaling CPE. Re-test handoff correctly scoped to three remaining bugs + full regression.
Output Quality:     5/5 — All four bug reports immediately actionable: exact curl reproduction commands, expected vs actual clearly stated, code-level root cause with line numbers, working fix suggestion provided. CPE's SE bug-fix handoff was written almost verbatim from QA reports — zero CPE clarification needed. Re-test correctly distinguished "resolved" from "not fixed" without ambiguity.
Velocity:           5/5 — Full test cycle (4 phases) and re-test both completed within their assigned sessions. No unnecessary delays. Regression sweep added to re-test correctly (not skipped for speed).
Overall:            5.00/5
Trend:              → (first cycle, baseline established)
Key finding:        First-cycle excellence. The feedback layer is operating at the intended quality level: all bugs caught, all reports actionable, zero false negatives, protocol followed exactly. This is the standard for QA performance going forward.
False negative rate: 0 — No bugs known to have passed QA undetected in M1 testing.
Recommendation:     None this cycle. No AGENTS.md patches needed.
CPE action taken:   N/A (QA passed; no changes needed)

<!--
## Cycle: [Sprint N / Milestone M] — YYYY-MM-DD
Accuracy:           [X]/5 — [rationale]
Protocol Adherence: [X]/5 — [rationale]
Output Quality:     [X]/5 — [rationale]
Velocity:           [X]/5 — [rationale]
Overall:            [weighted]/5
Trend:              Improving / Stable / Degrading
Key finding:        [most important observation]
False negative rate: [known bugs that passed QA / total bugs found post-release]
Recommendation:     [specific CLAUDE.md change, or "None"]
CPE action taken:   [what CPE did, or "Pending"]
-->

---

## What to Watch for QA

**High-signal indicators:**
- False negative rate: bugs that passed QA and were found later (in production or by CPE)
  — this is the most critical metric for QA
- Regression coverage: after a bug fix, did QA run regression or only test the specific fix?
  — partial regression = high false negative risk
- Bug report completeness: are reports using BUG_TEMPLATE.md fully? Incomplete reports slow SE.
- Premature approval: any pattern of approving work under time pressure? Check approval speed vs. normal.

**The feedback layer health check:**
QA is the feedback mechanism for the whole harness. If QA accuracy drops, the entire
build-verify-fix loop degrades — SE ships bugs, CPE can't trust releases, Eval scores
drop across the board. QA accuracy is the highest-leverage metric to protect.
