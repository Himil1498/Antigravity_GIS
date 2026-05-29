const { pool } = require('../../config/database');
const { notifyAllAdmins, createNotification } = require('../notification/services/notification.service');

// Constants moved from local constants file
const ERRORS = {
  REGION_REQUIRED: 'Region ID or name is required',
  REGION_NOT_FOUND: 'Region not found',
  ALREADY_HAS_ACCESS: 'You already have access to this region',
  ALREADY_PENDING: 'You already have a pending request for this region',
  CREATE_FAILED: 'Failed to create region request',
  REQUEST_NOT_FOUND: 'Request not found',
  DELETE_PERMISSION: 'You can only delete your own pending requests',
  DELETE_FAILED: 'Failed to delete request',
  PERMISSION_DENIED: 'Permission denied',
  ALREADY_PROCESSED: (status) => `Request is already ${status}`,
  APPROVE_FAILED: 'Failed to approve request',
  REJECT_FAILED: 'Failed to reject request'
};

const SUCCESS = {
  CREATED: 'Region access request submitted successfully',
  DELETED: 'Request deleted successfully',
  APPROVED: 'Request approved successfully',
  REJECTED: 'Request rejected successfully'
};

const NOTIFICATIONS = {
  NEW_REQUEST_TITLE: 'New Region Access Request',
  NEW_REQUEST_BODY: (user, region) => `User ${user} requested access to region ${region}`,
  APPROVED_TITLE: 'Region Access Approved',
  APPROVED_BODY: (region) => `Your request for access to ${region} has been approved`,
  REJECTED_TITLE: 'Region Access Rejected',
  REJECTED_BODY: (region) => `Your request for access to ${region} has been rejected`
};

/**
 * Create a region access request
 * @param {number} userId - User ID
 * @param {Object} data - Request payload { region_id, region_name, comments }
 * @returns {Promise<Object>} Created request
 */
const createRequest = async (userId, data) => {
  const { region_id, region_name, comments } = data;

  if (!region_id && !region_name) {
    throw new Error(ERRORS.REGION_REQUIRED);
  }

  // Find region
  let regionId;
  if (region_id) {
    const [regions] = await pool.query('SELECT id FROM regions WHERE id = ?', [region_id]);
    if (regions.length === 0) throw new Error(ERRORS.REGION_NOT_FOUND);
    regionId = region_id;
  } else {
    const [regions] = await pool.query('SELECT id FROM regions WHERE name = ? AND is_active::boolean = true', [region_name]);
    if (regions.length === 0) throw new Error(ERRORS.REGION_NOT_FOUND);
    regionId = regions[0].id;
  }

  // Check existing access
  const [existingAccess] = await pool.query(
    'SELECT id FROM user_regions WHERE user_id = ? AND region_id = ?',
    [userId, regionId]
  );
  if (existingAccess.length > 0) throw new Error(ERRORS.ALREADY_HAS_ACCESS);

  // Check pending
  const [pending] = await pool.query(
    'SELECT id FROM region_requests WHERE user_id = ? AND region_id = ? AND status = ?',
    [userId, regionId, 'pending']
  );
  if (pending.length > 0) throw new Error(ERRORS.ALREADY_PENDING);

  // Create request
  const [result] = await pool.query(
    `INSERT INTO region_requests (user_id, region_id, comments, status) VALUES (?, ?, ?, 'pending') RETURNING id`,
    [userId, regionId, comments || '']
  );

  const requestId = result[0].id;

  // Notify Admins
  // Note: Async notifications should ideally be decoupled, but keeping inline for parity
  const [regionInfo] = await pool.query('SELECT name FROM regions WHERE id = ?', [regionId]);
  const [userInfo] = await pool.query('SELECT username, full_name FROM users WHERE id = ?', [userId]);
  const regionNameString = regionInfo[0]?.name || 'Unknown Region';
  const userName = userInfo[0]?.full_name || userInfo[0]?.username || 'User';

  try {
    await notifyAllAdmins(
      'region_request',
      NOTIFICATIONS.NEW_REQUEST_TITLE,
      NOTIFICATIONS.NEW_REQUEST_BODY(userName, regionNameString),
      {
        data: { requestId: requestId, userId, userName, regionId, regionName: regionNameString, comments },
        priority: 'high',
        action_url: '/admin/region-requests',
        action_label: 'View Request'
      }
    );
  } catch (e) {
    console.error('Notification failed:', e);
  }

  return {
    id: requestId,
    user_id: userId,
    region_id: regionId,
    comments,
    status: 'pending'
  };
};

/**
 * Get all region requests
 * @param {number} userId - Requesting User ID
 * @param {string} userRole - Requesting User Role
 */
