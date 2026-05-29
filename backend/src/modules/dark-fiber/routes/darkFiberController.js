const { rawPool: pool } = require('../../../config/database');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');
const toGeoJSON = require('@mapbox/togeojson');
const AppError = require('../../../shared/utils/AppError');
const asyncHandler = require('../../../shared/utils/asyncHandler');

// Helper to sanitize object keys for JSONB storage
const sanitizeProperties = (props) => {
    if (!props) return {};
    const sanitized = {};
    for (const [key, value] of Object.entries(props)) {
        if (typeof value === 'string') {
            sanitized[key] = value.trim();
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};

/**
 * Extract KML string from either a .kml or .kmz file on disk.
 */
const extractKmlFromFile = (filePath, originalname) => {
    const ext = path.extname(originalname).toLowerCase();

    if (ext === '.kml') {
        return fs.readFileSync(filePath, 'utf8');
    }

    // KMZ = zipped KML
    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries();
    const kmlEntry = zipEntries.find(
        entry => entry.name.toLowerCase().endsWith('.kml')
    );

    if (!kmlEntry) {
        throw new AppError('No KML file found inside the KMZ archive', 400);
    }

    return kmlEntry.getData().toString('utf8');
};

/**
 * Cleanup uploaded temp file from disk
 */
const cleanupFile = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (e) {
        console.warn('Cleanup warning:', e.message);
    }
};

/**
 * POST /api/dark-fiber/import
 * Accepts .kml and .kmz files up to 1GB
 */
exports.importFile = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('No KML/KMZ file provided', 400));
    }

    const { originalname, path: filePath } = req.file;

    let kmlString;
    try {
        kmlString = extractKmlFromFile(filePath, originalname);
    } catch (err) {
        cleanupFile(filePath);
        if (err instanceof AppError) return next(err);
        return next(new AppError('Invalid KML/KMZ file format', 400));
    }

    // Parse KML to GeoJSON
    const kmlDom = new DOMParser().parseFromString(kmlString, 'text/xml');

    // Pre-process KML to preserve folder paths inside Placemarks as <ExtendedData>
    const processKmlNode = (node, currentFolder = '') => {
        const tagName = node.localName || node.tagName;
        let nextFolder = currentFolder;
        
        if (tagName === 'Folder' || tagName === 'Document') {
            let directName = '';
            for (let i = 0; i < node.childNodes.length; i++) {
                const child = node.childNodes[i];
                if (child.nodeType === 1 && (child.localName || child.tagName) === 'name') {
                    directName = child.textContent.trim();
                    break;
                }
            }
            if (directName) {
                if (!directName.toLowerCase().endsWith('.kmz') && !directName.toLowerCase().endsWith('.kml')) {
                    nextFolder = currentFolder ? `${currentFolder}/${directName}` : directName;
                }
            }
        } else if (tagName === 'Placemark') {
            if (currentFolder) {
                let extData = null;
                for (let i = 0; i < node.childNodes.length; i++) {
                    const child = node.childNodes[i];
                    if (child.nodeType === 1 && (child.localName || child.tagName) === 'ExtendedData') {
                        extData = child;
                        break;
                    }
                }
                if (!extData) {
                    extData = kmlDom.createElementNS('http://www.opengis.net/kml/2.2', 'ExtendedData');
                    node.appendChild(extData);
                }
                
                const dataNode = kmlDom.createElementNS('http://www.opengis.net/kml/2.2', 'Data');
                dataNode.setAttribute('name', 'kml_folder');
                const valueNode = kmlDom.createElementNS('http://www.opengis.net/kml/2.2', 'value');
                valueNode.textContent = currentFolder;
                dataNode.appendChild(valueNode);
                extData.appendChild(dataNode);
            }
        }
        
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            if (child.nodeType === 1) { // Element node
                processKmlNode(child, nextFolder);
            }
        }
    };
    
    // Start preprocessing from the root
    processKmlNode(kmlDom);

    const geoJson = toGeoJSON.kml(kmlDom);

    // Free memory from the raw KML string
    kmlString = null;

    if (!geoJson || !geoJson.features || geoJson.features.length === 0) {
        cleanupFile(filePath);
        return next(new AppError('No valid geographical features found', 400));
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Create import record
        const { folderId } = req.body;
        const insertImportSql = `
            INSERT INTO dark_fiber_imports (filename, imported_by, status, folder_id)
            VALUES ($1, $2, 'SUCCESS', $3)
            RETURNING id;
        `;
        const importResult = await client.query(insertImportSql, [
            originalname, req.user?.username || 'System', folderId || null
        ]);
        const importId = importResult.rows[0].id;

        let nodesCount = 0;
        let routesCount = 0;

        const insertNodeSql = `
            INSERT INTO dark_fiber_nodes (import_id, name, type, geom, properties)
            VALUES ($1, $2, $3, ST_Force2D(ST_SetSRID(ST_GeomFromGeoJSON($4), 4326)), $5)
        `;
        const insertRouteSql = `
            INSERT INTO dark_fiber_routes (import_id, name, geom, properties)
            VALUES ($1, $2, ST_Force2D(ST_SetSRID(ST_GeomFromGeoJSON($3), 4326)), $4)
        `;

        // Batch insert in chunks for large files
        const BATCH_SIZE = 100;
        let batch = [];

        const flushBatch = async () => {
            for (const op of batch) {
                await client.query(op.sql, op.params);
            }
            batch = [];
        };

        for (const feature of geoJson.features) {
            if (!feature.geometry) continue;

            const props = sanitizeProperties(feature.properties);
            const name = props.name || 'Unnamed Feature';
            const geom = JSON.stringify(feature.geometry);

            if (feature.geometry.type === 'Point') {
                let type = 'Customer';
                if (name.toUpperCase().includes('POP') || name.toUpperCase().includes('NODE')) {
                    type = 'POP';
                }
                batch.push({ sql: insertNodeSql, params: [importId, name, type, geom, props] });
                nodesCount++;
            } else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
                batch.push({ sql: insertRouteSql, params: [importId, name, geom, props] });
                routesCount++;
            }

            if (batch.length >= BATCH_SIZE) {
                await flushBatch();
            }
        }

        // Flush remaining
        if (batch.length > 0) {
            await flushBatch();
        }

        // Automatically deduplicate exact overlapping geometries from this import batch
        await client.query(`
            DELETE FROM dark_fiber_routes a
            USING dark_fiber_routes b
            WHERE ST_Equals(a.geom, b.geom) 
              AND a.import_id = $1
              AND b.import_id = $1
              AND a.id > b.id;
        `, [importId]);

        await client.query(`
            DELETE FROM dark_fiber_nodes a
            USING dark_fiber_nodes b
            WHERE ST_Equals(a.geom, b.geom) 
              AND a.import_id = $1
              AND b.import_id = $1
              AND a.id > b.id;
        `, [importId]);

        await client.query('COMMIT');

        // Cleanup temp file after successful import
        cleanupFile(filePath);

        res.status(200).json({
            status: 'success',
            message: `Successfully imported ${originalname}`,
            data: { importId, nodesAnalyzed: nodesCount, routesAnalyzed: routesCount }
        });

    } catch (err) {
        await client.query('ROLLBACK');
        cleanupFile(filePath);
        console.error('Import Error:', err);
        return next(new AppError('Failed to process geometry data into database', 500));
    } finally {
        client.release();
    }
});

