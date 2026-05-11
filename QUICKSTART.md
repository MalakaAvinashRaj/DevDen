# DevDen — Quick Start (5 Minutes)

You're about to see a SaaS factory in action.

---

## 1. Start the Studio (Control Plane)

```bash
cd DevDen
./run.sh studio
```

Open `http://localhost:3001` in your browser.

**What you'll see:**
- 6 agent nodes on a spatial canvas (draggable, color-coded by harness layer)
- Status badges for each agent (all idle right now)
- Zoom controls, pan support, dot-grid background
- "0 working · 0 queued" status bar at top-right
- `wake ↑` button on each agent

**This is the control plane.** Everything flows through here. Tasks, missions, agent status updates — all visible in real time.

---

## 2. Create a Test Mission

In a new terminal:

```bash
cp missions/templates/CLIENT-BRIEF.md missions/intake/CLIENT-BRIEF-001-link-vault.md
```

Open `CLIENT-BRIEF-001-link-vault.md` and fill it in. Example:

```markdown
# CLIENT-BRIEF-001: Link Vault

## The Problem
I save a lot of interesting links but lose them in my bookmarks. I need a personal link vault.

## The Product Idea
- List view of all saved links
- Add/edit page with URL, title, tags, notes
- Archive old links, search by tag
- Import/export

## What "Done" Looks Like
- [ ] Can save, view, edit, delete links
- [ ] Can tag links, search by tag
- [ ] Can archive links
- [ ] Mobile-responsive
- [ ] Deployed and live

## Technical Context
- Next.js + Tailwind + Prisma
- Vercel hosting
- PostgreSQL database
- No auth needed for v1
```

Save it.

---

## 3. CPE Processes the Brief

In the same terminal:

```bash
cd .agents/cpe
hermes
```

You're now in the CPE agent. Tell it:

```
I have a new brief in missions/intake/CLIENT-BRIEF-001-link-vault.md
Run through INTAKE-RUNBOOK.md and create the mission. Ready to go.
```

**What CPE does (mechanical, no improvisation):**
1. ✅ Determines mission number (MISSION-001, since this is the first)
2. ✅ Creates folder structure: `missions/active/MISSION-001-link-vault/`
3. ✅ Fills MISSION.md (brief → spec)
4. ✅ Fills PROGRESS.md (initial status)
5. ✅ Fills TASK-REGISTRY.md (empty Kanban board)
6. ✅ Creates agent MEMORY.md files
7. ✅ Writes handoff to Architect
8. ✅ Updates HEARTBEAT.md
9. ✅ Marks brief as PROCESSED-

**When CPE signals complete:**
It says: *"Mission intake complete. MISSION-001-link-vault is ready. Architect is assigned."*

---

## 4. Watch the Canvas Update

Go back to your browser at `http://localhost:3001`.

Refresh. Nothing changed yet because the task board is still empty.

Now in CPE, click on Architect's card and hit `wake ↑`.

