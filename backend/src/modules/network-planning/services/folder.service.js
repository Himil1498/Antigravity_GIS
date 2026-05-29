const { pool, prisma } = require("../../../config/database");
const catalogService = require("./catalog.service");class FolderService {
  /**
   * Resolve a folder name/path to its database ID
   * Looks up root-level folders by name (case-insensitive)
   * @param {string} path - Folder name (e.g. "Customer", "Infrastructure")
   * @returns {number|null} - Folder ID or null if not found
   */
  async getFolderIdByPath(path) {
    if (!path) return null;
    const folder = await prisma.network_folders.findFirst({
      where: {
        name: { equals: path.trim(), mode: "insensitive" },
        parent_id: null,
        deleted_at: null,
      },
      select: { id: true },
    });
    return folder ? folder.id : null;
  }

  /**
   * Get contents of a folder (subfolders and files)
   * @param {number|null} parentId - null for root
   */
  async getFolderContents(
    parentId,
    userId,
    role,
    includeApprovedOutcomes = false,
    accessType = 'view'
  ) {
    let folderQueryStr;
    let fileQueryStr;
    let queryParams = [];
    const isAdmin = role === "admin" || role === "Admin";

    // Filter Logic for Files
    let outcomeFilter = "";
    if (!includeApprovedOutcomes) {
      outcomeFilter =
        "AND (properties->>'is_outcome' IS NULL OR properties->>'is_outcome' != 'true')";
    }

    // ── Indian States list (used for both count scoping AND folder visibility) ──
    const INDIAN_STATES = [
      'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
      'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka',
      'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
      'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu',
      'telangana', 'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal',
      'andaman and nicobar islands', 'chandigarh', 'dadra and nagar haveli and daman and diu',
      'delhi', 'jammu and kashmir', 'ladakh', 'lakshadweep', 'puducherry'
    ];

    // ── Pre-fetch assigned regions for non-admin users (used in count + visibility) ──
    let assignedRegions = [];
    let regionDescendantFilter = '';     // for featureCountSubquery (uses alias "child")
    let regionDescendantFilter2 = '';    // for statusCountsSubquery (uses alias "c2")

    if (!isAdmin && userId) {
      try {
        const userRegionsRows = await prisma.$queryRaw`
          SELECT r.name FROM regions r JOIN user_regions ur ON r.id = ur.region_id WHERE ur.user_id = ${parseInt(userId, 10)}
        `;
        assignedRegions = userRegionsRows.map(r => r.name.toLowerCase().trim());

        // Build SQL filter to exclude state-named folders user is NOT assigned to
        const statesSql = INDIAN_STATES.map(s => `'${s.replace(/'/g, "''")}'`).join(',');

        if (assignedRegions.length > 0) {
          const regionsSql = assignedRegions.map(r => `'${r.replace(/'/g, "''")}'`).join(',');
          regionDescendantFilter = `AND (LOWER(child.name) NOT IN (${statesSql}) OR LOWER(child.name) IN (${regionsSql}))`;
          regionDescendantFilter2 = `AND (LOWER(c2.name) NOT IN (${statesSql}) OR LOWER(c2.name) IN (${regionsSql}))`;
        } else {
          // No regions assigned: exclude ALL state folders from counts
          regionDescendantFilter = `AND LOWER(child.name) NOT IN (${statesSql})`;
          regionDescendantFilter2 = `AND LOWER(c2.name) NOT IN (${statesSql})`;
        }
      } catch (e) {
        console.error("Failed to pre-fetch user regions for count scoping:", e);
      }
    }

    // Role-based Access Control for Folders
    let accessJoin = "";
    let accessWhere = "";

    if (!isAdmin && userId) {
      // Fetch Role-based Folder IDs
      let roleFolderIds = [];
      if (role) {
        try {
           const roleRows = await prisma.$queryRaw`SELECT default_folder_ids FROM roles WHERE name = ${role}`;
           if (roleRows.length > 0 && Array.isArray(roleRows[0].default_folder_ids)) {
               roleFolderIds = roleRows[0].default_folder_ids;
           }
        } catch (e) {
            console.error("Failed to fetch role folders", e);
        }
      }
      
      const roleIdsString = roleFolderIds.length > 0 ? roleFolderIds.join(',') : null;
      const roleUnion = roleIdsString 
          ? `UNION SELECT f.id, f.parent_id FROM network_folders f WHERE f.id IN (${roleIdsString}) AND f.deleted_at IS NULL`
          : "";

      accessJoin = `
        INNER JOIN (
          WITH RECURSIVE 
          -- Base: Explicit Assignments + Role Defaults + Created By User
          assigned_base AS (
            SELECT f.id, f.parent_id
            FROM network_folders f
            JOIN ${accessType === 'add' ? 'user_folder_add_access' : 'user_folder_access'} ufa ON f.id = ufa.folder_id
            WHERE ufa.user_id = ${userId} AND f.deleted_at IS NULL
            
            UNION
            
            SELECT f.id, f.parent_id
            FROM network_folders f
            WHERE f.created_by = ${userId} AND f.deleted_at IS NULL
            
            ${accessType !== 'add' ? roleUnion : ''}
          ),
          
          -- Walk UP (Parents)
          ancestors AS (
            SELECT id, parent_id FROM assigned_base
            UNION
            SELECT p.id, p.parent_id
            FROM network_folders p
            JOIN ancestors a ON a.parent_id = p.id
            WHERE p.deleted_at IS NULL
          ),

          -- Walk DOWN (Children)
          descendants AS (
            SELECT id, parent_id FROM assigned_base
            UNION
            SELECT c.id, c.parent_id
            FROM network_folders c
            JOIN descendants d ON d.id = c.parent_id
            WHERE c.deleted_at IS NULL
          )

          -- Combine all visible IDs
          SELECT id FROM ancestors
          UNION
          SELECT id FROM descendants
        ) visible_folders ON f.id = visible_folders.id
      `;
      accessWhere = "";
    }

    // ── Count subqueries — scoped by region for non-admin users ──
    const featureCountSubquery = `
      (SELECT COALESCE(SUM(nf_inner.feature_count), 0) FROM network_files nf_inner WHERE nf_inner.deleted_at IS NULL AND nf_inner.folder_id IN (
        WITH RECURSIVE folder_descendants AS (
          SELECT f.id AS folder_id
          UNION ALL
          SELECT child.id FROM network_folders child JOIN folder_descendants fd ON child.parent_id = fd.folder_id
          WHERE child.deleted_at IS NULL ${regionDescendantFilter}
        )
        SELECT folder_id FROM folder_descendants
      )) as total_feature_count
    `;

    const statusCountsSubquery = `
      , (SELECT json_build_object(
        'live', COALESCE(SUM(CASE WHEN LOWER(nf_s.name) LIKE '%live%' THEN nf_s.feature_count ELSE 0 END), 0),
        'planned', COALESCE(SUM(CASE WHEN LOWER(nf_s.name) LIKE '%planned%' THEN nf_s.feature_count ELSE 0 END), 0),
        'imported', COALESCE(SUM(CASE WHEN LOWER(nf_s.name) NOT LIKE '%live%' AND LOWER(nf_s.name) NOT LIKE '%planned%' THEN nf_s.feature_count ELSE 0 END), 0)
      ) FROM network_files nf_s WHERE nf_s.deleted_at IS NULL AND nf_s.folder_id IN (
        WITH RECURSIVE folder_desc2 AS (
          SELECT f.id AS folder_id
          UNION ALL
          SELECT c2.id FROM network_folders c2 JOIN folder_desc2 fd2 ON c2.parent_id = fd2.folder_id
          WHERE c2.deleted_at IS NULL ${regionDescendantFilter2}
        )
        SELECT folder_id FROM folder_desc2
      )) as status_counts
    `;

    if (parentId === null || parentId === "root") {
      // Root Level
      if (isAdmin) {
        folderQueryStr =
          `SELECT f.id, f.name, f.parent_id, f.is_system, f.category, f.default_icon, f.created_at, ${featureCountSubquery} ${statusCountsSubquery} FROM network_folders f WHERE f.parent_id IS NULL AND f.deleted_at IS NULL ORDER BY f.name ASC`;
        queryParams = [];
      } else {
        folderQueryStr = `SELECT f.id, f.name, f.parent_id, f.is_system, f.category, f.default_icon, f.created_at, ${featureCountSubquery} ${statusCountsSubquery} 
           FROM network_folders f 
           ${accessJoin} 
           WHERE f.parent_id IS NULL AND f.deleted_at IS NULL
           ORDER BY f.name ASC`;
        queryParams = [];
      }

      fileQueryStr = `SELECT * FROM network_files WHERE folder_id IS NULL AND deleted_at IS NULL ${outcomeFilter} ORDER BY name ASC`;
    } else {
      // Sub-folder Level
      if (isAdmin) {
        folderQueryStr =
          `SELECT f.id, f.name, f.parent_id, f.is_system, f.category, f.default_icon, f.created_at, ${featureCountSubquery} ${statusCountsSubquery} FROM network_folders f WHERE f.parent_id = $1 AND f.deleted_at IS NULL ORDER BY f.name ASC`;
        queryParams = [parentId];
      } else {
        folderQueryStr = `SELECT f.id, f.name, f.parent_id, f.is_system, f.category, f.default_icon, f.created_at, ${featureCountSubquery} ${statusCountsSubquery} 
           FROM network_folders f 
           ${accessJoin} 
           WHERE f.parent_id = $1 AND f.deleted_at IS NULL
           ORDER BY f.name ASC`;
        queryParams = [parentId];
      }

      fileQueryStr = `SELECT * FROM network_files WHERE folder_id = $1 AND deleted_at IS NULL ${outcomeFilter} ORDER BY name ASC`;
    }

    console.log("📝 Executing Folder Query:", folderQueryStr);
    console.log("🔢 Query Params:", queryParams);

    const [foldersRows, filesRows] = await Promise.all([
      prisma.$queryRawUnsafe(folderQueryStr, ...queryParams),
      prisma.$queryRawUnsafe(
        fileQueryStr,
        ...(parentId === null || parentId === "root" ? [] : [parentId])
      ),
    ]);

    let finalFolders = foldersRows || [];

    // --- APPLY STATE FILTER FOR FOLDER VISIBILITY (reuses pre-fetched assignedRegions) ---
    if (!isAdmin && userId) {
      finalFolders = finalFolders.filter(folder => {
        const nameClean = folder.name.toLowerCase().trim();
        if (INDIAN_STATES.includes(nameClean)) {
          return assignedRegions.includes(nameClean);
        }
        return true;
      });
    }

    const result = {
      folders: finalFolders,
      files: filesRows || [],
    };
    return result;
  }

  /**
   * Create a new folder
   */
  async createFolder(
    name,
    parentId,
    userId,
    isSystem = false,
    category = null, // Changed default to null to fallback to parent
    defaultIcon = null, // New: User chosen icon
  ) {
    let finalCategory = category;
    let finalIsSystem = isSystem;

    // 1. Inherit from Parent if exists
    if (parentId) {
      const parent = await prisma.network_folders.findUnique({
        where: { id: parseInt(parentId, 10) },
        select: { category: true, is_system: true },
      });

      if (parent) {
        // If category not explicitly provided, usage parent's
        if (!finalCategory) {
          finalCategory = parent.category;
        }
        // If using system folder as parent, still allow custom icon?
        // Actually, if parent has category, child likely inherits.
        // But for "Custom" folders nested in "Project", we want custom icons.
      }
    }

    // 2. Default Fallback
    const validCategories = ["infrastructure", "customer"];
    if (!validCategories.includes(finalCategory)) {
      finalCategory = "customer";
    }

    const newFolder = await prisma.network_folders.create({
      data: {
        name,
        parent_id: parentId ? parseInt(parentId, 10) : null,
        created_by: userId ? parseInt(userId, 10) : null,
        is_system: finalIsSystem,
        category: finalCategory,
        default_icon: defaultIcon,
      },
    });

    // ── Auto-grant creator full access (View + Add) ──
    // This ensures the creator can immediately see and manage their own folder.
    // ON CONFLICT prevents duplicate key errors if access was already pre-assigned.
    if (userId && newFolder) {
      try {
        await prisma.$queryRaw`
           INSERT INTO user_folder_access (user_id, folder_id, can_read, can_write, can_edit, can_delete)
           VALUES (${parseInt(userId, 10)}, ${newFolder.id}, TRUE, TRUE, TRUE, TRUE)
           ON CONFLICT (user_id, folder_id) DO NOTHING
        `;
        await prisma.$queryRaw`
           INSERT INTO user_folder_add_access (user_id, folder_id)
           VALUES (${parseInt(userId, 10)}, ${newFolder.id})
           ON CONFLICT (user_id, folder_id) DO NOTHING
        `;
      } catch (accessErr) {
        // Non-critical: Log but don't block folder creation
        console.error("⚠️ Auto-grant access failed (non-blocking):", accessErr.message);
      }
    }

    catalogService.invalidateCache('catalog:*').catch(console.error);
    return newFolder;
  }

  /**
   * Delete a folder (soft-delete to recycle bin)
   * Recursively deletes all sub-folders and files within them to prevent orphaned objects.
   */
  async deleteFolder(id, userId) {
    return await prisma.$transaction(async (tx) => {
      // Check if system folder
      const checkResult = await tx.$queryRaw`SELECT is_system FROM network_folders WHERE id = ${parseInt(id, 10)}`;
      if (checkResult.length > 0 && checkResult[0].is_system) {
        throw new Error("Cannot delete system folders");
      }

      // Step 1: Get the folder and ALL its recursive descendants
      const descendantsQuery = `
        WITH RECURSIVE descendants AS (
          SELECT id FROM network_folders WHERE id = ${parseInt(id, 10)}
          UNION ALL
          SELECT f.id FROM network_folders f
          JOIN descendants d ON f.parent_id = d.id
          WHERE f.deleted_at IS NULL
        )
        SELECT id FROM descendants;
      `;
      const descResult = await tx.$queryRawUnsafe(descendantsQuery);
      const folderIds = descResult.map(r => r.id);

      if (folderIds.length === 0) {
        throw new Error("Folder not found");
      }

      // Step 2: Soft-delete all files inside these folders
      await tx.$queryRawUnsafe(`
        UPDATE network_files 
        SET deleted_at = NOW(), deleted_by = $1 
        WHERE folder_id = ANY($2::int[]) AND deleted_at IS NULL
      `, parseInt(userId, 10), folderIds);

      // Step 3: Soft-delete all the folders themselves
      const resultRows = await tx.$queryRawUnsafe(`
        UPDATE network_folders 
        SET deleted_at = NOW(), deleted_by = $1 
        WHERE id = ANY($2::int[]) RETURNING id
      `, parseInt(userId, 10), folderIds);

      catalogService.invalidateCache('catalog:*').catch(console.error);
      return resultRows[0];
    });
  }

  /**
   * Rename a folder
   * Blocks rename on absolute root folders (parent_id IS NULL)
   */
  async renameFolder(id, newName) {
    const checkRows = await prisma.$queryRaw`SELECT id, name, parent_id FROM network_folders WHERE id = ${parseInt(id, 10)}`;

    if (!checkRows || checkRows.length === 0) {
      throw new Error("Folder not found");
    }

    const folder = checkRows[0];

    if (folder.parent_id === null) {
      throw new Error("Cannot rename root system folders");
    }

    let dupeRows;
    if (folder.parent_id === null) {
      dupeRows = await prisma.$queryRaw`SELECT id FROM network_folders WHERE parent_id IS NULL AND LOWER(name) = LOWER(${newName.trim()}) AND id != ${parseInt(id, 10)}`;
    } else {
      dupeRows = await prisma.$queryRaw`SELECT id FROM network_folders WHERE parent_id = ${parseInt(folder.parent_id, 10)} AND LOWER(name) = LOWER(${newName.trim()}) AND id != ${parseInt(id, 10)}`;
    }

    if (dupeRows && dupeRows.length > 0) {
      throw new Error(`A folder named "${newName.trim()}" already exists in this location`);
    }

    const resultRows = await prisma.$queryRaw`
      UPDATE network_folders SET name = ${newName.trim()}, updated_at = NOW() WHERE id = ${parseInt(id, 10)} RETURNING *
    `;

    catalogService.invalidateCache('catalog:*').catch(console.error);
    return resultRows[0];
  }

  /**
   * Get full breadcrumb path
   */
  async getBreadcrumbs(folderId) {
    if (!folderId) return [];

    // Recursive CTE to get path
    const query = `
      WITH RECURSIVE folder_path AS (
        SELECT id, name, parent_id, is_system, category, default_icon, 0 as level
        FROM network_folders
        WHERE id = $1 AND deleted_at IS NULL
        UNION ALL
        SELECT f.id, f.name, f.parent_id, f.is_system, f.category, f.default_icon, fp.level + 1
        FROM network_folders f
        JOIN folder_path fp ON f.id = fp.parent_id
        WHERE f.deleted_at IS NULL
      )
      SELECT * FROM folder_path ORDER BY level DESC;
    `;

    const rows = await prisma.$queryRawUnsafe(query, parseInt(folderId, 10));
    return rows;
  }

  /**
   * Get entire workspace tree (all visible folders and files)
   */
  async getWorkspaceTree(userId, role, includeApprovedOutcomes = false, accessType = 'view') {
    const isAdmin = role === "admin" || role === "Admin";
    let folderQueryStr;
    let fileQueryStr;
    let queryParams = [];

    let outcomeFilter = "";
    if (!includeApprovedOutcomes) {
      outcomeFilter = "AND (properties->>'is_outcome' IS NULL OR properties->>'is_outcome' != 'true')";
    }

    if (isAdmin) {
      folderQueryStr = "SELECT id, name, parent_id, is_system, category, default_icon, created_at FROM network_folders WHERE deleted_at IS NULL ORDER BY name ASC";
      fileQueryStr = `SELECT id, name, folder_id, file_type, created_at FROM network_files WHERE deleted_at IS NULL ${outcomeFilter} ORDER BY name ASC`;
    } else {
      let roleFolderIds = [];
      if (role) {
        try {
           const roleRows = await prisma.$queryRaw`SELECT default_folder_ids FROM roles WHERE name = ${role}`;
           if (roleRows.length > 0 && Array.isArray(roleRows[0].default_folder_ids)) {
               roleFolderIds = roleRows[0].default_folder_ids;
           }
        } catch (e) {
            console.error("Failed to fetch role folders", e);
        }
      }
      
      const roleIdsString = roleFolderIds.length > 0 ? roleFolderIds.join(',') : null;
      const roleUnion = roleIdsString 
          ? `UNION SELECT f.id, f.parent_id FROM network_folders f WHERE f.id IN (${roleIdsString}) AND f.deleted_at IS NULL`
          : "";

      const accessJoin = `
        INNER JOIN (
          WITH RECURSIVE 
          assigned_base AS (
            SELECT f.id, f.parent_id
            FROM network_folders f
            JOIN ${accessType === 'add' ? 'user_folder_add_access' : 'user_folder_access'} ufa ON f.id = ufa.folder_id
            WHERE ufa.user_id = ${userId} AND f.deleted_at IS NULL
            
            UNION
            
            SELECT f.id, f.parent_id
            FROM network_folders f
            WHERE f.created_by = ${userId} AND f.deleted_at IS NULL
            
            ${roleUnion}
          ),
          ancestors AS (
            SELECT id, parent_id FROM assigned_base
            UNION
            SELECT p.id, p.parent_id
            FROM network_folders p
            JOIN ancestors a ON a.parent_id = p.id
            WHERE p.deleted_at IS NULL
          ),
          descendants AS (
            SELECT id, parent_id FROM assigned_base
            UNION
            SELECT c.id, c.parent_id
            FROM network_folders c
            JOIN descendants d ON d.id = c.parent_id
            WHERE c.deleted_at IS NULL
          )
          SELECT id FROM ancestors
          UNION
          SELECT id FROM descendants
        ) visible_folders ON f.id = visible_folders.id
      `;

      folderQueryStr = `SELECT f.id, f.name, f.parent_id, f.is_system, f.category, f.default_icon, f.created_at 
         FROM network_folders f 
         ${accessJoin} 
         WHERE f.deleted_at IS NULL
         ORDER BY f.name ASC`;

      // We only want files that belong to the visible folders, PLUS any files in the root (where folder_id is null) if the user has root access somehow, actually let's just grab all files in visible folders. Root files handled via separate query or union.
      fileQueryStr = `
         SELECT fi.id, fi.name, fi.folder_id, fi.file_type, fi.created_at
         FROM network_files fi
         WHERE (fi.folder_id IN (
            WITH RECURSIVE 
            assigned_base AS (
              SELECT f.id, f.parent_id FROM network_folders f JOIN user_folder_access ufa ON f.id = ufa.folder_id WHERE ufa.user_id = ${userId} AND f.deleted_at IS NULL ${roleUnion}
            ),
            ancestors AS ( SELECT id, parent_id FROM assigned_base UNION SELECT p.id, p.parent_id FROM network_folders p JOIN ancestors a ON a.parent_id = p.id WHERE p.deleted_at IS NULL ),
            descendants AS ( SELECT id, parent_id FROM assigned_base UNION SELECT c.id, c.parent_id FROM network_folders c JOIN descendants d ON d.id = c.parent_id WHERE c.deleted_at IS NULL)
            SELECT id FROM ancestors UNION SELECT id FROM descendants
         ) OR fi.folder_id IS NULL)
         AND fi.deleted_at IS NULL
         ${outcomeFilter}
         ORDER BY fi.name ASC
      `;
    }

    const [foldersRows, filesRows] = await Promise.all([
      prisma.$queryRawUnsafe(folderQueryStr, ...queryParams),
      prisma.$queryRawUnsafe(fileQueryStr, ...queryParams),
    ]);

    let finalFolders = foldersRows || [];

    // --- APPLY STATE FILTER FOR REGIONS ---
    if (!isAdmin && userId) {
      try {
        const INDIAN_STATES = [
          'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
          'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka',
          'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
          'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu',
          'telangana', 'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal',
          'andaman and nicobar islands', 'chandigarh', 'dadra and nagar haveli and daman and diu',
          'delhi', 'jammu and kashmir', 'ladakh', 'lakshadweep', 'puducherry'
        ];
        const userRegionsRows = await prisma.$queryRaw`
          SELECT r.name FROM regions r JOIN user_regions ur ON r.id = ur.region_id WHERE ur.user_id = ${parseInt(userId, 10)}
        `;
        const assignedRegions = userRegionsRows.map(r => r.name.toLowerCase().trim());
        
        finalFolders = finalFolders.filter(folder => {
          const nameClean = folder.name.toLowerCase().trim();
          if (INDIAN_STATES.includes(nameClean)) {
            return assignedRegions.includes(nameClean);
          }
          return true;
        });
      } catch (e) {
        console.error("Failed to filter workspace tree folder boundaries:", e);
      }
    }

    return {
      folders: finalFolders,
      files: filesRows || [],
    };
  }
}

module.exports = new FolderService();
