# Evaluation Criteria
DevDen · Eval Agent · Scoring rubrics for all agents

---

## Scoring Scale

**1** — Unacceptable · **2** — Poor · **3** — Acceptable · **4** — Good · **5** — Excellent

Score each dimension independently. Do not average before recording individual scores.
Overall score = weighted average per the weights below.

---

## Dimension Weights by Agent

| Agent | Accuracy | Protocol Adherence | Output Quality | Velocity | Self-Verification |
|-------|----------|-------------------|----------------|----------|-------------------|
| CPE | 30% | 30% | 25% | 15% | — |
| Software Engineer | 35% | 20% | 25% | 10% | 10% |
| QA Engineer | 40% | 25% | 25% | 10% | — |
| Architect | 35% | 20% | 30% | 15% | — |

---

## Dimension: Accuracy
*Does the agent's output correctly address the task it was given?*

| Score | Description |
|-------|-------------|
| 5 | Output fully satisfies all specified requirements. All edge cases handled. No regressions. Passes acceptance criteria without revision. |
| 4 | Core requirements met. Minor gap or edge case missed but documented as known limitation. All existing checks pass. |
| 3 | Main case works correctly. Missing 1–2 edge cases. Existing checks pass. Happy path is covered. |
| 2 | Partial output. Main flow works under ideal conditions; breaks on basic edge cases. Some existing checks failing. |
| 1 | Does not address the requirement. Existing checks broken. Introduces regressions. |

---

## Dimension: Protocol Adherence
*Does the agent follow the protocols defined in their CLAUDE.md?*

| Score | Description |
|-------|-------------|
| 5 | Follows every protocol step exactly. Communication format correct. Routing correct. No steps skipped or reordered. |
| 4 | Follows almost all protocols. One minor deviation (e.g., slightly late acknowledgement, missing one log entry). No impact on output quality. |
| 3 | Generally follows protocols. Some inconsistencies — a step delayed, a format slightly off — but core workflow is intact. |
| 2 | Multiple protocol violations. Skipped steps, incorrect routing, or missing required communication. Workflow impact observed. |
| 1 | Does not follow defined protocols. Core workflow violated. Example: QA approved without testing, SE shipped without QA. |

---

## Dimension: Output Quality
*Is the agent's output clear, complete, and useful to the next agent in the chain?*

| Score | Description |
|-------|-------------|
| 5 | Output is immediately actionable with no ambiguity. Perfectly formatted per requirements. Provides sufficient context for the next agent to proceed without follow-up questions. |
| 4 | Output is actionable. Minor formatting or context gap that doesn't block the next step. |
| 3 | Output is usable but requires the next agent (or CPE) to ask at least one clarifying question before proceeding. |
| 2 | Output is incomplete or ambiguous. Multiple follow-up questions required. Creates delays in the pipeline. |
| 1 | Output is not usable. Wrong format, missing critical information, or incorrect conclusions. Must be redone. |

---

## Dimension: Velocity
*Does the agent complete work within a reasonable number of cycles?*

| Score | Description |
|-------|-------------|
| 5 | Task completed efficiently. No unnecessary back-and-forth. No doom loops observed. Blockers surfaced immediately when encountered. |
| 4 | Mostly efficient. One extra round-trip due to ambiguity or a missed detail. Recovered quickly. |
| 3 | Acceptable efficiency. 2–3 extra cycles. No signs of doom loops. Completion reached. |
| 2 | Low efficiency. Multiple unnecessary cycles. Same action repeated without progress (3–4 repetitions). |
| 1 | Severely inefficient. Doom loop observed (5+ repeated actions without progress). Task not completed or required human intervention to unblock. |

---

## Dimension: Self-Verification (Software Engineer only)
*Does the SE verify their work before submitting, or rely on QA to catch obvious failures?*

| Score | Description |
|-------|-------------|
| 5 | Full self-verification checklist completed. Tests written for happy path and edge cases. Zero obvious bugs that a self-review would catch. |
| 4 | Self-verification mostly complete. One minor item missed that QA caught — not a recurrence pattern. |
| 3 | Partial self-verification. 1–2 QA bugs were catchable via the self-review checklist in `AGENTS.md`. |
| 2 | Limited self-verification. Multiple QA bugs were obvious and catchable pre-submission. |
| 1 | No evidence of self-verification. Majority of QA bugs were trivially reproducible. Build-verify loop not followed. |

---

## Scoring Procedure

1. Define the evaluation window (sprint / milestone / incident)
2. Gather all observable outputs and decisions from the agent in that window
3. Score each applicable dimension 1–5 with a one-sentence rationale
4. Calculate weighted overall score
5. Note the trend: Improving / Stable / Degrading vs. previous cycle
6. For any dimension ≤ 2: identify root cause and propose specific CLAUDE.md change

---

## Score Recording Format

When appending to `docs/agent-scores/[agent].md`:

```markdown
## Cycle: [Sprint N / Milestone M] — YYYY-MM-DD
Accuracy: [X]/5 — [one sentence rationale]
Protocol Adherence: [X]/5 — [one sentence rationale]
Output Quality: [X]/5 — [one sentence rationale]
Velocity: [X]/5 — [one sentence rationale]
Self-Verification (if SE): [X]/5 — [one sentence rationale]
Overall: [weighted score]/5
Trend: Improving / Stable / Degrading
Recommended action: [specific CLAUDE.md change, or "None"]
```

---

## Escalation Thresholds

| Condition | Action |
|-----------|--------|
| Any dimension = 1 | Immediate alert to CPE — do not wait for end-of-cycle report |
| Any dimension ≤ 2 for 2+ consecutive cycles | High-priority recommendation in next report |
| Overall score drops by > 1 point vs. previous cycle | Flag as regression in report header |
| SE Self-Verification ≤ 2 | Flag immediately — increases QA load and slows the pipeline |
