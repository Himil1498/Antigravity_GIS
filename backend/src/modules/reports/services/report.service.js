const { pool } = require("../../../config/database");

/**
 * Get region usage statistics - Enhanced with more details
 */
const getRegionUsage = async () => {
  const [stats] = await pool.query(`
      SELECT 
        r.id as region_id,
        r.name as region,
        r.code,
        r.type,
        r.is_active,
        CASE WHEN r.is_active::boolean THEN 'Active' ELSE 'Inactive' END as status,
        COUNT(DISTINCT ur.user_id) as assigned_users,
        COUNT(DISTINCT ta.user_id) as temp_access_users,
        COUNT(DISTINCT ur.user_id) + COUNT(DISTINCT ta.user_id) as total_access_users,
        STRING_AGG(DISTINCT u.full_name, ', ' ORDER BY u.full_name) as assigned_user_names,
        r.created_at,
        r.updated_at
      FROM regions r
      LEFT JOIN user_regions ur ON r.id = ur.region_id
      LEFT JOIN users u ON ur.user_id = u.id AND u.is_active::boolean = true
      LEFT JOIN temporary_access_log ta ON r.id = ta.region_id 
        AND ta.end_time > NOW()
        AND ta.status != 'revoked'
      GROUP BY r.id, r.name, r.code, r.type, r.is_active, r.created_at, r.updated_at
      ORDER BY assigned_users DESC, r.name
    `);
  return stats;
};

/**
 * Get zone assignments report - Enhanced with user details
 */
const getZoneAssignments = async () => {
  const [assignments] = await pool.query(`
      SELECT 
        u.id as user_id,
        u.username,
        u.full_name as user_name,
        u.email as user_email,
        u.role,
        u.department,
        u.office_location,
        u.phone,
        CASE WHEN u.is_active::boolean THEN 'Active' ELSE 'Inactive' END as user_status,
        STRING_AGG(DISTINCT r.name, ', ' ORDER BY r.name) as assigned_regions,
        COUNT(DISTINCT ur.region_id) as region_count,
        ab.full_name as assigned_by_name,
        MIN(ur.assigned_at) as first_assignment,
        MAX(ur.assigned_at) as latest_assignment
      FROM users u
      INNER JOIN user_regions ur ON u.id = ur.user_id
      LEFT JOIN regions r ON ur.region_id = r.id AND r.is_active::boolean = true
      LEFT JOIN users ab ON ur.assigned_by = ab.id
      GROUP BY u.id, u.username, u.full_name, u.email, u.role, u.department, 
               u.office_location, u.phone, u.is_active, ab.full_name
      HAVING COUNT(ur.region_id) > 0
      ORDER BY u.full_name
    `);
  return assignments;
};

/**
 * Get user activity statistics - Enhanced with all user details
 */
