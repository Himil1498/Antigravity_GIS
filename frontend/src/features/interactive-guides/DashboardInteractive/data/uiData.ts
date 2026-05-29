import { KPICard, ActivityType, HealthMetric, Feature } from "../types";

export const kpiCards: KPICard[] = [
  {
    name: "POP",
    icon: "🔴",
    color: "red",
    desc: "Point of Presence - Main network connection points",
  },
  {
    name: "Sub POP",
    icon: "⭕",
    color: "orange",
    desc: "Sub Point of Presence - Secondary network points",
  },
  {
    name: "BTS-CO-LO",
    icon: "📡",
    color: "blue",
    desc: "Base Transceiver Station Co-Location",
  },
  {
    name: "Bandwidth BTS",
    icon: "📶",
    color: "cyan",
    desc: "Bandwidth distribution points",
  },
  {
    name: "Office Location",
    icon: "🏢",
    color: "purple",
    desc: "Company office sites",
  },
  {
    name: "NNI",
    icon: "🔗",
    color: "green",
    desc: "Network-to-Network Interface connections",
  },
  {
    name: "Data Center",
    icon: "🏛️",
    color: "indigo",
    desc: "Primary data facilities",
  },
  {
    name: "Customer",
    icon: "👥",
    color: "pink",
    desc: "Customer locations (5 telecom operators)",
  },
];

export const activityTypes: ActivityType[] = [
  {
    type: "measurement",
    color: "blue",
    icon: "📏",
    desc: "Distance measurements",
  },
  { type: "polygon", color: "purple", icon: "🔺", desc: "Polygon drawings" },
  {
    type: "infrastructure",
    color: "green",
    icon: "🏗️",
    desc: "Infrastructure items",
  },
  { type: "circle", color: "yellow", icon: "⭕", desc: "Circle drawings" },
  { type: "sector", color: "orange", icon: "📡", desc: "RF sectors" },
];

export const healthMetrics: HealthMetric[] = [
  {
    name: "Network Health",
    color: "green",
    icon: "🌐",
    calc: "(Active items / Total items) × 100",
    thresholds: "Green ≥90%, Yellow ≥70%, Red <70%",
    display: "X of Y infrastructure active",
  },
  {
    name: "Coverage",
    color: "blue",
    icon: "📍",
    calc: "(Covered regions / Total regions) × 100",
    thresholds: "Blue ≥80%, Cyan ≥50%, Orange <50%",
    display: "X of Y regions covered",
  },
  {
    name: "Utilization",
    color: "yellow",
    icon: "⚡",
    calc: "Based on UPS and power source quality",
    thresholds: "Green ≥80%, Yellow ≥60%, Orange <60%",
    display: "Resource usage efficiency",
  },
];

export const features: Feature[] = [
  {
    title: "Personal Dashboard",
    icon: "👤",
    color: "blue",
    desc: "All data filtered to show only YOUR infrastructure, activities, and metrics",
  },
  {
    title: "Real-time Updates",
    icon: "🔄",
    color: "green",
    desc: "Auto-refresh every 5 minutes (KPI) and 60 seconds (activities/health)",
  },
  {
    title: "Visual Health Metrics",
    icon: "📊",
    color: "purple",
    desc: "Color-coded progress bars show network health, coverage, and utilization at a glance",
  },
  {
    title: "Activity Tracking",
    icon: "📋",
    color: "orange",
    desc: "Monitor your last 10 actions with color-coded dots and relative timestamps",
  },
  {
    title: "Manual Refresh",
    icon: "🔄",
    color: "cyan",
    desc: "Instant data update button available for KPI cards anytime you need it",
  },
  {
    title: "Dark Mode Support",
    icon: "🌙",
    color: "indigo",
    desc: "Full dark mode support for comfortable viewing in any lighting condition",
  },
];

export const proTips = [
  {
    title: "🌅 Start Your Day with Dashboard",
    content:
      "Make it a habit to check the dashboard first thing - it gives you a complete health overview in seconds",
  },
  {
    title: "⚠️ Act on Maintenance Alerts Promptly",
    content:
      "Don't ignore the maintenance warning badge - schedule maintenance to prevent infrastructure issues",
  },
  {
    title: "📊 Watch Health Metric Trends",
    content:
      "If health percentages are declining over days, investigate before they hit critical levels",
  },
  {
    title: "🔄 Use Manual Refresh Strategically",
    content:
      "After making bulk changes, hit the manual refresh button to see updated stats immediately",
  },
  {
    title: "📋 Review Recent Activity Regularly",
    content:
      "Check the activity feed to verify your changes were recorded correctly and catch any mistakes",
  },
  {
    title: "🎯 Set Health Goals",
    content:
      "Aim for Network Health ≥95%, Coverage ≥90%, and Utilization ≥80% for optimal performance",
  },
  {
    title: "🌙 Use Dark Mode for Long Sessions",
    content:
      "Toggle dark mode if you're monitoring the dashboard for extended periods to reduce eye strain",
  },
  {
    title: "👥 Compare Customer Distribution",
    content:
      "Use the customer card to ensure balanced infrastructure allocation across telecom operators",
  },
  {
    title: "🔍 Hover for Hidden Details",
    content:
      "Hover over KPI cards and activity items for additional information not shown by default",
  },
  {
    title: "📱 Keep Dashboard Open",
    content:
      "Leave dashboard open in a browser tab - auto-refresh keeps you updated without manual checking",
  },
];

export const useCases = [
  {
    title: "📈 Daily Health Check",
    desc: "Start your day by checking the 3 health metrics to ensure all your infrastructure is operating normally",
  },
  {
    title: "🏗️ Infrastructure Overview",
    desc: "Quick view of all your infrastructure across 8 categories with status breakdowns",
  },
  {
    title: "📋 Activity Tracking",
    desc: "Monitor your recent work - what you've created, updated, or deleted in the last few hours",
  },
  {
    title: "⚠️ Maintenance Planning",
    desc: "Watch for maintenance alerts to plan and schedule necessary infrastructure upkeep",
  },
  {
    title: "👥 Customer Site Management",
    desc: "Track customer infrastructure across 5 major telecom operators at a glance",
  },
  {
    title: "📊 Performance Monitoring",
    desc: "Use health percentages to identify areas needing attention or improvement",
  },
];

