const express = require('express');
const router = express.Router();
const { authenticate } = require('../../shared/middleware/auth');
const { clearCacheOnMutation } = require('../../shared/middleware/cache');
const {
    getAllSectors,
    getSectorById,
    createSector,
    updateSector,
    deleteSector,
    calculateCoverage
} = require('./controllers/sector.controller');

router.use(authenticate);

router.get('/', getAllSectors);
router.get('/:id', getSectorById);
router.post('/', clearCacheOnMutation(['/api/datahub', '/api/datahub/all']), createSector);
router.put('/:id', clearCacheOnMutation(['/api/datahub', '/api/datahub/all']), updateSector);
router.delete('/:id', clearCacheOnMutation(['/api/datahub', '/api/datahub/all']), deleteSector);
router.post('/:id/calculate', calculateCoverage);

module.exports = router;
