const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'assessment_run', 'run_id', { filterCols: ['profile_id'] });
module.exports = router;
