import { TabOverview } from '../types';

export const tabsOverview: TabOverview[] = [
  {
    number: "1",
    name: "Audit Logs",
    icon: "📝",
    color: "blue",
    purpose: "System activity monitoring",
    features: [
      "Filter by user/action/entity",
      "Date range selection",
      "Detailed view modal",
      "CSV/PDF export",
    ],
  },
  {
    number: "2",
    name: "Region Requests",
    icon: "📋",
    color: "violet",
    purpose: "User access management",
    features: [
      "Approve/reject requests",
      "View justifications",
      "Bulk actions",
      "Auto-notifications",
    ],
  },
  {
    number: "3",
    name: "Bulk Assignment",
    icon: "👥",
    color: "green",
    purpose: "Multi-user region setup",
    features: [
      "Multi-select users",
      "Multi-select regions",
      "Add/Replace modes",
      "Preview before confirm",
    ],
  },
  {
    number: "4",
    name: "Temporary Access",
    icon: "⏰",
    color: "amber",
    purpose: "Time-limited permissions",
    features: [
      "Set expiry date/time",
      "Countdown timers",
      "Extend/revoke options",
      "Auto-cleanup",
    ],
  },
  {
    number: "5",
    name: "Export Reports",
    icon: "📥",
    color: "cyan",
    purpose: "Analytics & reporting",
    features: [
      "6 report types",
      "Custom fields",
      "Multiple formats",
      "Date range filters",
    ],
  },
  {
    number: "6",
    name: "Password Reset",
    icon: "🔑",
    color: "pink",
    purpose: "User account recovery",
    features: [
      "Reset link generation",
      "Temp password option",
      "Request history",
      "Status tracking",
    ],
  },
];

