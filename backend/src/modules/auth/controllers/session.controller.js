const authService = require('../auth.service');

const validateSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const username = req.user.username;

    console.log(`🔍 [Validate Session] Checking for user: ${username} (ID: ${userId})`);

    const sessions = await authService.getActiveSessions(userId);

    console.log(`📊 [Validate Session] Active sessions found: ${sessions.length}`);

    if (sessions.length === 0) {
      console.log(`❌ [Validate Session] NO ACTIVE SESSIONS - Returning session terminated for user: ${username}`);
      return res.status(401).json({
        success: false,
        valid: false,
        error: 'Session has been terminated',
        sessionTerminated: true
      });
    }

    console.log(`✅ [Validate Session] Session valid for user: ${username}`);
    res.json({
      success: true,
      valid: true,
      session: {
        loginTime: sessions[0].login_time,
        lastActivity: sessions[0].last_activity_time
      }
    });

  } catch (error) {
    console.error('❌ [Validate Session] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to validate session' });
  }
};

module.exports = { validateSession };