/**
 * GET /api/dark-fiber/data
 * Returns all nodes & routes as GeoJSON FeatureCollections
 */
exports.getDarkFiberData = asyncHandler(async (req, res, next) => {
    const client = await pool.connect();
    
    try {
        const { folderId } = req.query;
        const folderIdVal = folderId ? parseInt(folderId) : null;

        const nodesQuery = `
            SELECT n.id, n.import_id, n.name, n.type, n.properties,
                   ST_AsGeoJSON(n.geom)::json AS geometry
            FROM dark_fiber_nodes n
            JOIN dark_fiber_imports i ON n.import_id = i.id
            WHERE i.is_deleted = false
            AND ($1::int IS NULL OR i.folder_id = $1 OR i.folder_id IN (SELECT id FROM dark_fiber_folders WHERE parent_id = $1))
        `;
        const nodesResult = await client.query(nodesQuery, [folderIdVal]);
        
        const nodeFeatures = nodesResult.rows.map(row => ({
            type: 'Feature',
            geometry: row.geometry,
            properties: {
                ...row.properties,
                id: row.id,
                import_id: row.import_id,
                name: row.name,
                type: row.type
            }
        }));

        const routesQuery = `
    SELECT r.id, r.import_id, r.name, r.properties,
           ST_AsGeoJSON(ST_Force2D(r.geom))::json AS geometry
    FROM dark_fiber_routes r
    JOIN dark_fiber_imports i ON r.import_id = i.id
    WHERE i.is_deleted = false
    AND ($1::int IS NULL OR i.folder_id = $1 OR i.folder_id IN (SELECT id FROM dark_fiber_folders WHERE parent_id = $1))
`;
const routesResult = await client.query(routesQuery, [folderIdVal]);

        const routeFeatures = routesResult.rows.map(row => ({
            type: 'Feature',
            geometry: row.geometry,
            properties: {
                ...row.properties,
                id: row.id,
                import_id: row.import_id,
                name: row.name
            }
        }));

        console.log('Sending nodes:', nodeFeatures.length, 'routes:', routeFeatures.length);
        res.status(200).json({
            status: 'success',
            data: {
                nodes: { type: 'FeatureCollection', features: nodeFeatures },
                routes: { type: 'FeatureCollection', features: routeFeatures }
            }
        });

    } catch (err) {
        console.error('Data Fetch Error:', err);
        return next(new AppError('Failed to fetch dark fiber network data', 500));
    } finally {
        client.release();
    }
});

