const { verifyToken } = require("../utils/jwt");
const { pool } = require("../../config/database");
const NodeCache = require("node-cache");

// In-memory cache for authentication (TTL: 5 minutes)
// In-memory cache for authentication (TTL: 60 seconds for quick role updates)
const authCache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false,
});

/**
 * Authentication middleware - Verify JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // console.log("❌ Auth failed: No token provided");
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];
    // console.log("🔑 Token received:", token.substring(0, 50) + "...");

    try {
      // 1. Check Cache (Fast Path)
      const cachedUser = authCache.get(token);
      if (cachedUser) {
        req.user = cachedUser;
        updateLastActive(cachedUser.id);
        return next();
      }

      // 2. Cache Miss - Verify & Fetch from DB
      const decoded = verifyToken(token);

      // Get fresh user data including permissions
      // We fetch role and is_active as before, plus permissions
      const [users] = await pool.query(
        "SELECT id, username, email, full_name, role, is_active, permissions FROM users WHERE id = ?",
        [parseInt(decoded.id)], // Ensure integer for index usage
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        });
      }

      const user = users[0];

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          error: "User account is deactivated",
        });
      }

      // Check if user has any active sessions
      const [sessions] = await pool.query(
        "SELECT id FROM user_sessions WHERE user_id = ? AND expires_at > NOW() LIMIT 1",
        [decoded.id],
      );

      if (sessions.length === 0) {
        return res.status(401).json({
          success: false,
          error: "Session has been terminated. Please log in again.",
          sessionTerminated: true,
        });
      }

      // --- HYBRID PERMISSION LOADING ---
      // 1. Direct Permissions (from user table)
      const directPerms = user.permissions || [];



      // 3. Role Permissions (Inherited)
      let rolePerms = [];
      if (user.role) {
        try {
          // Fetch inherited permissions from the roles table
          const [roles] = await pool.query(
            "SELECT permissions FROM roles WHERE LOWER(name) = LOWER(?)",
            [user.role],
          );
          if (roles.length > 0) {
            let perms = roles[0].permissions;
            // Parse JSON if stored as string
            if (typeof perms === "string") {
              try {
                perms = JSON.parse(perms);
              } catch (e) {
                console.warn(`Failed to parse permissions for role ${user.role}:`, e);
              }
            }
            if (Array.isArray(perms)) {
              rolePerms = perms;
            }
          }
        } catch (err) {
          console.warn(`Role permission fetch failed for role '${user.role}' (ignoring):`, err.message);
        }
      }

      // 4. Merge & Deduplicate (Direct + Role)
      user.effectivePermissions = [...new Set([...directPerms, ...rolePerms])];

      // 3. Update Cache
      authCache.set(token, user);

      // Add user to request object
      req.user = user;
      console.log(
        `[Auth] User ${user.username} (${user.id}) accessing ${req.method} ${req.originalUrl}`,
      );
      // updateLastActive(req.user.id);

      next();
    } catch (tokenError) {
      console.error("❌ Token verification failed:", tokenError.message);
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      error: "Authentication failed",
    });
  }
};

/**
 * Check Granular Permission
 * @param {String} permissionCode - e.g. 'network:feature:create'
 */

const checkPermission = (permissionCode, additionalRoles = []) => {
  return (req, res, next) => {
    // 0. Ensure Authentication
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });

    // 1. Admin Bypass
    if (req.user.role === "admin") return next();

    // 2. Additional Roles Bypass
    if (additionalRoles.length > 0) {
      const userRoleLower = req.user.role?.toLowerCase() || "";
      const allowedRolesLower = additionalRoles.map((r) => r.toLowerCase());
      if (allowedRolesLower.includes(userRoleLower)) return next();
    }

    // 3. Update Check Permission Logic to support Array (OR condition)
    // effectivePermissions were calculated in authenticate middleware
    const perms = req.user.effectivePermissions || [];

    // Global Admin Wildcard
    if (perms.includes("*")) return next();

    // Support Array of Permissions (OR logic)
    const requiredPerms = Array.isArray(permissionCode) 
      ? permissionCode 
      : [permissionCode];

    let hasPermission = false;

    for (const code of requiredPerms) {
      if (typeof code !== 'string') continue;

      // Check Exact Match
      if (perms.includes(code)) {
        hasPermission = true;
        break;
      }

      // Check Normalized Exact Matches (colon vs dot)
      const colonized = code.replace(/\./g, ":");
      if (perms.includes(colonized)) {
        hasPermission = true;
        break;
      }
      
      const dotted = code.replace(/:/g, ".");
      if (perms.includes(dotted)) {
        hasPermission = true;
        break;
      }

      // Check Partial Wildcards (e.g. "map:*" matches "map:tools:distance")
      const parts = code.split(/[:.]/);
      let foundWildcard = false;
      
      // We check if the USER has a wildcard that covers the REQUIRED code
      // Example: User has "map:*", Required is "map:view"
      // User perms: ["map:*"]
      // Check: "map:*" matches? YES.
      
      // Reverse check: iterate over USER perms to see if any is a wildcard prefix of 'code'
      for (const userPerm of perms) {
        if (userPerm.endsWith("*")) {
           const prefix = userPerm.slice(0, -1); // "map:"
           if (code.startsWith(prefix) || colonized.startsWith(prefix)) {
             foundWildcard = true;
             break;
           }
        }
      }

      if (foundWildcard) {
        hasPermission = true;
        break;
      }
    }

    if (hasPermission) {
      return next();
    }

    console.warn(`[Access Denied] User: ${req.user.username}, Role: ${req.user.role}, Required: ${requiredPerms.join('|')}, Has: ${perms.length} perms`);
    return res.status(403).json({
      success: false,
      error: `Access denied. Missing permission: ${requiredPerms.join(' or ')}`,
    });
  };
};

/**
 * Authorization middleware - Check user role
 * @param {Array} allowedRoles - Array of allowed roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    // Case-insensitive role comparison
    const userRole = req.user.role?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((r) => r.toLowerCase());

    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

/**
 * Check if user has access to region
 * @param {Number} regionId - Region ID to check
 */
const checkRegionAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const regionId =
      req.params.regionId || req.body.regionId || req.query.regionId;

    if (!regionId) {
      return next(); // No region specified, continue
    }

    // Admin has access to all regions
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user has access to this region
    const [access] = await pool.query(
      "SELECT * FROM user_regions WHERE user_id = ? AND region_id = ?",
      [userId, regionId],
    );

    if (access.length === 0) {
      return res.status(403).json({
        success: false,
        error: "Access denied to this region",
      });
    }

    req.regionAccess = access[0];
    next();
  } catch (error) {
    console.error("Region access check error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to verify region access",
    });
  }
};

/**
 * Fire-and-forget update of last_active_at
 * Updates only if 5 minutes have passed to reduce DB write load
 */
const updateLastActive = (userId) => {
  const query =
    "UPDATE users SET last_active_at = NOW() WHERE id = $1 AND (last_active_at IS NULL OR last_active_at < NOW() - INTERVAL '1 minute')";
  pool
    .query(query, [userId])
    .then((res) => {
      // res is [rows, fields] structure from database.js wrapper
      const rows = res[0];
      if (rows && rows.affectedRows > 0) {
        console.log(`[Activity] Updated last_active_at for User ${userId}`);
      }
    })
    .catch((err) =>
      console.error(`[Activity] Update failed for User ${userId}:`, err),
    );
};

module.exports = {
  authenticate,
  authorize,
  checkRegionAccess,
  checkPermission,
};
