/**
 * POST /api/assessment/submit
 *
 * Receives the full assessment form payload, saves everything to the database
 * in one transaction, and returns the new assessment_run_id.
 *
 * Requires: Authorization: Bearer <jwt>
 */
const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool   = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'careerquest_dev_secret_change_in_production';

// ── helpers ────────────────────────────────────────────────────

function errMsg(err) {
  if (!err) return 'Unknown error';
  if (err.sqlMessage)              return err.sqlMessage;
  if (err.message)                 return err.message;
  if (err.errors && err.errors[0]) return errMsg(err.errors[0]);
  return String(err);
}

/** "2024-05" → "2024-05-01"   |  falsy → null */
function toDate(monthStr) {
  if (!monthStr) return null;
  return `${monthStr}-01`;
}

/** Parse GPA string like "3.8 / 4.0" → 3.8  |  out of range → null */
function parseGpa(raw) {
  if (!raw) return null;
  const n = parseFloat(raw.split('/')[0].trim());
  if (isNaN(n) || n < 0 || n > 4.0) return null;
  return n;
}

const DEGREE_MAP = {
  'associate':          'associate',
  "associate's":        'associate',
  "bachelor's":         'bachelor',
  'bachelor':           'bachelor',
  "master's":           'master',
  'master':             'master',
  'doctorate':          'doctorate',
  'phd':                'doctorate',
  'diploma':            'diploma',
  'diploma / certificate': 'diploma',
  'certificate':        'certificate',
  'high_school':        'high_school',
};
function mapDegree(raw = '') {
  return DEGREE_MAP[raw.toLowerCase()] || 'other';
}

const EMP_MAP = {
  'full-time':               'full_time',
  'full_time':               'full_time',
  'part-time':               'part_time',
  'part_time':               'part_time',
  'contract':                'contract',
  'internship':              'internship',
  'freelance':               'freelance',
  'volunteer':               'other',
  'graduate assistantship':  'other',
  'research assistantship':  'other',
};
function mapEmpType(raw = '') {
  return EMP_MAP[raw.toLowerCase()] || 'other';
}

function yesNoBool(val) {
  if (val === 'Yes' || val === true || val === 1) return 1;
  if (val === 'No'  || val === false || val === 0) return 0;
  return null;
}

