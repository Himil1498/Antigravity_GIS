import React from "react";
import { toast, ToastOptions } from "react-toastify";
import { Check, X, AlertTriangle, Info, Loader2 } from "lucide-react";

/**
 * Centralized Toast Notification Utility
 * Provides consistent toast notifications across the application
 */

// Custom Toast Content Component
interface ToastContentProps {
  title: string;
  description?: string;
}

export const ToastBody: React.FC<ToastContentProps> = ({ title, description }) => (
  <div className="flex flex-col justify-center">
    <h4 className="font-normal text-[#374151] dark:text-gray-200 text-[15px] leading-tight flex items-center h-full">
      {title}
    </h4>
    {description && (
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-normal font-medium">
        {description}
      </p>
    )}
  </div>
);

const defaultOptions: ToastOptions = {
  position: "bottom-left", // Re-positioned per user request
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  className: "custom-toast-container",
};

// Helper to determine content
const resolveContent = (
  content: string | { title: string; description?: string },
) => {
  if (typeof content === "string") {
    return <ToastBody title={content} />;
  }
  return <ToastBody title={content.title} description={content.description} />;
};

export const showToast = {
  /**
   * Show success notification
   */
  success: (
    content: string | { title: string; description?: string },
    options?: ToastOptions,
  ) => {
    toast.success(resolveContent(content), {
      ...defaultOptions,
      ...options,
      icon: (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#16a34a] text-white flex-shrink-0">
          <Check className="w-4 h-4" strokeWidth={3} />
        </div>
      ),
    });
  },

  /**
   * Show error notification
   */
  error: (
    content: string | { title: string; description?: string },
    options?: ToastOptions,
  ) => {
    toast.error(resolveContent(content), {
      ...defaultOptions,
      autoClose: 5000,
      ...options,
      icon: (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-sm ring-1 ring-red-500/10">
          <X className="w-5 h-5" strokeWidth={3} />
        </div>
      ),
    });
  },

  /**
   * Show warning notification
   */
  warning: (
    content: string | { title: string; description?: string },
    options?: ToastOptions,
  ) => {
    toast.warning(resolveContent(content), {
      ...defaultOptions,
      ...options,
      icon: (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shadow-sm ring-1 ring-amber-500/10">
          <AlertTriangle className="w-5 h-5" strokeWidth={3} />
        </div>
      ),
    });
  },

  /**
   * Show info notification
   */
  info: (
    content: string | { title: string; description?: string },
    options?: ToastOptions,
  ) => {
    toast.info(resolveContent(content), {
      ...defaultOptions,
      ...options,
      icon: (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500/10">
          <Info className="w-5 h-5" strokeWidth={3} />
        </div>
      ),
    });
  },

  /**
   * Show loading notification (returns toast id for updates)
   */
  loading: (message: string) => {
    return toast.loading(<ToastBody title={message} />, {
      ...defaultOptions,
      icon: <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />,
    });
  },

  /**
   * Update existing toast
   */
  update: (
    toastId: any,
    content: string | { title: string; description?: string },
    type: "success" | "error" | "warning" | "info",
  ) => {
    let icon;
    switch (type) {
      case "success":
        icon = (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#4cd964] text-white flex-shrink-0">
            <Check className="w-4 h-4" strokeWidth={3} />
          </div>
        );
        break;
      case "error":
        icon = (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-sm ring-1 ring-red-500/10">
            <X className="w-5 h-5" strokeWidth={3} />
          </div>
        );
        break;
      case "warning":
        icon = (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shadow-sm ring-1 ring-amber-500/10">
            <AlertTriangle className="w-5 h-5" strokeWidth={3} />
          </div>
        );
        break;
      case "info":
        icon = (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500/10">
            <Info className="w-5 h-5" strokeWidth={3} />
          </div>
        );
        break;
    }

    toast.update(toastId, {
      render: resolveContent(content),
      type: type,
      icon: icon,
      isLoading: false,
      autoClose: 3000,
      ...defaultOptions,
    });
  },

  /**
   * Dismiss specific toast
   */
  dismiss: (toastId?: any) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },
};

