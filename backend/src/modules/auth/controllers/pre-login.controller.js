const { pool } = require('../../../config/database');

const getPreLoginInfo = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required.' });
    }

    // Try to find the user by email or username
    const [users] = await pool.query(
      `SELECT last_login_at, last_login_ip, is_2fa_enabled 
       FROM users 
       WHERE email = $1 OR username = $1`,
      [username]
    );

    if (users.length === 0) {
      // Return a 200 with no data so we don't leak user existence easily via 404
      return res.json({ success: true, data: null });
    }

    const user = users[0];
    res.json({
      success: true,
      data: {
        last_login_at: user.last_login_at,
        last_login_ip: user.last_login_ip,
        is_2fa_enabled: user.is_2fa_enabled
      }
    });
  } catch (error) {
    console.error("Error fetching pre-login info:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = { getPreLoginInfo };
