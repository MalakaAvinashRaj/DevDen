# DevDen Agent Team — Routing Reference
Last updated: 2026-05-07

## Agent Directory

### UI/UX Engineer — Design Layer
**Role:** Design system owner. Produces the mission design system before any code is written.
**Engage when:** Mission has been scoped and approved · feature has a UI component · visual regression suspected
**Do not engage when:** Pure backend/API work with no user-facing interface
**Input format:** Mission brief + PRODUCT_SENSE.md for this mission
**Output format:** `missions/active/MISSION-NNN/DESIGN_SYSTEM.md` — complete, unambiguous visual spec
**Note:** SE does not start until CPE has approved the design system from UI/UX

### Software Engineer — Instruction Layer
**Role:** Implementation specialist. Writes all code. Fixes all bugs.
**Engage when:** Feature task ready for development · bug fix assigned · implementation question needs resolution
**Do not engage when:** Spec not yet approved · Architect flagged an architectural concern · bug not yet triaged by CPE
**Input format:** Task description + acceptance criteria + priority (P0–P3) + relevant ExecPlan path or context
**Output format:** "Feature/fix [name] ready for QA — [summary of what changed]"
**Typical latency:** S tasks same session · M/L tasks multi-session · XL tasks require ExecPlan first

### QA Engineer — Feedback Layer
**Role:** Quality gate. No code ships without QA sign-off.
**Engage when:** SE signals work complete · hotfix needs verification · regression test requested
**Do not engage when:** Work is partial or incomplete · asking QA to approve "good enough"
**Input format:** "Feature/fix [name] ready for QA — [brief description of what changed]"
**Output format:** Either "QA APPROVED — [name] clear for release" or bug reports in BUG_TEMPLATE.md format
**Note:** QA communicates bug reports to CPE only — never directly to SE

### Architect — Constraint Layer
**Role:** System planner. Owns ARCHITECTURE.md and all ExecPlans. Monitors timeline.
**Engage when:** New feature has architectural impact · timeline check-in is due · tech debt review needed · ambiguous technical tradeoff requires a decision
**Do not engage when:** Pure implementation with no architectural decision · simple bug fix within established patterns
**Input format:** Feature description + constraints + timeline context
**Output format:** Architecture guidance · deviation reports with options · updated ExecPlans
**Note:** Architect always delivers options + recommendation, never just problems