// Predefined toast messages for common operations
export const toastMessages = {
  // User Management
  user: {
    created: "User created successfully!",
    updated: "User updated successfully!",
    deleted: "User deleted successfully!",
    activated: "User activated successfully!",
    deactivated: "User deactivated successfully!",
    passwordChanged: "Password changed successfully!",
    bulkDeleted: (count: number) => `${count} user(s) deleted successfully!`,
    bulkUpdated: (count: number) => `${count} user(s) updated successfully!`,
    importSuccess: (count: number) => `${count} user(s) imported successfully!`,
    exportSuccess: "Users exported successfully!",
  },

  // Audit Logs
  auditLog: {
    deleted: "Audit log deleted successfully!",
    bulkDeleted: (count: number) =>
      `${count} audit log(s) deleted successfully!`,
    allDeleted: "All audit logs deleted successfully!",
    exported: "Audit logs exported successfully!",
  },

  // Region Management
  region: {
    requestSubmitted: "Region request submitted successfully!",
    requestApproved: "Region request approved!",
    requestRejected: "Region request rejected!",
    assigned: "Region assigned successfully!",
    unassigned: "Region unassigned successfully!",
  },

  // Access Management
  access: {
    bulkAssigned: (count: number) =>
      `Access granted to ${count} user(s) successfully!`,
    temporaryGranted: "Temporary access granted successfully!",
    temporaryRevoked: "Temporary access revoked successfully!",
    temporaryExpired: "Your temporary access has expired!",
  },

  // Infrastructure
  infrastructure: {
    created: "Infrastructure item created successfully!",
    updated: "Infrastructure item updated successfully!",
    deleted: "Infrastructure item deleted successfully!",
    bulkDeleted: (count: number) =>
      `${count} infrastructure item(s) deleted successfully!`,
    imported: (count: number) =>
      `${count} infrastructure item(s) imported successfully!`,
    exported: "Infrastructure items exported successfully!",
  },

  // GIS Data Hub
  gisData: {
    saved: "Data saved successfully!",
    deleted: "Data deleted successfully!",
    bulkDeleted: (count: number, type: string) =>
      `${count} ${type} record(s) deleted successfully!`,
    exported: "Data exported successfully!",
    imported: "Data imported successfully!",
  },

  // Map Tools
  map: {
    measurementSaved: "Measurement saved successfully!",
    polygonSaved: "Polygon saved successfully!",
    circleSaved: "Circle saved successfully!",
    sectorSaved: "RF Sector saved successfully!",
    elevationSaved: "Elevation profile saved successfully!",
    deleted: "Item deleted successfully!",

    // Detailed messages for enhanced UI
    loaded: {
      title: "Map Loaded",
      description: "Google Maps loaded - All tools ready in India",
    },
  },

  // Authentication
  auth: {
    loginSuccess: {
      title: "Welcome back!",
      description: "You have successfully logged in.",
    },
    logoutSuccess: "Logged out successfully!",
    sessionExpired: "Your session has expired. Please login again.",
    passwordResetSent: "Password reset link sent to your email!",
    passwordReset: "Password reset successfully!",
    unauthorized: "You do not have permission to perform this action.",
  },

  // Profile
  profile: {
    updated: "Profile updated successfully!",
    photoUploaded: "Profile photo uploaded successfully!",
    settingsSaved: "Settings saved successfully!",
  },

  // General
  general: {
    saved: "Saved successfully!",
    deleted: "Deleted successfully!",
    updated: "Updated successfully!",
    copied: "Copied to clipboard!",
    uploadSuccess: "File uploaded successfully!",
    downloadSuccess: "File downloaded successfully!",
  },

  // Errors
  error: {
    general: "An error occurred. Please try again.",
    network: "Network error. Please check your connection.",
    server: "Server error. Please try again later.",
    validation: "Please check your input and try again.",
    notFound: "Resource not found.",
    unauthorized: "You are not authorized to perform this action.",
    forbidden: "Access denied.",
    timeout: "Request timed out. Please try again.",
  },
};
