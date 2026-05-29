const express = require('express');
const router = express.Router();
const { authenticate } = require('../../shared/middleware/auth');
const { getAllPublishedBoundaries } = require('./boundary-public.controller');

router.use(authenticate);

// Get published boundaries (All auth users)
router.get('/published', getAllPublishedBoundaries);

module.exports = router;
