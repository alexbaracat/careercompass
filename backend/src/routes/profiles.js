const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'profile', 'profile_id', { filterCols: ['user_id'] });
module.exports = router;
