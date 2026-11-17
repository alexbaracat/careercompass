const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'skill', 'skill_id', { filterCols: ['skill_category_id'] });
module.exports = router;
