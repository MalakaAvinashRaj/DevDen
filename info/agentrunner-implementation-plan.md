# Dynamic Tiered AgentRunner — Value Assessment & DevDen Implementation Plan

**Source paper:** *Beyond Autonomy: A Dynamic Tiered AgentRunner Framework* (Pan & Hou, A2A Lab, arXiv 2605.10223, May 2026)
**Written:** 2026-05-13
**Status:** Plan — awaiting approval before implementation begins

---

## Part 1: Value Assessment — How Relevant Is This to DevDen?

**Short answer: 9/10. The highest-fit research paper we've found for DevDen's architecture.**

This paper was not written for code generation systems — it was written for enterprise chain-operations management. But the problems it solves map almost perfectly to DevDen's failure modes, because the underlying problem is the same: *multi-agent systems that propose and execute actions without independent review fail in predictable and expensive ways.*

### Where DevDen Is Today vs. Where AgentRunner Would Put It

| Capability | DevDen v1 (current) | AgentRunner approach | Gap |
|---|---|---|---|
| Agent oversight | Validator judges after build | Critic reviews before execution, Validator audits outcome | **Critical gap** |
| Risk classification | None — all features spawn same pipeline | Risk score R(T) → Light/Standard/Full routing | **Critical gap** |
| Recovery | `retry_count` ≤ 3, then `failed` | RecoveryAgent with avoidance list, 5-way decision tree | **Significant gap** |
| Separation of powers | Worker proposes + executes | Worker proposes, Critic approves, ToolGateway executes | **Significant gap** |
| Checkpoint durability | SQLite job table (partial) | Full checkpoint `CP = (tier, phase, roles, outputs, recovery)` | **Moderate gap** |
| Organizational learning | Manual GBrain import at ship | Async Retrospector → skill drafts → human approval → GBrain | **Moderate gap** |
| Spawn governance | chokidar → direct spawn | Spawn Gateway with 6-layer validation | **Moderate gap** |

### The Numbers That Matter for DevDen

The ablation results tell you exactly what each missing component costs:

- **No Critic** → error rate 12.6× worse. DevDen currently has no Critic. This means roughly 1 in 8 high-risk Worker outputs probably have scope violations, unsafe operations, or spec drift that the Validator catches too late (after the code is committed).
- **No structured Recovery** → 67.3% of recoverable failures become permanent failures. DevDen retries up to 3 times blindly — no avoidance list, no replan signal.
- **Static Full governance (no tiering)** → 139% higher cost AND 3.7% lower success rate. Over-governance is real. Not every DevDen feature needs the same scrutiny.

### Can We Implement It?

**Yes — with deliberate adaptations for DevDen's context.**

The paper's system operates at the level of individual tool calls (API operations). DevDen operates at the level of feature builds (multi-file code changes). The concepts translate, but the granularity is coarser. Concretely:

- Their **Critic** reviews a single proposed API action. DevDen's **Critic** reviews a complete Worker feature handoff (code changes, test results, spec adherence).
- Their **ToolGateway** intercepts individual tool invocations. DevDen's **Spawn Gateway** intercepts agent spawns at the supervisor level.
- Their **risk score** is per API call. DevDen's **risk score** is per feature spec.
- Their **Retrospector** extracts patterns from task traces. DevDen's **Retrospector** reads mission ACTIVITY.md + verdict files.

The core insight — *governance guarantees must live at the system layer, not the prompt layer* — applies directly and without modification.

---

## Part 2: Implementation Plan

**7 phases. Sequential. Each phase is independently valuable and shippable.**
**Total estimated build time: ~14–18 worker sessions across 3 missions.**

---

### Phase A — Risk Scorer
*"Before spawning anything, score the feature's risk."*

**What it is:** A `studio/lib/risk-scorer.ts` module that reads a feature spec file and returns a composite risk score + tier assignment. The Orchestrator agent calls this (via a bash script) before writing each spawn handoff.

**The adapted R(T) formula for DevDen features:**

