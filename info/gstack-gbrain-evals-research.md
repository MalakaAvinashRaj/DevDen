# GStack + gbrain-evals — Research Report
*Researched 2026-05-12. Sources: github.com/garrytan/gstack, github.com/garrytan/gbrain-evals*

---

## GStack — What It Is

GStack is a collection of 30+ slash-command skills (Markdown methodology files) that turn a Claude Code or Hermes session into a virtual engineering team. Not a platform — installs into `~/.claude/skills/gstack/` as a git clone.

**Sprint pipeline:** Think → Plan → Build → Review → Test → Ship → Reflect

Garry Tan reports ~810× his 2013 code output rate using this stack with 10-15 parallel sessions.

### Setup
```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup

# For Hermes:
./setup --host hermes    # installs to ~/.hermes/skills/gstack-*/
```

---

## GStack Key Components

| Component | What it does |
|---|---|
| Slash-command skills | `/review`, `/cso` (security), `/ship`, `/investigate`, `/qa`, `/design-shotgun` |
| Browse daemon | Long-lived Chromium via CDP, 100-200ms after cold start |
| `gstack-model-benchmark` | CLI: Claude vs GPT vs Gemini — latency/tokens/cost/LLM-judge quality |
| Continuous checkpoint mode | WIP commits with `[gstack-context]` body: decisions, remaining work, failed attempts |
| `/pair-agent` | Two agents (Claude + Hermes) share the same browser session |
| GBrain integration | `/setup-gbrain` registers GBrain as MCP: `gbrain search`, `gbrain put_page` as tool calls |

---

## Hermes Integration

GStack explicitly supports Hermes. Skills install to `~/.hermes/skills/gstack-*/`. The host config system defines installation paths and frontmatter transformations per host.

**For DevDen's `hermes -p <profile> chat -q <prompt> --yolo` pattern:** GStack skills are pre-loaded methodology files in `~/.hermes/skills/`, read at session start.

---

## GStack Relevance to DevDen

**High relevance:**
1. **Sprint pipeline** maps exactly onto DevDen's agent roles — GStack proves filesystem-based coordination works at production scale
2. **`gstack-model-benchmark`** — cross-model benchmarking CLI, directly usable by DevDen's Eval agent
3. **Continuous checkpoint** pattern — WIP commits with `[gstack-context]` bodies should be adopted for DevDen handoff files
4. **`/careful` + `/freeze` guardrails** — destructive-command warning pattern to port to DevDen's supervisor
5. **`/pair-agent`** — Hermes + Claude Code can share a browser session for QA testing

**Lower relevance:**
- Browser daemon: relevant only when DevDen's QA agent needs browser automation
- Design pipeline: relevant only for UI/UX agent

---

## gbrain-evals — What It Is

A public benchmarking harness for personal-knowledge retrieval. Two benchmark families:

**BrainBench (in-house):**
- `world-v1` (2.0MB): 80 people, 80 companies, 50 meetings, 30 concepts
- `amara-life-v1` (2.1MB): one week of life — emails, Slack, calendar, meetings, notes. **10 planted contradictions, 5 stale facts, 5 poison items, 3 implicit preferences**

**LongMemEval (public):** 500 questions, 6 question types, ~50 distractor sessions per haystack.

---

## gbrain-evals Methodology

### Adapter Interface
Every retrieval implementation must expose:
- `init(pages, config) → BrainState`
- `query(q, state) → RankedDoc[]`

Four reference adapters: `grep-only` (BM25), `vector` (cosine similarity), `vector-grep-rrf-fusion` (Reciprocal Rank Fusion), `claude-sonnet` (query expansion — gave 0pp lift, published anyway).

### LLM-as-Judge (`judge.ts`)
- Claude Haiku 4.5 judges semantic categories
- Rubric: 0-5 per criterion, weighted mean
- Verdict thresholds: Pass ≥ 3.5, Partial 2.5-3.5, Fail < 2.5
- XML structured evidence: `<probe>`, `<final_answer>`, `<evidence_refs>`, `<rubric>`
- One sentence per criterion enforced to prevent verbose evasion

### Anti-Gaming
- Sealed qrels: `_facts` gold metadata stripped before adapter sees data
- N=3/5/10 tolerance bands for non-deterministic adapters
- Judge-version pinning
- Randomized query order per seeded run
- SHA-256 content hashing for cache invalidation

### Cost
- First run: ~$2 OpenAI embeddings
- Subsequent runs: ~$0 from SQLite embedding cache (WAL mode)
- `llm-budget.ts`: shared Anthropic semaphore prevents runaway spend

---

## 8 Patterns DevDen's Eval Agent Should Adopt

| Pattern | How to apply in DevDen |
|---|---|
| **Sealed qrels** | Add `gold/` dir to missions with expected outputs — Eval reads it only after mission completes |
| **LLM-as-judge with XML contract** | Eval invokes Haiku with `<mission_brief>`, `<handoff_files>`, `<rubric>` — Pass ≥ 3.5 |
| **Category decomposition** | Cat A (handoff correctness), Cat B (code compiles), Cat C (no regressions), Cat D (on-time), Cat E (cost) |
| **Adapter interface** | `init(mission, config)` + `run(agent, state)` — enables A/B testing Sonnet vs Opus per role |
| **Tolerance bands** | LLM is non-deterministic — 9/10 pass rate at same config is not flaky |
| **NDJSON flight recorder** | One line per agent step — resume after crash, trend analysis |
| **Budget semaphore** | CPE enforces per-mission token budget — overrun = mission failure condition |
| **Adversarial category** | Missions with intentionally bad requirements — tests whether Architect's handoff protects downstream |

---

## Overall Verdict

**Adopt directly:** Run `./setup --host hermes`. Use `gstack-model-benchmark` in Eval. Steal LLM-as-judge pattern from gbrain-evals.

**Learn from and adapt:** Continuous-checkpoint handoff structure. Adapter interface for A/B testing agent configs. Fictional corpus with planted perturbations for regression testing.

**Ignore:** GBrain database (add after 20+ missions). Browser daemon (add when QA needs it). OpenClaw/ClawHub (DevDen has its own supervisor).
