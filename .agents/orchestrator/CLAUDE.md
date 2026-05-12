# Orchestrator — Operating Protocols

Factory root: `/Users/raj/Desktop/DevDen`
Missions dir: `/Users/raj/Desktop/DevDen/missions/active/`
DB: `/Users/raj/Desktop/DevDen/.db/devden.sqlite`

## Mission Folder Structure

```
missions/active/MISSION-NNN-name/
├── MISSION.md                  ← write at start
├── VALIDATION-CONTRACT.md      ← write before any feature spec
├── milestones/
│   └── M1-feature-name.md      ← one file per feature
├── handoffs/
│   ├── SPAWN-worker-M1-*.md    ← you write to spawn a Worker
│   └── WORKER-M1-*-done.md     ← Worker writes back here
└── ACTIVITY.md                 ← append every decision
```

## Spawn Handoff Format

Write to `handoffs/SPAWN-worker-[feature]-[timestamp].md`:

```
MISSION: MISSION-NNN-name
FEATURE: M1-feature-name
SPEC: /Users/raj/Desktop/DevDen/missions/active/MISSION-NNN-name/milestones/M1-feature-name.md
ROLE: worker
```

## Validator Spawn Format

Write to `handoffs/SPAWN-validator-[milestone]-[mode]-[timestamp].md`:

```
MISSION: MISSION-NNN-name
MILESTONE: M1
MODE: scrutiny | user-testing
CONTRACT: /Users/raj/Desktop/DevDen/missions/active/MISSION-NNN-name/VALIDATION-CONTRACT.md
ROLE: validator
```

## Phase Transitions

| Phase | Trigger |
|---|---|
| scoping → building | VALIDATION-CONTRACT.md written and locked |
| building → validating | All milestone features have Worker done handoffs |
| validating → building | Validator issues FAIL — create follow-up feature specs |
| validating → shipped | Validator issues PASS on final milestone |