```
R(feature) = w1·op_type + w2·scope + w3·cross_system + w4·hist_failure_rate

w1 = 0.35  (operation type)
  0.0 = read-only / analysis / documentation
  0.3 = single-file code write
  0.6 = multi-file write or new dependencies
  0.8 = database schema change or migration
  1.0 = deployment, infrastructure change, destructive operation

w2 = 0.25  (scope — normalized 0–1)
  = min(file_count / 10, 1.0)  where file_count = estimated files touched

w3 = 0.25  (cross-system flag)
  0 = feature stays within one domain (e.g., pure UI, pure API)
  1 = feature touches ≥ 2 systems (e.g., API + DB + UI, or external service integration)

w4 = 0.15  (historical failure rate for this mission's agent, 0–1)
  = failed_jobs / total_jobs for this mission (from SQLite jobs table)
  = 0 if no history

Thresholds (calibrated to paper's values, to be tuned after 20 real missions):
  R < 0.25  →  Light tier   (Worker → Validator, no Critic)
  R < 0.60  →  Standard tier (Worker → Critic → Validator)
  R ≥ 0.60  →  Full tier    (Worker → Critic → human approval gate → Validator)
```

**Implementation files:**
- `studio/lib/risk-scorer.ts` — scoring logic, reads feature spec markdown, returns `{score, tier, breakdown}`
- `scripts/score-feature.ts` — CLI wrapper: `bun score-feature.ts <spec-path>` → prints JSON score
- Update `db.ts` schema: add `risk_score REAL, tier TEXT` columns to `jobs` table

**Orchestrator CLAUDE.md update:** Before writing any SPAWN handoff, run:
```bash
bun /Users/raj/Desktop/DevDen/scripts/score-feature.ts milestones/<spec>.md
```
Include the tier in the SPAWN handoff file under `TIER:` field.

**What improves:** Every spawn now carries a risk classification. Supervisor can route appropriately. You get an audit trail of which features were considered high-risk and whether that judgment was correct.

---

### Phase B — Tiered Spawn Pipeline
*"Don't give every feature the same pipeline."*

**What it is:** The supervisor reads the `TIER:` field from spawn files and routes to different pipelines:

```
Light tier:    Worker spawn → [wait for WORKER-done] → Validator spawn
Standard tier: Worker spawn → [wait for WORKER-done] → Critic spawn → [wait for CRITIC-verdict] → Validator spawn
Full tier:     Worker spawn → [wait for WORKER-done] → Critic spawn → [wait for CRITIC-verdict] → human SSE gate → Validator spawn
```

**Implementation files:**
- Update `studio/lib/fs-sync.ts`: parse `TIER:` field from SPAWN files, store in `SpawnPayload`
- Update `studio/lib/supervisor.ts`: after Worker done handoff, check tier → spawn Critic (Standard/Full) or Validator (Light) directly
- Update `studio/lib/db-store.ts`: add `createJob` overload accepting tier; track pipeline stage per job

**New SPAWN file field:**
```
MISSION: MISSION-001-name
FEATURE: M1-auth-api
SPEC: .../milestones/M1-auth-api.md
ROLE: worker
TIER: standard
RISK_SCORE: 0.42
```

**What improves:** Light-tier features (read-only analysis, doc generation, small single-file changes) skip the Critic entirely — faster and cheaper. Full-tier features (DB migrations, deployments) get a human gate before the Validator runs.

---

### Phase C — Critic Agent
*"An independent reviewer between build and validation — the highest-value addition."*

**What it is:** A new Hermes profile (`critic`) that reads a Worker's done handoff + the original feature spec, and produces a structured verdict before the Validator runs. This is the component with the largest impact: removing it causes 12.6× more errors in production.

**What the Critic does (in order):**
1. Read the feature spec (`milestones/<feature>.md`) — understand what was requested
2. Read the Worker's done handoff (`handoffs/WORKER-<feature>-done.md`) — understand what was built
3. `git diff HEAD~1 HEAD` — see the actual code changes
4. Run `/review` on each changed file (blind review, fresh context per file)
5. For each spec assertion, determine: does the implementation satisfy it?
6. Produce verdict: `{approve | revise | reject | escalate}`
7. Write verdict file: `handoffs/CRITIC-<feature>-verdict.md`

