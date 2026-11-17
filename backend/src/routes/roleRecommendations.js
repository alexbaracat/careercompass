const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'role_recommendation', 'role_recommendation_id', { filterCols: ['run_id', 'career_role_id'] });
module.exports = router;
