const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'role_skill_requirement', 'role_skill_requirement_id', { filterCols: ['career_role_id', 'skill_id'] });
module.exports = router;
