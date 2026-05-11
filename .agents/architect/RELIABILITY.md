# Reliability Requirements — Architect Reference
DevDen · These targets must be designed into the architecture, not bolted on later

---

## Core Principle
Reliability is an architectural property, not a QA concern. If the architecture
doesn't guarantee reliability, no amount of testing will produce it.
These requirements must be accounted for in every exec plan and system design.

---

## Service Level Objectives — Design Targets

| Metric | Target | Architectural Implication |
|--------|--------|--------------------------|
| API availability | 99.9% monthly | No single points of failure in critical paths |
| P95 response time | ≤ 500ms | Async processing for anything > 100ms; no blocking I/O in handlers |
| P99 response time | ≤ 2000ms | Timeout budgets must be defined in the design |
| Error rate (5xx) | < 0.1% | All external dependencies need failure isolation |
| Data RPO | < 1 hour | Backup strategy required in any persistence design |
| Data RTO | < 4 hours | Recovery procedure must exist before feature ships |

---

## Architectural Patterns Required for Reliability

### Timeout Budget Allocation
Every exec plan that touches external services must define the timeout budget:
```
Route handler → Service → External adapter
Total budget: 10s for external calls, 2s for internal service calls
Each layer consumes a portion; document allocation in the exec plan
```

### Retry Strategy
Any integration with an external service requires a documented retry strategy:
- Maximum retries: 3
- Backoff: exponential with jitter (1s, 2s, 4s ±20%)
- Non-retryable errors: 4xx client errors (except 429), authentication failures
- Retryable errors: 5xx server errors, network timeouts, 429 (rate limit)

### Graceful Degradation Map
For every external dependency, the exec plan must document what happens when it's unavailable:

```
Template for each dependency:
If [service] is down:
  - User-visible effect: [what the user sees]
  - System behavior: [how the system responds]
  - Recovery: [how and when normal operation resumes]
```

### Asynchronous by Default for Slow Operations
Any operation that cannot complete in < 100ms should be designed as async:
- User receives immediate acknowledgment
- Work happens in the background
- User is notified of completion (or failure) via notification mechanism

---

## Failure Mode Analysis — Required for L/XL ExecPlans

Before finalizing any L/XL exec plan, document:
1. What are the top 3 failure modes for this feature?
2. How does each failure mode surface to the user?
3. How does the system recover from each failure mode?
4. Are there any failure modes that could cause data loss? If so, what prevents it?

---

## Reliability Anti-Patterns — Flag These in Design Review

```
🚫  Single point of failure in a user-facing path — no fallback
🚫  Synchronous external API call in a route handler with no timeout
🚫  Database schema changes that could lock tables in production under load
🚫  Background jobs with no dead letter queue or failure monitoring
🚫  "We'll add retries later" — retries must be designed in, not retrofitted
🚫  Hard dependency on a third-party service for critical-path user actions
```

---

## How This Maps to ExecPlans

Every exec plan in `docs/exec-plans/` must include a section:

```markdown
## Reliability Considerations
Timeout budget: [how the 10s budget is allocated across layers]
Retry strategy: [what gets retried, with what backoff]
Degradation behavior: [what happens when dependencies fail]
Failure modes: [top 3 failure modes and how they're handled]
Data safety: [any risk of data loss and how it's prevented]
```

If the plan doesn't touch reliability-sensitive areas, state that explicitly:
"This change is a pure UI update with no external dependencies — no reliability concerns."
