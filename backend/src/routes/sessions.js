const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'session_log', 'session_id', { filterCols: ['user_id'] });
module.exports = router;
