'use strict';
require('dotenv').config();
const Database = require('better-sqlite3');
const path     = require('path');

// SQLite file lives next to the backend folder
const DB_PATH = process.env.DB_PATH
  || path.join(__dirname, '..', '..', 'careerquest.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema init (runs once; CREATE IF NOT EXISTS is idempotent) ───────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS "user" (
    user_id        TEXT NOT NULL PRIMARY KEY,
    email          TEXT NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,
    account_status TEXT NOT NULL DEFAULT 'active'
                   CHECK(account_status IN ('active','inactive','suspended','deleted')),
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
    last_login_at  TEXT
  );

  CREATE TABLE IF NOT EXISTS profile (
    profile_id             TEXT NOT NULL PRIMARY KEY,
    user_id                TEXT NOT NULL UNIQUE,
    first_name             TEXT NOT NULL DEFAULT '',
    last_name              TEXT NOT NULL DEFAULT '',
    phone_number           TEXT,
    country                TEXT,
    state                  TEXT,
    city                   TEXT,
    total_years_experience REAL CHECK(total_years_experience >= 0),
    current_title          TEXT,
    professional_summary   TEXT,
    created_at             TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at             TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS session_log (
    session_id  TEXT NOT NULL PRIMARY KEY,
    user_id     TEXT NOT NULL,
    login_at    TEXT NOT NULL DEFAULT (datetime('now')),
    logout_at   TEXT,
    ip_address  TEXT,
    device_type TEXT CHECK(device_type IN ('desktop','mobile','tablet','other')),
    FOREIGN KEY (user_id) REFERENCES "user"(user_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS education (
    education_id TEXT NOT NULL PRIMARY KEY,
    profile_id   TEXT NOT NULL,
    degree_level TEXT NOT NULL
                 CHECK(degree_level IN ('high_school','associate','bachelor','master','doctorate','diploma','certificate','other')),
    degree_name  TEXT NOT NULL,
    major        TEXT,
    institution  TEXT NOT NULL,
    start_year   INTEGER,
    end_year     INTEGER,
    gpa          REAL CHECK(gpa >= 0.00 AND gpa <= 4.00),
    is_current   INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS experience (
    experience_id   TEXT NOT NULL PRIMARY KEY,
    profile_id      TEXT NOT NULL,
    employer_name   TEXT NOT NULL,
    job_title       TEXT NOT NULL,
    employment_type TEXT CHECK(employment_type IN ('full_time','part_time','contract','internship','freelance','other')),
    domain_area     TEXT,
    start_date      TEXT NOT NULL,
    end_date        TEXT,
    is_current      INTEGER NOT NULL DEFAULT 0,
    description     TEXT,
    FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS certification (
    certification_id     TEXT NOT NULL PRIMARY KEY,
    profile_id           TEXT NOT NULL,
    certification_name   TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    issue_date           TEXT NOT NULL,
    expiration_date      TEXT,
    credential_url       TEXT,
    FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS skill_category (
    skill_category_id TEXT NOT NULL PRIMARY KEY,
    category_name     TEXT,
    skill_description TEXT,
    profile_id        TEXT,
    FOREIGN KEY (profile_id) REFERENCES profile(profile_id)
  );

  CREATE TABLE IF NOT EXISTS skill (
    skill_id          TEXT NOT NULL PRIMARY KEY,
    skill_name        TEXT,
    skill_type        TEXT,
    skill_category_id TEXT,
    FOREIGN KEY (skill_category_id) REFERENCES skill_category(skill_category_id)
  );

  CREATE TABLE IF NOT EXISTS profile_skill (
    profile_skill_id          TEXT NOT NULL PRIMARY KEY,
    profile_proficiency_level TEXT,
    profile_confidence_level  TEXT,
    profile_id                TEXT,
    skill_id                  TEXT,
    FOREIGN KEY (profile_id) REFERENCES profile(profile_id),
    FOREIGN KEY (skill_id)   REFERENCES skill(skill_id)
  );

  CREATE TABLE IF NOT EXISTS profile_language (
    profile_language_id        TEXT NOT NULL PRIMARY KEY,
    language_name              TEXT,
    language_proficiency_level TEXT,
    profile_id                 TEXT,
    FOREIGN KEY (profile_id) REFERENCES profile(profile_id)
  );

  CREATE TABLE IF NOT EXISTS project (
    project_id        TEXT NOT NULL PRIMARY KEY,
    profile_id        TEXT NOT NULL,
    project_title     TEXT NOT NULL,
    project_domain    TEXT,
    organization_name TEXT,
    start_date        TEXT,
    end_date          TEXT,
    description       TEXT,
    outcome_text      TEXT,
    FOREIGN KEY (profile_id) REFERENCES profile(profile_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS career_role (
    career_role_id TEXT NOT NULL PRIMARY KEY,
    role_category  TEXT,
    role_name      TEXT,
    profile_id     TEXT,
    FOREIGN KEY (profile_id) REFERENCES profile(profile_id)
  );

  CREATE TABLE IF NOT EXISTS role_skill_requirement (
    role_skill_requirement_id TEXT NOT NULL PRIMARY KEY,
    role_skill_required_level TEXT,
    role_skill_weight         REAL,
    role_skill_is_mandatory   INTEGER,
    career_role_id            TEXT,
    skill_id                  TEXT,
    FOREIGN KEY (career_role_id) REFERENCES career_role(career_role_id),
    FOREIGN KEY (skill_id)       REFERENCES skill(skill_id)
  );

  CREATE TABLE IF NOT EXISTS preference (
    preference_id              TEXT NOT NULL PRIMARY KEY,
    salary_expectation_minimum INTEGER,
    salary_expectation_maximum INTEGER,
    willing_to_relocate        INTEGER,
    willing_to_travel          INTEGER,
    profile_id                 TEXT,
    FOREIGN KEY (profile_id) REFERENCES profile(profile_id)
  );

  CREATE TABLE IF NOT EXISTS preference_constraint (
    preference_constraint_id TEXT NOT NULL PRIMARY KEY,
    work_authorization       TEXT,
    employmemt_type          TEXT,
    work_mode                TEXT,
    experience_level         TEXT,
    profile_id               TEXT,
    FOREIGN KEY (profile_id) REFERENCES profile(profile_id)
  );

  CREATE TABLE IF NOT EXISTS preferred_location (
    preferred_location_id TEXT NOT NULL PRIMARY KEY,
    state                 TEXT,
    city                  TEXT,
    priority_order        INTEGER,
    preference_id         TEXT,
    FOREIGN KEY (preference_id) REFERENCES preference(preference_id)
  );

  CREATE TABLE IF NOT EXISTS preferred_role (
    preferred_role_id         TEXT NOT NULL PRIMARY KEY,
    preferred_role_created_at TEXT,
    preferred_role_is_active  INTEGER,
    profile_id                TEXT,
    career_role_id            TEXT,
    FOREIGN KEY (profile_id)     REFERENCES profile(profile_id),
    FOREIGN KEY (career_role_id) REFERENCES career_role(career_role_id)
  );

  CREATE TABLE IF NOT EXISTS assessment_run (
    run_id                TEXT NOT NULL PRIMARY KEY,
    run_date              TEXT,
    total_roles_evaluated INTEGER,
    run_evaluted_at       TEXT,
    profile_id            TEXT,
    FOREIGN KEY (profile_id) REFERENCES profile(profile_id)
  );

  CREATE TABLE IF NOT EXISTS role_assessment_result (
    role_assessment_result_id    TEXT NOT NULL PRIMARY KEY,
    skill_match_score            REAL,
    experience_match_score       REAL,
    education_match_score        REAL,
    overall_readiness_score      REAL,
    role_readiness_band          TEXT,
    role_assessment_evaluated_at TEXT,
    run_id                       TEXT,
    career_role_id               TEXT,
    FOREIGN KEY (run_id)         REFERENCES assessment_run(run_id),
    FOREIGN KEY (career_role_id) REFERENCES career_role(career_role_id)
  );

  CREATE TABLE IF NOT EXISTS role_recommendation (
    role_recommendation_id         TEXT NOT NULL PRIMARY KEY,
    fit_score                      REAL,
    role_recommendation_reason     TEXT,
    role_recommendation_created_at TEXT,
    run_id                         TEXT,
    career_role_id                 TEXT,
    FOREIGN KEY (run_id) REFERENCES assessment_run(run_id)
  );

  CREATE TABLE IF NOT EXISTS skill_gap (
    skill_gap_id                   TEXT NOT NULL PRIMARY KEY,
    skill_gap_current_skill_level  TEXT,
    skill_gap_required_skill_level TEXT,
    skill_gap_severyity            TEXT,
    role_assessment_result_id      TEXT,
    skill_id                       TEXT,
    FOREIGN KEY (role_assessment_result_id) REFERENCES role_assessment_result(role_assessment_result_id),
    FOREIGN KEY (skill_id)                  REFERENCES skill(skill_id)
  );

  -- Seed demo account  (email: demo@careercompass.com  /  password: demo123)
  INSERT OR IGNORE INTO "user" (user_id, email, password_hash, account_status, created_at)
  VALUES (
    'seed-user-001',
    'demo@careercompass.com',
    '$2a$12$byrGDGVa83m5hjewDB/aVuvXk14EuGaBjG5FWfLs1D4zWfLvsahFK',
    'active',
    datetime('now')
  );

  INSERT OR IGNORE INTO profile (profile_id, user_id, first_name, last_name)
  VALUES ('seed-profile-001', 'seed-user-001', 'Demo', 'User');
`);

// ── Migrations (add columns that may not exist in older DB files) ────────────
try { db.exec('ALTER TABLE profile ADD COLUMN date_of_birth TEXT'); } catch (_) {}

// ── mysql2-compatible async pool shim ────────────────────────────────────────
// Wraps better-sqlite3 (sync) so existing route files need zero changes.

function isReadOnly(sql) {
  return /^\s*(SELECT|WITH)/i.test(sql.trim());
}

function execQuery(sql, params = []) {
  const args = Array.isArray(params) ? params : [params];
  const stmt = db.prepare(sql);
  if (isReadOnly(sql)) {
    const rows = stmt.all(...args);
    return [rows, []];
  }
  const result = stmt.run(...args);
  return [{ affectedRows: result.changes, insertId: result.lastInsertRowid }, []];
}

const pool = {
  // Simple query (no transaction)
  async query(sql, params = []) {
    return execQuery(sql, params);
  },

  // Transaction-capable connection
  async getConnection() {
    const conn = {
      _inTx: false,

      async query(sql, params = []) {
        return execQuery(sql, params);
      },

      async beginTransaction() {
        db.prepare('BEGIN').run();
        conn._inTx = true;
      },

      async commit() {
        if (conn._inTx) {
          db.prepare('COMMIT').run();
          conn._inTx = false;
        }
      },

      async rollback() {
        if (conn._inTx) {
          try { db.prepare('ROLLBACK').run(); } catch (_) {}
          conn._inTx = false;
        }
      },

      release() { /* no-op — SQLite has no connection pool */ },
    };
    return conn;
  },
};

module.exports = pool;
