# Design Principles & Code Patterns
DevDen · Software Engineer reference

---

## Core Engineering Principles

### 1. Correct first, clean second, fast third — in that order
Never optimize or refactor code that isn't working. Never make code elegant at the expense of correctness.
A correct ugly solution beats a beautiful broken one.

### 2. Explicit over implicit
Prefer code that says exactly what it does over code that relies on hidden conventions, framework magic, or implicit behavior that surprises readers. Write the extra line that makes the behavior obvious.

**Do:**
```
const userId = session.user.id; // explicit extraction
const user = await getUserById(userId);
```
**Don't:**
```
const user = await getUser(session); // what field does this use?
```

### 3. Fix root causes, never patch symptoms
When a bug is assigned, find and fix what actually caused it. A symptom patch that makes the test pass without understanding the failure is a future P0 waiting to happen.

### 4. Write for the person debugging at 2am
Every error message, log line, and non-obvious code path should help someone who has never seen this code understand what went wrong and what to do. That person may be you in three months.

### 5. Boring technology by default
Don't reach for a new library or pattern unless the boring approach genuinely can't solve the problem. Novel dependencies have learning curves, maintenance burdens, and failure modes you haven't seen yet.

---

## Established Patterns

### Repository Pattern — Data Access
**Problem:** Prevent business logic from coupling to ORM or SQL implementation details.
**Pattern:** Each domain has a repository module that owns all data access. Services call the repository; nothing else does.
```
services/user-service.ts     → calls lib/repositories/user-repository.ts
lib/repositories/user-repository.ts → calls database client
routes/users.ts              → calls services/user-service.ts (NEVER the repository directly)
```

### Service Pattern — Business Logic
**Problem:** Keep route handlers thin and business logic testable.
**Pattern:** All business logic lives in service functions. Route handlers validate input, call a service, and serialize the response.
```
// route handler — thin
async function handleCreateUser(req, res) {
  const data = validateBody(req.body, CreateUserSchema);
  const user = await userService.create(data);
  res.json(user);
}

// service — contains all logic
async function create(data: CreateUserInput): Promise<User> {
  await ensureEmailUnique(data.email);
  const hashed = await hashPassword(data.password);
  return userRepository.insert({ ...data, password: hashed });
}
```

### Error Handling Pattern
**Problem:** Silent failures and cryptic errors destroy trust.
**Pattern:** Errors bubble up to service boundaries. Every catch logs with context and rethrows or converts to a structured error.
```
// At service boundary — catch, log with context, convert to typed error
try {
  return await externalApi.call(payload);
} catch (err) {
  logger.error({ err, payload, service: 'external-api' }, 'External API call failed');
  throw new ServiceUnavailableError('External API unavailable', { cause: err });
}

// Deep in implementation — let it bubble, don't swallow
const result = await db.query(sql, params); // let DB errors propagate up
```

### Input Validation Pattern
**Problem:** Unvalidated input is a security and reliability risk.
**Pattern:** All external inputs (HTTP request bodies, query params, webhook payloads) are validated with a schema at the service boundary before any processing.
```
// At the route or service entry point
const validated = InputSchema.parse(rawInput); // throws ZodError if invalid
// After this line, data is typed and safe to use
```

---

## Naming Conventions

| Thing | Convention | Example |
|-------|------------|---------|
| Files | kebab-case | `user-repository.ts` |
| Functions | camelCase verbs | `getUserById`, `createInvoice` |
| Types / Interfaces | PascalCase nouns | `UserProfile`, `InvoiceLineItem` |
| Constants | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| Boolean variables | `is`/`has`/`should` prefix | `isActive`, `hasPermission` |
| Database tables | snake_case | `user_profiles`, `invoice_line_items` |

---

## Anti-Patterns — Do Not Use

These are the patterns most commonly introduced by mistake. Review this list before submitting work.

```
❌  Empty catch blocks
    catch (err) {}  // errors disappear silently

❌  Business logic in route handlers
    app.post('/users', async (req, res) => {
      const hash = await bcrypt.hash(req.body.password, 10); // belongs in service
      ...
    });

❌  Direct database access outside repositories
    const users = await db.query('SELECT * FROM users'); // only in repositories

❌  Any-typed parameters
    function process(data: any) // use unknown + type narrowing

❌  Retrying without backoff
    while (!success) { await retry(); } // thundering herd waiting to happen

❌  Secrets in code
    const API_KEY = 'sk-...'; // use process.env.API_KEY

❌  Mutating function parameters
    function addTag(user: User, tag: string) {
      user.tags.push(tag); // mutates the caller's object — return a new value instead
    }
```

---

## Comments — When to Write One

Write a comment only when the WHY is non-obvious: a hidden constraint, a subtle invariant, a workaround for a specific bug, behavior that would surprise a reader who knows the language and frameworks well.

Do not write comments that explain WHAT the code does. Well-named functions and variables do that already.

```
// ✅ Worth commenting — non-obvious constraint
// Stripe requires idempotency keys to be unique per payment attempt,
// so we hash the order ID + attempt number rather than using the order ID alone.
const idempotencyKey = hashKey(`${orderId}-${attemptNumber}`);

// ❌ Noise — the code already says this
// Hash the password before storing it
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
```
