const reportService = require("../services/report.service");
const { logAudit } = require("../../audit/audit.service");
const { generateXLSX, generateCSV } = require("../utils/export.utils");
const { REPORT_TYPES } = require("../constants");

// Enhanced column definitions for exports
const REPORT_HEADERS = {
  REGION_USAGE: [
    { header: "Region ID", key: "region_id" },
    { header: "Region", key: "region" },
    { header: "Code", key: "code" },
    { header: "Type", key: "type" },
    { header: "Status", key: "status" },
    { header: "Assigned Users", key: "assigned_users" },
    { header: "Temp Access Users", key: "temp_access_users" },
    { header: "Total Access Users", key: "total_access_users" },
    { header: "Assigned User Names", key: "assigned_user_names" },
    { header: "Created At", key: "created_at" },
    { header: "Updated At", key: "updated_at" },
  ],
  USER_ACTIVITY: [
    { header: "ID", key: "id" },
    { header: "Username", key: "username" },
    { header: "Email", key: "email" },
    { header: "Full Name", key: "full_name" },
    { header: "Role", key: "role" },
    { header: "Department", key: "department" },
    { header: "Phone", key: "phone" },
    { header: "Office Location", key: "office_location" },
    { header: "Street", key: "street" },
    { header: "City", key: "city" },
    { header: "State", key: "state" },
    { header: "Pincode", key: "pincode" },
    { header: "Gender", key: "gender" },
    { header: "Status", key: "status" },
    { header: "Email Verified", key: "email_verified" },
    { header: "MFA Enabled", key: "mfa_enabled" },
    { header: "MFA Method", key: "mfa_method" },
    { header: "Permissions", key: "permissions" },
    { header: "Assigned Regions", key: "assigned_region_names" },
    { header: "Region Count", key: "permanent_regions" },
    { header: "Temp Access Grants", key: "temporary_access_grants" },
    { header: "Last Login", key: "last_login" },
    { header: "Created At", key: "created_at" },
  ],
  ACCESS_DENIALS: [
    { header: "Log ID", key: "log_id" },
    { header: "User ID", key: "user_id" },
    { header: "Username", key: "username" },
    { header: "Full Name", key: "full_name" },
    { header: "Email", key: "email" },
    { header: "Role", key: "role" },
    { header: "Department", key: "department" },
    { header: "Action", key: "action" },
    { header: "Resource Type", key: "resource_type" },
    { header: "Resource ID", key: "resource_id" },
    { header: "IP Address", key: "ip_address" },
    { header: "Details", key: "details" },
    { header: "Time", key: "created_at" },
  ],
  AUDIT_LOGS: [
    { header: "Log ID", key: "id" },
    { header: "User ID", key: "user_id" },
    { header: "Username", key: "username" },
    { header: "Full Name", key: "full_name" },
    { header: "Email", key: "email" },
    { header: "Role", key: "role" },
    { header: "Action", key: "action" },
    { header: "Resource Type", key: "resource_type" },
    { header: "Resource ID", key: "resource_id" },
    { header: "Details", key: "details" },
    { header: "IP Address", key: "ip_address" },
    { header: "Time", key: "created_at" },
  ],
  TEMP_ACCESS: [
    { header: "ID", key: "id" },
    { header: "User", key: "user_name" },
    { header: "Email", key: "user_email" },
    { header: "Role", key: "user_role" },
    { header: "Department", key: "user_department" },
    { header: "Region", key: "region" },
    { header: "Region Code", key: "region_code" },
    { header: "Granted By", key: "granted_by_name" },
    { header: "Start Time", key: "start_time" },
    { header: "End Time", key: "end_time" },
    { header: "Reason", key: "reason" },
    { header: "Status", key: "status" },
    { header: "Hours Remaining", key: "hours_remaining" },
    { header: "Revoked At", key: "revoked_at" },
    { header: "Revoked By", key: "revoked_by_name" },
  ],
  REGION_REQUESTS: [
    { header: "Request ID", key: "id" },
    { header: "User", key: "user_name" },
    { header: "Email", key: "user_email" },
    { header: "User Role", key: "user_role" },
    { header: "Department", key: "user_department" },
    { header: "Region", key: "region" },
    { header: "Region Code", key: "region_code" },
    { header: "Request Type", key: "request_type" },
    { header: "Reason", key: "reason" },
    { header: "Status", key: "status" },
    { header: "Created At", key: "created_at" },
    { header: "Reviewed By", key: "reviewed_by_name" },
    { header: "Reviewed At", key: "reviewed_at" },
    { header: "Review Notes", key: "review_notes" },
    { header: "Response Time (hrs)", key: "response_time_hours" },
  ],
  ZONE_ASSIGNMENTS: [
    { header: "User ID", key: "user_id" },
    { header: "Username", key: "username" },
    { header: "User", key: "user_name" },
    { header: "Email", key: "user_email" },
    { header: "Role", key: "role" },
    { header: "Department", key: "department" },
    { header: "Office Location", key: "office_location" },
    { header: "Phone", key: "phone" },
    { header: "Status", key: "user_status" },
    { header: "Assigned Regions", key: "assigned_regions" },
    { header: "Region Count", key: "region_count" },
    { header: "Assigned By", key: "assigned_by_name" },
    { header: "First Assignment", key: "first_assignment" },
    { header: "Latest Assignment", key: "latest_assignment" },
  ],
  COMPREHENSIVE: [
    { header: "Category", key: "category" },
    { header: "Metric", key: "metric" },
    { header: "Value", key: "value" },
    { header: "Details", key: "details" },
  ],
  NETWORK_DATA: [
    { header: "Category", key: "category" },
    { header: "Folder Path", key: "folder_path" },
    { header: "File Name", key: "file_name" },
    { header: "Icon Type", key: "icon_type" },
    { header: "Feature Count", key: "feature_count" },
    { header: "Feature ID", key: "feature_id" },
    { header: "Properties", key: "properties" },
    { header: "Latitude", key: "latitude" },
    { header: "Longitude", key: "longitude" },
    { header: "Status", key: "processing_status" },
    { header: "Created At", key: "file_created_at" },
  ],
};