/**
 * GET /api/dark-fiber/imports
 * Returns list of all imports
 */
exports.getImports = asyncHandler(async (req, res, next) => {
    const { folderId } = req.query;
    const folderIdVal = folderId ? parseInt(folderId) : null;

    const result = await pool.query(`
        SELECT id, filename, imported_by, upload_date AS imported_at, status
        FROM dark_fiber_imports
        WHERE is_deleted = false
        AND ($1::int IS NULL OR folder_id = $1 OR folder_id IN (SELECT id FROM dark_fiber_folders WHERE parent_id = $1))
        ORDER BY upload_date DESC
    `, [folderIdVal]);
    
    res.status(200).json({
        status: 'success',
        data: result.rows
    });
});

/**
 * DELETE /api/dark-fiber/import/:id
 */
exports.deleteImport = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    // Soft delete
    await pool.query('UPDATE dark_fiber_imports SET is_deleted = true WHERE id = $1', [id]);
    
    res.status(200).json({
        status: 'success',
        message: 'Import moved to Recycle Bin'
    });
});

/**
 * DELETE /api/dark-fiber/node/:id
 */
exports.deleteNode = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    await pool.query('DELETE FROM dark_fiber_nodes WHERE id = $1', [id]);
    res.status(200).json({ status: 'success', message: 'Node deleted successfully' });
});

/**
 * DELETE /api/dark-fiber/route/:id
 */
exports.deleteRoute = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    await pool.query('DELETE FROM dark_fiber_routes WHERE id = $1', [id]);
    res.status(200).json({ status: 'success', message: 'Fiber route deleted successfully' });
});

/**
 * POST /api/dark-fiber/node
 * Create a node manually
 */
