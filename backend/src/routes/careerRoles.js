const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'career_role', 'career_role_id', { filterCols: ['profile_id'] });
module.exports = router;
