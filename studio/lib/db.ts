import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_DIR = path.join(process.cwd(), '..', '.db')
const DB_PATH = path.join(DB_DIR, 'devden.sqlite')

fs.mkdirSync(DB_DIR, { recursive: true })

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db

  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')

  _db.exec(`
    CREATE TABLE IF NOT EXISTS missions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      folder      TEXT NOT NULL UNIQUE,
      phase       TEXT NOT NULL DEFAULT 'scoping',
      version     INTEGER NOT NULL DEFAULT 1,
      brief       TEXT,
      goal        TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      shipped_at  TEXT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      mission_id  INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
      title       TEXT NOT NULL,
      assignee    TEXT NOT NULL DEFAULT 'worker',
      status      TEXT NOT NULL DEFAULT 'pending',
      priority    INTEGER NOT NULL DEFAULT 0,
      milestone   TEXT
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      role        TEXT NOT NULL,
      mission_id  INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
      feature     TEXT,
      status      TEXT NOT NULL DEFAULT 'queued',
      pid         INTEGER,
      retry_count INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activity (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      mission_id  INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
      role        TEXT NOT NULL,
      event       TEXT NOT NULL,
      detail      TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS validations (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      mission_id  INTEGER NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
      milestone   TEXT NOT NULL,
      mode        TEXT NOT NULL,
      verdict     TEXT NOT NULL,
      score       REAL,
      ndjson_path TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  return _db
}
