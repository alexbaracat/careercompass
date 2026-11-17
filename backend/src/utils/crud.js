/**
 * Generic CRUD factory.
 * Creates standard GET-all, GET-one, POST, PUT, DELETE handlers
 * for a given MySQL table.
 *
 * Usage:
 *   const router = require('express').Router();
 *   const { makeCrud } = require('../utils/crud');
 *   makeCrud(router, 'education', 'education_id');
 *   module.exports = router;
 */

const { v4: uuidv4 } = require('uuid');
const pool = require('../db');

// Handles AggregateError (Node 15+), MySQL2 sqlMessage, plain Error
const readErr = (err) =>
  (err && err.sqlMessage) ? err.sqlMessage :
  (err && err.message)    ? err.message    :
  (err && err.errors && err.errors[0]) ? readErr(err.errors[0]) :
  String(err);

/**
 * @param {import('express').Router} router
 * @param {string} table   - MySQL table name
 * @param {string} pkCol   - primary key column name
 * @param {object} [opts]
 * @param {string[]} [opts.filterCols] - columns allowed as query-string filters (e.g. ['profile_id'])
 */
function makeCrud(router, table, pkCol, opts = {}) {
  const { filterCols = [] } = opts;

  // GET all (with optional equality filters from query string)
  router.get('/', async (req, res) => {
    try {
      const conditions = [];
      const values = [];
      for (const col of filterCols) {
        if (req.query[col] !== undefined) {
          conditions.push(`${col} = ?`);
          values.push(req.query[col]);
        }
      }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const [rows] = await pool.query(`SELECT * FROM \`${table}\` ${where}`, values);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: readErr(err) });
    }
  });

  // GET one
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM \`${table}\` WHERE ${pkCol} = ?`,
        [req.params.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: readErr(err) });
    }
  });

  // POST create
  router.post('/', async (req, res) => {
    try {
      const body = { ...req.body };
      if (!body[pkCol]) body[pkCol] = uuidv4();
      const cols = Object.keys(body);
      const placeholders = cols.map(() => '?').join(', ');
      const vals = cols.map(c => body[c]);
      await pool.query(
        `INSERT INTO \`${table}\` (${cols.map(c => `\`${c}\``).join(', ')}) VALUES (${placeholders})`,
        vals
      );
      const [rows] = await pool.query(
        `SELECT * FROM \`${table}\` WHERE ${pkCol} = ?`,
        [body[pkCol]]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: readErr(err) });
    }
  });

  // PUT update
  router.put('/:id', async (req, res) => {
    try {
      const body = { ...req.body };
      delete body[pkCol]; // don't update PK
      if (!Object.keys(body).length) return res.status(400).json({ error: 'No fields to update' });
      const setClause = Object.keys(body).map(c => `\`${c}\` = ?`).join(', ');
      const vals = [...Object.values(body), req.params.id];
      await pool.query(
        `UPDATE \`${table}\` SET ${setClause} WHERE ${pkCol} = ?`,
        vals
      );
      const [rows] = await pool.query(
        `SELECT * FROM \`${table}\` WHERE ${pkCol} = ?`,
        [req.params.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: readErr(err) });
    }
  });

  // DELETE
  router.delete('/:id', async (req, res) => {
    try {
      const [result] = await pool.query(
        `DELETE FROM \`${table}\` WHERE ${pkCol} = ?`,
        [req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ deleted: req.params.id });
    } catch (err) {
      res.status(500).json({ error: readErr(err) });
    }
  });
}

module.exports = { makeCrud };
