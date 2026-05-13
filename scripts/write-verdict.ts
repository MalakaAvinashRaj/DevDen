#!/usr/bin/env bun
/**
 * write-verdict.ts
 *
 * Validator helper — takes a scored criteria JSON file and writes the
 * formal verdict markdown to the mission's handoffs directory.
 *
 * Usage:
 *   bun /Users/raj/Desktop/DevDen/scripts/write-verdict.ts \
 *     <mission-folder> <milestone> <mode> <scores-json-file> [ndjson-path]
 *
 * Example:
 *   bun /Users/raj/Desktop/DevDen/scripts/write-verdict.ts \
 *     MISSION-001-todo-list M1 scrutiny /path/to/scores.json /path/to/checks.ndjson
 *
 * scores-json-file format:
 *   [
 *     { "criterion": "API returns 200", "score": 4, "evidence": "GET /api returns 200 with correct shape" },
 *     { "criterion": "Auth required", "score": 5, "evidence": "401 returned when no token" },
 *     { "criterion": "Tests pass", "score": 2, "evidence": "3 tests fail in auth.test.ts" }
 *   ]
 *
 * Output:
 *   - Writes handoffs/VALIDATOR-<milestone>-<mode>-verdict.md
 *   - Prints the verdict file path to stdout
 *   - Exit code 0 = verdict written
 *   - Exit code 1 = bad args or invalid scores file
 */

import fs from 'fs'
import path from 'path'

const FACTORY_ROOT = '/Users/raj/Desktop/DevDen'
const MISSIONS_DIR = path.join(FACTORY_ROOT, 'missions', 'active')

// ── Args ──────────────────────────────────────────────────────────────────────

const [missionFolder, milestone, mode, scoresFile, ndjsonPath] = process.argv.slice(2)

if (!missionFolder || !milestone || !mode || !scoresFile) {
  console.error(
    'Usage: bun write-verdict.ts <mission-folder> <milestone> <mode> <scores-json-file> [ndjson-path]'
  )
  process.exit(1)
}

if (!['scrutiny', 'user-testing'].includes(mode)) {
  console.error('mode must be: scrutiny | user-testing')
  process.exit(1)
}

const missionDir = path.join(MISSIONS_DIR, missionFolder)
if (!fs.existsSync(missionDir)) {
  console.error(`Mission folder not found: ${missionDir}`)
  process.exit(1)
}

if (!fs.existsSync(scoresFile)) {
  console.error(`Scores file not found: ${scoresFile}`)
  process.exit(1)
}

// ── Parse scores ──────────────────────────────────────────────────────────────

type CriterionScore = {
  criterion: string
  score: number
  evidence: string
  weight?: number // optional weight, defaults to 1
}

let scores: CriterionScore[]
try {
  scores = JSON.parse(fs.readFileSync(scoresFile, 'utf-8'))
} catch (e) {
  console.error(`Failed to parse scores JSON: ${e}`)
  process.exit(1)
}

if (!Array.isArray(scores) || scores.length === 0) {
  console.error('Scores file must be a non-empty JSON array')
  process.exit(1)
}

for (const s of scores) {
  if (!s.criterion || typeof s.score !== 'number' || !s.evidence) {
    console.error(`Invalid score entry: ${JSON.stringify(s)}`)
    console.error('Each entry must have: criterion (string), score (number 0-5), evidence (string)')
    process.exit(1)
  }
  if (s.score < 0 || s.score > 5) {
    console.error(`Score out of range (0-5): ${s.score} for criterion: ${s.criterion}`)
    process.exit(1)
  }
}

// ── Compute verdict ───────────────────────────────────────────────────────────

function computeVerdict(scores: CriterionScore[]): {
  weightedMean: number
  verdict: 'PASS' | 'PARTIAL' | 'FAIL'
  blockingIssues: CriterionScore[]
} {
  const totalWeight = scores.reduce((sum, s) => sum + (s.weight ?? 1), 0)
  const weightedSum = scores.reduce((sum, s) => sum + s.score * (s.weight ?? 1), 0)
  const weightedMean = totalWeight > 0 ? weightedSum / totalWeight : 0

  const blockingIssues = scores.filter((s) => s.score < 2.5)

  let verdict: 'PASS' | 'PARTIAL' | 'FAIL'
  if (blockingIssues.length > 0 || weightedMean < 2.5) {
    verdict = 'FAIL'
  } else if (weightedMean >= 3.5) {
    verdict = 'PASS'
  } else {
    verdict = 'PARTIAL'
  }

  return { weightedMean, verdict, blockingIssues }
}

const { weightedMean, verdict, blockingIssues } = computeVerdict(scores)

// ── Build verdict markdown ────────────────────────────────────────────────────

const dateStr = new Date().toISOString().split('T')[0]

const criteriaTable = [
  '| Criterion | Score | Evidence |',
  '|---|---|---|',
  ...scores.map((s) => `| ${s.criterion} | ${s.score}/5 | ${s.evidence} |`),
].join('\n')

const blockingSection =
  blockingIssues.length > 0
    ? blockingIssues.map((s) => `- **${s.criterion}** (${s.score}/5): ${s.evidence}`).join('\n')
    : '_None — all assertions scored ≥ 2.5_'

const ndjsonLine = ndjsonPath
  ? `NDJSON: ${path.relative(missionDir, ndjsonPath)}`
  : 'NDJSON: (no checks log provided)'

const verdictMd = `# Validator Verdict — ${milestone} — ${mode}
Date: ${dateStr}
Mode: ${mode}
Verdict: ${verdict}
Score: ${weightedMean.toFixed(2)}
${ndjsonLine}

## Criteria Scores
${criteriaTable}

## Blocking Issues
${blockingSection}

## Recommendations
<!-- Add non-blocking observations for the Orchestrator's follow-up features -->
`

// ── Write verdict file ────────────────────────────────────────────────────────

const handoffsDir = path.join(missionDir, 'handoffs')
fs.mkdirSync(handoffsDir, { recursive: true })

const verdictFilename = `VALIDATOR-${milestone}-${mode}-verdict.md`
const verdictPath = path.join(handoffsDir, verdictFilename)
fs.writeFileSync(verdictPath, verdictMd, 'utf-8')

// Append final judgment line to NDJSON if provided
if (ndjsonPath && fs.existsSync(ndjsonPath)) {
  const finalLine = JSON.stringify({
    ts: new Date().toISOString(),
    check: 'verdict',
    verdict,
    score: parseFloat(weightedMean.toFixed(2)),
    blocking_count: blockingIssues.length,
    note: `Verdict file: ${verdictFilename}`,
  })
  fs.appendFileSync(ndjsonPath, finalLine + '\n')
}

// Print verdict summary to stdout for agent to see
console.log(`\n${'─'.repeat(60)}`)
console.log(`Verdict: ${verdict}`)
console.log(`Score:   ${weightedMean.toFixed(2)} / 5.00`)
console.log(`Criteria: ${scores.length} total, ${blockingIssues.length} blocking`)
console.log(`File:    ${verdictPath}`)
console.log('─'.repeat(60))

if (verdict === 'FAIL') {
  console.log('\nBlocking issues:')
  for (const b of blockingIssues) {
    console.log(`  ✗ ${b.criterion} (${b.score}/5): ${b.evidence}`)
  }
}

// Print path for agent to capture
console.log(verdictPath)
