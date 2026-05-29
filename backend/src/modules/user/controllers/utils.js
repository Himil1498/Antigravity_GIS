const { createNotification } = require('../../notification/services/notification.service');
const { AUDIT_ACTIONS } = require('./constants');

/**
 * Find or create a region by name
 * @param {Object} pool - Database pool
 * @param {string} regionName - Name of the region
 * @returns {Promise<number>} - Region ID
 */
const findOrCreateRegion = async (pool, regionName) => {
  // Find region by name (check both active and inactive)
  let [regions] = await pool.query(
    'SELECT id, is_active FROM regions WHERE name = ?',
    [regionName]
  );

  if (regions.length > 0) {
    const region = regions[0];
    if (!region.is_active) {
       // Reactivate if inactive
       await pool.query('UPDATE regions SET is_active = true WHERE id = ?', [region.id]);
       console.log(`Reactivated existing region: ${regionName} (ID: ${region.id})`);
    }
    return region.id;
  }

  // Region doesn't exist, create it
  // Generate code: First 2 letters + last letter, all uppercase
  let regionCode = (regionName.substring(0, 2) + regionName.charAt(regionName.length - 1)).toUpperCase();
  
  let codeAttempt = regionCode;
  let attempts = 0;
  let regionId;

  while (attempts < 10) {
    try {
      const [newRegion] = await pool.query(
        `INSERT INTO regions (name, code, type, is_active)
         VALUES (?, ?, 'state', true) RETURNING id`,
        [regionName, codeAttempt]
      );
      regionId = newRegion[0].id;
      console.log(`Created new region: ${regionName} with ID ${regionId} (code: ${codeAttempt})`);
      break;
    } catch (insertErr) {
      if (insertErr.code === 'ER_DUP_ENTRY') {
        attempts++;
        codeAttempt = regionCode + attempts;
      } else {
        throw insertErr;
      }
    }
  }

  if (!regionId) {
    throw new Error(`Failed to create region ${regionName} after multiple attempts`);
  }

  return regionId;
};

/**
 * Assign regions to a user
 * @param {Object} pool - Database pool
 * @param {number} userId - User ID
 * @param {Array<string>} assignedRegions - List of region names
 * @param {number} assignedBy - ID of the admin assigning regions
 */
const assignUserRegions = async (pool, userId, assignedRegions, assignedBy) => {
  if (!assignedRegions || !Array.isArray(assignedRegions) || assignedRegions.length === 0) {
    return;
  }

  for (const regionName of assignedRegions) {
    try {
      const regionId = await findOrCreateRegion(pool, regionName);
      
      // Insert into user_regions
      await pool.query(
        `INSERT IGNORE INTO user_regions (user_id, region_id, access_level, assigned_by)
         VALUES (?, ?, 'read', ?)`,
        [userId, regionId, assignedBy]
      );
      console.log(`Assigned region ${regionName} (ID: ${regionId}) to user ${userId}`);
    } catch (err) {
      console.error(`Error assigning region ${regionName}:`, err);
    }
  }
};

/**
 * Send notification to user about region changes
 * @param {Object} pool - Database pool
 * @param {number} userId - User ID
 * @param {Array<string>} addedRegions
 * @param {Array<string>} removedRegions
 * @param {Array<string>} currentRegions
 * @param {Object} user - The user object (req.user)
 */
const sendRegionUpdateNotification = async (pool, userId, addedRegions, removedRegions, currentRegions, user) => {
  if (addedRegions.length === 0 && removedRegions.length === 0) return;

  try {
    const [userInfo] = await pool.query('SELECT username, full_name FROM users WHERE id = ?', [userId]);
    const userName = userInfo[0]?.full_name || userInfo[0]?.username || 'User';

    let notificationMessage = 'Your assigned regions have been updated by an administrator.\n\n';

    if (addedRegions.length > 0) {
      notificationMessage += `✅ Added: ${addedRegions.join(', ')}\n`;
    }
    if (removedRegions.length > 0) {
      notificationMessage += `❌ Removed: ${removedRegions.join(', ')}\n`;
    }

    notificationMessage += `\nCurrent regions: ${currentRegions && currentRegions.length > 0 ? currentRegions.join(', ') : 'None'}`;

    await createNotification(
      userId,
      AUDIT_ACTIONS.REGION_REQUEST,
      '🗺️ Regions Updated',
      notificationMessage,
      {
        data: {
          addedRegions,
          removedRegions,
          currentRegions,
          updatedBy: user?.full_name || user?.username
        },
        priority: 'medium',
        action_url: '/map',
        action_label: 'View Map'
      }
    );
    console.log(`📧 User ${userName} notified about region changes (Edit User)`);
  } catch (notifError) {
    console.error('Failed to send region update notification:', notifError);
  }
};

module.exports = {
  findOrCreateRegion,
  assignUserRegions,
  sendRegionUpdateNotification
};
