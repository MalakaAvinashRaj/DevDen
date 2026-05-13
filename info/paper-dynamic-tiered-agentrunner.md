# Beyond Autonomy: A Dynamic Tiered AgentRunner Framework for Governable and Resilient Enterprise AI Execution

**Authors:** Kai Pan, Rong Hou (A2A Lab — kaipan@a2alab.cn)
**Date:** May 11, 2026
**arXiv:** [2605.10223v1](https://arxiv.org/abs/2605.10223) [cs.AI]

---

## TL;DR

This paper argues that enterprise multi-agent AI systems suffer not from insufficient autonomy but from insufficient **governability**, and proposes Dynamic Tiered AgentRunner — a production-deployed framework that routes tasks through three governance tiers (Light / Standard / Full) based on a composite risk score, enforces hard separation of powers between proposal and execution via a ToolGateway, and treats failure as a recoverable first-class state. Deployed on a real multi-tenant SaaS platform over 537 tasks, it achieves 88.9% task success rate with only 0.5% unreviewed high-risk execution errors, while cutting latency by 46.8% and inference cost by 58.2% compared to a static always-full pipeline.

---

## Key Contributions

- **Risk-Adaptive Tiering** — A tier function `τ(T)` that selects the minimal governance intensity sufficient for a task's risk profile, routing 55% of production tasks through a minimal-overhead Light path and reserving Full governance for the 15% that genuinely require it. Achieves Pareto-optimal safety-efficiency trade-offs.
- **Separation of Powers architecture** — Physically isolated roles (Worker, Critic, ToolGateway, Verifier) where no single process can simultaneously propose, approve, and execute an action. The ToolGateway is the only path through which any agent can affect the external world — bypassing it is architecturally impossible, not merely discouraged.
- **Verifier-Recovery closed loop** — Treats failure as a first-class execution state. Achieves 67% automated recovery rate on initially-failed tasks via a Recovery agent that maintains an avoidance list and generates repair paths, plus an async Retrospector for organizational learning.
- **Production evidence** — Battle-tested on a real-world multi-tenant enterprise SaaS (chain operations management), not a simulated benchmark. Results include 95% confidence intervals via bootstrap resampling over n=537 tasks.

---

## Methodology / How It Works

### The Three Core Principles

**1. Risk-Adaptive Tiering**

Tasks are classified into three tiers:

| Tier | Roles Active | Typical Use Case | Median Latency |
|------|-------------|------------------|----------------|
| **Light (L)** | Orchestrator + Worker + ToolGateway | Read-only queries, low-risk single ops | 8.4s |
| **Standard (S)** | + CriticAgent | Write operations, multi-step tasks | 26.1s |
| **Full (F)** | + Verifier + Recovery | Batch mutations, cross-domain, high-impact | 41.7s |

Tier selection uses a composite risk score:

```
R(T) = w1·op_type(T) + w2·obj_count(T) + w3·cross_domain(T) + w4·hist_fail(T)
```

- `w1=0.35` (operation type: 0=read, 0.3=single-write, 0.7=batch-write, 1.0=delete/irreversible)
- `w2=0.25` (normalized count of affected business objects)
- `w3=0.25` (cross-domain flag: 0 or 1)
- `w4=0.15` (historical failure rate over preceding 30-day window)
- Thresholds: `θL=0.25`, `θS=0.60` (calibrated via 120-task expert annotation study)

Tier escalation is **strictly monotonic** (L → S → F) and **unidirectional** — the Worker agent cannot self-certify reduced risk. Only the Orchestrator can demote a tier, only when elevated risk context is explicitly resolved.

**2. Separation of Powers**

Roles are explicitly mapped to constitutional governance analogies:
- **Worker** → proposes actions (legislative)
- **Critic** → reviews and may veto proposals (judicial); produces verdict in `{approve, revise, reject, ask_user, escalate}`
- **ToolGateway** → executes approved actions under strict constraints (executive)
- **Verifier** → validates outcomes against predetermined success criteria (audit); outputs `{passed, incomplete, failed, uncertain}` — cannot mark uncertain as passed

The Critic uses a distinct prompt temperature and system instructions from the Worker to ensure genuine independence.

**ToolGateway Six-Layer Validation Pipeline (in order):**
1. **Schema** — structural and type validation
2. **Permission** — RBAC enforcement against the initiating user's permission set
3. **Scope** — tenant, brand, and location boundary verification (prevents cross-tenant access regardless of LLM output)
4. **Risk** — dynamic risk scoring; medium/high triggers human confirmation that physically halts execution
5. **Idempotency** — duplicate detection via task-bound idempotency keys (prevents repeated mutations during recovery/retry)
6. **Execution** — actual tool invocation with structured result capture and audit logging

Tools exposed through the Gateway follow an **agent-first protocol**: semantic inputs (natural language + exact identifiers), structured outputs with confidence scores and evidence references, machine-readable error codes with candidate resolutions, and dry-run support for preview without side effects.

**3. Resilience by Design**

The system explicitly models failure as a first-class execution state. Phase state machine:

```
Planning → Criticizing → Executing → Verifying → {Recovering | Finalizing}
```

- **RecoveryAgent** maintains an avoidance list of previously-failed payloads and proposes decisions in `{retry, replan, ask_user, wait, fail}`. All modified high-risk repair proposals must re-enter Critic review.
- **RetrospectorAgent** runs asynchronously post-task, extracts success/failure patterns, generates reusable skill drafts (default to draft status requiring human approval), never blocks the user-facing path.
- **Checkpoint structure** `CP = (τ, φ, R_active, O, V, Rc, Rt)` is the authoritative state source — no ephemeral in-memory state survives restarts.

### Observability

Structured events emitted at each state transition: `runner.tier.selected`, `agent.critic.reviewed`, `agent.verifier.checked`, `runner.phase.changed`, `runner.completed`, `runner.failed`. These enable real-time dashboards, offline audit replay, and external monitoring integration.

---

## Results / Findings

### Main Results (n=537 tasks, 4-week production dataset)

| Method | SR (%) | RERR (%) | Latency (s) | Cost ($) |
|--------|--------|----------|-------------|---------|
| Single-Agent | 62.4 | 12.8 | 18.5 | 0.042 |
| Static-Full | 85.2 | 0.6 | 42.1 | 0.098 |
| No-Critic | 79.3 | 6.3 | 20.8 | 0.039 |
| No-Verifier | 81.7 | 0.9 | 23.5 | 0.044 |
| No-Recovery | 84.5 | 0.5 | 21.9 | 0.040 |
| **AgentRunner (Dynamic)** | **88.9** | **0.5** | **22.4** | **0.041** |

*SR = Task Success Rate; RERR = Risk Execution Error Rate (unreviewed high-risk operations)*

95% CI for headline SR: [86.2%, 91.4%]. RERR 95% CI: [0.1%, 1.2%]. Cost advantage over Static-Full significant at p < 0.001.

### Production Tier Distribution

| Tier | Distribution (%) | SR (%) | RERR (%) | Latency (s) |
|------|-----------------|--------|----------|-------------|
| Light | 54.7 | 92.1 | 1.2 | 8.4 |
| Standard | 30.4 | 86.5 | 0.3 | 26.1 |
| Full | 14.9 | 83.8 | 0.0 | 41.7 |
| Escalated* | 8.2 | 85.4 | 0.2 | 33.5 |

*Tasks that escalated tier during execution (subset, not additive)*

### Ablation Results

| Configuration | SR (%) | RERR (%) | RSR (%) | Cost ($) |
|--------------|--------|----------|---------|---------|
| Full AgentRunner | **88.9** | **0.5** | 67.3 | 0.041 |
| − Critic | 79.3 | 6.3 | 62.1 | 0.039 |
| − Verifier | 81.7 | 0.9 | 41.2 | 0.038 |
| − Recovery | 84.5 | 0.5 | 0.0 | 0.040 |
| Static Full (no tiering) | 85.2 | 0.6 | 65.8 | 0.098 |

*RSR = Recovery Success Rate*

### Key Ablation Takeaways

- **Critic removal**: RERR explodes 12.6× (0.5% → 6.3%). Critic catches scope violations, missing confirmations, and unsafe batch operations Workers systematically overlook.
- **Verifier removal**: 15.1% of tasks Workers mark "complete" are actually incomplete. SR drops 7.2 points.
- **Recovery removal**: 67.3% of initially-failed tasks can be automatically repaired — that value is entirely lost.
- **Tiering removal (Static Full)**: Cost increases 139% while SR actually decreases 3.7% — over-governance harms both efficiency *and* effectiveness (excessive overhead triggers timeout failures and unnecessary user interruptions).

### Limitations

1. Tier classification depends on LLM judgment — approximately 3.4% of tasks receive initially incorrect tiers (mitigated by mid-execution escalation).
2. Critic exhibits 5–8% false positive rate, adding latency without safety benefit in those cases (mitigated: effective user-facing false positive rate reduced to under 2% via confidence threshold, one-click override for trusted users, and Orchestrator auto-resolution that resolves ~70% of false positives automatically).
3. Standard/Full tiers introduce 2–3 additional LLM calls, setting a floor on minimum latency for governed operations.
4. Approximately 3% of Standard-tier tasks are pure read queries over-escalated from Light due to false-positive cross-domain indicators (+4.2s median latency penalty, negligible user satisfaction impact).

---

## Implications for AI Agent Systems (DevDen relevance)

### 1. Governance as Architecture, Not Prompting

The central insight is architectural: **governance guarantees must live at the system layer, not the prompt layer**. Soft constraints ("you are a careful reviewer...") are not governance — they degrade under hallucination, model substitution, or adversarial input. DevDen's supervisor and mission system should enforce critical boundaries (tenant isolation, destructive operations, cross-mission state mutations) at the execution boundary level, not through prompt instructions alone.

### 2. Risk-Adaptive Routing Directly Applicable to DevDen Missions

DevDen missions have wildly different risk profiles: a read-only code search is not the same as a `git push --force` or database migration. A tiering mechanism where the Orchestrator (supervisor) classifies missions by risk and routes them through proportionally different review paths would directly reduce both cost and governance failures. The R(T) formula with operation type, object count, cross-domain, and historical failure rate is a practical template for a DevDen mission risk scorer.

### 3. Separation of Powers for Multi-Agent Pipelines

The Worker/Critic/ToolGateway/Verifier separation is directly applicable to DevDen's multi-agent chain. Currently, agents that propose an action also execute it. Introducing a physically separate Critic (a second LLM call with independent prompt and higher conservatism) before any write operation — code commits, deployments, DB writes — would catch the class of errors the ablation shows Critic prevents. Latency cost is acceptable given the 12.6× RERR reduction.

### 4. Checkpoint Durability for Long-Running Missions

The checkpoint structure `CP = (τ, φ, R_active, O, V, Rc, Rt)` with no ephemeral in-memory state surviving restarts is the correct model for DevDen missions that may run for minutes to hours. If a mission runner crashes mid-execution, reconstruction from checkpoint is safer than restart-from-scratch. This maps to persisting mission phase state and agent opinions to durable storage (DB/file), not just in-memory.

### 5. Retrospector Pattern for Organizational Learning

The async Retrospector that extracts success/failure patterns and generates skill drafts (requiring human approval before activation) is a concrete design for DevDen's skill discovery loop. Every completed or failed mission is a training signal. The pattern — asynchronous, never blocking user path, human-gated skill promotion — avoids the danger of automated self-modification while still capturing value.

### 6. Dual-Entry Architecture

The paper's "dual-entry" pattern (conventional UI-driven CRUD for deterministic ops + Agent workspace for natural language complex tasks, both sharing permissions and audit) is a practical template for DevDen's Studio UI + agent layer coexistence. Not every operation needs AI mediation; the framework is additive.

### 7. Model-Agnostic Governance

Because governance lives at the system layer, the framework is stable across LLM model changes. DevDen's dependence on specific Claude model capabilities for safety properties is fragile — the ToolGateway approach of enforcing constraints structurally (RBAC, scope checks, idempotency keys) at the API gateway level is more robust than relying on the model's alignment.

### 8. Multi-Runner Coordination (Future Relevance)

The preliminary design for concurrent Runner coordination (optimistic locking with version vectors, scope-aware scheduling, cross-tenant federated learning via anonymized hashes) is directly relevant as DevDen scales to concurrent missions. The idempotency conflict → wait-retry queue pattern prevents the "two agents clobber the same file" class of bugs.

---

## Quotes and Specific Numbers Worth Preserving

> "Enterprise AI does not suffer from a lack of autonomy, but from a lack of governability."

> "The constraint lives in the prompt, not in the execution boundary."

> "Governance is not the antithesis of autonomy — it is its prerequisite."

> "Bypassing [the ToolGateway] is architecturally impossible, not merely discouraged."

> "The 'Pending Approval' state is not a simulated prompt output but a hard-wired system constraint that physically halts execution. This transforms AI governance from a 'prompt engineering suggestion' into a 'system architecture guarantee.'"

**Key numbers:**
- 88.9% task success rate (95% CI: [86.2%, 91.4%])
- 0.5% RERR — unreviewed high-risk operations (95% CI: [0.1%, 1.2%])
- 67.3% automated recovery rate on initially-failed tasks (95% CI: [52.4%, 79.8%] over 48 tasks)
- 46.8% latency reduction vs. always-full pipeline
- 58.2% inference cost reduction vs. always-full pipeline ($0.041 vs $0.098)
- 54.7% of production tasks execute via Light (8.4s median latency)
- Only 14.9% require Full governance
- Single-agent baseline: 12.8% RERR — "roughly 1 in 8 high-risk operations proceeds without review"
- Critic removal: RERR 12.6× worse (0.5% → 6.3%)
- Static Full without tiering: 139% cost increase *and* 3.7% SR decrease
- Critic false positive rate: 5–8% raw, reduced to <2% effective with mitigations
- 70% of Critic false positives auto-resolved by Orchestrator arbitration
- Tier misclassification rate: 3.4% (projected reducible to <1.5% with learned classifier)
- Risk score weights: w1=0.35 (op type), w2=0.25 (obj count), w3=0.25 (cross-domain), w4=0.15 (hist failure)
- Thresholds: θL=0.25 (Light cutoff), θS=0.60 (Standard cutoff)
- Calibrated on n=120 expert-labeled tasks; held fixed across tenants
- 537 total evaluation tasks; 4-week collection window; models: MiniMax-M2.7, Kimi-K2.6
- Over-escalation edge case: ~3% of Standard tasks are read-only (false-positive cross-domain), median +4.2s penalty

---

## Dataset Composition

537 real enterprise operational tasks from production over 4 weeks:
- Information queries: 40.2% (n=216)
- Single-object writes: 29.8% (n=160)
- Multi-object/batch operations: 19.7% (n=106)
- Cross-domain complex: 10.2% (n=55)

---

## Related Work Positioned Against

- **AutoGPT, BabyAGI** — zero governance, fully autonomous
- **AutoGen, CrewAI, LangGraph, MetaGPT, ChatDev** — soft constraints, excellent orchestration, but "agents are well-behaved by construction" assumption
- **Temporal, Prefect, Airflow** — hard execution guarantees but cannot accommodate non-deterministic LLM reasoning
- **Constitutional AI, ToolEmu, R-Judge** — safety at individual call level, not system-level governance
- **Reflexion, LATS** — self-reflection but within single-agent loops, no separation of powers
