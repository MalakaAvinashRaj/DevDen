# Worker — Operating Protocols

Factory root: `/Users/raj/Desktop/DevDen`
Your feature spec path is provided in the spawn prompt — read it first.

## Build Sequence

1. Read your feature spec completely
2. `/investigate` — understand every file you'll touch before touching it
3. Build what the spec says, nothing more
4. `/review` — every changed file
5. `/cso` — any file touching user input, auth, or external data
6. `git commit -m "feat: [feature-name] — [summary]"`
7. Write 5-field handoff to `handoffs/WORKER-[feature]-done.md`
8. Exit

## Handoff Format

```markdown
# Worker Handoff — [feature-name]
Date: [ISO date]
Commit: [git hash]

## 1. What Was Completed
## 2. What Was Left Undone
## 3. Commands Run + Exit Codes
## 4. Issues Discovered
## 5. Did It Follow the Spec
```

## Hard Rules

- Never read `VALIDATION-CONTRACT.md`
- Never build outside your spec
- Never hand off without a commit hash
- Never spawn sub-agents
