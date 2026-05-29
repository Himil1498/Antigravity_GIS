const userService = require("../user.service");
const { calculateTimeRemaining } = require("../../../shared/utils/time"); // This helper might need to be moved to utils or service
const { ERROR_MESSAGES } = require("./constants");

/**
 * @route   GET /api/users
 * @desc    Get all users (paginated)
 * @access  Private (Manager/Admin)
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role } = req.query;

    const { users, total } = await userService.getAllUsers(
      page,
      limit,
      search,
      role,
    );

    // Transform logic (temp access parsing) kept in controller for now as it's view-specific transformation
    // Ideally this goes into a serialization layer or helper
    for (const user of users) {
      // Parse assigned regions
      user.assignedRegions = user.region_names
        ? user.region_names.split("|||").filter(Boolean)
        : [];
      delete user.region_names;

      // Parse temporary access
      user.temporaryAccess = [];
      if (user.temp_access_data) {
        const tempAccessItems = user.temp_access_data
          .split("|||")
          .filter(Boolean);
        user.temporaryAccess = tempAccessItems.map((item) => {
          const [
            id,
            region,
            expiresAt,
            secondsRemaining,
            grantedByName,
            grantedAt,
            reason,
          ] = item.split(":::");
          return {
            id: parseInt(id),
            region,
            expiresAt,
            grantedAt,
            grantedByName,
            reason,
            secondsRemaining: parseInt(secondsRemaining),
            timeRemaining: calculateTimeRemaining(parseInt(secondsRemaining)),
          };
        });
      }
      delete user.temp_access_data;

      // Calculate online status - REMOVED per request
      user.lastLogin = user.last_active_at; // Keep mapping for potential other uses, but no status logic

      if (user.assignedRegions.length > 0) {
        console.log(
          `📍 User ${user.username} (ID: ${user.id}) has ${user.assignedRegions.length} regions assigned`,
        );
      }

      // Map MFA fields for frontend
      user.mfaEnabled = Boolean(user.mfa_enabled);
      user.mfaMethod = user.mfa_method;
      user.mfaEnabledAt = user.mfa_enabled_at;
    }

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res
      .status(500)
      .json({ success: false, error: ERROR_MESSAGES.FAILED_GET_USERS });
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.findUserById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    const regions = await userService.getUserRegionsDetails(id);
    user.regions = regions;

    res.json({ success: true, user });
  } catch (error) {
    console.error("Get user error:", error);
    res
      .status(500)
      .json({ success: false, error: ERROR_MESSAGES.FAILED_GET_USER });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
};
