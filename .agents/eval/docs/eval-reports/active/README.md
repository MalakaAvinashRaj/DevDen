# Active Eval Reports
DevDen · Reports sent to CPE this cycle

## File Naming

`YYYYMMDD-cycle-[sprint-or-milestone]-eval-report.md`

## Efficiency Report Template

```markdown
# Efficiency Report — [Cycle Identifier]
Date: YYYY-MM-DD
Eval window: YYYY-MM-DD to YYYY-MM-DD
Prepared by: Eval Agent

---

## Executive Summary
[2–3 sentences on overall harness health this cycle. Lead with the most important finding.]

---

## Agent Performance Scores

| Agent | Accuracy | Protocol | Output Quality | Velocity | Self-Verify | Overall | Trend |
|-------|----------|----------|----------------|----------|-------------|---------|-------|
| CPE | [X]/5 | [X]/5 | [X]/5 | [X]/5 | N/A | [X]/5 | ↑/→/↓ |
| Software Engineer | [X]/5 | [X]/5 | [X]/5 | [X]/5 | [X]/5 | [X]/5 | ↑/→/↓ |
| QA Engineer | [X]/5 | [X]/5 | [X]/5 | [X]/5 | N/A | [X]/5 | ↑/→/↓ |
| Architect | [X]/5 | [X]/5 | [X]/5 | [X]/5 | N/A | [X]/5 | ↑/→/↓ |

Score definitions: see EVAL_CRITERIA.md

---

## Issues Identified

### Issue 1: [One-line description]
- **Agent:** [which agent]
- **Dimension:** [which dimension — accuracy, protocol, output quality, velocity, self-verify]
- **Score:** [X]/5
- **Observed:** [specific behavior observed — grounded in evidence, not opinion]
- **Root cause:** [prompt issue? missing instruction? unclear boundary? model limitation?]
- **Impact:** [what this cost the team — delays, extra cycles, quality degradation]
- **Recommendation:** Update [Agent] CLAUDE.md §[section] to [specific change] — [why this change addresses the root cause]

### Issue 2: [...]

---

## Positive Signals

What worked well this cycle and should be reinforced:
- [Agent] — [specific behavior that produced a good outcome]
- [...]

---

## Recommended CLAUDE.md Changes

| Agent | File | Section | Change | Priority |
|-------|------|---------|--------|----------|
| [agent] | [CLAUDE.md path] | §[section] | [specific change] | High/Med/Low |

---

## Next Eval Checkpoint
Recommended: [when and what to focus on — specific agent or dimension showing risk]
```

## Immediate Escalation Format

For critical findings that can't wait for end-of-cycle:

```markdown
# EVAL ALERT — [One-line description]
Date: YYYY-MM-DD
Severity: Critical

Observed: [what happened]
Agent: [which agent]
Evidence: [specific behavior]
Recommended immediate action: [what CPE should do now]
```
