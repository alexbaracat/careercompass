const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'skill_gap', 'skill_gap_id', { filterCols: ['role_assessment_result_id', 'skill_id'] });
module.exports = router;
