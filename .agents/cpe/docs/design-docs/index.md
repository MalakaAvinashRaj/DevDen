# Design Docs Index
DevDen · CPE · All design documentation

---

## Index

| Document | Status | Last Updated | Owner | Summary |
|----------|--------|-------------|-------|---------|
| [core-beliefs.md](core-beliefs.md) | Active | 2026-05-07 | CPE | Foundational engineering principles |

> Architect: add design docs here as they are created.
> Format: `[filename](filename) | Active/Superseded | YYYY-MM-DD | [owner] | [one-line summary]`

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| Draft | Under discussion, not yet governing |
| Active | Governing — agents must follow |
| Superseded | Replaced by a newer doc — do not apply |

---

## How to Add a Design Doc

1. Create the file in this directory: `docs/design-docs/YYYY-MM-DD-topic.md`
2. Add a row to the index above with status "Draft"
3. Route to CPE for review
4. When approved: change status to "Active"
5. If this doc supersedes an older one: update old doc's status to "Superseded" and add a link to the new one

---

## Design Doc Template

```markdown
# [Topic] — Design Document
Status: Draft / Active / Superseded
Date: YYYY-MM-DD
Author: [agent]
Reviewed by: CPE — [date]

## Problem
[What challenge or decision this document addresses]

## Options Considered
### Option A: [name]
Tradeoffs: [pros and cons]

### Option B: [name]
Tradeoffs: [pros and cons]

## Decision
[What was decided and why — specific, not generic]

## Implications
[What this decision means for how we build things going forward]

## Open Questions
[Any remaining uncertainties]
```