exports.createNode = asyncHandler(async (req, res, next) => {
    const { name, type, geometry, properties, folderId } = req.body;
    
    if (!name || !type || !geometry || !folderId) {
        return next(new AppError('Missing required fields', 400));
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Check for an ACTIVE manual import batch
        let importId = null;
        const manualImportQuery = await client.query(
            `SELECT id FROM dark_fiber_imports WHERE folder_id = $1 AND filename = 'Manual Additions' AND is_deleted = false LIMIT 1`, 
            [folderId]
        );
        
        if (manualImportQuery.rows.length > 0) {
            importId = manualImportQuery.rows[0].id;
        } else {
            const createImport = await client.query(
                `INSERT INTO dark_fiber_imports (filename, imported_by, status, folder_id) VALUES ('Manual Additions', $1, 'SUCCESS', $2) RETURNING id`, 
                [req.user?.username || 'System', folderId]
            );
            importId = createImport.rows[0].id;
        }

        const insertSql = `
            INSERT INTO dark_fiber_nodes (import_id, name, type, geom, properties)
            VALUES ($1, $2, $3, ST_Force2D(ST_SetSRID(ST_GeomFromGeoJSON($4), 4326)), $5)
            RETURNING id
        `;
        const result = await client.query(insertSql, [importId, name, type, JSON.stringify(geometry), sanitizeProperties(properties)]);
        
        await client.query('COMMIT');
        
        res.status(201).json({
            status: 'success',
            message: 'Node created successfully',
            data: { id: result.rows[0].id }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Create Node Error:', err);
        return next(new AppError('Failed to create node', 500));
    } finally {
        client.release();
    }
});

/**
 * PUT /api/dark-fiber/route/:id/geometry
 * Update geometry of a route
 */
exports.updateRouteGeometry = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { geometry } = req.body;

    if (!geometry) {
        return next(new AppError('Missing geometry data', 400));
    }

    // Validate coordinates exist
    if (!geometry.coordinates || geometry.coordinates.length < 2) {
        return next(new AppError('Route must have at least 2 coordinates', 400));
    }

    const result = await pool.query(
        `UPDATE dark_fiber_routes 
         SET geom = ST_Force2D(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326))
         WHERE id = $2
         RETURNING id, ST_AsGeoJSON(ST_Force2D(geom))::json AS geometry`,
        [JSON.stringify(geometry), id]
    );

    if (result.rows.length === 0) {
        return next(new AppError('Route not found', 404));
    }

    // Return the saved geometry so frontend can verify
    res.status(200).json({
        status: 'success',
        message: 'Route geometry updated successfully',
        data: {
            id: result.rows[0].id,
            geometry: result.rows[0].geometry
        }
    });
});

/**
 * POST /api/dark-fiber/route
 * Create a route manually
 */
exports.createRoute = asyncHandler(async (req, res, next) => {
    const { name, geometry, properties, folderId } = req.body;
    
    if (!name || !geometry || !folderId) {
        return next(new AppError('Missing required fields', 400));
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Check for an ACTIVE manual import batch
        let importId = null;
        const manualImportQuery = await client.query(
            `SELECT id FROM dark_fiber_imports WHERE folder_id = $1 AND filename = 'Manual Additions' AND is_deleted = false LIMIT 1`, 
            [folderId]
        );
        
        if (manualImportQuery.rows.length > 0) {
            importId = manualImportQuery.rows[0].id;
        } else {
            const createImport = await client.query(
                `INSERT INTO dark_fiber_imports (filename, imported_by, status, folder_id) VALUES ('Manual Additions', $1, 'SUCCESS', $2) RETURNING id`, 
                [req.user?.username || 'System', folderId]
            );
            importId = createImport.rows[0].id;
        }

        const insertSql = `
            INSERT INTO dark_fiber_routes (import_id, name, geom, properties)
            VALUES ($1, $2, ST_Force2D(ST_SetSRID(ST_GeomFromGeoJSON($3), 4326)), $4)
            RETURNING id
        `;
        const result = await client.query(insertSql, [importId, name, JSON.stringify(geometry), sanitizeProperties(properties)]);
        
        await client.query('COMMIT');
        
        res.status(201).json({
            status: 'success',
            message: 'Route created successfully',
            data: { id: result.rows[0].id }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Create Route Error:', err);
        return next(new AppError('Failed to create route', 500));
    } finally {
        client.release();
    }
});

/**
 * PUT /api/dark-fiber/route/:id/properties
 * Update properties of a route
 */
exports.updateRouteProperties = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { properties } = req.body;

    if (!properties) {
        return next(new AppError('Missing properties data', 400));
    }

    const result = await pool.query(
        `UPDATE dark_fiber_routes 
         SET properties = $1
         WHERE id = $2
         RETURNING id, properties`,
        [sanitizeProperties(properties), id]
    );

    if (result.rows.length === 0) {
        return next(new AppError('Route not found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Route properties updated successfully',
        data: result.rows[0]
    });
});

/**
 * PUT /api/dark-fiber/node/:id/properties
 * Update properties of a node
 */
exports.updateNodeProperties = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { properties } = req.body;

    if (!properties) {
        return next(new AppError('Missing properties data', 400));
    }

    const result = await pool.query(
        `UPDATE dark_fiber_nodes 
         SET properties = $1
         WHERE id = $2
         RETURNING id, properties`,
        [sanitizeProperties(properties), id]
    );

    if (result.rows.length === 0) {
        return next(new AppError('Node not found', 404));
    }

    res.status(200).json({
        status: 'success',
        message: 'Node properties updated successfully',
        data: result.rows[0]
    });
});
