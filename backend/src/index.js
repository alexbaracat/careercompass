require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const pool    = require('./db');

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', db: err.message });
  }
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',                   require('./routes/auth'));
app.use('/api/user',                   require('./routes/userProfile'));
app.use('/api/assessment',             require('./routes/assessmentSubmit'));
app.use('/api/users',                  require('./routes/users'));
app.use('/api/profiles',               require('./routes/profiles'));
app.use('/api/sessions',               require('./routes/sessions'));
app.use('/api/education',              require('./routes/education'));
app.use('/api/experience',             require('./routes/experience'));
app.use('/api/certifications',         require('./routes/certifications'));
app.use('/api/skill-categories',       require('./routes/skillCategories'));
app.use('/api/skills',                 require('./routes/skills'));
app.use('/api/profile-skills',         require('./routes/profileSkills'));
app.use('/api/profile-languages',      require('./routes/profileLanguages'));
app.use('/api/projects',               require('./routes/projects'));
app.use('/api/career-roles',           require('./routes/careerRoles'));
app.use('/api/role-skill-requirements', require('./routes/roleSkillRequirements'));
app.use('/api/preferences',            require('./routes/preferences'));
app.use('/api/preference-constraints', require('./routes/preferenceConstraints'));
app.use('/api/preferred-locations',    require('./routes/preferredLocations'));
app.use('/api/preferred-roles',        require('./routes/preferredRoles'));
app.use('/api/assessment-runs',        require('./routes/assessmentRuns'));
app.use('/api/role-assessment-results', require('./routes/roleAssessmentResults'));
app.use('/api/role-recommendations',   require('./routes/roleRecommendations'));
app.use('/api/skill-gaps',             require('./routes/skillGaps'));

// ── 404 fallback ──────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`CareerQuest API listening on http://localhost:${PORT}`);
});
