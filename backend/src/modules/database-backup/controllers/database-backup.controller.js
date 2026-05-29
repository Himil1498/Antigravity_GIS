const { ERRORS, MESSAGES } = require("../constants");
const { getBackupFilepath, fileExists, deleteFile } = require("../utils");
// Update imports to point to services directory
const { logAudit } = require("../../audit/audit.service");
const { createBackup } = require("../services/backup.service");
const { sendAdminNotifications } = require("../services/notification.service");
const {
  getAllBackups,
  getBackupById,
  deleteBackupRecord,
} = require("../services/backup-query.service");

const createDatabaseBackup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { description = "", includeData = true, tables = [] } = req.body;

    const backupResult = await createBackup(
      { description, includeData, tables },
      userId,
    );

    try {
      await sendAdminNotifications({
        toolType: "database_backup",
        reportType: "create_backup",
        status: "completed",
        duration: backupResult.duration,
        stats: {
          tables_count: backupResult.tableCount,
          size_mb: backupResult.sizeMB,
          backup_type: tables.length > 0 ? "partial" : "full",
          filename: backupResult.filename,
          fk_support: "enabled",
        },
      });
    } catch (notifyErr) {
      console.warn(
        "Warning: Failed to send success notification:",
        notifyErr.message,
      );
    }

    res.json({
      success: true,
      message: MESSAGES.BACKUP_CREATED,
      data: {
        id: backupResult.id,
        filename: backupResult.filename,
        size: `${backupResult.sizeMB} MB`,
        sizeBytes: backupResult.sizeBytes,
        tableCount: backupResult.tableCount,
        duration: backupResult.duration,
        createdAt: backupResult.createdAt,
        foreignKeySupport: true,
        note: "This backup can be restored using pgAdmin or DBeaver without integrity errors",
      },
    });

    try {
      await logAudit(
        userId,
        "Created database backup",
        "SYSTEM_BACKUP",
        backupResult.id,
        { description, tables: tables.length, size: backupResult.sizeMB },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }
  } catch (error) {
    console.error("❌ Backup creation error:", error);
    try {
      await sendAdminNotifications({
        toolType: "database_backup",
        reportType: "create_backup",
        status: "failed",
        duration: null,
        stats: {},
        errorMessage: error.message,
      });
    } catch (notifyErr) {
      console.warn(
        "Warning: Failed to send failure notification:",
        notifyErr.message,
      );
    }

    res.status(500).json({
      success: false,
      message: ERRORS.FAILED_TO_CREATE,
      error: error.message,
    });
  }
};

const getBackups = async (req, res) => {
  try {
    const backups = await getAllBackups();
    res.json({ success: true, data: backups });
  } catch (error) {
    console.error("Get backups error:", error);
    res.status(500).json({
      success: false,
      message: ERRORS.FAILED_TO_GET,
      error: error.message,
    });
  }
};

const downloadBackup = async (req, res) => {
  try {
    const { backupId } = req.params;
    const backup = await getBackupById(backupId);

    if (!backup)
      return res
        .status(404)
        .json({ success: false, message: ERRORS.BACKUP_NOT_FOUND });

    const filepath = backup.filepath || getBackupFilepath(backup.filename);

    try {
      await logAudit(
        req.user.id,
        "Downloaded database backup",
        "SYSTEM_BACKUP",
        backupId,
        { filename: backup.filename },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    if (!fileExists(filepath))
      return res
        .status(404)
        .json({ success: false, message: ERRORS.FILE_NOT_FOUND });

    res.download(filepath, backup.filename, (err) => {
      if (err && !res.headersSent) {
        console.error("Download error:", err);
        res.status(500).json({
          success: false,
          message: ERRORS.FAILED_TO_DOWNLOAD,
          error: err.message,
        });
      }
    });
  } catch (error) {
    console.error("Download backup error:", error);
    res.status(500).json({
      success: false,
      message: ERRORS.FAILED_TO_DOWNLOAD,
      error: error.message,
    });
  }
};

const deleteBackup = async (req, res) => {
  try {
    const { backupId } = req.params;
    const { deleteFile: shouldDeleteFile = true } = req.body;
    const backup = await getBackupById(backupId);

    if (!backup)
      return res
        .status(404)
        .json({ success: false, message: ERRORS.BACKUP_NOT_FOUND });

    const filepath = backup.filepath || getBackupFilepath(backup.filename);
    if (shouldDeleteFile && fileExists(filepath)) {
      deleteFile(filepath);
    }

    await deleteBackupRecord(backupId);

    try {
      await logAudit(
        req.user.id || 0,
        "Deleted database backup",
        "SYSTEM_BACKUP",
        backupId,
        { filename: backup.filename, fileDeleted: shouldDeleteFile },
        req,
      );
    } catch (e) {
      console.error("Audit log failed", e);
    }

    res.json({
      success: true,
      message: MESSAGES.BACKUP_DELETED,
      data: { filename: backup.filename, fileDeleted: shouldDeleteFile },
    });
  } catch (error) {
    console.error("Delete backup error:", error);
    res.status(500).json({
      success: false,
      message: ERRORS.FAILED_TO_DELETE,
      error: error.message,
    });
  }
};

module.exports = {
  createBackup: createDatabaseBackup,
  getBackups,
  downloadBackup,
  deleteBackup,

};
