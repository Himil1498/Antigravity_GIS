const authService = require("../auth.service");
const { generateToken } = require("../../../shared/utils/jwt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../../../shared/utils/asyncHandler");
const AppError = require("../../../shared/utils/AppError");

const refreshToken = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError("Token is required", 400);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    if (!decoded || !decoded.id) {
      throw new AppError("Invalid token", 401);
    }

    const user = await authService.findUserByIdentifier(decoded.email);

    if (!user || !user.is_active) {
      throw new AppError("User not found or deactivated", 401);
    }

    const newToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    throw new AppError("Invalid or expired token", 401);
  }
});

module.exports = { refreshToken };
