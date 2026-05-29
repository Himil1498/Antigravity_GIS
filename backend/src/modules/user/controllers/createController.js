const userService = require("../user.service");
const { logAudit } = require("../../audit/audit.service");
const { sendVerificationEmail } = require("../../../shared/services/email");
const {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  AUDIT_ACTIONS,
} = require("./constants");

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin)
 */
const createUser = async (req, res) => {
  try {
    // Validation is handled by middleware
    const {
      username,
      email,
      password,
      full_name,
      role,
      phone,
      department,
      office_location,
      gender,
      street,
      city,
      state,
      pincode,
      assignedRegions,
      is_active,
    } = req.body;

    console.log("=== CREATE USER DEBUG ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("Logged in user (req.user):", req.user);
    console.log("assignedRegions:", assignedRegions);
    console.log("========================");

    // Check if user exists
    const existingUser = await userService.findUserByEmailOrUsername(
      email,
      username,
    );
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: ERROR_MESSAGES.USER_ALREADY_EXISTS });
    }

    // Create user
    const userId = await userService.createUser({
      username,
      email,
      password,
      full_name,
      role,
      phone,
      department,
      office_location,
      gender,
      street,
      city,
      state,
      pincode,
      createdBy: req.user ? req.user.id : null,
      is_active: is_active !== undefined ? is_active : true, // Default to true if undefined
    });

    console.log(`User created with ID: ${userId}`);

    // Create default settings
    await userService.createUserSettings(userId);
    console.log(`Default settings created for user ${userId}`);

    // Assign regions
    if (
      assignedRegions &&
      Array.isArray(assignedRegions) &&
      assignedRegions.length > 0
    ) {
      await userService.assignUserRegions(
        userId,
        assignedRegions,
        req.user ? req.user.id : null,
      );
    }

    // Log audit
    await logAudit(
      req.user.id,
      AUDIT_ACTIONS.CREATE,
      "user",
      userId,
      {
        username,
        email,
        role,
        assignedRegions: assignedRegions || [],
      },
      req,
    );

    // Send response IMMEDIATELY before email (don't block on email sending)
    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_CREATED,
      user: { id: userId, username, email, role },
    });

    // Send email in background (fire-and-forget) - don't block the API response
    if (email && req.body.is_active !== false) {
      sendVerificationEmail({
        id: userId,
        email,
        username,
        full_name,
        role,
        password,
      })
        .then(() => console.log(`Verification email sent to ${email}`))
        .catch((emailError) =>
          console.error("Failed to send verification email:", emailError)
        );
    } else {
      console.log(`Email suppressed for inactive user ${email}`);
    }
  } catch (error) {
    console.error("Create user error:", error);
    res
      .status(500)
      .json({ success: false, error: ERROR_MESSAGES.FAILED_CREATE_USER });
  }
};

module.exports = {
  createUser,
};
