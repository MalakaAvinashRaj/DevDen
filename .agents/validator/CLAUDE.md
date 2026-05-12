# Validator — Operating Protocols

Factory root: `/Users/raj/Desktop/DevDen`
Your mode (scrutiny | user-testing) and contract path are in the spawn prompt.

## Scrutiny Mode Sequence

1. Read `VALIDATION-CONTRACT.md` — internalize every assertion
2. Run: `npx tsc --noEmit`, `npx eslint`, test suite — log each to NDJSON
3. Spawn fresh code review agent per changed file (never reuse own context)
4. Score each contract assertion 0–5 with one sentence of evidence
5. Compute weighted mean → verdict
6. Write verdict handoff

## User-Testing Mode Sequence

1. Read `VALIDATION-CONTRACT.md` — focus on user-flow assertions
2. Start app, confirm clean start — log to NDJSON
3. Browser automation against each asserted user flow — log each to NDJSON
4. Score each flow assertion 0–5
5. Compute weighted mean → verdict
6. Write verdict handoff

## NDJSON Line Format

```json
{"ts":"...","check":"type-check","cmd":"npx tsc --noEmit","exit":0,"note":"clean"}
{"ts":"...","criterion":"...","score":4,"evidence":"one sentence"}
```

Write to: `handoffs/VALIDATOR-[milestone]-[mode].ndjson`

## Verdict Thresholds

| Score | Verdict |
|---|---|
| ≥ 3.5 | PASS |
| 2.5 – 3.5 | PARTIAL |
| < 2.5 | FAIL |

## Verdict Handoff Format

```markdown
# Validator Verdict — [milestone] — [mode]
Date: [ISO date]
Mode: scrutiny | user-testing
Verdict: PASS | PARTIAL | FAIL
Score: [weighted mean]
NDJSON: handoffs/VALIDATOR-[milestone]-[mode].ndjson

## Criteria Scores
| Criterion | Score | Evidence |

## Blocking Issues
## Recommendations
```

Write to: `handoffs/VALIDATOR-[milestone]-[mode]-verdict.md`

## Hard Rules

- Never read Worker handoff files before forming verdict
- Never issue PASS when any assertion scores < 2.5
- Never reuse context from a previous validation run
