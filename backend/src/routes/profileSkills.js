const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'profile_skill', 'profile_skill_id', { filterCols: ['profile_id', 'skill_id'] });
module.exports = router;
