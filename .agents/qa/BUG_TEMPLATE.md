# Bug Report Template
DevDen · QA Engineer · Required format for all bugs sent to CPE

---

## How to Use This Template

1. Copy the template below for each bug
2. Save as `docs/bug-log/active/BUG-NNN.md` (increment NNN from the last bug number)
3. Send the filled report to CPE — do not send incomplete reports
4. When the fix is confirmed resolved: move file to `docs/bug-log/resolved/`

Incomplete reports (missing repro steps, missing expected vs. actual, missing severity) will be returned by CPE without routing to SE.

---

## Bug Report Template

```markdown
# BUG-NNN — [One-line summary of what failed]

**Date:**        YYYY-MM-DD
**Severity:**    P0 / P1 / P2 / P3
**Feature:**     [Feature name or domain]
**Status:**      Open

---

## Steps to Reproduce

1. [Exact starting state — e.g., "Logged in as a user with Billing plan"]
2. [Action taken — e.g., "Navigate to Settings → API Keys"]
3. [Next action — e.g., "Click 'Generate new key'"]
4. [Continue until the failure point]

## Expected Behavior

[Describe precisely what should happen. Reference the product spec if applicable:
docs/product-specs/[spec-name].md §[section]]

## Actual Behavior

[Describe precisely what actually happened. Be specific — include error messages,
wrong values, unexpected states. Copy exact error text if available.]

## Evidence

[Attach or describe: screenshot description, error log excerpt, response body, console output]

## Environment / Context

- Test executed: [date and time]
- Relevant state: [e.g., "account had 0 existing API keys", "billing status: active"]
- Related to: [prior fix / related spec / previous bug ID if regression]

## Severity Rationale

[One sentence explaining why you chose P0/P1/P2/P3]

P0 — system crash, data loss, security issue, feature completely non-functional
P1 — major functionality broken, no viable workaround
P2 — functionality impaired, workaround exists
P3 — cosmetic or minor UX issue, low user impact

## QA Notes

[Optional: hypotheses, related patterns observed, suggested starting point for SE]
```

---

## Example — Filled Report

```markdown
# BUG-001 — API key generation returns 500 after first key is created

**Date:**        2026-05-07
**Severity:**    P1
**Feature:**     API / Integrations — Key Management
**Status:**      Open

---

## Steps to Reproduce

1. Log in as a user with an active Billing plan
2. Navigate to Settings → API Keys
3. Click "Generate new key" — first key created successfully
4. Click "Generate new key" a second time

## Expected Behavior

A second API key is created and displayed in the list alongside the first.
(Reference: docs/product-specs/api-key-management.md §Key Creation)

## Actual Behavior

The request returns HTTP 500. The error toast displays "Something went wrong."
No second key is created. The first key remains visible and functional.

## Evidence

Console error: "POST /api/keys 500 Internal Server Error"
Response body: {"error": "Internal Server Error"} (no detail)

## Environment / Context

- Test executed: 2026-05-07 14:32 UTC
- Account state: 1 existing API key at time of second generation attempt
- Not a regression — first time this flow has been tested

## Severity Rationale

P1 — Users can only have one API key. The primary use case (multiple keys for
different integrations) is completely broken. No workaround.

## QA Notes

Did not reproduce when account had 0 keys. Appears to be a "second key" edge case.
Possibly a unique constraint violation not being handled gracefully.
```
