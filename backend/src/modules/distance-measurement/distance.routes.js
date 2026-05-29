const express = require('express');
const router = express.Router();
const { authenticate } = require('../../shared/middleware/auth');
const {
  getAllMeasurements,
  getMeasurementById,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement
} = require('./controllers/distance.controller');

router.use(authenticate);

router.get('/', getAllMeasurements);
router.get('/:id', getMeasurementById);
router.post('/', createMeasurement);
router.put('/:id', updateMeasurement);
router.delete('/:id', deleteMeasurement);

module.exports = router;
