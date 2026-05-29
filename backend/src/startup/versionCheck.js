const { pool } = require("../config/database");
const fs = require("fs");
const path = require("path");
const { notifyAllUsers } = require("../modules/notification/services/notification.service");
const websocketService = require("../shared/services/websocketService");

/**
 * Checks the current package version against the database.
 * If the version has bumped, it creates an automated system update.
 */
const checkVersionAndNotify = async () => {
  try {
    const pkgPath = path.join(__dirname, "../../package.json");
    if (!fs.existsSync(pkgPath)) return;
    
    // Read current version
    const pkgOpts = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const currentVersion = `v${pkgOpts.version}`;

    // Get latest auto-release version from DB
    const [latestAuto] = await pool.query(
      `SELECT version_tag FROM system_updates 
       WHERE is_automated = TRUE 
       ORDER BY created_at DESC LIMIT 1`
    );

    const latestVersionInDb = latestAuto.length > 0 ? latestAuto[0].version_tag : null;

    if (currentVersion !== latestVersionInDb) {
      console.log(`🚀 Version bump detected: ${latestVersionInDb || 'None'} -> ${currentVersion}`);
      
      const title = `System Update: ${currentVersion} Released`;
      const content = `The platform has been successfully updated to version ${currentVersion}.\n\nThis is an automated system announcement indicating successful deployment and startup. For detailed patch notes, please check the changelog.`;
      
      const [result] = await pool.query(
        `INSERT INTO system_updates 
          (title, content, type, version_tag, is_published, is_automated)
         VALUES ($1, $2, $3, $4, TRUE, TRUE)
         RETURNING *`,
        [title, content, 'auto-release', currentVersion]
      );
      
      const newUpdate = result[0];

      // Notify users
      await notifyAllUsers(
        "system_update",
        title,
        content,
        { related_entity_type: "system_update" }
      );
      
      if (websocketService && websocketService.broadcast) {
         websocketService.broadcast('notification', {
             type: 'system_update',
             title: title,
             message: content
         });
      }
      console.log(`✅ System update broadcast complete for ${currentVersion}`);
    }
  } catch (error) {
    console.error("❌ Error in automatic version check:", error);
  }
};

module.exports = checkVersionAndNotify;
