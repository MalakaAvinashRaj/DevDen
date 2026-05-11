# Deployment Standards — DevDen Factory
Authored by: CPE  
Applies to: All missions unless Architect specifies otherwise in ARCHITECTURE.md

---

## Factory Defaults

Every SaaS we ship follows one of three deployment patterns. Architect picks the pattern in ARCHITECTURE.md. SE follows it. CPE approves the deploy.

---

## Pattern A — Full-Stack Web App

**When to use:** SaaS with a frontend UI + backend API + database

| Layer | Default | Notes |
|-------|---------|-------|
| Frontend | **Vercel** | Next.js or static React. Auto-deploys from `main` branch. |
| Backend / API | **Railway** | Node/Python/Go service. Managed environment variables. |
| Database | **Railway** (Postgres) | Managed Postgres, backups enabled. |
| Auth | **Clerk** or **Supabase Auth** | Never roll custom auth. |

**Deploy flow:**
```
SE pushes to main (feature branch PR merged by CPE)
    → Vercel auto-deploys frontend
    → Railway auto-deploys backend
    → CPE confirms both deploys healthy in dashboards
    → CPE signals QA to run post-deploy smoke test
    → QA approves → CPE marks mission shipped
```

---

## Pattern B — API / Backend Only

**When to use:** SaaS that is an API product (no frontend, or frontend is out of scope)

| Layer | Default | Notes |
|-------|---------|-------|
| API | **Railway** | Managed service, env vars, logging built in |
| Database | **Railway** (Postgres) | Same as Pattern A |
| Docs | **ReadMe.io** or static Markdown | API docs ship with the product |

---

## Pattern C — Static / Content Site

**When to use:** Marketing site, documentation site, or simple content SaaS

| Layer | Default | Notes |
|-------|---------|-------|
| Hosting | **Vercel** | Git-connected, instant preview URLs per branch |
| CMS (if needed) | **Sanity** or MDX files | Depends on how often content changes |

---

## CI/CD Baseline

Every mission uses this CI/CD setup regardless of pattern:

```
Pull Request opened
    → GitHub Actions: lint + typecheck + unit tests
    → Preview deploy (Vercel/Railway preview environment)
    → CPE reviews PR + preview URL
    → Merge to main → production deploy
```

**GitHub Actions minimum config** (SE creates `.github/workflows/ci.yml` for every mission):
- Trigger: `pull_request` to `main`
- Steps: install deps → lint → typecheck → test
- No merge if CI fails. CPE enforces this.

---

## Environment Variables

- **Never** commit secrets or `.env` files
- All secrets go into Vercel/Railway environment variable dashboards
- SE documents required env vars in the mission's `ARCHITECTURE.md` under an `## Environment Variables` section
- CPE confirms all env vars are set before approving a deploy

---

## Per-Mission Override

If Architect specifies a different stack in `ARCHITECTURE.md`, that overrides these defaults. Architect must document:
- Why the default doesn't fit
- What the alternative is
- What CPE needs to do differently at deploy time
