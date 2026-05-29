const authService = require("../auth.service");
const auditService = require("../../audit/audit.service");
const { createSessionTokenHash } = require("../auth.utils");

const logout = async (req, res) => {
  try {
    const userId = req.user?.id;
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (userId) {
      // Audit Log: Logout
      await auditService.logAudit(userId, "LOGOUT", "USER", userId, {}, req);

      await authService.updateUserLogoutStatus(userId);
      console.log(`🚪 User ${userId} logged out - set to offline`);

      if (token) {
        try {
          const sessionToken = createSessionTokenHash(token);
          await authService.invalidateSession(sessionToken, userId);
          console.log(`✅ Session marked as logged out for user ${userId}`);
        } catch (sessionError) {
          console.error("Failed to update session:", sessionError);
        }
      }
    }

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.json({ success: true, message: "Logged out successfully" });
  }
};

module.exports = { logout };
