const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'experience', 'experience_id', { filterCols: ['profile_id'] });
module.exports = router;
