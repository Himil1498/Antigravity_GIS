const express = require('express');
const router = express.Router();
const { authenticate } = require('../../shared/middleware/auth');
const {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  calculateElevation
} = require('./controllers/elevation.controller');

router.use(authenticate);

// Primary endpoints
router.get('/', getAllProfiles);
router.get('/:id', getProfileById);
router.post('/', createProfile);
router.put('/:id', updateProfile);
router.delete('/:id', deleteProfile);

// Legacy endpoints support (mapped to same controllers)
router.get('/profiles', getAllProfiles);
router.get('/profiles/:id', getProfileById);
router.post('/profiles', createProfile);
router.put('/profiles/:id', updateProfile);
router.delete('/profiles/:id', deleteProfile);
router.post('/calculate', calculateElevation);

module.exports = router;