// ── auth middleware ─────────────────────────────────────────────

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided.' });
  try {
    req.auth = jwt.verify(header.replace('Bearer ', ''), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// ── submit ──────────────────────────────────────────────────────

router.post('/submit', requireAuth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const userId = req.auth.userId;
    const {
      // Section 1 — user details
      form = {},
      // Section 2 — education (array)
      educations = [],
      // Section 3 — target roles (array)
      targetRoles = [],
      // Section 5 — locations (array)
      locations = [],
      // Section 6 — skill blocks (array of { skillCategory, skillRows })
      skillBlocks = [],
      // Section 7 — experience (array)
      experiences = [],
      // Section 8 — projects (array)
      projects = [],
      // Section 9 — certifications (array)
      certifications = [],
      // Section 10 — languages (array)
      languages = [],
    } = req.body;

    // ── 1. Get or create profile ────────────────────────────────
    const [[existingProfile]] = await conn.query(
      'SELECT profile_id FROM profile WHERE user_id = ?', [userId]
    );

    let profileId = existingProfile?.profile_id;

    if (profileId) {
      // ── Clean up previous submission data ──────────────────
      // Delete in dependency order to avoid FK violations
      await conn.query('DELETE FROM assessment_run WHERE profile_id = ?', [profileId]);
      await conn.query('DELETE FROM preferred_role WHERE profile_id = ?', [profileId]);
      await conn.query('DELETE FROM career_role WHERE profile_id = ?', [profileId]);
      // preferred_location has FK to preference, so delete locations first
      const [[pref]] = await conn.query('SELECT preference_id FROM preference WHERE profile_id = ?', [profileId]);
      if (pref) {
        await conn.query('DELETE FROM preferred_location WHERE preference_id = ?', [pref.preference_id]);
      }
      await conn.query('DELETE FROM preference WHERE profile_id = ?', [profileId]);
      await conn.query('DELETE FROM preference_constraint WHERE profile_id = ?', [profileId]);
      // profile_skill depends on skill, skill depends on skill_category
      await conn.query('DELETE FROM profile_skill WHERE profile_id = ?', [profileId]);
      await conn.query(
        'DELETE s FROM skill s JOIN skill_category sc ON s.skill_category_id = sc.skill_category_id WHERE sc.profile_id = ?',
        [profileId]
      );
      await conn.query('DELETE FROM skill_category WHERE profile_id = ?', [profileId]);
      await conn.query('DELETE FROM profile_language WHERE profile_id = ?', [profileId]);
      // education, experience, project, certification cascade on profile DELETE — but since we're not deleting profile, delete explicitly
      await conn.query('DELETE FROM education WHERE profile_id = ?', [profileId]);
      await conn.query('DELETE FROM experience WHERE profile_id = ?', [profileId]);
      await conn.query('DELETE FROM project WHERE profile_id = ?', [profileId]);
      await conn.query('DELETE FROM certification WHERE profile_id = ?', [profileId]);

      // Update profile
      await conn.query(
        `UPDATE profile SET
           first_name = ?, last_name = ?,
           country = ?, state = ?, city = ?,
           total_years_experience = ?,
           current_title = ?
         WHERE profile_id = ?`,
        [
          form.firstName || '', form.lastName || '',
          form.country || 'United States', form.state || '', form.city || '',
          form.totalYearsExperience ? parseFloat(form.totalYearsExperience) : null,
          form.currentTitle || '',
          profileId,
        ]
      );
    } else {
      // Create new profile
      profileId = uuidv4();
      await conn.query(
        `INSERT INTO profile (profile_id, user_id, first_name, last_name, country, state, city, total_years_experience, current_title)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profileId, userId,
          form.firstName || '', form.lastName || '',
          form.country || 'United States', form.state || '', form.city || '',
          form.totalYearsExperience ? parseFloat(form.totalYearsExperience) : null,
          form.currentTitle || '',
        ]
      );
    }

    // ── 2. Education ────────────────────────────────────────────
    for (const edu of educations) {
      if (!edu.degreeName && !edu.institution) continue; // skip empty rows
      await conn.query(
        `INSERT INTO education
           (education_id, profile_id, degree_level, degree_name, major, institution,
            start_year, end_year, gpa, is_current)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(), profileId,
          mapDegree(edu.degreeLevel),
          edu.degreeName || 'N/A',
          edu.major || null,
          edu.institution || 'N/A',
          edu.startYear ? parseInt(edu.startYear) : null,
          edu.endYear   ? parseInt(edu.endYear)   : null,
          parseGpa(edu.gpa),
          yesNoBool(edu.isCurrent) ?? 0,
        ]
      );
    }

    // ── 3. Target roles (career_role + preferred_role) ──────────
    for (const role of targetRoles) {
      if (!role.targetRole) continue;
      const crId = uuidv4();
      await conn.query(
        `INSERT INTO career_role (career_role_id, role_name, role_category, profile_id)
         VALUES (?, ?, ?, ?)`,
        [crId, role.targetRole, role.industry || null, profileId]
      );
      await conn.query(
        `INSERT INTO preferred_role
           (preferred_role_id, preferred_role_created_at, preferred_role_is_active, profile_id, career_role_id)
         VALUES (?, NOW(), 1, ?, ?)`,
        [uuidv4(), profileId, crId]
      );
    }

    // ── 4. Preferences ──────────────────────────────────────────
    const prefId = uuidv4();
    await conn.query(
      `INSERT INTO preference
         (preference_id, salary_expectation_minimum, salary_expectation_maximum,
          willing_to_relocate, willing_to_travel, profile_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        prefId,
        form.salaryMin ? parseInt(form.salaryMin) : null,
        form.salaryMax ? parseInt(form.salaryMax) : null,
        yesNoBool(form.willingToRelocate),
        yesNoBool(form.willingToTravel),
        profileId,
      ]
    );

    await conn.query(
      `INSERT INTO preference_constraint
         (preference_constraint_id, work_authorization, employmemt_type, work_mode, experience_level, profile_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        form.workAuthorization || null,
        form.preferredEmploymentType || null,
        form.workMode || null,
        form.experienceLevel || null,
        profileId,
      ]
    );

    // ── 5. Preferred locations ───────────────────────────────────
    for (const loc of locations) {
      if (!loc.state && !loc.city) continue;
      await conn.query(
        `INSERT INTO preferred_location
           (preferred_location_id, state, city, priority_order, preference_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          loc.state || null,
          loc.city  || null,
          loc.priority ? parseInt(loc.priority) : null,
          prefId,
        ]
      );
    }

    // ── 6. Skills ────────────────────────────────────────────────
    for (const block of skillBlocks) {
      if (!block.skillCategory || !block.skillRows?.length) continue;
      const scId = uuidv4();
      await conn.query(
        `INSERT INTO skill_category (skill_category_id, category_name, profile_id) VALUES (?, ?, ?)`,
        [scId, block.skillCategory, profileId]
      );
      for (const row of block.skillRows) {
        if (!row.skillName) continue;
        const skillId = uuidv4();
        await conn.query(
          `INSERT INTO skill (skill_id, skill_name, skill_type, skill_category_id) VALUES (?, ?, ?, ?)`,
          [skillId, row.skillName, block.skillCategory, scId]
        );
        await conn.query(
          `INSERT INTO profile_skill
             (profile_skill_id, profile_proficiency_level, profile_confidence_level, profile_id, skill_id)
           VALUES (?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            row.proficiencyLevel || null,
            row.confidenceLevel  || null,
            profileId,
            skillId,
          ]
        );
      }
    }

    // ── 7. Experience ────────────────────────────────────────────
    for (const exp of experiences) {
      if (!exp.employerName && !exp.jobTitle) continue;
      await conn.query(
        `INSERT INTO experience
           (experience_id, profile_id, employer_name, job_title, employment_type,
            domain_area, start_date, end_date, is_current)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(), profileId,
          exp.employerName || 'N/A',
          exp.jobTitle     || 'N/A',
          exp.employmentType ? mapEmpType(exp.employmentType) : null,
          exp.industry || null,
          toDate(exp.startDate) || '2020-01-01',
          toDate(exp.endDate)   || null,
          yesNoBool(exp.isCurrent) ?? 0,
        ]
      );
    }

    // ── 8. Projects ──────────────────────────────────────────────
    for (const proj of projects) {
      if (!proj.projectTitle) continue;
      await conn.query(
        `INSERT INTO project
           (project_id, profile_id, project_title, project_domain, organization_name,
            start_date, end_date, outcome_text)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(), profileId,
          proj.projectTitle,
          proj.projectIndustry     || null,
          proj.projectOrganization || null,
          toDate(proj.projectStartDate) || null,
          toDate(proj.projectEndDate)   || null,
          proj.outcome || null,
        ]
      );
    }

    // ── 9. Certifications ────────────────────────────────────────
    for (const cert of certifications) {
      if (!cert.certificationName) continue;
      await conn.query(
        `INSERT INTO certification
           (certification_id, profile_id, certification_name, issuing_organization,
            issue_date, expiration_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(), profileId,
          cert.certificationName,
          cert.issuingOrganization || 'N/A',
          toDate(cert.issueDate) || '2020-01-01',
          toDate(cert.expirationDate) || null,
        ]
      );
    }

    // ── 10. Languages ────────────────────────────────────────────
    for (const lang of languages) {
      if (!lang.languageName) continue;
      await conn.query(
        `INSERT INTO profile_language
           (profile_language_id, language_name, language_proficiency_level, profile_id)
         VALUES (?, ?, ?, ?)`,
        [uuidv4(), lang.languageName, lang.languageProficiency || null, profileId]
      );
    }

    // ── 11. Assessment run ───────────────────────────────────────
    const runId = uuidv4();
    await conn.query(
      `INSERT INTO assessment_run (run_id, run_date, profile_id) VALUES (?, NOW(), ?)`,
      [runId, profileId]
    );

    await conn.commit();

    res.status(201).json({
      success: true,
      runId,
      profileId,
      message: 'Assessment saved successfully.',
    });
  } catch (err) {
    await conn.rollback();
    console.error('[assessment/submit]', err);
    res.status(500).json({ error: errMsg(err) });
  } finally {
    conn.release();
  }
});

module.exports = router;