**Critic verdict format:**
```markdown
# Critic Verdict — <feature>
Date: <ISO>
Feature: <feature>
Verdict: approve | revise | reject | escalate

## Spec Adherence
| Assertion | Satisfied | Note |
|---|---|---|
| <from spec> | yes/partial/no | one sentence |

## Issues Found
<!-- Only populated for revise/reject/escalate -->
- BLOCKING: <specific issue that must be fixed>
- WARNING: <non-blocking concern>

## Decision
<!-- approve: Validator may proceed -->
<!-- revise: Worker must address blocking issues and re-submit -->
<!-- reject: Feature must be re-specced — escalate to Orchestrator -->
<!-- escalate: Human input required before proceeding -->
```

**Implementation files:**
- `~/.hermes/profiles/critic/SOUL.md` — Critic identity, what drives it, what it never does
- `~/.hermes/profiles/critic/config.yaml` — same base config as other profiles; Critic uses **higher conservatism** (lower temperature, explicit instruction to find problems not confirm correctness)
- `.agents/critic/CLAUDE.md` — exact sequence with bash commands
- Update `studio/lib/fs-sync.ts`: handle `CRITIC-*-verdict.md` files; if `revise` → requeue Worker job with revision context; if `reject`/`escalate` → notify Orchestrator via SSE

**Critic hard rules (non-negotiable):**
- Never read the Validator contract. The Critic judges spec adherence, not contract assertions.
- Never suggest implementation approaches. Report findings only.
- A BLOCKING issue found → verdict is `revise` or `reject`. No exceptions.
- The Critic's system prompt temperature is set to 0.2 (vs Worker's 0.7) — conservative by design.

**What improves:** Catches the class of errors that appear "done" to the Worker but fail contract assertions — missing edge cases, incorrect types, incomplete implementations, spec drift. The ablation shows this is the single highest-value addition.

---

### Phase D — Structured Recovery Agent
*"When a Worker fails, don't just retry blindly."*

**What it is:** A new Hermes profile (`recovery`) that activates when a job exhausts retries or a Critic issues `reject`. Instead of marking the job `failed`, it analyzes what went wrong, consults an avoidance list of previously-failed approaches, and makes a structured decision.

**Recovery decision tree:**
```
retry    → Same spec, new Worker session (only if failure was environmental/timeout, not logic)
replan   → Revised spec with explicit constraints added based on failure analysis
ask_user → Human input required to resolve ambiguity in spec
wait     → External dependency not ready (e.g., another feature must complete first)
fail     → Permanently unrecoverable; Orchestrator must re-scope
```

**The avoidance list:** A new SQLite table `recovery_attempts` stores each failed approach so the Recovery agent can explicitly say "don't try X again."

**Implementation files:**
- `~/.hermes/profiles/recovery/SOUL.md` + `config.yaml`
- `.agents/recovery/CLAUDE.md`
- New DB table:
  ```sql
  CREATE TABLE recovery_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER REFERENCES jobs(id),
    mission_id INTEGER REFERENCES missions(id),
    feature TEXT NOT NULL,
    failed_approach TEXT NOT NULL,  -- what was tried
    failure_reason TEXT,            -- why it failed
    decision TEXT NOT NULL,         -- retry|replan|ask_user|wait|fail
    avoidance_note TEXT,            -- "do not: ..."
    created_at TEXT DEFAULT (datetime('now'))
  );
  ```
- Update `studio/lib/job-queue.ts`: before marking `failed`, route to Recovery if `retry_count >= MAX_RETRIES`
- Update `studio/lib/fs-sync.ts`: handle `RECOVERY-<feature>-decision.md` files

**Recovery handoff format:**
```markdown
# Recovery Decision — <feature>
Date: <ISO>
Decision: replan
Avoidance: Do not attempt direct SQL migration — use ORM migration tooling instead
Context: Worker failed 3 times attempting raw SQL schema changes; PostgreSQL constraint ordering caused failures

## Revised Spec
<!-- For replan only: add explicit constraints to the original spec -->
Additional constraints:
- Use drizzle-orm migration files, not raw SQL
- Run migration in a transaction
```

**What improves:** 67.3% of initially-failed tasks become recoverable. Currently DevDen's blind retry on the same job recovers maybe 20% (transient failures only). Structured recovery with avoidance lists catches the logic-failure class.

---

### Phase E — Full Checkpoint Persistence
*"If the supervisor crashes mid-feature, reconstruct state from DB, not memory."*

**What it is:** Enhance the SQLite jobs table to store complete pipeline checkpoint state. Any in-flight job can be reconstructed without re-running completed stages.