const getUserActivity = async () => {
  const [activity] = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.full_name,
        u.role,
        u.department,
        u.phone,
        u.office_location,
        u.street,
        u.city,
        u.state,
        u.pincode,
        u.gender,
        CASE WHEN u.is_active::boolean THEN 'Active' ELSE 'Inactive' END as status,
        CASE WHEN u.is_email_verified::boolean THEN 'Yes' ELSE 'No' END as email_verified,
        CASE WHEN u.mfa_enabled::boolean THEN 'Yes' ELSE 'No' END as mfa_enabled,
        u.mfa_method,
        u.permissions,
        COUNT(DISTINCT ur.region_id) as permanent_regions,
        STRING_AGG(DISTINCT r.name, ', ' ORDER BY r.name) as assigned_region_names,
        COUNT(DISTINCT ta.id) as temporary_access_grants,
        u.last_active_at as last_login,
        u.created_at
      FROM users u
      LEFT JOIN user_regions ur ON u.id = ur.user_id
      LEFT JOIN regions r ON ur.region_id = r.id AND r.is_active::boolean = true
      LEFT JOIN temporary_access_log ta ON u.id = ta.user_id 
        AND ta.end_time > NOW()
        AND ta.status != 'revoked'
      GROUP BY u.id, u.username, u.email, u.full_name, u.role, u.department, u.phone, 
               u.office_location, u.street, u.city, u.state, u.pincode, u.gender,
               u.is_active, u.is_email_verified, u.mfa_enabled, u.mfa_method, 
               u.permissions, u.last_active_at, u.created_at
      ORDER BY u.full_name
    `);

  // Process permissions from JSON to readable string
  return activity.map(row => ({
    ...row,
    permissions: Array.isArray(row.permissions) 
      ? row.permissions.join(', ')
      : typeof row.permissions === 'string' 
        ? (() => { try { return JSON.parse(row.permissions).join(', '); } catch(e) { return row.permissions; } })()
        : ''
  }));
};

/**
 * Get access denial statistics - Enhanced with more details
 */
const getAccessDenials = async () => {
  const [denials] = await pool.query(`
      SELECT 
        al.id as log_id,
        al.user_id,
        u.username,
        u.full_name,
        u.email,
        u.role,
        u.department,
        al.action,
        al.resource_type,
        al.resource_id,
        al.ip_address,
        al.details,
        al.created_at
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.action LIKE '%DENIED%' 
        OR al.action LIKE '%FAILED%'
        OR (al.details ->> 'success')::boolean = false
      ORDER BY al.created_at DESC
      LIMIT 2000
    `);

  // Parse details JSON to readable string
  return denials.map(row => ({
    ...row,
    details: row.details ? (typeof row.details === 'object' ? JSON.stringify(row.details) : row.details) : ''
  }));
};

/**
 * Get temporary access report - Enhanced
 */
const getTemporaryAccess = async () => {
  const [tempAccess] = await pool.query(`
      SELECT 
        ta.id,
        ta.user_id,
        u.username,
        u.full_name as user_name,
        u.email as user_email,
        u.role as user_role,
        u.department as user_department,
        r.name as region,
        r.code as region_code,
        ta.granted_by,
        gb.full_name as granted_by_name,
        ta.start_time,
        ta.end_time,
        ta.reason,
        ta.revoked_at,
        ta.revoked_by,
        rb.full_name as revoked_by_name,
        CASE 
          WHEN ta.status = 'revoked' THEN 'Revoked'
          WHEN ta.end_time < NOW() THEN 'Expired'
          ELSE 'Active'
        END as status,
        CASE 
          WHEN ta.end_time > NOW() AND ta.status != 'revoked'
          THEN ROUND(EXTRACT(EPOCH FROM (ta.end_time - NOW())) / 3600, 1)
          ELSE 0
        END as hours_remaining
      FROM temporary_access_log ta
      INNER JOIN users u ON ta.user_id = u.id
      INNER JOIN regions r ON ta.region_id = r.id 
      LEFT JOIN users gb ON ta.granted_by = gb.id
      LEFT JOIN users rb ON ta.revoked_by = rb.id
      ORDER BY ta.start_time DESC
    `);
  return tempAccess;
};

/**
 * Get region requests report - Enhanced with full details
 */
const getRegionRequests = async () => {
  const [requests] = await pool.query(`
      SELECT 
        rr.id,
        rr.user_id,
        u.username,
        u.full_name as user_name,
        u.email as user_email,
        u.role as user_role,
        u.department as user_department,
        r.name as region,
        r.code as region_code,
        rr.comments as reason,
        rr.status,
        rr.requested_at,
        rr.reviewed_by,
        rb.full_name as reviewed_by_name,
        rr.reviewed_at,
        rr.comments as review_notes, -- Reusing comments as review_notes for compatibility
        CASE 
          WHEN rr.reviewed_at IS NOT NULL 
          THEN ROUND(EXTRACT(EPOCH FROM (rr.reviewed_at - rr.requested_at)) / 3600, 1)
          ELSE NULL
        END as response_time_hours
      FROM region_requests rr
      INNER JOIN users u ON rr.user_id = u.id
      INNER JOIN regions r ON rr.region_id = r.id
      LEFT JOIN users rb ON rr.reviewed_by = rb.id
      ORDER BY rr.requested_at DESC
    `);
  return requests;
};

/**
 * Get audit logs report - Enhanced with more columns
 */
const getAuditLogs = async (limit = 2000) => {
  const [logs] = await pool.query(
    `
      SELECT
        al.id,
        al.user_id,
        u.username,
        u.full_name,
        u.email,
        u.role,
        al.action,
        al.resource_type,
        al.resource_id,
        al.details,
        al.ip_address,
        al.created_at
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ?
    `,
    [parseInt(limit)],
  );

  // Parse details JSON
  return logs.map(row => ({
    ...row,
    details: row.details ? (typeof row.details === 'object' ? JSON.stringify(row.details) : row.details) : ''
  }));
};

/**
 * Get comprehensive report (all summary data)
 */
const getComprehensive = async () => {
  // Gather all statistics
  const [regionStats] = await pool.query(
    "SELECT COUNT(*) as total, COUNT(CASE WHEN is_active::boolean = true THEN 1 END) as active FROM regions",
  );
  const [userStats] = await pool.query(
    `SELECT COUNT(*) as total, 
     COUNT(CASE WHEN is_active::boolean = true THEN 1 END) as active,
     COUNT(CASE WHEN is_active::boolean = false THEN 1 END) as inactive,
     COUNT(CASE WHEN is_email_verified::boolean = true THEN 1 END) as email_verified,
     COUNT(CASE WHEN mfa_enabled::boolean = true THEN 1 END) as mfa_enabled,
     COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
     COUNT(CASE WHEN role = 'manager' THEN 1 END) as managers,
     COUNT(CASE WHEN role = 'viewer' THEN 1 END) as viewers,
     COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users
     FROM users`,
  );
  const [tempAccessStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN end_time > NOW() AND status != 'revoked' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'revoked' THEN 1 END) as revoked,
        COUNT(CASE WHEN end_time < NOW() AND status != 'revoked' THEN 1 END) as expired
      FROM temporary_access_log
    `);
  const [requestStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
      FROM region_requests
    `);
  const [auditStats] = await pool.query(
    `SELECT COUNT(*) as total,
     COUNT(CASE WHEN action LIKE '%DENIED%' OR action LIKE '%FAILED%' THEN 1 END) as denied_or_failed,
     COUNT(DISTINCT user_id) as unique_users
     FROM audit_logs`,
  );
  const [networkStats] = await pool.query(
    `SELECT 
     COUNT(DISTINCT nf.id) as total_files,
     COUNT(DISTINCT nf.folder_id) as total_folders,
     COALESCE(SUM(nf.feature_count), 0) as total_features,
     COUNT(CASE WHEN nf.processing_status = 'completed' THEN 1 END) as completed_files,
     COUNT(CASE WHEN nf.processing_status = 'failed' THEN 1 END) as failed_files
     FROM network_files nf`,
  );

  return {
    regions: regionStats[0],
    users: userStats[0],
    temporary_access: tempAccessStats[0],
    region_requests: requestStats[0],
    audit_logs: auditStats[0],
    network_data: networkStats[0],
  };
};

/**
 * Get network data report with hierarchical folder structure
 */
const getNetworkData = async () => {
  const [data] = await pool.query(`
      WITH RECURSIVE folder_paths AS (
        SELECT 
          id, 
          name, 
          parent_id, 
          name::text as full_path,
          CASE
            WHEN name ILIKE '%Sub%POP%' THEN 'Sub POP'
            WHEN name ILIKE '%POP%' THEN 'POP'
            WHEN name ILIKE '%Bandwidth Drop BTS%' THEN 'Bandwidth Drop BTS'
            WHEN name ILIKE '%BTS%' THEN 'BTS'
            WHEN name ILIKE '%NNI%' THEN 'NNI'
            WHEN name ILIKE '%Office Location%' THEN 'Office Location'
            WHEN name ILIKE '%Data Center%' THEN 'Data Center'
            WHEN name ILIKE '%Infra Provider%' THEN 'Infra Provider'
            ELSE 'Other'
          END as category
        FROM network_folders
        WHERE parent_id IS NULL
        UNION ALL
        SELECT 
          c.id, 
          c.name, 
          c.parent_id, 
          p.full_path || '/' || c.name,
          CASE
            WHEN c.name ILIKE '%Sub%POP%' THEN 'Sub POP'
            WHEN c.name ILIKE '%POP%' THEN 'POP'
            WHEN c.name ILIKE '%Bandwidth Drop BTS%' THEN 'Bandwidth Drop BTS'
            WHEN c.name ILIKE '%BTS%' THEN 'BTS'
            WHEN c.name ILIKE '%NNI%' THEN 'NNI'
            WHEN c.name ILIKE '%Office Location%' THEN 'Office Location'
            WHEN c.name ILIKE '%Data Center%' THEN 'Data Center'
            WHEN c.name ILIKE '%Infra Provider%' THEN 'Infra Provider'
            WHEN p.full_path ILIKE '%Sub%POP%' THEN 'Sub POP'
            WHEN p.full_path ILIKE '%POP%' THEN 'POP'
            WHEN p.full_path ILIKE '%Bandwidth Drop BTS%' THEN 'Bandwidth Drop BTS'
            WHEN p.full_path ILIKE '%BTS%' THEN 'BTS'
            WHEN p.full_path ILIKE '%NNI%' THEN 'NNI'
            WHEN p.full_path ILIKE '%Office Location%' THEN 'Office Location'
            WHEN p.full_path ILIKE '%Data Center%' THEN 'Data Center'
            WHEN p.full_path ILIKE '%Infra Provider%' THEN 'Infra Provider'
            ELSE p.category
          END as category
        FROM network_folders c
        JOIN folder_paths p ON c.parent_id = p.id
      )
      SELECT 
        fp.category,
        fp.full_path as folder_path,
        nf.name as file_name,
        nf.icon_type,
        nf.feature_count,
        nf.processing_status,
        nf.created_at as file_created_at,
        feat.id as feature_id,
        feat.properties,
        CASE 
          WHEN ST_GeometryType(feat.geom) IN ('ST_Point', 'ST_MultiPoint') 
          THEN ST_Y(ST_Transform(ST_Centroid(feat.geom), 4326))
          ELSE NULL 
        END as latitude,
        CASE 
          WHEN ST_GeometryType(feat.geom) IN ('ST_Point', 'ST_MultiPoint') 
          THEN ST_X(ST_Transform(ST_Centroid(feat.geom), 4326))
          ELSE NULL 
        END as longitude
      FROM folder_paths fp
      INNER JOIN network_files nf ON nf.folder_id = fp.id
      LEFT JOIN network_features feat ON feat.file_id = nf.id
      WHERE nf.processing_status = 'completed'
      ORDER BY fp.category, fp.full_path, nf.name
    `);
  return data;
};

module.exports = {
  getRegionUsage,
  getZoneAssignments,
  getUserActivity,
  getAccessDenials,
  getTemporaryAccess,
  getRegionRequests,
  getAuditLogs,
  getComprehensive,
  getNetworkData,
};
