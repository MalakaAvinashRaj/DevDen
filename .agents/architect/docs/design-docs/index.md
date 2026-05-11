# Design Docs Index — Architect
DevDen · All design documentation owned by Architect

---

## Index

| Document | Status | Last Updated | Summary |
|----------|--------|-------------|---------|
| [core-beliefs.md](core-beliefs.md) | Active | 2026-05-07 | Foundational engineering principles |
| [../../../CPE/docs/design-docs/core-beliefs.md](../../../CPE/docs/design-docs/core-beliefs.md) | Active (authoritative) | 2026-05-07 | CPE copy — authoritative if divergence |

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| Draft | Under discussion — not yet governing |
| Active | Governing — Architect references when making design decisions |
| Superseded | Replaced by a newer doc |

---

## How to Add a Design Document

1. Identify the architectural decision or pattern to document
2. Create: `YYYY-MM-DD-topic.md`
3. Required sections: Problem · Options · Decision · Rationale · Implications
4. Set status to "Draft"
5. Route to CPE for review and approval
6. When approved: set status to "Active", add to index above
7. Also add to CPE's design-docs index: `CPE/docs/design-docs/index.md`

---

## When Design Docs Are Created

Create a design document when:
- Making a significant architectural decision with multiple valid options
- Establishing a new pattern that will be used across multiple features
- Documenting a known constraint or tradeoff that future agents need to understand
- Superseding an old decision (document why, link to the old one)

Do not create a design doc for:
- Implementation details (those go in ExecPlans)
- Task-level decisions (those go in ExecPlan Decision Logs)
- Facts that are obvious from the codebase