**Enhanced job schema:**
```sql
ALTER TABLE jobs ADD COLUMN tier TEXT DEFAULT 'light';        -- light|standard|full
ALTER TABLE jobs ADD COLUMN pipeline_stage TEXT DEFAULT 'spawned'; -- spawned|critic_pending|critic_done|validator_pending|done
ALTER TABLE jobs ADD COLUMN risk_score REAL;
ALTER TABLE jobs ADD COLUMN worker_handoff_path TEXT;         -- path to WORKER-done.md
ALTER TABLE jobs ADD COLUMN critic_verdict TEXT;              -- approve|revise|reject|escalate|null
ALTER TABLE jobs ADD COLUMN critic_handoff_path TEXT;         -- path to CRITIC-verdict.md
ALTER TABLE jobs ADD COLUMN validator_verdict TEXT;           -- PASS|PARTIAL|FAIL|null
ALTER TABLE jobs ADD COLUMN recovery_decision TEXT;           -- retry|replan|ask_user|wait|fail|null
ALTER TABLE jobs ADD COLUMN checkpoint_ts TEXT;               -- last checkpoint timestamp
```

**Supervisor restart recovery (updated):**
```
Restart detected → scan jobs WHERE status='running' OR pipeline_stage NOT IN ('done', 'failed')
For each: check pipeline_stage → resume from that stage
  stage='spawned'          → check PID alive; if dead → requeue Worker
  stage='critic_pending'   → check if CRITIC-verdict.md exists; if yes → advance; if no → respawn Critic
  stage='validator_pending'→ check if VALIDATOR-verdict.md exists; if yes → advance; if no → respawn Validator
```

**What improves:** Supervisor hot-reloads (Next.js dev mode restarts constantly) no longer restart entire agent sessions. Overnight missions don't lose state to morning restarts.

---

### Phase F — Retrospector (Async Organizational Learning)
*"Every completed or failed mission is a training signal. Capture it."*

**What it is:** A script that runs asynchronously after every mission ships or fails. It reads all handoffs, activity logs, and verdict files to extract patterns and write them to GBrain as skill drafts. Skill drafts require human approval before agents can use them.

**What Retrospector extracts:**
- Which feature types consistently fail in which modes
- Which Critic-found issues appear repeatedly (signals spec template weakness)
- Which recovery decisions succeeded vs. failed
- Which risk scores were calibrated correctly vs. over/under-estimated
- Successful patterns worth codifying as reusable skill steps

**Implementation:**
- `scripts/retrospect.ts <mission-folder>` — reads all files, uses Claude API to extract patterns, writes to GBrain
- Output format: `gbrain put mission-NNN-<slug>-retrospect < /tmp/retrospect-output.md`
- Skill drafts written under `~/.hermes/skills/drafts/` — NOT in `~/.hermes/skills/` (requires human to `mv` to activate)
- Add to Orchestrator CLAUDE.md: after `gbrain put` at Step 6, run `bun /Users/raj/Desktop/DevDen/scripts/retrospect.ts <folder>`

**What improves:** The factory gets smarter after each mission without automated self-modification. The human-gated skill draft promotion means no runaway self-improvement.

---

### Phase G — Spawn Gateway
*"The supervisor is not just a dispatcher — it's the only safe path to agent execution."*

**What it is:** A `studio/lib/spawn-gateway.ts` module that wraps every `hermes` spawn call in a 5-layer validation pipeline. No agent runs unless it passes all layers.