**What happens:**
- Architect's status changes to `assigned`
- The canvas polls and updates
- Architect gets a message via Hermes (if it's running)

---

## 5. Architect Designs the System

In a third terminal:

```bash
cd .agents/architect
hermes
```

You're now the Architect. Tell it:

```
I have an assignment: missions/active/MISSION-001-link-vault/
Read the handoff, design the system, produce ARCHITECTURE.md and PLANS.md.
```

**What Architect does:**
1. ✅ Reads the handoff file
2. ✅ Reads MISSION.md (spec)
3. ✅ Designs system architecture (Next.js + Prisma + PostgreSQL)
4. ✅ Writes ARCHITECTURE.md (system overview, tech choices, constraints)
5. ✅ Writes PLANS.md (milestones, timeline, risks)
6. ✅ Writes first ExecPlan for SE
7. ✅ Updates MEMORY.md
8. ✅ Signals CPE: *"Architecture complete. ARCHITECTURE.md and PLANS.md ready for review."*

---

## 6. CPE Approves & Routes to SE

Back in CPE terminal:

```
Review the deliverables:
- missions/active/MISSION-001-link-vault/.agents/architect/ARCHITECTURE.md
- missions/active/MISSION-001-link-vault/.agents/architect/PLANS.md

Approve them and route to Software Engineer for build.
```

CPE will:
1. ✅ Check ARCHITECTURE.md (system design valid? tech stack reasonable?)
2. ✅ Check PLANS.md (timeline realistic? risks identified?)
3. ✅ Approve or request changes
4. ✅ When approved: create first task in TASK-REGISTRY.md
5. ✅ Wake Software Engineer with the task

---

## 7. Watch the Kanban Board Live

Go back to the canvas. Refresh.

When CPE creates a task in TASK-REGISTRY.md:
- Task appears in SQLite DB automatically (via API sync)
- SE's agent card shows the task
- Status bar updates: "1 queued"

When SE picks up the task:
- SE's status changes to `in-progress`
- Task status changes to `in-progress`
- Canvas shows it live

---

## 8. The Full Loop

This is the pattern that repeats for every feature:

```
CPE creates task
  → SE implements (reads ExecPlan, writes code)
  → SE signals complete (moves task to review)
  → CPE routes to QA
  → QA tests
  → QA finds bugs? → CPE routes back to SE
  → QA approves? → CPE marks task done
  → Move on to next task
```

**The QA loop never breaks early. Not for deadlines.**

---

## 9. Ship the Product

Once all tasks are done and QA approves:

```
In CPE:
"Mark MISSION-001 as shipped. Move it to missions/completed/. Generate release notes."
```

CPE will:
1. ✅ Verify all tasks done
2. ✅ Verify QA sign-off on latest
3. ✅ Move `missions/active/MISSION-001-link-vault/` → `missions/completed/`
4. ✅ Tag release
5. ✅ Ready to deploy

---

## What You Just Built

You've bootstrapped a complete SaaS factory:

- ✅ **Six agents** (CPE, Architect, SE, UI/UX, QA, Eval) in `.agents/`
- ✅ **Stateless across missions** — each mission is self-contained in `missions/active/MISSION-NNN/`
- ✅ **Studio control plane** — spatial canvas, live task updates, agent wake buttons
- ✅ **Non-negotiable QA loop** — no code ships without sign-off
- ✅ **Mechanical intake** — CPE follows INTAKE-RUNBOOK.md (no improvisation)
- ✅ **Task sync** — TASK-REGISTRY.md auto-syncs to canvas

---

## Next Steps

### Create Your Own Mission
1. Write a CLIENT-BRIEF.md (fill `missions/templates/CLIENT-BRIEF.md`)
2. Drop it in `missions/intake/`
3. Run CPE, follow INTAKE-RUNBOOK.md
4. Watch it flow through the factory

### Run All Agents Locally
```bash
./run.sh all
# Studio launches in background
# CPE launches in foreground
# You can switch between agents via hermes profile [agent-name]
```

### Monitor Performance
After a few missions:
```bash
cd .agents/eval
hermes
# Review agent performance across missions
# Get recommendations for improvements
```

---

## Key Principle

**The factory is mechanical. No improvisation.**

Every step CPE takes follows INTAKE-RUNBOOK.md exactly.  
Every agent knows their protocol from AGENTS.md.  
Every mission has the same folder structure.  
Every handoff is documented.  
Every task flows through the QA loop.

This is what makes it repeatable. This is what makes it scale.

---

## Resources

- **README.md** — Full factory guide
- **.agents/cpe/INTAKE-RUNBOOK.md** — CPE's mechanical checklist (8 steps, no improvisation)
- **.agents/cpe/AGENTS.md** — How CPE works, routing protocols
- **missions/active/MISSION-001-link-vault/MISSION.md** — Your first mission spec
- **studio/ — REST API reference in README.md**

Ship something. 🚀
