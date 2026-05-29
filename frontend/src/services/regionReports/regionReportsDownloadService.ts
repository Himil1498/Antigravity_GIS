import { ReportOptions, ReportType } from "./types";
import {
  generateRegionUsageReport,
  generateUserActivityReport,
  generateAccessDenialsReport,
} from "./regionReportsUsageService";
import {
  generateAuditLogsReport,
  generateTemporaryAccessReport,
  generateRegionRequestsReport,
  generateZoneAssignmentsReport,
  generateComprehensiveReport,
} from "./regionReportsManagementService";

/**
 * Get available report types with enhanced descriptions
 */
export const getAvailableReports = (): Array<{
  type: ReportType;
  name: string;
  description: string;
  icon: string;
  columns: number;
  category: string;
}> => {
  return [
    {
      type: "comprehensive",
      name: "Comprehensive Report",
      description: "Complete system overview — regions, users, access stats, audit events, and network data summary all in one report",
      icon: "📊",
      columns: 4,
      category: "Overview",
    },
    {
      type: "user_activity",
      name: "User Activity Report",
      description: "All user details with login history, permissions, regions, MFA status, department, and address info (23 columns)",
      icon: "👥",
      columns: 23,
      category: "Users",
    },
    {
      type: "region_usage",
      name: "Region Usage Report",
      description: "Region access statistics — assigned users, temporary access users, user names, and region status",
      icon: "🗺️",
      columns: 11,
      category: "Regions",
    },
    {
      type: "zone_assignments",
      name: "Zone/Region Assignments",
      description: "Which users are assigned to which regions, with assignment dates, department, and office location",
      icon: "📌",
      columns: 14,
      category: "Regions",
    },
    {
      type: "region_requests",
      name: "Region Access Requests",
      description: "All access requests with user details, review status, reviewer notes, and response time tracking",
      icon: "📋",
      columns: 15,
      category: "Access",
    },
    {
      type: "audit_logs",
      name: "Audit Logs Report",
      description: "Complete audit trail — user actions, IP addresses, user agents, resource changes, and parsed details (up to 2000 entries)",
      icon: "📝",
      columns: 13,
      category: "Security",
    },
    {
      type: "access_denials",
      name: "Access Denials Report",
      description: "Denied and failed access attempts with full user info, IP addresses, and failure details",
      icon: "🚫",
      columns: 13,
      category: "Security",
    },
    {
      type: "network_data",
      name: "Network Data Report",
      description: "POP, Sub POP, BTS, NNI, Data Center, and Infra Provider data with GPS coordinates and GIS properties",
      icon: "🌐",
      columns: 11,
      category: "Network",
    },
  ];
};

/**
 * Generate report based on type and options
 */
export const generateReport = async (
  options: ReportOptions,
): Promise<string> => {
  switch (options.type) {
    case "region_usage":
      return generateRegionUsageReport(options.format);
    case "user_activity":
      return generateUserActivityReport(options.format);
    case "access_denials":
      return generateAccessDenialsReport(options.format);
    case "audit_logs":
      return generateAuditLogsReport(options.format);
    case "region_requests":
      return await generateRegionRequestsReport(options.format);
    case "zone_assignments":
      return generateZoneAssignmentsReport(options.format);
    case "comprehensive":
      return await generateComprehensiveReport(options.format);
    default:
      throw new Error(`Unknown report type: ${options.type}`);
  }
};

/**
 * Download report as file from backend API
 */
export const downloadReport = async (
  options: ReportOptions,
  filename?: string,
): Promise<void> => {
  try {
    const USE_BACKEND = process.env.REACT_APP_USE_BACKEND === "true";

    if (USE_BACKEND) {
      // Use backend API for reports
      const axios = (await import("axios")).default;
      const BACKEND_API_URL =
        process.env.REACT_APP_API_URL || "http://localhost:82/api";
      const apiClient = axios.create({
        baseURL: BACKEND_API_URL,
        timeout: 60000, // 60s timeout for reports
        headers: { "Content-Type": "application/json" },
      });

      // Add authorization header
      const token = sessionStorage.getItem("opti_connect_token") || localStorage.getItem("opti_connect_token");
      if (token) {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      // Convert report type to backend endpoint format (replace _ with -)
      const endpoint = options.type.replace(/_/g, "-");

      // Make API call with format query parameter
      const response = await apiClient.get(`/reports/${endpoint}`, {
        params: { format: options.format },
        responseType: options.format === "json" ? "json" : "blob",
      });

      // Handle JSON response
      if (options.format === "json") {
        const jsonStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          filename ||
          `${options.type}_report_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      // Handle CSV/XLSX blob response
      const blob = response.data as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers["content-disposition"];
      let downloadFilename = filename;

      if (!downloadFilename && contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          downloadFilename = filenameMatch[1];
        }
      }

      if (!downloadFilename) {
        const extension = options.format === "xlsx" ? "xlsx" : "csv";
        downloadFilename = `${options.type}_report_${new Date().toISOString().split("T")[0]}.${extension}`;
      }

      a.download = downloadFilename;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Fallback to old localStorage-based reports
      const content = await generateReport(options);
      const extension =
        options.format === "json"
          ? "json"
          : options.format === "xlsx"
            ? "xlsx"
            : "csv";
      const mimeType =
        options.format === "json"
          ? "application/json"
          : options.format === "xlsx"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv";

      const defaultFilename = `${options.type}_report_${new Date().toISOString().split("T")[0]}.${extension}`;
      const finalFilename = filename || defaultFilename;

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = finalFilename;
      a.click();
      URL.revokeObjectURL(url);
    }
  } catch (error: any) {
    console.error("Download report error:", error);
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        "Failed to download report",
    );
  }
};
