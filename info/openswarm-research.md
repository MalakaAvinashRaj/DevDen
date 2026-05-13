# OpenSwarm — Research Report
*Researched 2026-05-12. Source: github.com/openswarm-ai/openswarm. License: MIT.*

---

## What It Is

OpenSwarm is an Electron desktop app — a visual session manager for running multiple Claude Code instances side by side on a spatial canvas. "Mission Control for a swarm of AI agents."

**Mental model:** agent session manager with a spatial canvas UI. User opens a dashboard, drags agent cards around a 2D canvas. Each card is a live Claude session. No pipeline, no mission concept, no handoff protocol. Agents are independent, manually coordinated by the user.

**Not** an orchestration framework. No agent-to-agent delegation logic. That is left to Claude itself via tool calls.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Redux Toolkit + Material UI v7 |
| Canvas | Custom CSS absolute-position grid — NOT React Flow. No edges, no connections. |
| Backend | Python FastAPI + `claude-agent-sdk==0.1.70` |
| Real-time | WebSockets only (no SSE). 300 cps interpolated streaming renderer |
| Database | None — disk serialization |
| Delivery | Electron 33 (desktop app, not web app) |
| Auth | Install-scoped bearer token |

---

## What It Has

- Spatial agent dashboard: cards for sessions, browser tabs, output views, sticky notes
- Real-time streaming: token-by-token with interpolated rendering (300 cps, 150ms hold, 200ms headroom)
- Human-in-the-loop approval: per-tool approve/deny with batch-approve, 600s timeout
- Conversation branching: fork at any prior message
- Cost tracking: real-time USD per session
- Modes: pre-baked agent configs (system prompt + tool set)
- Skills registry: fetches from `anthropics/skills` on GitHub
- DynamicIsland: floating approval queue pill (morphs between idle → single approval → batch queue)

---

## What It Does NOT Have

- A mission concept (no named work items with status)
- Agent-to-agent handoff or typed roles (Architect, SE, QA)
- A pipeline or DAG view
- Any work queue

---

## Mental Model Match with DevDen

| DevDen Concept | OpenSwarm Equivalent | Match? |
|---|---|---|
| Mission (MISSION-NNN) | Nothing — no mission entity | ❌ |
| Agent roles (CPE, Architect, SE, QA) | Generic Claude sessions, no role taxonomy | ❌ |
| Handoff files | Not aware of filesystem at all | ❌ |
| CPE orchestrator | No equivalent — user coordinates manually | ❌ |
| Canvas with directed edges | Free-form card pile, no edges | ❌ |
| Token streaming in UI | WebSocketManager.ts — production quality | ✅ |
| Agent approval queue | DynamicIsland.tsx — polished | ✅ |
| Agent role configs | Modes system (system_prompt + tools per mode) | ✅ |
| Next.js web app | Electron desktop — incompatible shell | ❌ |
| Hermes CLI agents | Impossible — hardwired to Python SDK in-process | ❌ |

---

## The 5 Components Worth Stealing (MIT License)

### 1. `WebSocketManager.ts`
Interpolated 300 cps streaming renderer with headroom buffer, flush-on-end. Best-in-class token streaming UX. Copy into DevDen's studio, adapt Redux dispatch to DevDen's store shape.

### 2. `agentsSlice.ts` Redux architecture
- `streamStart` / `streamDelta` / `streamEnd` lifecycle
- Optimistic messages
- `client_message_id` deduplication
- Streaming lifecycle state management

Saves weeks on activity feed implementation.

### 3. `DynamicIsland.tsx`
Floating pill (z-index 9999, top-center) morphing between:
- Idle: search bar
- Active: agent count
- Single approval: one approve/deny action
- Batch: approval queue

Strip Electron-specific routing calls. Wire to DevDen's mission/agent model.

### 4. Modes model pattern (`backend/apps/modes/models.py`)
Each Mode has: `system_prompt` + `tools` list. Maps directly to DevDen's agent roles — each role (CPE, Architect, SE, QA, Eval, UI/UX) becomes a Mode with its curated config.

### 5. `RichPromptEditor.tsx`
CodeMirror 6 prompt editor with slash-command picker (`CommandPicker.tsx`). Better than `<textarea>` for DevDen's mission brief form.

---

## Verdict

**Don't adopt OpenSwarm wholesale. Cherry-pick 5 components.**

Adopting wholesale means: ripping out Electron, fighting a canvas with no edges, rebuilding the entire mission/handoff/role model from scratch on top of it, replacing the Python backend with Node.js. More work than building v1 yourself.

DevDen's React Flow canvas with directed agent nodes is actually **better** than OpenSwarm's free-form card pile for a factory mental model.

**Use in v1:**
- `WebSocketManager.ts` → streaming activity feed
- `agentsSlice.ts` → Redux architecture for agent state
- `DynamicIsland.tsx` → approval/notification widget
- Modes pattern → agent role configuration
- `RichPromptEditor.tsx` → mission brief form
