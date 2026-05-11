# Reliability — QA Testing Reference
DevDen · What QA tests against

---

## Reliability Targets

Test all user-facing flows against these thresholds. Flag any violation as a bug.

| Metric | Target | How to Test |
|--------|--------|-------------|
| Page load — initial | < 2s | Browser dev tools Network tab |
| API response — P95 | ≤ 500ms | Load test or repeated manual measurement |
| API response — P99 | ≤ 2000ms | Under simulated load |
| Error rate (5xx) | < 0.1% | Watch browser console and network tab during test session |
| Form submission feedback | < 200ms | User perceives this as "instant" |
| Background job notification | Within stated SLA | Check status endpoint or notification |

---

## Degradation Testing — Required for Every Feature

For every feature that touches an external service, test what happens when that service is unavailable.

| Scenario | Expected Behavior | Pass Criteria |
|----------|-------------------|---------------|
| Email service down | User request succeeds; notification queued for retry | No 500 error, UI does not mention email failure on non-email flows |
| Search unavailable | Empty state shown, no 500 | Page renders, user gets graceful empty state |
| Payment API timeout | Error message with actionable guidance | User sees "Payment processing failed — please try again" |
| Slow API response (> 5s) | Loading state displayed, request eventually completes or times out with message | No blank/frozen UI |

---

## Error Handling Quality Tests

For every error state, verify the user-facing message is specific and actionable:

```
❌ Failing:  "Something went wrong"
❌ Failing:  "Error 500"
❌ Failing:  "Internal Server Error"
✅ Passing:  "Unable to save changes — your session expired. Please log in again."
✅ Passing:  "Payment declined — your card's billing address doesn't match. Check your details in Settings → Billing."
```

---

## Security-Adjacent Reliability Checks

Verify during QA that:
- [ ] Error messages do not expose internal file paths, stack traces, or database queries to the user
- [ ] Rate limiting is active on auth endpoints (attempt > N logins rapidly — should be throttled)
- [ ] Session expiry is handled gracefully (expired token → redirect to login, not 401 JSON)
- [ ] Invalid inputs return 400 with helpful message, not 500

---

## Load and Concurrency Notes

For features that involve shared state or concurrent operations:
- Test with two browser sessions performing the same action simultaneously
- Test rapid successive actions (double-clicking submit buttons, rapid form submission)
- Verify optimistic UI updates reconcile correctly if the server response is delayed

---

## How to File a Reliability Bug

Use `BUG_TEMPLATE.md`. For reliability failures, set severity based on:
- P0: Feature is completely unavailable or causing data loss
- P1: Feature works under ideal conditions, fails under normal load or degraded dependencies
- P2: Feature is slow but functional; UX degrades but doesn't break
- P3: Minor UX degradation under unusual conditions
