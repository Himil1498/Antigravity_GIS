import { Section, Feature } from '../types';

export const sections: Section[] = [
  {
    title: "Infrastructure KPI Cards",
    icon: "🏗️",
    color: "blue",
    items: [
      { name: "POP", desc: "Point of Presence - Main network connection points" },
      { name: "Sub POP", desc: "Sub Point of Presence - Secondary network points" },
      { name: "BTS-CO-LO", desc: "Base Transceiver Station Co-Location" },
      { name: "Bandwidth BTS", desc: "Bandwidth distribution points" },
      { name: "Office Location", desc: "Company office sites" },
      { name: "NNI", desc: "Network-to-Network Interface connections" },
      { name: "Data Center", desc: "Primary data facilities" },
      { name: "Customer", desc: "Customer locations" }
    ]
  },
  {
    title: "User & Tool Analytics",
    icon: "👥",
    color: "purple",
    items: [
      { name: "Total Users", desc: "All registered users count" },
      { name: "Active Users", desc: "Currently active accounts" },
      { name: "Distance Measurements", desc: "Total measurements created" },
      { name: "Elevation Profiles", desc: "Elevation analysis count" },
      { name: "Polygon Drawings", desc: "Polygon shapes drawn" },
      { name: "Circle Drawings", desc: "Circle shapes created" },
      { name: "RF Sector Tools", desc: "RF sector usage count" }
    ]
  },
  {
    title: "Performance Metrics",
    icon: "⚡",
    color: "cyan",
    items: [
      { name: "Latency Chart", desc: "API response times over time" },
      { name: "Success Rate", desc: "Percentage of successful requests" },
      { name: "Top Endpoints", desc: "Most frequently called APIs" },
      { name: "Time Ranges", desc: "1 hour, 6 hours, 24 hours, 7 days" }
    ]
  },
  {
    title: "System Health",
    icon: "💚",
    color: "green",
    items: [
      { name: "Database", desc: "Connection status indicator" },
      { name: "API", desc: "API health status" },
      { name: "WebSocket", desc: "Real-time connection status" },
      { name: "Uptime", desc: "System running duration" }
    ]
  }
];

export const features: Feature[] = [
  {
    title: "Real-Time Updates",
    icon: "🔄",
    color: "blue",
    desc: "Live data updates via WebSocket connection, no manual refresh needed for activity feed"
  },
  {
    title: "Interactive Charts",
    icon: "📊",
    color: "purple",
    desc: "Recharts library for responsive, interactive visualizations with hover tooltips"
  },
  {
    title: "Time Range Selector",
    icon: "⏰",
    color: "green",
    desc: "Choose from multiple time ranges (1h, 6h, 24h, 7d, 30d, 90d) for different views"
  },
  {
    title: "Color-Coded Status",
    icon: "🎨",
    color: "orange",
    desc: "Visual status indicators: Green (healthy/active), Red (issues/inactive), Amber (warning)"
  },
  {
    title: "System-Wide Scope",
    icon: "🌐",
    color: "cyan",
    desc: "All metrics show data from ALL users across the entire platform"
  },
  {
    title: "Dark Mode Support",
    icon: "🌙",
    color: "indigo",
    desc: "Full dark mode support for comfortable viewing in any lighting condition"
  }
];

export const proTips = [
  {
    title: "🔄 Enable Auto-Refresh for Live Monitoring",
    content: "Keep the dashboard open with auto-refresh ON to monitor system in real-time"
  },
  {
    title: "📊 Compare Different Time Ranges",
    content: "Switch between time ranges (1h, 24h, 7d) to spot trends and anomalies"
  },
  {
    title: "💚 Check System Health First",
    content: "Always verify system health badges before investigating other metrics"
  },
  {
    title: "📈 Watch Usage Trends",
    content: "Monitor 30-day and 90-day trends to understand long-term patterns"
  },
  {
    title: "⚡ Identify Performance Issues Early",
    content: "Look for latency spikes or drops in success rate to catch problems quickly"
  },
  {
    title: "🌙 Use Dark Mode for Extended Viewing",
    content: "Toggle dark mode for comfortable monitoring during long sessions"
  },
  {
    title: "👥 Track Recent Activity",
    content: "Watch the activity feed to see what's happening across the platform in real-time"
  },
  {
    title: "🎯 Focus on Top Endpoints",
    content: "Monitor the most-used API endpoints for performance optimization opportunities"
  }
];

export const useCases = [
  { title: "📈 Monitor Platform Growth", desc: "Track user adoption, feature usage, and infrastructure expansion over time" },
  { title: "⚡ Performance Analysis", desc: "Identify slow APIs, monitor latency trends, and ensure system reliability" },
  { title: "🏗️ Infrastructure Overview", desc: "Get complete picture of all infrastructure across the network" },
  { title: "👥 User Activity Tracking", desc: "See what users are doing in real-time across the platform" },
  { title: "💚 System Health Checks", desc: "Verify database, API, and WebSocket connections are operational" },
  { title: "📊 Usage Pattern Analysis", desc: "Identify most-used features and plan resource allocation" }
];

