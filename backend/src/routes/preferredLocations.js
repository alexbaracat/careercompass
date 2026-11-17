const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'preferred_location', 'preferred_location_id', { filterCols: ['preference_id'] });
module.exports = router;
