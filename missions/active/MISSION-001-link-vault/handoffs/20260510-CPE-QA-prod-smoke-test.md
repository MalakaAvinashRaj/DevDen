# Handoff: CPE → QA — Production Smoke Test
**Date:** 2026-05-10
**From:** CPE
**To:** QA
**Mission:** MISSION-001 — Link Vault
**Task:** T-003 Production Smoke Test
**Priority:** P1

---

## Context
The API has been deployed to Vercel and verified in production at `https://link-vault-zeta.vercel.app`. All endpoints were tested locally and production verification steps were completed by SE (see handoff 20260508-CPE-SE-m1-t003-deploy.md). QA now needs to perform a production smoke test to ensure no environment-specific regressions.

## Assignment
1. Verify the production URL is reachable.
2. Run the same CURL test suite as in local QA (POST, GET, PATCH, DELETE, export) against the production URL.
3. Confirm that:
   - All endpoints return expected status codes and data.
   - No new errors appear in Vercel function logs.
   - Database interactions succeed with PostgreSQL.
4. Document any issues. If all pass, signal CPE with approval.

---

## Definition of Done
- [ ] All 7 API endpoints exercised in production and return correct responses.
- [ ] No errors in Vercel logs.
- [ ] QA confirms production behavior matches local QA report.
- [ ] Signal CPE: "PRODUCTION_SMOKE_TEST COMPLETE — all endpoints verified"