const handleReportResponse = (res, data, format, reportName, headers) => {
  if (format === "xlsx") {
    return generateXLSX(res, data, reportName, headers);
  }
  if (format === "csv") {
    return generateCSV(res, data, reportName);
  }
  res.json({ success: true, data, meta: { total: data.length, generatedAt: new Date().toISOString() } });
};

const getRegionUsageReport = async (req, res) => {
  try {
    const stats = await reportService.getRegionUsage();
    try {
      await logAudit(
        req.user.id,
        "Generated Region Usage Report",
        "REPORT_GENERATE",
        0,
        { type: "REGION_USAGE", records: stats.length },
        req,
      );
    } catch (e) {}
    handleReportResponse(
      res,
      stats,
      req.query.format,
      "region_usage",
      REPORT_HEADERS.REGION_USAGE,
    );
  } catch (error) {
    console.error("Region usage report error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate region usage report",
    });
  }
};

const getUserActivityReport = async (req, res) => {
  try {
    const activity = await reportService.getUserActivity();
    try {
      await logAudit(
        req.user.id,
        "Generated User Activity Report",
        "REPORT_GENERATE",
        0,
        { type: "USER_ACTIVITY", records: activity.length },
        req,
      );
    } catch (e) {}
    handleReportResponse(
      res,
      activity,
      req.query.format,
      "user_activity",
      REPORT_HEADERS.USER_ACTIVITY,
    );
  } catch (error) {
    console.error("User activity report error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate user activity report",
    });
  }
};

const getAccessDenialsReport = async (req, res) => {
  try {
    const denials = await reportService.getAccessDenials();
    try {
      await logAudit(
        req.user.id,
        "Generated Access Denials Report",
        "REPORT_GENERATE",
        0,
        { type: "ACCESS_DENIALS", records: denials.length },
        req,
      );
    } catch (e) {}
    handleReportResponse(
      res,
      denials,
      req.query.format,
      "access_denials",
      REPORT_HEADERS.ACCESS_DENIALS,
    );
  } catch (error) {
    console.error("Access denials report error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate access denials report",
    });
  }
};

