const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'preferred_role', 'preferred_role_id', { filterCols: ['profile_id', 'career_role_id'] });
module.exports = router;
