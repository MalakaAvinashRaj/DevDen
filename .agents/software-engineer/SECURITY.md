# Security Rules
DevDen · Software Engineer — required reading · these are hard constraints

---

## Hard Rules — NEVER Violate

Violations of these rules will be caught by QA and are treated as P0 bugs.

```
🚫  NEVER store credentials, API keys, tokens, or secrets in code or config files
    → Use environment variables: process.env.VARIABLE_NAME
    → Secrets in .env.local (gitignored) locally; secrets manager in production

🚫  NEVER log sensitive data
    → No passwords, tokens, API keys, PII, payment card data in logs
    → Log request IDs and user IDs, never user data payloads

🚫  NEVER use eval() or execute arbitrary user input as code

🚫  NEVER write SQL with user input via string concatenation
    ❌  db.query('SELECT * FROM users WHERE id = ' + userId)
    ✅  db.query('SELECT * FROM users WHERE id = $1', [userId])

🚫  NEVER disable HTTPS or certificate validation, even in development

🚫  NEVER commit .env files, private keys, or credential files to version control
```

---

## Required Patterns by Category

### Input Validation — All User Input
```
MUST: Validate all inputs at the service boundary before processing
MUST: Validate type, length, format, and range — not just presence
MUST: Reject and log inputs that fail validation; never attempt to clean and reuse
MUST: Use a schema library (Zod, Yup, etc.) for all HTTP request body validation
```

```typescript
// Required pattern at every service entry point
const validated = RequestSchema.parse(req.body); // throws on invalid
// Everything after this line is typed and validated
```

### Authentication & Authorization
```
MUST: All API routes require auth by default
MUST: Public routes must be explicitly registered in the allowlist — opt-in, not opt-out
MUST: Authorization checks happen in service functions, not route handlers
MUST: Use the project's established auth helper — never build auth logic inline
```

```typescript
// Required pattern for authorization check
await requirePermission(userId, resourceId, 'write'); // throws AuthorizationError if denied
// Not: if (user.role === 'admin') { ... } — use the centralized helper
```

### Dependency Security
```
MUST: Only add packages after checking for known vulnerabilities
MUST: Pin to exact versions — not ranges
MUST: Run dependency audit before adding any new package
```

### Secrets Handling
```typescript
// ✅ Correct — environment variable
const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) throw new Error('STRIPE_SECRET_KEY not configured');

// ❌ Violation — hardcoded secret
const apiKey = 'sk_live_abc123...';

// ❌ Violation — secret in config file that could be committed
import config from './config.json'; // { stripeKey: 'sk_live_...' }
```

---

## High-Sensitivity Areas — Extra Scrutiny Required

When modifying these areas, add a comment explaining the security consideration you checked:

| Area | Why It's Sensitive |
|------|--------------------|
| Authentication / session handling | Session hijacking, token leakage |
| Authorization middleware | Bypassing access controls |
| Payment / billing flows | Financial data, Stripe webhook validation |
| User data ingestion | Injection vectors, PII exposure |
| File upload handling | Path traversal, malicious content |
| External API integrations | SSRF, credential exposure |

---

## Security Self-Review — Required Before Submitting

Before notifying CPE that work is ready, run this checklist:

- [ ] Does any user input reach a database query without parameterization?
- [ ] Are any secrets referenced in code rather than environment variables?
- [ ] Does any new route bypass authentication without being in the public route allowlist?
- [ ] Does any error message expose internal state, stack traces, or file paths to the client?
- [ ] Does any log line contain sensitive user data (passwords, tokens, PII)?
- [ ] Do new dependencies have known vulnerabilities? (`pnpm audit` or equivalent)

---

## When In Doubt
Ask CPE before implementing. Security mistakes are far cheaper to prevent than to fix after the fact.
