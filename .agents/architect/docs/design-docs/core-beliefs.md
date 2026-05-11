# Core Beliefs — DevDen Engineering
Architect's reference copy · Authoritative source: `CPE/docs/design-docs/core-beliefs.md`

> This copy is here for quick reference during architectural design work.
> If this file diverges from the CPE copy, the CPE copy is authoritative.

---

## Who We Are

We are a small team that ships. We build SaaS products using AI agents, and we operate
with the discipline of a larger team and the speed of a small one. We value working
software over comprehensive planning. We value reliability over impressiveness. We have
been burned by complexity and we avoid it reflexively.

---

## Engineering Principles

### 1. The harness is the product
The model is a replaceable component. The real engineering work is in the five layers around it:
instruction, constraint, feedback, memory, and orchestration. Invest in the harness.

### 2. Repository-local knowledge is the only real knowledge
Every decision, every constraint, every plan must be in a file that agents can read.
If it's not here, it doesn't exist. ARCHITECTURE.md and ExecPlans are the Architect's primary contribution to this principle.

### 3. Boring technology is agent-friendly
Agents work best with stable APIs and predictable behavior. Before proposing a new library or pattern in an ExecPlan: does the boring option genuinely fail? If not, use the boring option.

### 4. Enforce invariants mechanically, not verbally
Rules in architecture docs are first-line defense. For invariants that truly cannot be violated, design the enforcement into the architecture: tests, lints, module boundaries.

### 5. Explicit over implicit
Prefer code that says exactly what it does. This is especially important in architectural decisions — never design a system that relies on convention or magic that isn't documented.

### 6. Write for the person debugging at 2am
Every ExecPlan you write should help someone who has never seen this codebase navigate it at speed. That is the Architect's operational definition of "good documentation."

---

## Tradeoffs That Govern Architectural Decisions

**Reliability > Performance**
Design for correctness and reliability first. Performance optimization is a second-order concern.

**Simplicity > Completeness**
An architecture that can be explained in one paragraph is better than a comprehensive one that requires a three-hour onboarding. Optimize for understandability.

**Deletability > Sophistication**
Design components that can be removed or replaced without cascading changes. Avoid deep coupling.

**Consistency > Local Optimization**
A consistent pattern used across the codebase is worth more than a locally optimal solution that introduces a new pattern. Agents replicate patterns — make sure the patterns you establish are worth replicating.

---

## Anti-Values (What We Don't Optimize For)

- Being first to adopt new technology for its own sake
- Having the most sophisticated architecture
- Minimizing lines of code at the expense of clarity
- Appearing impressive to other engineers
- Designing for hypothetical future requirements that don't exist yet

**We design for the product that needs to be built today, with room to extend tomorrow.**
