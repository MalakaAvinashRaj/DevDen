# Core Beliefs — DevDen Engineering
The principles that guide how we build everything

---

## Who We Are

We are a small team that ships. We build SaaS products using AI agents, and we operate
with the discipline of a larger team and the speed of a small one. We value working
software over comprehensive planning. We value reliability over impressiveness. We have
been burned by complexity and we avoid it reflexively.

---

## Engineering Principles

### 1. The harness is the product
We are not building software — we are building a harness that builds software. The model
is a replaceable component. The real engineering work is in the five layers around it:
instruction, constraint, feedback, memory, and orchestration. Invest in the harness.

### 2. Repository-local knowledge is the only real knowledge
Any context that is not discoverable from this repository — Slack threads, meeting notes,
people's heads — is invisible to agents and will be lost. Every decision, every constraint,
every plan must be in a file that agents can read. If it's not here, it doesn't exist.

### 3. AGENTS.md is a map, not a manual
Short, stable entry point. ~100 lines. Deep knowledge lives elsewhere and is pointed to.
If you need to explain more than 100 lines to orient an agent, the problem is with the
repository structure, not the AGENTS.md. Fix the structure.

### 4. Boring technology is agent-friendly
Novel dependencies are bets. Agents work best with stable APIs, strong training
representation, and predictable behavior. Before adding something new: does the boring
option genuinely fail? If not, use the boring option.

### 5. Enforce invariants mechanically, not verbally
Rules in markdown files are advisory. For things that truly must not be violated,
write a test, a lint rule, or a CI gate. Documentation rules are first-line defense,
not the only line.

### 6. Build-verify is non-negotiable
Writing code and calling it done is not done. Every implementation is followed by
a verify step that runs the tests and checks the output against the acceptance criteria.
Agents have a strong bias toward "looks correct" — override it by running it.

### 7. Explicit over implicit
Write the extra line that makes the behavior obvious. Avoid hidden conventions, magic
framework behavior, and anything that requires knowing the framework's internals to debug.
If a reader who knows the language but not the framework would be surprised, make it explicit.

### 8. Write for the person debugging at 2am
Every error message, log line, and non-obvious code path should help someone who has
never seen this code understand what went wrong and what to do. That person may be you.

---

## How We Make Decisions

When facing a choice not covered by explicit rules:

1. Does ARCHITECTURE.md or an ExecPlan cover it? Follow that.
2. What would minimize complexity and surface area? Do that.
3. What would a future maintainer (or agent) expect to find here? Follow that.
4. What is already the pattern elsewhere in the codebase? Be consistent.
5. If still unclear: ask CPE. Don't guess on architectural decisions.

When choosing between two valid implementations:
- Choose the one easier to delete or replace later
- Choose the one with less "magic" or hidden behavior
- Choose the one already established as a pattern in this codebase

---

## Tradeoffs We Have Consciously Made

**Reliability > Performance**
A slower endpoint is better than an endpoint that sometimes returns wrong data or
silently fails. Performance is measurable and improveable. Trust once lost is not.

**Simplicity > Completeness**
An 80% solution that ships beats a complete solution that doesn't. We refactor after
validating the idea, not before. We resist the temptation to over-engineer in advance.

**Correctness > Cleverness**
The most impressive-looking code is rarely the most maintainable. We optimize first
for correct, then for clear, then for fast. Never the other way around.

**Shipping > Polishing**
Good code that ships today beats perfect code that ships next month. We iterate in
production, with users, not in isolation. The product is what the user experiences.

---

## Anti-Values

Things we deliberately do not optimize for:

- Being first to adopt new technology
- Having the most sophisticated architecture
- Minimizing lines of code at the expense of clarity
- Appearing impressive to other engineers
- Comprehensive planning before any execution

**We value outcomes. Everything else is in service of that.**

---

## The Quality Bar

Before any work is considered done, ask:
*Would this make a user trust DevDen more, or less?*

- More → ship it
- Less → do not ship it
- Not sure → test it again, then decide

This applies to features, fixes, error messages, and agent outputs alike.
