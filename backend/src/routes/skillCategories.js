const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'skill_category', 'skill_category_id', { filterCols: ['profile_id'] });
module.exports = router;
