#!/usr/bin/env bun
/**
 * run-checks.ts
 *
 * Validator helper — runs mechanical checks against a mission's app directory
 * and writes one NDJSON line per check to the mission's handoffs directory.
 *
 * Usage:
 *   bun /Users/raj/Desktop/DevDen/scripts/run-checks.ts <mission-folder> [--mode scrutiny|user-testing]
 *
 * Example:
 *   bun /Users/raj/Desktop/DevDen/scripts/run-checks.ts MISSION-001-todo-list
 *
 * Output:
 *   - Writes NDJSON lines to: missions/active/<mission-folder>/handoffs/checks-<ts>.ndjson
 *   - Prints the NDJSON path to stdout on completion
 *   - Exit code 0 = all checks ran (some may have failed — check NDJSON)
 *   - Exit code 1 = script error (bad args, mission not found)
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const FACTORY_ROOT = '/Users/raj/Desktop/DevDen'
const MISSIONS_DIR = path.join(FACTORY_ROOT, 'missions', 'active')

// ── Args ──────────────────────────────────────────────────────────────────────

const missionFolder = process.argv[2]
if (!missionFolder) {
  console.error('Usage: bun run-checks.ts <mission-folder>')
  process.exit(1)
}

const missionDir = path.join(MISSIONS_DIR, missionFolder)
if (!fs.existsSync(missionDir)) {
  console.error(`Mission folder not found: ${missionDir}`)
  process.exit(1)
}

const handoffsDir = path.join(missionDir, 'handoffs')
fs.mkdirSync(handoffsDir, { recursive: true })

const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const ndjsonPath = path.join(handoffsDir, `checks-${ts}.ndjson`)
const stream = fs.createWriteStream(ndjsonPath, { flags: 'a' })

// ── Helpers ───────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString()
}

function writeLine(record: Record<string, unknown>): void {
  stream.write(JSON.stringify(record) + '\n')
}

function runCheck(
  check: string,
  cmd: string,
  cwd: string
): { exit: number; stdout: string; stderr: string } {
  writeLine({ ts: now(), check, cmd, status: 'running' })
  try {
    const result = execSync(cmd, { cwd, encoding: 'utf-8', stdio: 'pipe', timeout: 120_000 })
    const stdout = typeof result === 'string' ? result.trim() : ''
    writeLine({ ts: now(), check, cmd, exit: 0, note: stdout.slice(0, 500) || 'clean' })
    return { exit: 0, stdout, stderr: '' }
  } catch (err: unknown) {
    const e = err as { status?: number; stdout?: string; stderr?: string; message?: string }
    const exit = e.status ?? 1
    const stdout = (e.stdout ?? '').trim()
    const stderr = (e.stderr ?? '').trim()
    const note = ((stderr || stdout).slice(0, 500)) || (e.message ?? 'failed')
    writeLine({ ts: now(), check, cmd, exit, note })
    return { exit, stdout, stderr }
  }
}

// ── Detect app directory ──────────────────────────────────────────────────────

// The Worker builds the app inside missions/active/MISSION-NNN/app/
// Fallback: check if there's a package.json at the mission root
let appDir: string | null = null
const candidates = [
  path.join(missionDir, 'app'),
  missionDir,
]
for (const candidate of candidates) {
  if (fs.existsSync(path.join(candidate, 'package.json'))) {
    appDir = candidate
    break
  }
}

if (!appDir) {
  writeLine({ ts: now(), check: 'setup', note: 'No package.json found — skipping all checks', exit: 1 })
  stream.end()
  console.log(ndjsonPath)
  process.exit(0)
}

writeLine({ ts: now(), check: 'setup', note: `App directory: ${appDir}`, exit: 0 })

// ── Install dependencies (if node_modules missing) ────────────────────────────

if (!fs.existsSync(path.join(appDir, 'node_modules'))) {
  writeLine({ ts: now(), check: 'install', cmd: 'npm install', status: 'running' })
  runCheck('install', 'npm install', appDir)
}

// ── TypeScript type check ─────────────────────────────────────────────────────

const hasTsConfig = fs.existsSync(path.join(appDir, 'tsconfig.json'))
if (hasTsConfig) {
  runCheck('type-check', 'npx tsc --noEmit', appDir)
} else {
  writeLine({ ts: now(), check: 'type-check', note: 'No tsconfig.json — skipped', exit: 0 })
}

// ── Lint ──────────────────────────────────────────────────────────────────────

const pkgJson = JSON.parse(fs.readFileSync(path.join(appDir, 'package.json'), 'utf-8'))
const hasLint = pkgJson.scripts?.lint || fs.existsSync(path.join(appDir, '.eslintrc.json')) ||
                fs.existsSync(path.join(appDir, '.eslintrc.js')) || pkgJson.eslintConfig

if (hasLint && pkgJson.scripts?.lint) {
  runCheck('lint', 'npm run lint', appDir)
} else if (hasLint) {
  runCheck('lint', 'npx eslint src/ --ext .ts,.tsx --max-warnings 0', appDir)
} else {
  writeLine({ ts: now(), check: 'lint', note: 'No ESLint config found — skipped', exit: 0 })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

const testRunners: Array<{ name: string; cmd: string; detect: string[] }> = [
  { name: 'vitest', cmd: 'npx vitest run --reporter=verbose', detect: ['vitest'] },
  { name: 'jest', cmd: 'npx jest --ci', detect: ['jest'] },
]

const allDeps = { ...pkgJson.dependencies, ...pkgJson.devDependencies }
const hasTestScript = !!pkgJson.scripts?.test && !pkgJson.scripts.test.includes('no test')
const detectedRunner = testRunners.find((r) => r.detect.some((d) => d in allDeps))

if (hasTestScript) {
  runCheck('tests', 'npm test -- --passWithNoTests 2>/dev/null || npm test', appDir)
} else if (detectedRunner) {
  runCheck('tests', detectedRunner.cmd, appDir)
} else {
  writeLine({ ts: now(), check: 'tests', note: 'No test runner found — skipped', exit: 0 })
}

// ── Build check ───────────────────────────────────────────────────────────────

if (pkgJson.scripts?.build) {
  runCheck('build', 'npm run build', appDir)
} else {
  writeLine({ ts: now(), check: 'build', note: 'No build script — skipped', exit: 0 })
}

// ── Summary ───────────────────────────────────────────────────────────────────

writeLine({ ts: now(), check: 'summary', note: 'All checks complete', ndjson: ndjsonPath })
stream.end()

// Print the NDJSON path for the agent to reference
console.log(ndjsonPath)