### Eval — Memory Layer
**Role:** Agent performance monitor. Analyzes traces, scores agents, sends efficiency reports.
**Engage when:** End of sprint or milestone · agent behavior shows signs of degradation · baseline performance check requested
**Do not engage when:** Mid-task execution (don't interrupt) · when expecting Eval to make changes directly — they recommend, CPE decides
**Input format:** "Run eval cycle — [agent(s) or time window to focus on]"
**Output format:** Structured efficiency report with per-agent scores + CLAUDE.md update recommendations
**Note:** Eval never edits agent files — CPE does that based on Eval's recommendations

---

## Escalation Thresholds

| Condition                                        | CPE Action                                                     |
|--------------------------------------------------|----------------------------------------------------------------|
| P0 bug found                                     | Halt non-critical work immediately · route to SE same session  |
| Same bug returned by QA 3+ times                 | Review SE's approach before re-routing · may need Architect    |
| Eval scores any agent ≤ 2 on any dimension       | Update that agent's CLAUDE.md before next task assignment      |
| Architect flags timeline as BROKEN               | Pause new feature work · resolve plan deviation first          |
| QA finds regression in previously-cleared code   | Treat as new P1 · full re-test cycle required                  |
| Agent silent on task receipt for > 1 session     | Re-route task with explicit acknowledgement requirement        |
| Eval flags a doom loop (5+ repeated actions)     | Immediately interrupt · reassign or restructure the task       |

---

## Eval Loop — Detailed Protocol

Every Eval finding is either an **instance** (this agent, this mission) or a **pattern** (any agent, any mission). CPE handles each differently.

```
Eval sends efficiency report to CPE
    ↓
CPE reads report — for each finding, ask:
    - Is the finding grounded in observed behavior? (not fabricated)
    - Is the recommendation specific? (file + section, not vague)
    - Is this classified correctly — instance, pattern, or both?
    ↓
For INSTANCE findings (one agent, one mission):
    A. Patch the agent's AGENTS.md at the specific section Eval identified
    B. Log in docs/decisions/: what changed, why, which Eval report triggered it
    C. Notify Eval: "Patched [Agent] AGENTS.md §[section] — [change]. Monitor next cycle."

For PATTERN findings (structural — will recur in any harness):
    A. Edit the canonical skill file:
       ~/.agents/skills/agent-development/agent-development/SKILL.md
       (Hermes and Claude Code both symlink here — one edit, everywhere updated)
    B. Log in docs/decisions/: what changed in the skill, what pattern it encodes
    C. Notify Eval: "Updated agent-development skill §[section] — [change]. Permanent."

For NO ACTION:
    Notify Eval: "Acknowledged. No change — [reason]"
    ↓
Eval monitors next eval cycle for measurable improvement
Eval records outcome in docs/agent-scores/[agent].md
```

**The rule:** Instance findings fix this system. Pattern findings fix all future systems.
Both can apply to the same finding — patch AGENTS.md AND update the skill.

## Architect Loop — Detailed Protocol
```
Architect sends deviation report to CPE
    ↓
CPE reads report:
    - What deviated? How significant?
    - What options did Architect provide?
    - What are the downstream effects of each option?
    ↓
CPE decides one of:
    A. Approve scope change → update PLANS.md · notify all affected agents via CPE
    B. Adjust timeline → update PLANS.md · confirm with Architect
    C. Reallocate resources → reassign tasks · update PLANS.md
    D. Override deviation → tell Architect to restore original plan · explain why
    ↓
Architect updates PLANS.md and relevant ExecPlans to reflect decision
```

---

## Handoff Protocol

Every routing decision between agents is a **handoff**. Handoffs are explicit — never implicit.

### How a handoff works

1. **CPE writes a HANDOFF.md** in the mission folder using `missions/templates/HANDOFF-TEMPLATE.md`  
   Save it as: `missions/active/MISSION-NNN/handoffs/YYYYMMDD-from-to-task.md`

2. **The receiving agent opens their folder in a new Claude Code session**  
   First action in every session: read the latest handoff file + `PROGRESS.md`

3. **The receiving agent acknowledges** — one line in PROGRESS.md: `[date] [Agent] received handoff: [task name]`

4. **On completion**, the agent writes their output to the appropriate file and signals back to CPE via PROGRESS.md: `[date] [Agent] complete: [task name] — [one-line summary]`

5. **CPE reads PROGRESS.md** to confirm completion, then routes the next handoff.

### Handoff file location

```
missions/active/MISSION-NNN/
└── handoffs/
    ├── 20260507-CPE-Architect-system-design.md
    ├── 20260507-Architect-CPE-design-approved.md
    ├── 20260508-CPE-SE-feature-auth.md
    └── 20260508-CPE-QA-auth-feature-ready.md
```

### What a handoff must contain (non-negotiable)

- Who it's from and to
- What task needs to be done and what "done" looks like
- The mission folder path and specific files to read
- The priority level (P0–P3)

Template: `missions/templates/HANDOFF-TEMPLATE.md`

---

## Communication Rules
- All inter-agent communication routes through CPE. Zero exceptions.
- Every handoff is a written file — never verbal, never implied.
- Every agent must acknowledge receipt (PROGRESS.md entry) before work begins.
- Every routing decision involving scope or priority change → log in CPE `docs/decisions/`.
- If two agents need context from each other, CPE facilitates and relays — agents never communicate directly.