const getAuditLogsReport = async (req, res) => {
  try {
    const logs = await reportService.getAuditLogs(req.query.limit);
    try {
      await logAudit(
        req.user.id,
        "Generated Audit Logs Report",
        "REPORT_GENERATE",
        0,
        { type: "AUDIT_LOGS", records: logs.length },
        req,
      );
    } catch (e) {}
    handleReportResponse(
      res,
      logs,
      req.query.format,
      "audit_logs",
      REPORT_HEADERS.AUDIT_LOGS,
    );
  } catch (error) {
    console.error("Audit logs report error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to generate audit logs report" });
  }
};

const getTemporaryAccessReport = async (req, res) => {
  console.log("📊 getTemporaryAccessReport controller called!");
  try {
    const tempAccess = await reportService.getTemporaryAccess();
    try {
      await logAudit(
        req.user.id,
        "Generated Temporary Access Report",
        "REPORT_GENERATE",
        0,
        { type: "TEMP_ACCESS", records: tempAccess.length },
        req,
      );
    } catch (e) {}
    handleReportResponse(
      res,
      tempAccess,
      req.query.format,
      "temporary_access",
      REPORT_HEADERS.TEMP_ACCESS,
    );
  } catch (error) {
    console.error("Temporary access report error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate temporary access report",
    });
  }
};

const getRegionRequestsReport = async (req, res) => {
  try {
    const requests = await reportService.getRegionRequests();
    try {
      await logAudit(
        req.user.id,
        "Generated Region Requests Report",
        "REPORT_GENERATE",
        0,
        { type: "REGION_REQUESTS", records: requests.length },
        req,
      );
    } catch (e) {}
    handleReportResponse(
      res,
      requests,
      req.query.format,
      "region_requests",
      REPORT_HEADERS.REGION_REQUESTS,
    );
  } catch (error) {
    console.error("Region requests report error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate region requests report",
    });
  }
};

const getZoneAssignmentsReport = async (req, res) => {
  try {
    const assignments = await reportService.getZoneAssignments();
    try {
      await logAudit(
        req.user.id,
        "Generated Zone Assignments Report",
        "REPORT_GENERATE",
        0,
        { type: "ZONE_ASSIGNMENTS", records: assignments.length },
        req,
      );
    } catch (e) {}
    handleReportResponse(
      res,
      assignments,
      req.query.format,
      "zone_assignments",
      REPORT_HEADERS.ZONE_ASSIGNMENTS,
    );
  } catch (error) {
    console.error("Zone assignments report error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate zone assignments report",
    });
  }
};

