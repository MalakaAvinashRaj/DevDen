# Security Requirements — Architect Reference
DevDen · Security must be designed in, not added after

---

## Core Principle
Security vulnerabilities are almost always architectural in origin: a missing auth
check, an injection vector designed into the data flow, a trust boundary that was
never drawn. These requirements must be reflected in every exec plan and system design.

---

## Required Security Design Patterns

### Authentication — Default Deny
All routes and endpoints require authentication by default.
Public endpoints must be explicitly registered in an allowlist — opt-in, not opt-out.

Exec plan requirement: list every new endpoint, its auth requirement, and the mechanism.
```
POST /api/users/create    → requires: authenticated user + 'users:write' permission
GET  /api/health          → public (explicitly allowlisted)
```

### Authorization — Centralized, Not Inline
Authorization logic belongs in a single, testable location — not scattered through route handlers.

Design pattern:
```
Route handler → calls requirePermission(userId, resource, action)
Service method → calls requirePermission(userId, resource, action) for sensitive operations
Database layer → row-level filtering by userId where applicable
```

Never: `if (user.role === 'admin') { ... }` scattered through handlers.

### Input Validation — Trust Nothing External
All external inputs (HTTP bodies, query params, URL params, webhook payloads, file uploads)
must be validated against a strict schema before entering the system.

Design requirement: every exec plan touching external inputs must identify:
- What schema library is used
- Where validation happens (service boundary)
- What happens when validation fails (log + 400, not 500)

### Secrets Management — Never in Code
No credential, token, API key, or private value is ever in:
- Source code
- Config files tracked in version control
- Log output
- Error messages returned to clients

Design requirement: exec plans must identify every secret the feature needs and
document how it is injected at runtime (environment variable, secrets manager).

### Data Isolation — Tenant / User Boundaries
Every query that returns user data must be scoped to the requesting user's context.
No query should be able to return data belonging to another user through manipulation of request parameters.

Design requirement: exec plans that introduce new data access patterns must document
the isolation strategy (user_id filter, tenant_id scoping, row-level security).

---

## Threat Model — Questions for Every Feature

Before finalizing an exec plan, answer:

1. **What data does this feature access or create?** Is any of it sensitive?
2. **Who is allowed to call this endpoint or trigger this action?** How is that enforced?
3. **What external inputs does this feature accept?** How are they validated?
4. **Does this feature introduce any new secrets?** How are they stored and injected?
5. **Could a user manipulate parameters to access another user's data?** How is that prevented?
6. **Does this feature generate user-visible error messages?** Do they expose internal state?

---

## Security-Sensitive Architectural Areas

Changes to these areas require heightened scrutiny in design review:

| Area | Risk | Required Design Review |
|------|------|----------------------|
| Authentication / session management | Session hijacking, token forgery | Explicit threat model in exec plan |
| Route auth middleware | Auth bypass | Mapping of all routes + auth requirements |
| Payment / billing integration | Financial fraud, webhook spoofing | Signature verification documented |
| User data queries | Cross-user data access | Isolation strategy documented |
| File handling | Path traversal, malicious upload | Validation + storage strategy documented |
| External webhook receipt | SSRF, replay attacks | Signature verification + idempotency |

---

## Security Requirements in ExecPlans

Every exec plan must include a section:

```markdown
## Security Considerations
Data accessed: [what sensitive data this feature touches]
Auth requirement: [what authentication/authorization is required]
Input validation: [what external inputs are validated, with what schema, at what boundary]
Secrets: [any new secrets this feature needs and how they are injected]
Threat model: [answers to the 6 threat model questions above, or "N/A — no security surface"]
```

If the plan introduces no security-relevant changes, state explicitly:
"This change is a pure internal refactor with no external inputs, new data access, or auth changes."
