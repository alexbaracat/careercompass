const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool    = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'careerquest_dev_secret_change_in_production';
const JWT_EXPIRES = '7d';

// Extract a readable message from any error type (handles AggregateError, MySQL2, plain Error)
function errMsg(err) {
  if (!err) return 'Unknown error';
  if (err.sqlMessage)                              return err.sqlMessage;
  if (err.message)                                 return err.message;
  if (err.errors && err.errors[0])                 return errMsg(err.errors[0]);
  return String(err);
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const [existing] = await pool.query('SELECT user_id FROM "user" WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'An account with this email already exists.' });

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO "user" (user_id, email, password_hash, account_status) VALUES (?, ?, ?, 'active')`,
      [userId, email, passwordHash]
    );

    // Create profile if name provided
    if (firstName || lastName) {
      const profileId = uuidv4();
      await pool.query(
        `INSERT INTO profile (profile_id, user_id, first_name, last_name) VALUES (?, ?, ?, ?)`,
        [profileId, userId, firstName || '', lastName || '']
      );
    }

    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.status(201).json({ token, user: { userId, email, firstName, lastName } });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ error: errMsg(err) });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const [rows] = await pool.query(
      `SELECT u.user_id, u.email, u.password_hash, u.account_status,
              p.first_name, p.last_name, p.profile_id
       FROM "user" u
       LEFT JOIN profile p ON p.user_id = u.user_id
       WHERE u.email = ?`,
      [email]
    );

    if (!rows.length) return res.status(401).json({ error: 'Invalid email or password.' });

    const user = rows[0];
    if (user.account_status === 'suspended' || user.account_status === 'deleted') {
      return res.status(403).json({ error: 'This account is not active.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password.' });

    // Update last_login_at
    await pool.query('UPDATE "user" SET last_login_at = datetime(\'now\') WHERE user_id = ?', [user.user_id]);

    const token = jwt.sign({ userId: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        profileId: user.profile_id || null,
      }
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: errMsg(err) });
  }
});

// GET /api/auth/me  (verify token + return user info)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided.' });
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);

    const [rows] = await pool.query(
      `SELECT u.user_id, u.email, u.account_status,
              p.first_name, p.last_name, p.profile_id
       FROM "user" u
       LEFT JOIN profile p ON p.user_id = u.user_id
       WHERE u.user_id = ?`,
      [decoded.userId]
    );
    if (!rows.length) return res.status(401).json({ error: 'User not found.' });

    const user = rows[0];
    res.json({
      userId: user.user_id,
      email: user.email,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      profileId: user.profile_id || null,
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

module.exports = router;