const getAllRequests = async (userId, userRole) => {
  let query = `
    SELECT rr.*, 
           u.username, u.full_name, u.email,
           r.name as region_name,
           reviewer.full_name as reviewer_name
    FROM region_requests rr
    JOIN users u ON rr.user_id = u.id
    JOIN regions r ON rr.region_id = r.id
    LEFT JOIN users reviewer ON rr.reviewed_by = reviewer.id
  `;

  const params = [];

  // If not admin/manager, only show own requests
  if (userRole !== 'admin' && userRole !== 'manager') {
    query += ' WHERE rr.user_id = ?';
    params.push(userId);
  }

  query += ' ORDER BY rr.requested_at DESC';

  const [requests] = await pool.query(query, params);
  return requests;
};

/**
 * Delete a request (Cancel)
 * @param {number} id - Request ID
 * @param {number} userId - Requesting User ID
 * @param {string} userRole - Requesting User Role
 */
const deleteRequest = async (id, userId, userRole) => {
  const [requests] = await pool.query('SELECT user_id FROM region_requests WHERE id = ?', [id]);
  if (requests.length === 0) throw new Error(ERRORS.REQUEST_NOT_FOUND);

  const request = requests[0];
  if (userRole !== 'admin' && request.user_id !== userId) {
    throw new Error(ERRORS.DELETE_PERMISSION);
  }

  await pool.query('DELETE FROM region_requests WHERE id = ?', [id]);
};

/**
 * Approve a request
 * @param {number} id - Request ID
 * @param {number} reviewerId - Admin/Manager ID
 * @param {string} comments - Review comments
 */
const approveRequest = async (id, reviewerId, comments) => {
  const [requests] = await pool.query('SELECT * FROM region_requests WHERE id = ?', [id]);
  if (requests.length === 0) throw new Error(ERRORS.REQUEST_NOT_FOUND);
  const request = requests[0];

  if (request.status !== 'pending') throw new Error(ERRORS.ALREADY_PROCESSED(request.status));

  const connection = await pool.getConnection(); // Note: PG uses client, wrapper handles this?
  // My wrapper pool.getConnection returns a client.
  // Standard PG client has query, release/end.
  // Transaction: BEGIN, COMMIT, ROLLBACK via query.
  
  await connection.query('BEGIN'); // Start transaction manually for PG compatibility if wrapper doesn't provide beginTransaction

  try {
    await connection.query(
      `UPDATE region_requests SET status = 'approved', reviewed_by = ?, reviewed_at = NOW(), comments = ? WHERE id = ?`,
      [reviewerId, comments, id]
    );

    await connection.query(
      `INSERT INTO user_regions (user_id, region_id, assigned_by) 
       VALUES (?, ?, ?) 
       ON CONFLICT (user_id, region_id) DO UPDATE SET assigned_by = EXCLUDED.assigned_by`,
      [request.user_id, request.region_id, reviewerId]
    );

    await connection.query('COMMIT');

    // Notify User
    const [regionInfo] = await pool.query('SELECT name FROM regions WHERE id = ?', [request.region_id]);
    const regionNameString = regionInfo[0]?.name || 'Unknown Region';

    try {
      await createNotification(
        request.user_id,
        'region_request',
        NOTIFICATIONS.APPROVED_TITLE,
        NOTIFICATIONS.APPROVED_BODY(regionNameString),
        {
          data: { requestId: id, regionId: request.region_id, regionName: regionNameString, reviewNotes: comments },
          priority: 'high',
          action_url: '/map',
          action_label: 'View Map'
        }
      );
    } catch (e) {
       console.error('Notification failed:', e);
    }

  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

/**
 * Reject a request
 * @param {number} id - Request ID
 * @param {number} reviewerId - Admin/Manager ID
 * @param {string} comments - Review comments
 */
const rejectRequest = async (id, reviewerId, comments) => {
  const [requests] = await pool.query('SELECT * FROM region_requests WHERE id = ?', [id]);
  if (requests.length === 0) throw new Error(ERRORS.REQUEST_NOT_FOUND);
  const request = requests[0];

  if (request.status !== 'pending') throw new Error(ERRORS.ALREADY_PROCESSED(request.status));

  await pool.query(
    `UPDATE region_requests SET status = 'rejected', comments = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?`,
    [comments || 'Rejected', reviewerId, id]
  );

   // Notify User
    const [regionInfo] = await pool.query('SELECT name FROM regions WHERE id = ?', [request.region_id]);
    const regionNameString = regionInfo[0]?.name || 'Unknown Region';

    try {
      await createNotification(
        request.user_id,
        'region_request',
        NOTIFICATIONS.REJECTED_TITLE,
        NOTIFICATIONS.REJECTED_BODY(regionNameString),
        {
          data: { requestId: id, regionId: request.region_id, regionName: regionNameString, reviewNotes: comments },
          priority: 'high',
          action_url: '/region-requests',
          action_label: 'View Requests'
        }
      );
    } catch (e) {
       console.error('Notification failed:', e);
    }
};

module.exports = {
  createRequest,
  getAllRequests,
  deleteRequest,
  approveRequest,
  rejectRequest,
  ERRORS,
  SUCCESS
};
