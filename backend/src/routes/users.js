const router = require('express').Router();
const { makeCrud } = require('../utils/crud');
makeCrud(router, 'user', 'user_id');
module.exports = router;
