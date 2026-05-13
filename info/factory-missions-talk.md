# Factory — Missions Talk (Luke, Factory.ai)
*Transcript from conference talk. Source: Factory.ai engineering team.*

---

## The Bottleneck Is Human Attention

The bottleneck in software engineering nowadays is not intelligence — it's limited by human attention. Even the best engineers can only complete a couple of tasks at a time. They may have a backlog of 50 features but they can only drive a few forward per day because every task requires their attention. Every commit needs their review.

Today's models are smart enough to figure out all 50 of these tasks but there's not enough bandwidth to supervise their implementation.

**The question: What if a human decides what to build and then a system figures out how to do so?**

---

## Five Frontier Multi-Agent Patterns

### 1. Delegation
One agent spawns another agent. Parent says "go figure out the database schema" and gets a response back. Simplest form. Sub-agents in coding tools are the most common example.

### 2. Creator-Verifier
One agent builds something, another agent checks that work. Key is separation of concerns — the agent that implemented the code has some cost bias (wants that code to work). A fresh agent with fresh context is far more likely to find issues. Same reason humans do code review.

### 3. Direct Communication
Agents communicate without a central coordinator — like DMing each other. Hard to get right because state fragments across conversations without a coordinator and there's no single source of truth.

### 4. Negotiation
Agents communicate over a shared resource (same API, same portion of the codebase). Doesn't need to be adversarial — best use case is when there's a net positive-sum trade where agents have a potential win-win situation.

### 5. Broadcast
One agent sends information to many. Status updates, new context that applies to everyone, shared constraints. Less flashy but critical for maintaining coherence over long-running tasks.

---

## Missions: The Composition

Missions combines **Delegation + Creator-Verifier + Broadcast + Negotiation** into a single workflow.

- You describe a goal
- Scope it through a conversation
- Approve a plan
- The system handles execution for hours or days
- You focus on something else

**A mission is not a single agent session. It's an ecosystem of agents that communicate through structured handoffs and shared state.**

---

## Three-Role Architecture

### Orchestrator (Planning)
- Acts as your sounding board
- Asks the right strategic questions
- Checks for unclear requirements
- Produces a plan: features + milestones + **validation contract**

**The validation contract defines what "done" means before any coding is done.** This is the key innovation.

### Workers (Implementation)
- Each feature gets assigned to a worker with clean context — no accumulated baggage, no degraded attention
- Worker reads its spec, implements the feature, commits via Git
- Next worker inherits a clean slate and a working codebase

### Validators (Verification)
Two types:

**Scrutiny Validator (faster):**
- Runs test suite, type checking, lints
- Spawns dedicated code review agents for each completed feature within the milestone

**User Testing Validator (slower, more important):**
- Acts like a QA engineer
- Spawns the application
- Interacts through computer use: fills forms, checks page renders, clicks buttons
- Ensures functional flows work holistically
- Neither validator has seen the code before — validation is adversarial by design
- Most of missions' wall clock time is spent here (real-world execution, not token generation)

---

## Why the Validation Contract Matters

Standard pattern that breaks:
> Agent builds a feature → writes tests → tests pass → full coverage → BUT tests were shaped by the code, not by what the code was attempting to do.

Tests written after implementation don't catch bugs. They confirm decisions. If you rely on validation like that, your system will eventually drift.

**The validation contract is written during planning, before any code, and defines correctness independently of implementation.** For a complex project this can be hundreds of assertions. Each feature is assigned one or more assertions it must satisfy. The sum of all features must cover every assertion.

---

## Structured Handoffs (Context Preservation)

When a worker finishes a feature it doesn't just say "I'm done." It fills out a structured handoff detailing:
- What was completed
- What was left undone
- What commands were run and their exit codes
- What issues were discovered
- Did it abide by the procedures the orchestrator defined

This is how the system self-heals. Errors get caught at milestone boundaries. Corrective work gets scoped. The mission pulls itself back on track — not by hoping agents remember what happened but by forcing them to write it down and address issues.

**Longest mission ran for 16 days. They believe 30 is possible.**

---

## Serial vs. Parallel Execution

**What they tried first:** 10 agents running in parallel = 10x throughput. Doesn't work. Agents conflict, step on each other's changes, duplicate work, make inconsistent architectural decisions. Coordination overhead eats the speed gains while burning tokens.

**What works:**
- Features run **serially** — only one worker or validator running at any given time
- **Within a feature:** parallelize read-only operations (searching codebase, researching APIs)
- **Within validators:** parallelize read-only operations (code review agents)

Serial execution with targeted internal parallelization. Seems slower on paper. Error rate drops dramatically. When tasks run for many days, correctness compounds.

---

## Production Numbers (Slack Clone Example)
- 60% of time and tokens spent on implementation
- Validation never succeeds on the first go — follow-up features are almost always created
- 50% of final lines of code are tests
- 90% code coverage
- Heavy use of prompt caching to offset cost of long runs

---

## Model Selection per Role ("Droid Whispering")

Different roles benefit from different model strengths:
- **Planning:** slow, careful reasoning
- **Implementation:** fast code fluency and creativity
- **Validation:** precise instruction following

No single model or provider is best at all three. The skill they're developing internally: mentally model how different LLMs interact, where they fail, how those failures compound over a multi-day run, then make a deliberate choice about which model sits in which seat.

**Validation might use a different model provider entirely** to avoid bias from the same training data.

Model-agnostic architecture: you're only as strong as your weakest link. As models specialize, the ability to put the right model in the right seat becomes a compounding advantage.

**It works in the other direction too:** The structure of missions (validation contracts, milestone checkpoints) allows running missions successfully even using open-weight models.

---

## Anti-Fragile Architecture (Bitter Lesson)

Fear: next model release makes the architecture obsolete overnight.

**Their answer:** almost all orchestration logic is defined in prompts and skills, not a hard-coded state machine. How it decomposes features and handles failures is ~700 lines of text. Four sentences of that can alter execution strategy dramatically.

- Worker behavior driven by skills the orchestrator defines per mission → customized behavior per project
- Only deterministic logic: very thin bookkeeping (running validation, blocking progress when handoff issues unaddressed)
- Missions ensure the discipline. Models provide the intelligence.

---

## The Economics Shift

Before: a team of 5 engineers might work on 10 work streams at any given time.
With missions: potentially 30 work streams.

The team focuses on architecture and product decisions instead of execution.

**The codebase ends up cleaner than when you started** — end-to-end tests, unit tests, skills, and structure means agents and humans are more productive in that environment going forward.

---

## Key Takeaways for DevDen

1. **Validation contract written before coding** — DevDen's QA agent checks after the fact. This should move earlier.
2. **Adversarial validators with fresh context** — our QA was rubber-stamping. Separate context is the fix.
3. **Structured handoffs are connective tissue** — DevDen has this, it's correct.
4. **Serial execution outperforms parallel** — DevDen already does this (one agent at a time per mission).
5. **Right model per role** — DevDen uses one model for all roles. This is a leverage point.
6. **Prompts over state machines** — DevDen's supervisor should stay thin; intelligence stays in agent prompts.
7. **Self-healing via forced written summaries** — handoffs must include: what was done, what was left, commands run, exit codes, issues discovered.
