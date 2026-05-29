const authService = require("../auth.service");
const { logAudit } = require("../../audit/audit.service");
const { generateToken } = require("../../../shared/utils/jwt");

const register = async (req, res) => {
  try {
    const { username, email, password, full_name, role = "user" } = req.body;

    // Register user
    const user = await authService.registerUser({
      username,
      email,
      password,
      full_name,
      role,
    });

    // Generate token
    const token = generateToken({
      id: user.id,
      email,
      role,
    });

    try {
      await logAudit(
        user.id,
        "User registered",
        "USER_LOGIN",
        user.id,
        { action: "REGISTER", email, role },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }



    res.status(201).json({
      success: true,
      token,
      message:
        "Registration successful! Please check your email to verify your account.",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    const statusCode = error.message.includes("already exists") ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message || "Registration failed. Please try again.",
    });
  }
};

module.exports = { register };
