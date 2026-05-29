const { pool } = require('../../../config/database');
const AppError = require('../../../shared/utils/AppError');
const asyncHandler = require('../../../shared/utils/asyncHandler');

/**
 * Get all dark fiber folders
 */
exports.getFolders = asyncHandler(async (req, res, next) => {
    const [rows] = await pool.query(`
        WITH RECURSIVE folder_tree AS (
            -- Base case: find all root folders (Airtel, BSNL, etc.)
            SELECT id, name, created_at, parent_id
            FROM dark_fiber_folders
            WHERE parent_id IS NULL AND is_deleted = false
            
            UNION ALL
            
            -- Recursive step: find all children (Regions)
            SELECT f.id, f.name, f.created_at, f.parent_id
            FROM dark_fiber_folders f
            INNER JOIN folder_tree ft ON f.parent_id = ft.id
            WHERE f.is_deleted = false
        )
        SELECT * FROM folder_tree ORDER BY parent_id ASC NULLS FIRST, name ASC;
    `);

    res.status(200).json({
        status: 'success',
        data: rows
    });
});

/**
 * Create a new folder
 */
exports.createFolder = asyncHandler(async (req, res, next) => {
    const { name, parentId } = req.body;

    if (!name) {
        return next(new AppError('Folder name is required', 400));
    }

    const targetParentId = parentId || null;

    const [rows] = await pool.query(`
        INSERT INTO dark_fiber_folders (name, parent_id) 
        VALUES ($1, $2) 
        RETURNING id, name, created_at, parent_id
    `, [name, targetParentId]);

    res.status(201).json({
        status: 'success',
        data: rows[0]
    });
});

/**
 * Update a folder name
 */
exports.updateFolder = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!id || !name) {
        return next(new AppError('Folder ID and new name are required', 400));
    }

    const [result] = await pool.query(
        'UPDATE dark_fiber_folders SET name = $1 WHERE id = $2 RETURNING id, name',
        [name, id]
    );

    if (result.length === 0) {
        return next(new AppError('Folder not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: result[0]
    });
});

/**
 * Delete a folder (soft delete)
 */
exports.deleteFolder = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new AppError('Folder ID is required', 400));
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Cascade soft-delete down the tree
        await client.query(`
            WITH RECURSIVE descendants AS (
              SELECT id FROM dark_fiber_folders WHERE id = $1
              UNION ALL
              SELECT f.id FROM dark_fiber_folders f
              JOIN descendants d ON f.parent_id = d.id
            )
            UPDATE dark_fiber_folders 
            SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP 
            WHERE id IN (SELECT id FROM descendants)
        `, [id]);

        await client.query('COMMIT');
        
        res.status(200).json({
            status: 'success',
            message: 'Folder and its contents moved to recycle bin'
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("DELETE FOLDER ERROR:", err);
        return next(new AppError('Failed to delete folder: ' + err.message, 500));
    } finally {
        client.release();
    }
});

/**
 * Get items in recycle bin
 */
exports.getRecycleBin = asyncHandler(async (req, res, next) => {
    // Return soft-deleted folders and imports
    const [folders] = await pool.query(`
        SELECT id, name, deleted_at, 'folder' as type
        FROM dark_fiber_folders
        WHERE is_deleted = true
        ORDER BY deleted_at DESC
    `);

    const [files] = await pool.query(`
        SELECT id, filename as name, deleted_at, 'file' as type
        FROM dark_fiber_imports
        WHERE is_deleted = true
        ORDER BY deleted_at DESC
    `);

    res.status(200).json({
        status: 'success',
        data: [...folders, ...files].sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at))
    });
});

/**
 * Restore an item from recycle bin
 */
exports.restoreItem = asyncHandler(async (req, res, next) => {
    const { type, id } = req.params;
    
    if (type === 'folder') {
        await pool.query('UPDATE dark_fiber_folders SET is_deleted = false, deleted_at = NULL WHERE id = $1', [id]);
    } else if (type === 'file') {
        await pool.query('UPDATE dark_fiber_imports SET is_deleted = false, deleted_at = NULL WHERE id = $1', [id]);
    }

    res.status(200).json({ status: 'success' });
});

/**
 * Permanently delete an item
 */
exports.permanentDelete = asyncHandler(async (req, res, next) => {
    const { type, id } = req.params;

    if (type === 'folder') {
        await pool.query('DELETE FROM dark_fiber_folders WHERE id = $1', [id]);
    } else if (type === 'file') {
        await pool.query('DELETE FROM dark_fiber_imports WHERE id = $1', [id]);
    }

    res.status(200).json({ status: 'success' });
});
