# Reliability Standards
DevDen · Software Engineer — required reading before touching any service-level code

---

## Service Level Targets
These are the thresholds your code must not break. QA tests against them.

| Metric | Target | Hard Limit |
|--------|--------|------------|
| API availability | 99.9% monthly | < 43.8 min downtime/month |
| P50 response time | ≤ 150ms | — |
| P95 response time | ≤ 500ms | — |
| P99 response time | ≤ 2000ms | — |
| Error rate (5xx) | < 0.1% of requests | — |
| Background job completion | 99.5% within SLA window | — |

---

## Required Error Handling Patterns

These are MUST rules. Every violation will be caught by QA.

```
MUST: All async functions handle rejection — no unhandled promise rejections
MUST: All external API calls have an explicit timeout
      Third-party services: max 10s
      Internal services:    max 2s
MUST: All external API calls have retry logic with exponential backoff
      Maximum retries: 3
      Backoff: 1s, 2s, 4s (with ±20% jitter)
MUST: All database queries have a timeout configured
      Read queries:  max 5s
      Write queries: max 15s
MUST: All errors logged with: message · stack trace · request ID · user ID (if available)
MUST: Never log sensitive data — passwords, tokens, PII, payment data
```

---

## Timeout Implementation Reference

```typescript
// External API call — always set timeout
const response = await fetch(url, {
  signal: AbortSignal.timeout(10_000), // 10 seconds
});

// Database query — set at connection or query level
const result = await db.query(sql, params, { timeout: 5000 });
```

---

## Retry with Backoff Reference

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      const backoff = Math.pow(2, attempt - 1) * 1000;
      const jitter = backoff * 0.2 * (Math.random() - 0.5);
      await sleep(backoff + jitter);
    }
  }
  throw new Error('unreachable');
}
```

---

## Graceful Degradation — Required Behavior

When a dependency is unavailable, the system must degrade gracefully. Never let a
non-critical dependency bring down a core user flow.

| Dependency Down | Required Behavior |
|-----------------|-------------------|
| Email service | Queue notification, retry up to 24h · do NOT fail the user request |
| Search service | Return empty state or cached results · never 500 the page |
| Analytics / telemetry | Drop silently · never block the critical path |
| Non-critical third-party | Return degraded response with user-visible indicator |

---

## Prohibited Patterns

```
🚫  Empty catch blocks — errors disappear silently
    catch (err) {}

🚫  Retry without backoff — thundering herd
    while (!success) { await callApi(); }

🚫  Synchronous operations in async request handlers
    app.post('/data', (req, res) => {
      const result = fs.readFileSync(path); // blocks the event loop
    });

🚫  Unbounded retries — infinite loops on persistent failures
    while (!success) { ... } // always set a max attempt count

🚫  Timeouts above defined maximums
    signal: AbortSignal.timeout(60_000) // 60s violates the 10s external API limit

🚫  Swallowing errors at service boundaries without logging
    try { ... } catch { return null; } // what failed? when? why?
```

---

## Testing Reliability Requirements

Before signaling work is complete, verify:
- [ ] Timeout scenarios are tested (what happens when the external call takes too long?)
- [ ] Failure modes are tested (network error, 4xx, 5xx from dependencies)
- [ ] Retry logic is tested (does backoff work? does it stop at maxAttempts?)
- [ ] Error logging is verified (do errors include sufficient context?)
