const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'education', 'education_id', { filterCols: ['profile_id'] });
module.exports = router;
