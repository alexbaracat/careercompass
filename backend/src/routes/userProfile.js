'use strict';
const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool    = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'careerquest_dev_secret_change_in_production';

function errMsg(err) {
  if (!err) return 'Unknown error';
  if (err.sqlMessage)          return err.sqlMessage;
  if (err.message)             return err.message;
  if (err.errors && err.errors[0]) return errMsg(err.errors[0]);
  return String(err);
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided.' });
  try {
    req.user = jwt.verify(header.replace('Bearer ', ''), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// ── GET /api/user/profile ────────────────────────────────────────────────────
// Returns profile row + preference + preference_constraint (for Settings page)
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*,
              pc.work_authorization, pc.employmemt_type, pc.work_mode, pc.experience_level,
              pref.salary_expectation_minimum, pref.salary_expectation_maximum,
              pref.willing_to_relocate, pref.willing_to_travel
       FROM profile p
       LEFT JOIN preference_constraint pc   ON pc.profile_id   = p.profile_id
       LEFT JOIN preference pref            ON pref.profile_id  = p.profile_id
       WHERE p.user_id = ?`,
      [req.user.userId]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error('[GET /user/profile]', err);
    res.status(500).json({ error: errMsg(err) });
  }
});

// ── PUT /api/user/profile ────────────────────────────────────────────────────
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, phoneNumber, country, state, city } = req.body;

    const [existing] = await pool.query(
      'SELECT profile_id FROM profile WHERE user_id = ?',
      [req.user.userId]
    );

    if (existing.length) {
      await pool.query(
        `UPDATE profile
         SET first_name = ?, last_name = ?, date_of_birth = ?,
             phone_number = ?, country = ?, state = ?, city = ?,
             updated_at = datetime('now')
         WHERE user_id = ?`,
        [
          firstName   || '',
          lastName    || '',
          dateOfBirth || null,
          phoneNumber || null,
          country     || null,
          state       || null,
          city        || null,
          req.user.userId,
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO profile
           (profile_id, user_id, first_name, last_name, date_of_birth, phone_number, country, state, city)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          req.user.userId,
          firstName   || '',
          lastName    || '',
          dateOfBirth || null,
          phoneNumber || null,
          country     || null,
          state       || null,
          city        || null,
        ]
      );
    }

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('[PUT /user/profile]', err);
    res.status(500).json({ error: errMsg(err) });
  }
});

// ── PUT /api/user/password ───────────────────────────────────────────────────
router.put('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Both current and new password are required.' });
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });

    const [rows] = await pool.query(
      'SELECT password_hash FROM "user" WHERE user_id = ?',
      [req.user.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });

    const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!match) return res.status(401).json({ error: 'Current password is incorrect.' });

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      `UPDATE "user" SET password_hash = ?, updated_at = datetime('now') WHERE user_id = ?`,
      [newHash, req.user.userId]
    );

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('[PUT /user/password]', err);
    res.status(500).json({ error: errMsg(err) });
  }
});

module.exports = router;
