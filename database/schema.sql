-- =============================================================
-- CareerQuest Database Schema (MySQL)
-- Adapted from PostgreSQL source
-- =============================================================

CREATE DATABASE IF NOT EXISTS careerquest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE careerquest;

-- ---------------------------------------------------------------
-- USER
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
  user_id         VARCHAR(50)  NOT NULL,
  email           VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  account_status  ENUM('active','inactive','suspended','deleted') NOT NULL DEFAULT 'active',
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at   DATETIME     NULL,
  PRIMARY KEY (user_id),
  UNIQUE KEY user_email_key (email)
);

-- ---------------------------------------------------------------
-- PROFILE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profile (
  profile_id              VARCHAR(50)   NOT NULL,
  user_id                 VARCHAR(50)   NOT NULL,
  first_name              VARCHAR(100)  NOT NULL,
  last_name               VARCHAR(100)  NOT NULL,
  phone_number            VARCHAR(20)   NULL,
  country                 VARCHAR(100)  NULL,
  state                   VARCHAR(100)  NULL,
  city                    VARCHAR(100)  NULL,
  total_years_experience  DECIMAL(4,1)  NULL,
  current_title           VARCHAR(150)  NULL,
  professional_summary    TEXT          NULL,
  created_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (profile_id),
  UNIQUE KEY profile_user_id_key (user_id),
  CONSTRAINT profile_total_years_experience_check CHECK (total_years_experience >= 0),
  CONSTRAINT profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES `user` (user_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------
-- SESSION_LOG
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_log (
  session_id   VARCHAR(50) NOT NULL,
  user_id      VARCHAR(50) NOT NULL,
  login_at     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  logout_at    DATETIME    NULL,
  ip_address   VARCHAR(45) NULL,
  device_type  ENUM('desktop','mobile','tablet','other') NULL,
  PRIMARY KEY (session_id),
  CONSTRAINT session_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES `user` (user_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------
-- EDUCATION
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS education (
  education_id  VARCHAR(50)  NOT NULL,
  profile_id    VARCHAR(50)  NOT NULL,
  degree_level  ENUM('high_school','associate','bachelor','master','doctorate','diploma','certificate','other') NOT NULL,
  degree_name   VARCHAR(200) NOT NULL,
  major         VARCHAR(200) NULL,
  institution   VARCHAR(255) NOT NULL,
  start_year    SMALLINT     NULL,
  end_year      SMALLINT     NULL,
  gpa           DECIMAL(3,2) NULL,
  is_current    BOOLEAN      NOT NULL DEFAULT FALSE,
  PRIMARY KEY (education_id),
  CONSTRAINT education_gpa_check       CHECK (gpa >= 0.00 AND gpa <= 4.00),
  CONSTRAINT education_start_year_check CHECK (start_year >= 1950 AND start_year <= 2100),
  CONSTRAINT education_end_year_check   CHECK (end_year >= 1950 AND end_year <= 2100),
  CONSTRAINT education_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profile (profile_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------
-- EXPERIENCE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS experience (
  experience_id    VARCHAR(50)  NOT NULL,
  profile_id       VARCHAR(50)  NOT NULL,
  employer_name    VARCHAR(255) NOT NULL,
  job_title        VARCHAR(200) NOT NULL,
  employment_type  ENUM('full_time','part_time','contract','internship','freelance','other') NULL,
  domain_area      VARCHAR(150) NULL,
  start_date       DATE         NOT NULL,
  end_date         DATE         NULL,
  is_current       BOOLEAN      NOT NULL DEFAULT FALSE,
  description      TEXT         NULL,
  PRIMARY KEY (experience_id),
  CONSTRAINT chk_experience_dates CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT experience_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profile (profile_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------
-- CERTIFICATION
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS certification (
  certification_id      VARCHAR(50)  NOT NULL,
  profile_id            VARCHAR(50)  NOT NULL,
  certification_name    VARCHAR(255) NOT NULL,
  issuing_organization  VARCHAR(255) NOT NULL,
  issue_date            DATE         NOT NULL,
  expiration_date       DATE         NULL,
  credential_url        VARCHAR(500) NULL,
  PRIMARY KEY (certification_id),
  CONSTRAINT chk_certification_dates CHECK (expiration_date IS NULL OR expiration_date >= issue_date),
  CONSTRAINT certification_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profile (profile_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------
-- SKILL_CATEGORY
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skill_category (
  skill_category_id  VARCHAR(50) NOT NULL,
  category_name      TEXT        NULL,
  skill_description  TEXT        NULL,
  profile_id         VARCHAR(50) NULL,
  PRIMARY KEY (skill_category_id),
  CONSTRAINT skill_category_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profile (profile_id)
);

-- ---------------------------------------------------------------
-- SKILL
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skill (
  skill_id           VARCHAR(50) NOT NULL,
  skill_name         TEXT        NULL,
  skill_type         TEXT        NULL,
  skill_category_id  VARCHAR(50) NULL,
  PRIMARY KEY (skill_id),
  CONSTRAINT skill_skill_category_id_fkey FOREIGN KEY (skill_category_id) REFERENCES skill_category (skill_category_id)
);

-- ---------------------------------------------------------------
-- PROFILE_SKILL
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profile_skill (
  profile_skill_id          VARCHAR(50) NOT NULL,
  profile_proficiency_level VARCHAR(50) NULL,
  profile_confidence_level  VARCHAR(50) NULL,
  profile_id                VARCHAR(50) NULL,
  skill_id                  VARCHAR(50) NULL,
  PRIMARY KEY (profile_skill_id),
  CONSTRAINT profile_skill_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profile (profile_id),
  CONSTRAINT profile_skill_skill_id_fkey  FOREIGN KEY (skill_id)   REFERENCES skill (skill_id)
);

-- ---------------------------------------------------------------
-- PROFILE_LANGUAGE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profile_language (
  profile_language_id          VARCHAR(50) NOT NULL,
  language_name                VARCHAR(50) NULL,
  language_proficiency_level   VARCHAR(50) NULL,
  profile_id                   VARCHAR(50) NULL,
  PRIMARY KEY (profile_language_id),
  CONSTRAINT profile_language_skill_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profile (profile_id)
);

-- ---------------------------------------------------------------
-- PROJECT
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project (
  project_id         VARCHAR(50)  NOT NULL,
  profile_id         VARCHAR(50)  NOT NULL,
  project_title      VARCHAR(255) NOT NULL,
  project_domain     VARCHAR(150) NULL,
  organization_name  VARCHAR(255) NULL,
  start_date         DATE         NULL,
  end_date           DATE         NULL,
  description        TEXT         NULL,
  outcome_text       TEXT         NULL,
  PRIMARY KEY (project_id),
  CONSTRAINT chk_project_dates CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT project_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profile (profile_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------
-- CAREER_ROLE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS career_role (
  career_role_id  VARCHAR(50) NOT NULL,
  role_category   TEXT        NULL,
  role_name       TEXT        NULL,
  profile_id      VARCHAR(50) NULL,
  PRIMARY KEY (career_role_id),
  CONSTRAINT career_role_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profile (profile_id)
);

-- ---------------------------------------------------------------
-- ROLE_SKILL_REQUIREMENT
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_skill_requirement (
  role_skill_requirement_id   VARCHAR(50)    NOT NULL,
  role_skill_required_level   TEXT           NULL,
  role_skill_weight           DECIMAL(10,4)  NULL,
  role_skill_is_mandatory     BOOLEAN        NULL,
  career_role_id              VARCHAR(50)    NULL,
  skill_id                    VARCHAR(50)    NULL,
  PRIMARY KEY (role_skill_requirement_id),
  CONSTRAINT role_skill_requirement_career_role_id_fkey FOREIGN KEY (career_role_id) REFERENCES career_role (career_role_id),
  CONSTRAINT role_skill_requirement_skill_id_fkey       FOREIGN KEY (skill_id)       REFERENCES skill (skill_id)
);

-- ---------------------------------------------------------------
-- PREFERENCE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS preference (
  preference_id               VARCHAR(50) NOT NULL,
  salary_expectation_minimum  INT         NULL,
  salary_expectation_maximum  INT         NULL,
  willing_to_relocate         BOOLEAN     NULL,
  willing_to_travel           INT         NULL,
  profile_id                  VARCHAR(50) NULL,
  PRIMARY KEY (preference_id),
  CONSTRAINT preference_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profile (profile_id)
);

-- ---------------------------------------------------------------
-- PREFERENCE_CONSTRAINT
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS preference_constraint (
  preference_constraint_id  VARCHAR(50) NOT NULL,
  work_authorization        TEXT        NULL,
  employmemt_type           TEXT        NULL,
  work_mode                 TEXT        NULL,
  experience_level          TEXT        NULL,
  profile_id                VARCHAR(50) NULL,
  PRIMARY KEY (preference_constraint_id),
  CONSTRAINT preference_constraint_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profile (profile_id)
);

-- ---------------------------------------------------------------
-- PREFERRED_LOCATION
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS preferred_location (
  preferred_location_id  VARCHAR(50) NOT NULL,
  state                  TEXT        NULL,
  city                   TEXT        NULL,
  priority_order         INT         NULL,
  preference_id          VARCHAR(50) NULL,
  PRIMARY KEY (preferred_location_id),
  CONSTRAINT preferred_location_preference_id_fkey FOREIGN KEY (preference_id) REFERENCES preference (preference_id)
);

-- ---------------------------------------------------------------
-- PREFERRED_ROLE
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS preferred_role (
  preferred_role_id          VARCHAR(50) NOT NULL,
  preferred_role_created_at  DATETIME    NULL,
  preferred_role_is_active   BOOLEAN     NULL,
  profile_id                 VARCHAR(50) NULL,
  career_role_id             VARCHAR(50) NULL,
  PRIMARY KEY (preferred_role_id),
  CONSTRAINT preferred_role_profile_id_fkey    FOREIGN KEY (profile_id)    REFERENCES profile (profile_id),
  CONSTRAINT preferred_role_career_role_id_fkey FOREIGN KEY (career_role_id) REFERENCES career_role (career_role_id)
);

-- ---------------------------------------------------------------
-- ASSESSMENT_RUN
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assessment_run (
  run_id                   VARCHAR(50) NOT NULL,
  run_date                 DATETIME    NULL,
  total_roles_evaluated    INT         NULL,
  run_evaluted_at          DATETIME    NULL,
  profile_id               VARCHAR(50) NULL,
  PRIMARY KEY (run_id),
  CONSTRAINT assessment_run_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profile (profile_id)
);

-- ---------------------------------------------------------------
-- ROLE_ASSESSMENT_RESULT
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_assessment_result (
  role_assessment_result_id    VARCHAR(50)   NOT NULL,
  skill_match_score            DECIMAL(5,2)  NULL,
  experience_match_score       DECIMAL(5,2)  NULL,
  education_match_score        DECIMAL(5,2)  NULL,
  overall_readiness_score      DECIMAL(5,2)  NULL,
  role_readiness_band          VARCHAR(50)   NULL,
  role_assessment_evaluated_at DATETIME      NULL,
  run_id                       VARCHAR(50)   NULL,
  career_role_id               VARCHAR(50)   NULL,
  PRIMARY KEY (role_assessment_result_id),
  CONSTRAINT role_recommendation_result_run_id_fkey       FOREIGN KEY (run_id)        REFERENCES assessment_run (run_id),
  CONSTRAINT role_recommendation_result_career_role_id_fkey FOREIGN KEY (career_role_id) REFERENCES career_role (career_role_id)
);

-- ---------------------------------------------------------------
-- ROLE_RECOMMENDATION
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_recommendation (
  role_recommendation_id          VARCHAR(50)  NOT NULL,
  fit_score                       DECIMAL(5,2) NULL,
  role_recommendation_reason      TEXT         NULL,
  role_recommendation_created_at  DATETIME     NULL,
  run_id                          VARCHAR(50)  NULL,
  career_role_id                  VARCHAR(50)  NULL,
  PRIMARY KEY (role_recommendation_id),
  CONSTRAINT role_recommendation_run_id_fkey FOREIGN KEY (run_id) REFERENCES assessment_run (run_id)
);

-- ---------------------------------------------------------------
-- SKILL_GAP
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skill_gap (
  skill_gap_id                  VARCHAR(50)  NOT NULL,
  skill_gap_current_skill_level TEXT         NULL,
  skill_gap_required_skill_level TEXT        NULL,
  skill_gap_severyity           VARCHAR(255) NULL,
  role_assessment_result_id     VARCHAR(50)  NULL,
  skill_id                      VARCHAR(50)  NULL,
  PRIMARY KEY (skill_gap_id),
  CONSTRAINT skill_gap_role_assessment_result_id_fkey FOREIGN KEY (role_assessment_result_id) REFERENCES role_assessment_result (role_assessment_result_id),
  CONSTRAINT skill_gap_skill_id_fkey                  FOREIGN KEY (skill_id)                  REFERENCES skill (skill_id)
);

-- ---------------------------------------------------------------
-- SEED DATA  (demo account — auto-created on first docker up)
-- email: demo@careercompass.com  /  password: demo123
-- ---------------------------------------------------------------
INSERT IGNORE INTO `user` (user_id, email, password_hash, account_status, created_at)
VALUES (
  'seed-user-001',
  'demo@careercompass.com',
  '$2a$12$byrGDGVa83m5hjewDB/aVuvXk14EuGaBjG5FWfLs1D4zWfLvsahFK',
  'active',
  NOW()
);

INSERT IGNORE INTO profile (profile_id, user_id, first_name, last_name)
VALUES (
  'seed-profile-001',
  'seed-user-001',
  'Demo',
  'User'
);
