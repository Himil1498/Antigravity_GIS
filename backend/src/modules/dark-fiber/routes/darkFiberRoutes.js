const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, checkPermission } = require('../../../shared/middleware/auth');

// Disk storage for large KML/KMZ files (up to 1GB)
const uploadDir = path.join(__dirname, '../../../../uploads/dark-fiber');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ 
    storage: multer.diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
            const uniqueName = `${Date.now()}-${file.originalname}`;
            cb(null, uniqueName);
        }
    }),
    limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB Limit
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.kmz' || ext === '.kml') {
            cb(null, true);
        } else {
            cb(new Error('Only .kml and .kmz files are allowed'), false);
        }
    }
});

const darkFiberController = require('./darkFiberController');

// Define Routes
router.post(
    '/import',
    authenticate,
    checkPermission('darkfiber:view'),
    upload.single('file'),
    darkFiberController.importFile
);

router.get(
    '/data',
    authenticate,
    checkPermission('darkfiber:view'),
    darkFiberController.getDarkFiberData
);

router.get(
    '/imports',
    authenticate,
    checkPermission('darkfiber:view'),
    darkFiberController.getImports
);

router.delete(
    '/import/:id',
    authenticate,
    checkPermission('darkfiber:view'),
    darkFiberController.deleteImport
);

router.delete(
    '/node/:id',
    authenticate,
    checkPermission('darkfiber:view'),
    darkFiberController.deleteNode
);

router.delete(
    '/route/:id',
    authenticate,
    checkPermission('darkfiber:view'),
    darkFiberController.deleteRoute
);

router.post(
    '/node',
    authenticate,
    checkPermission('darkfiber:view'),
    darkFiberController.createNode
);

router.post(
    '/route',
    authenticate,
    checkPermission('darkfiber:view'),
    darkFiberController.createRoute
);

router.put(
    '/route/:id/geometry',
    authenticate,
    checkPermission('darkfiber:view'),
    darkFiberController.updateRouteGeometry
);

router.put(
    '/route/:id/properties',
    authenticate,
    checkPermission('darkfiber:view'),
    darkFiberController.updateRouteProperties
);

router.put(
    '/node/:id/properties',
    authenticate,
    checkPermission('darkfiber:view'),
    darkFiberController.updateNodeProperties
);

module.exports = router;
