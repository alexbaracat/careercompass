const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'preference_constraint', 'preference_constraint_id', { filterCols: ['profile_id'] });
module.exports = router;
