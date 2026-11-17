const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'project', 'project_id', { filterCols: ['profile_id'] });
module.exports = router;
