# GBrain + Minions — Research Report
*Researched 2026-05-12. Source: github.com/garrytan/gbrain*

---

## What GBrain Is

GBrain is a persistent knowledge layer for AI agents — Postgres + pgvector + a self-wiring knowledge graph. Agents write to it (meetings, notes, ideas), it auto-extracts typed relationships (`works_at`, `invested_in`, `founded`) with zero LLM calls, and agents query it via hybrid search (vector + keyword + graph).

Garry Tan runs it personally: 17,888 pages, 723 companies, 21 autonomous cron jobs.

---

## Minions: Postgres-Native Durable Job Queue

| Metric | Minions | Session Spawn |
|---|---|---|
| Wall time | 753ms | >10,000ms (timeout) |
| Token cost | $0.00 | ~$0.03/run |
| Success rate | 100% | ~40% |

### How Durability Works
1. **Postgres as state store** — job rows persist independently of any process. Gateway restart doesn't touch the database.
2. **`FOR UPDATE SKIP LOCKED`** — concurrent-safe job claiming, same pattern as BullMQ (Redis) and Que (Postgres).
3. **Three-layer zombie defense** — in-process SIGCHLD handler, `tini` as PID-1, container-level `tini`. `handleWallClockTimeouts` as kill-shot for wedged jobs.

### Steerability
- Dual abort signals: one for graceful shutdown, one for immediate cancellation
- Parent-child job hierarchies with cascade-kill support
- Idempotency keys: submit same job with same key → deduplication (resume after partial completion)

### Observability
- Audit JSONL at `~/.gbrain/audit/subagent-jobs-YYYY-Www.jsonl` (ISO-week rotation)
- Heartbeat events emitted at every turn boundary during subagent execution
- Best-effort writes (non-blocking, disk failure doesn't kill job execution)

### Concurrent Safety
- `FOR UPDATE SKIP LOCKED` at DB level — no application mutex needed
- `pg_advisory_xact_lock` guards rate lease check-then-insert
- `GBRAIN_ANTHROPIC_MAX_INFLIGHT` controls max concurrent LLM calls

---

## Search Quality

- P@5: 44.7%, R@5: 94.6% on 240-page benchmark corpus
- Graph-only F1: 86.6% vs ripgrep baseline 57.8%
- Hybrid vs graph-disabled: +31.4pp precision@5
- LongMemEval: 25.9ms p50 per question on Apple Silicon

---

## How Agents Connect to GBrain

1. **MCP Server** — `gbrain serve --http --port 3131`, Claude Code connects via stdio or HTTP
2. **CLI Direct** — `gbrain query`, `gbrain search`, `gbrain import`, `gbrain jobs submit`
3. **Subagent Tool Bridge** — 13-operation tool registry derived from `src/core/operations.ts`

---

## Fit for DevDen

### Minions for DevDen's Job Durability Problem
**Solves it, but requires adding Postgres (or PGLite).**

Integration steps:
1. Install PGLite (embedded, 2-second startup, no server)
2. Replace agent spawn call with `gbrain jobs submit subagent`
3. Run Minions worker process alongside Next.js
4. Keep handoff files for human readability; job rows for durability

**Verdict:** The 60s scan workaround covers the problem well enough for now. Gate this on whether hot-reload losses become frequent operational pain.

### GBrain Knowledge Graph for DevDen
Useful after 20+ completed missions. At that point, agents can query across missions:
- "What stack did we use in MISSION-004?"
- "Which missions involved payments?"

Before that, the sync overhead exceeds the retrieval benefit.

---

## Where GBrain + Minions Is Most Useful

| Use Case | Why |
|---|---|
| Long-lived personal AI agents (founder, exec, researcher) | Knowledge compounds over months |
| Research synthesis pipelines | Zero-LLM-cost entity extraction |
| High-volume enterprise agent ops | 40% session spawn failure unacceptable at scale |
| Multi-device team agents | Supabase backend + MCP = shared memory |
| Deterministic background tasks (webhooks, scripts) | 753ms, $0.00, no LLM |
| Hermes-based deployments | GBrain is explicitly designed for the Hermes ecosystem |
