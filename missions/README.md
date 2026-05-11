# Missions
DevDen · Every project is a mission. Every mission ships a SaaS.

---

## What Is a Mission?

A mission is a project DevDen takes on. It has a brief, a goal, a timeline, and
a definition of done. The output is always a shipped SaaS product.

The agents are the factory. Missions are the work orders.
The same five agents run every mission — CPE orchestrates, Architect plans,
SE builds, QA gates, Eval improves.

---

## Mission Lifecycle

```
INTAKE       CPE receives the project brief
    ↓
DESIGN       Architect produces ARCHITECTURE.md + PLANS.md for this mission
    ↓        CPE approves before any code is written
BUILD        SE implements from ExecPlans
    ↓        QA loop runs on every completed piece of work
SHIP         CPE approves release after QA signs off
    ↓
EVAL         Eval reviews agent performance for this mission
    ↓
COMPLETE     Mission folder moved to missions/completed/
```

---

## Folder Structure

```
missions/
├── active/
│   └── MISSION-NNN-project-name/   ← one folder per active mission
│       ├── MISSION.md              ← brief, goal, client, timeline, success criteria
│       ├── ARCHITECTURE.md         ← system design for this specific product
│       ├── PLANS.md                ← milestone plan for this mission
│       ├── PRODUCT_SENSE.md        ← user priorities specific to this product
│       ├── exec-plans/
│       │   ├── active/             ← plans currently being executed
│       │   └── completed/          ← finished plans (retained for reference)
│       ├── product-specs/
│       │   └── index.md            ← specs for features in this mission
│       ├── qa/
│       │   ├── bug-log/active/     ← open bugs for this mission
│       │   ├── bug-log/resolved/   ← resolved bugs
│       │   └── test-plans/         ← test plans for this mission
│       └── PROGRESS.md             ← live status updated by CPE each session
├── completed/
│   └── MISSION-NNN-project-name/   ← same structure, archived after ship
└── templates/
    └── MISSION-TEMPLATE.md         ← copy this to start a new mission
```

---

## Active Missions

| ID | Project | Status | Started | Target Ship |
|----|---------|--------|---------|------------|
| — | — | — | — | — |

---

## Completed Missions

| ID | Project | Shipped | Notes |
|----|---------|---------|-------|
| — | — | — | — |

---

## Starting a New Mission

1. Copy `templates/MISSION-TEMPLATE.md` → `active/MISSION-NNN-project-name/MISSION.md`
2. CPE reads the brief and routes to Architect
3. Architect fills in `ARCHITECTURE.md` and `PLANS.md` for this mission
4. CPE approves both before SE begins
5. All work for this mission lives inside `active/MISSION-NNN-project-name/`
