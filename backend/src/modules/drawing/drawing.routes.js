const express = require('express');
const router = express.Router();

router.use('/polygon', require('./polygon.routes'));
router.use('/circle', require('./circle.routes'));

module.exports = router;
