# Product Sense — DevDen
The factory's standards. What every SaaS we ship must achieve.

---

## What DevDen Is

DevDen is an AI-powered SaaS factory. We take on projects as missions.
The output of every mission is a shipped SaaS product.
We do not build internal tools, one-off scripts, or prototypes.
We build real products that real users pay for or rely on.

Each mission has its own specific users, priorities, and success criteria — defined
in that mission's `MISSION.md` and `PRODUCT_SENSE.md` inside the mission folder.

This file defines the **factory-wide standards** that apply to every mission,
regardless of the specific product being built.

---

## The Factory Quality Bar

Every SaaS we ship must clear this bar — no exceptions across missions:

**Reliability first.**
A slow correct feature beats a fast broken one. Users forgive slow. They don't forgive wrong, broken, or data-losing. Reliability is non-negotiable on every mission.

**Works on first use.**
A new user reaches their first working output without reading documentation or contacting support. If they need help to get started, the product failed, not the user.

**Specific error messages.**
Every error tells the user what went wrong, in what context, and what to do next. "Something went wrong" is not an error message. It ships back to QA.

**Nothing ships with a known P0 or P1 bug.**
The QA loop runs as many times as it takes. Mission deadlines do not override this.

---

## How Missions Are Evaluated

A mission is complete when:
- All features meet their product spec acceptance criteria
- QA has signed off — zero open P0/P1 bugs
- The core user flow works end-to-end without errors
- The product has been deployed and is accessible

A mission is NOT complete because:
- The code works in local testing
- SE says it's done
- The deadline has arrived
- Most features work

---

## Factory-Wide Priorities — When Things Conflict Across Missions

1. **A P0 bug on any active mission** overrides all other work
2. **QA sign-off is never bypassed** regardless of timeline pressure
3. **Reliability and security** are designed in — never retrofitted after ship
4. **Each mission's users come first** — we build what solves their problem, not what's technically interesting

---

## What Good Looks Like — Factory Level

**Good mission intake:**
CPE has a clear brief before Architect begins. Scope is defined. Out-of-scope is explicit.
The Architect's plan is approved before SE writes a line of code.

**Good build cycle:**
SE follows the build-verify loop. QA gets clean submissions, not explorations.
Bug cycles are short because SE fixes root causes, not symptoms.

**Good ship:**
The product works. The QA log is clean. The mission log documents what was built and why.
Eval has captured what this mission taught us about the factory's performance.

**Good retrospective:**
Every completed mission makes the factory better. Eval's mission report identifies what
improved the harness and what should change before the next mission.

---

## What We Do Not Build

Across all missions, DevDen does not produce:
- Prototypes or proof-of-concepts presented as production software
- Products with known security vulnerabilities (see each agent's SECURITY.md)
- Software that cannot be maintained or extended after the mission ends
- "Demo-ware" — things that look good in screenshots but break in real use