const getComprehensiveReport = async (req, res) => {
  try {
    const data = await reportService.getComprehensive();
    try {
      await logAudit(
        req.user.id,
        "Generated Comprehensive Report",
        "REPORT_GENERATE",
        0,
        { type: "COMPREHENSIVE" },
        req,
      );
    } catch (e) {}
    const { format } = req.query;

    if (format === "xlsx" || format === "csv") {
      // Build detailed summary array with categories
      const summaryArray = [
        // Regions
        { category: "Regions", metric: "Total Regions", value: data.regions.total, details: "" },
        { category: "Regions", metric: "Active Regions", value: data.regions.active, details: "" },
        // Users
        { category: "Users", metric: "Total Users", value: data.users.total, details: "" },
        { category: "Users", metric: "Active Users", value: data.users.active, details: "" },
        { category: "Users", metric: "Inactive Users", value: data.users.inactive, details: "" },
        { category: "Users", metric: "Email Verified Users", value: data.users.email_verified, details: "" },
        { category: "Users", metric: "MFA Enabled Users", value: data.users.mfa_enabled, details: "" },
        { category: "Users", metric: "Admins", value: data.users.admins, details: "Role: admin" },
        { category: "Users", metric: "Managers", value: data.users.managers, details: "Role: manager" },
        { category: "Users", metric: "Viewers", value: data.users.viewers, details: "Role: viewer" },
        { category: "Users", metric: "Regular Users", value: data.users.regular_users, details: "Role: user" },
        // Temporary Access
        { category: "Temporary Access", metric: "Total Grants", value: data.temporary_access.total, details: "" },
        { category: "Temporary Access", metric: "Active Grants", value: data.temporary_access.active, details: "" },
        { category: "Temporary Access", metric: "Expired Grants", value: data.temporary_access.expired, details: "" },
        { category: "Temporary Access", metric: "Revoked Grants", value: data.temporary_access.revoked, details: "" },
        // Region Requests
        { category: "Region Requests", metric: "Total Requests", value: data.region_requests.total, details: "" },
        { category: "Region Requests", metric: "Pending Requests", value: data.region_requests.pending, details: "Awaiting review" },
        { category: "Region Requests", metric: "Approved Requests", value: data.region_requests.approved, details: "" },
        { category: "Region Requests", metric: "Rejected Requests", value: data.region_requests.rejected, details: "" },
        // Audit Logs
        { category: "Audit Logs", metric: "Total Audit Events", value: data.audit_logs.total, details: "" },
        { category: "Audit Logs", metric: "Denied/Failed Events", value: data.audit_logs.denied_or_failed, details: "" },
        { category: "Audit Logs", metric: "Unique Users in Logs", value: data.audit_logs.unique_users, details: "" },
        // Network Data
        { category: "Network Data", metric: "Total Files", value: data.network_data.total_files, details: "" },
        { category: "Network Data", metric: "Total Folders", value: data.network_data.total_folders, details: "" },
        { category: "Network Data", metric: "Total Features (GIS)", value: data.network_data.total_features, details: "" },
        { category: "Network Data", metric: "Completed Files", value: data.network_data.completed_files, details: "" },
        { category: "Network Data", metric: "Failed Files", value: data.network_data.failed_files, details: "" },
        // Report Metadata
        { category: "Report Info", metric: "Generated At", value: new Date().toISOString(), details: "Comprehensive Report" },
      ];

      return handleReportResponse(
        res,
        summaryArray,
        format,
        "comprehensive_report",
        REPORT_HEADERS.COMPREHENSIVE,
      );
    }

    // JSON: return full structured data
    res.json({
      success: true,
      data: {
        generated_at: new Date().toISOString(),
        summary: data,
      },
      meta: { generatedAt: new Date().toISOString() },
    });
  } catch (error) {
    console.error("Comprehensive report error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate comprehensive report",
    });
  }
};

const getNetworkDataReport = async (req, res) => {
  try {
    const networkData = await reportService.getNetworkData();

    // Process properties to string for CSV/XLSX export
    const processedData = networkData.map((row) => ({
      ...row,
      properties: row.properties ? JSON.stringify(row.properties) : "",
      latitude: row.latitude ? parseFloat(row.latitude).toFixed(6) : "",
      longitude: row.longitude ? parseFloat(row.longitude).toFixed(6) : "",
    }));

    try {
      await logAudit(
        req.user.id,
        "Generated Network Data Report",
        "REPORT_GENERATE",
        0,
        { type: "NETWORK_DATA", count: processedData.length },
        req,
      );
    } catch (e) {}

    handleReportResponse(
      res,
      processedData,
      req.query.format,
      "network_data",
      REPORT_HEADERS.NETWORK_DATA,
    );
  } catch (error) {
    console.error("Network data report error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate network data report",
    });
  }
};

module.exports = {
  getRegionUsageReport,
  getUserActivityReport,
  getAccessDenialsReport,
  getAuditLogsReport,
  getTemporaryAccessReport,
  getRegionRequestsReport,
  getZoneAssignmentsReport,
  getComprehensiveReport,
  getNetworkDataReport,
};
