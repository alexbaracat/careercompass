const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'profile_language', 'profile_language_id', { filterCols: ['profile_id'] });
module.exports = router;
