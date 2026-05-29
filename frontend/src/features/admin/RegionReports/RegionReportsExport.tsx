// Region Reports Export Component - Enhanced

import React, { useState } from "react";
import { useAppSelector } from "../../../store/index";
import {
  getAvailableReports,
  downloadReport,
  type ReportType,
} from "../../../services/regionReports/index";
import NotificationDialog from "../../../components/ui/NotificationDialog";
import { usePermission } from "../../../hooks/usePermission";
import RegionReportsExportHeader from "./components/RegionReportsExportHeader";
import ReportSelection from "./components/ReportSelection";
import FormatSelection from "./components/FormatSelection";
import QuickExportButtons from "./components/QuickExportButtons";

const RegionReportsExport: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { can, isAdmin } = usePermission();
  const canAccess = isAdmin || can("admin:export_reports");

  const [selectedReport, setSelectedReport] =
    useState<ReportType>("comprehensive");
  const [selectedFormat, setSelectedFormat] = useState<"csv" | "json" | "xlsx">(
    "xlsx",
  );
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<{ report: string; time: string; format: string } | null>(null);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: "info" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
  });

  const availableReports = getAvailableReports();
  const selectedReportDetails = availableReports.find((r) => r.type === selectedReport);

  const handleExport = async (
    reportType?: ReportType,
    format?: "csv" | "json" | "xlsx",
  ) => {
    const type = reportType || selectedReport;
    const fmt = format || selectedFormat;
    const reportName = availableReports.find((r) => r.type === type)?.name || type;

    setIsExporting(true);
    try {
      await downloadReport({ type, format: fmt });

      setLastExport({
        report: reportName,
        time: new Date().toLocaleTimeString(),
        format: fmt.toUpperCase(),
      });

      setNotification({
        isOpen: true,
        type: "success",
        title: "Report Exported Successfully",
        message: `${reportName} exported as ${fmt.toUpperCase()} successfully. Check your downloads folder.`,
      });
    } catch (error: any) {
      console.error("Failed to export report:", error);
      setNotification({
        isOpen: true,
        type: "error",
        title: "Export Failed",
        message:
          error.message || "Failed to generate report. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickExport = (
    reportType: ReportType,
    format: "csv" | "json" | "xlsx",
  ) => {
    setSelectedReport(reportType);
    setSelectedFormat(format);
    handleExport(reportType, format);
  };

  if (!canAccess) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Access Denied
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Only administrators can export reports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <RegionReportsExportHeader />

      {/* Last Export Info */}
      {lastExport && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Last Export: <strong>{lastExport.report}</strong> ({lastExport.format})
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Exported at {lastExport.time}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Report Selection */}
      <ReportSelection
        availableReports={availableReports}
        selectedReport={selectedReport}
        onReportChange={setSelectedReport}
      />

      {/* Format Selection */}
      <FormatSelection
        selectedFormat={selectedFormat}
        onFormatChange={setSelectedFormat}
      />

      {/* Export Button — Enhanced with selected report details */}
      <div className="bg-gradient-to-br from-blue-50/50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl shadow-xl border-2 border-blue-100 dark:border-blue-900/30 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              {selectedReportDetails?.icon ? (
                <span className="text-2xl">{selectedReportDetails.icon}</span>
              ) : (
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                Ready to export:{" "}
                <strong className="text-blue-700 dark:text-blue-300">
                  {selectedReportDetails?.name}
                </strong>
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300 px-2 py-0.5 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-md shadow-sm border border-blue-300 dark:border-blue-700">
                  Format: {selectedFormat.toUpperCase()}
                </span>
                {selectedReportDetails?.columns && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 px-2 py-0.5 bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-md shadow-sm border border-indigo-300 dark:border-indigo-700">
                    {selectedReportDetails.columns} columns
                  </span>
                )}
                {selectedReportDetails?.category && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md">
                    {selectedReportDetails.category}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleExport()}
            disabled={isExporting}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200 font-bold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Export Buttons */}
      <QuickExportButtons onQuickExport={handleQuickExport} />

      {/* Notification Dialog */}
      <NotificationDialog
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />
    </div>
  );
};

export default RegionReportsExport;