**The 5 layers (adapted from paper's 6-layer ToolGateway):**

```
Layer 1: Schema validation
  → Spawn payload has all required fields: mission, role, feature/milestone, spec/contract path
  → Referenced files exist on disk

Layer 2: Phase permission
  → Is this agent role valid for the mission's current phase?
  → Workers: only during 'building' phase
  → Critics: only after a Worker done handoff exists for this feature
  → Validators: only after Critic approval (Standard/Full) or Worker done (Light)
  → Recovery: only when job.retry_count >= 2

Layer 3: Scope guard
  → Does the spec path belong to this mission's folder? (no cross-mission file access)
  → Is there already a running job for this feature? (idempotency — prevent duplicate spawns)

Layer 4: Risk gate (Full tier only)
  → If tier='full' and no human approval recorded → block spawn, push SSE 'approval_required' event
  → Studio shows approval gate in DynamicIsland; human clicks approve → flag set in DB → spawn proceeds

Layer 5: Execution
  → Spawn hermes process
  → Record PID, stage, checkpoint_ts in DB
  → Emit SSE 'agent_spawned' event
```

**Implementation files:**
- `studio/lib/spawn-gateway.ts` — the 5-layer pipeline, returns `{allowed: boolean, reason?: string}`
- Update `studio/lib/supervisor.ts`: replace direct `spawnHermes()` calls with `spawnGateway.validate(payload).then(() => spawnHermes(...))`
- Add `human_approvals` table:
  ```sql
  CREATE TABLE human_approvals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER REFERENCES jobs(id),
    approved_at TEXT,
    approved_by TEXT DEFAULT 'user'
  );
  ```
- Add `POST /api/jobs/[id]/approve` API route → inserts approval record, triggers queued spawn

**What improves:** Makes "governance as architecture" real for DevDen. Critical operations (Full-tier features) cannot proceed without human sign-off. No prompt instruction needed — it's a physical block.

---

## Part 3: Implementation Sequencing

Build these in order. Each phase ships value independently.

```
Phase A (Risk Scorer)         ← foundation for everything else; build first
Phase B (Tiered Pipeline)     ← depends on A; enables routing
Phase C (Critic Agent)        ← highest individual value; build third
Phase D (Recovery Agent)      ← depends on C (Critic can trigger Recovery)
Phase E (Checkpointing)       ← completes durability story
Phase F (Retrospector)        ← async, build last (lowest urgency)
Phase G (Spawn Gateway)       ← wraps everything; build before Phase C goes live
```

**Realistic sequencing for DevDen missions:**

| Mission | Phases | Outcome |
|---|---|---|
| MISSION-002 | A + B + G | Risk scoring live, pipeline routing works, spawn gateway enforced |
| MISSION-003 | C + E | Critic agent live, full checkpoint persistence |
| MISSION-004 | D + F | Recovery agent live, Retrospector generating skill drafts |

---

## Part 4: What We Do NOT Implement

Some paper concepts don't fit DevDen's context:

- **Multi-tenant federation** — DevDen is single-user. Cross-tenant anonymized learning is irrelevant.
- **ToolGateway within agent sessions** — We can't intercept Hermes agent tool calls from the outside. The Spawn Gateway at the supervisor level is the correct adaptation.
- **Critic false-positive confidence threshold** — The paper uses a trained classifier. We start with the simple rule: any BLOCKING finding → revise verdict. Tune later.
- **w4 (historical failure rate) per tenant** — DevDen has no tenants. w4 is per-mission or per-agent-role instead.

---

## Part 5: Expected Outcomes After Full Implementation

Based on the paper's ablation results, adapted to DevDen's context:

| Metric | DevDen v1 (current) | DevDen + AgentRunner | Expected gain |
|---|---|---|---|
| Feature build success rate | ~65–70% (estimated) | ~85–90% | +20–25pp |
| Recoverable failures caught | ~20% (blind retry) | ~67% | +47pp |
| Wasted work (building wrong thing) | Unknown, likely high | Critic catches before Validator | Significant reduction |
| Cost per Light feature | baseline | -40–55% (skip Critic) | Cost reduction |
| Mission failure due to bad handoff | Unknown | Critic detects pre-Validator | Near elimination |

The most important outcome is not the numbers — it's the governance model. DevDen's current single failure mode (Worker builds the wrong thing → Validator fails → Orchestrator must re-spec → Worker rebuilds) gets intercepted at the Critic stage. The loop shortens from 3 agent sessions to 1 Critic + 1 revision.

---

## Part 6: First Concrete Step

If this plan is approved: **Phase A** — the Risk Scorer is a self-contained module with zero disruption to the current pipeline. It adds metadata without changing agent behavior. That makes it the right first step.

```
Deliverables for Phase A:
1. studio/lib/risk-scorer.ts         — scoring function
2. scripts/score-feature.ts          — CLI wrapper
3. DB migration: add risk_score + tier columns to jobs table
4. Orchestrator CLAUDE.md update     — instructions to score before spawning
5. End-to-end test: score a sample feature spec, verify tier output
```

Estimated: 1 worker session.
