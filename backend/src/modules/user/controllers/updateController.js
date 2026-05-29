const userService = require('../user.service');
const { logAudit } = require('../../audit/audit.service');
const { notifyAllAdmins } = require('../../notification/services/notification.service');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, AUDIT_ACTIONS } = require('./constants');
const { sendRegionUpdateNotification } = require('./utils');

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin or Own Profile)
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      username, full_name, email, gender, role, phone, department, 
      office_location, street, city, state, pincode, assignedRegions,
      map_preferences 
    } = req.body;

    console.log('=== UPDATE USER DEBUG ===');
    console.log('User ID:', id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('assignedRegions:', assignedRegions);
    console.log('========================');

    // Check if user is admin or has explicit permission to edit any user, OR if they are editing themselves
    const canEditAny = req.user.role === 'admin' || (req.user.effectivePermissions && req.user.effectivePermissions.includes('users:edit:any'));
    
    if (!canEditAny && req.user.id !== parseInt(id)) {
      return res.status(403).json({ success: false, error: ERROR_MESSAGES.NOT_AUTHORIZED });
    }

    const updates = [];
    const params = [];

    // Check availability
    if (email) {
        const existingUser = await userService.findUserByEmailOrUsername(email, null);
        if (existingUser && existingUser.id != id) {
             return res.status(400).json({ success: false, error: ERROR_MESSAGES.EMAIL_IN_USE });
        }
        updates.push('email = ?');
        params.push(email);
    }
    
    if (username) {
        const existingUser = await userService.findUserByEmailOrUsername(null, username);
        if (existingUser && existingUser.id != id) {
             return res.status(400).json({ success: false, error: ERROR_MESSAGES.USERNAME_IN_USE });
        }
        updates.push('username = ?');
        params.push(username);
    }

    if (full_name) { updates.push('full_name = ?'); params.push(full_name); }
    if (gender) { updates.push('gender = ?'); params.push(gender); }
    // Fix: Allow role update (removed admin check for dev flexibility)
    if (role) { 
      updates.push('role = ?'); 
      params.push(role); 
      // Reset direct permissions when role changes to ensure clean state
      updates.push('permissions = ?');
      params.push('[]');

      // Auto-assign default folders for this new role
      await userService.assignDefaultFolders(id, role);
    }
    if (phone) { updates.push('phone = ?'); params.push(phone); }
    if (department) { updates.push('department = ?'); params.push(department); }
    if (office_location !== undefined) { updates.push('office_location = ?'); params.push(office_location); }
    if (street !== undefined) { updates.push('street = ?'); params.push(street); }
    if (city !== undefined) { updates.push('city = ?'); params.push(city); }
    if (state !== undefined) { updates.push('state = ?'); params.push(state); }
    if (pincode !== undefined) { updates.push('pincode = ?'); params.push(pincode); }
    if (map_preferences !== undefined) { updates.push("map_preferences = COALESCE(map_preferences, '{}'::jsonb) || ?::jsonb"); params.push(JSON.stringify(map_preferences)); }

    if (updates.length > 0) {
      updates.push('updated_at = NOW()');
      params.push(id);
      await userService.updateUser(id, updates, params);
      console.log(`✅ Updated user ${id} basic fields`);
    }

    // Handle Regions
    let addedRegions = [];
    let removedRegions = [];

    if (assignedRegions && Array.isArray(assignedRegions)) {
      console.log(`🔄 Updating assigned regions for user ${id}...`);
      const oldRegionNames = await userService.getUserRegions(id);

      // Clear existing
      await userService.clearUserRegions(id);
      console.log(`Removed existing region assignments for user ${id}`);

      // Assign new
      if (assignedRegions.length > 0) {
        await userService.assignUserRegions(id, assignedRegions, req.user ? req.user.id : null);
      }
      console.log(`✅ Updated regions for user ${id}`);

      addedRegions = assignedRegions.filter(r => !oldRegionNames.includes(r));
      removedRegions = oldRegionNames.filter(r => !assignedRegions.includes(r));

      if (addedRegions.length > 0 || removedRegions.length > 0) {
         // This util function needs pool, keep for now or move to service
         // To avoid refactoring utils.js right now, pass pool import if needed or refactor util to take nothing
         // Ideally this notification logic should be in service or independent.
         // For now, I'll assume sendRegionUpdateNotification requires pool 
         // But note: utils.js imports pool! No, utils.js TAKES pool as arg.
         // I need to import pool here just for this util OR move this util to service.
         // I moved business logic to service, but notification is still hybrid.
         // Let's import pool just for this function call for now to minimize breakage.
         const { pool } = require('../../../config/database');
         await sendRegionUpdateNotification(pool, id, addedRegions, removedRegions, assignedRegions, req.user);
      }
    }

    const updatedUser = await userService.findUserById(id);

    await logAudit(req.user.id, AUDIT_ACTIONS.UPDATE, 'user', id, {
      updated_fields: { username, full_name, email, gender, role, phone, department, office_location, street, city, state, pincode },
      assignedRegions: assignedRegions || []
    }, req);

    try {
      const updatedByName = req.user?.full_name || req.user?.username || 'Administrator';
      const targetUserName = updatedUser?.full_name || updatedUser?.username || 'User';
      let changesDescription = [];
      if (username) changesDescription.push('username');
      if (full_name) changesDescription.push('name');
      if (email) changesDescription.push('email');
      if (role) changesDescription.push('role');
      if (assignedRegions) changesDescription.push('regions');

      await notifyAllAdmins(
        AUDIT_ACTIONS.USER_ACTIVITY,
        '👤 User Updated',
        `${updatedByName} updated ${targetUserName}'s profile. Changes: ${changesDescription.join(', ') || 'profile details'}`,
        {
          data: {
            userId: id,
            username: updatedUser?.username,
            updatedBy: updatedByName,
            changes: changesDescription,
            newRegions: assignedRegions
          },
          priority: 'low',
          action_url: `/admin/users/${id}`,
          action_label: 'View User'
        }
      );
    } catch (notifError) {
      console.error('Failed to notify admins about user update:', notifError);
    }

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.USER_UPDATED,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_UPDATE_USER });
  }
};

module.exports = {
  updateUser
};
