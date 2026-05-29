// constants.ts
import { HelpMenuItem } from "./types";
import {
  FlowDiagramIcon,
  BookIcon,
  KeyboardIcon,
  VideoIcon,
  EmailIcon,
  DatabaseIcon,
  ApiIcon,
} from "./icons";

export const HELP_MENU_ITEMS: HelpMenuItem[] = [
  {
    id: "user-guides",
    label: "User Guide",
    description: "Complete documentation",
    icon: BookIcon,
    iconBgColor:
      "bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    hoverBgColor: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
    action: "view-user-guide", // Maps to existing /flow-diagram route
  },
  {
    id: "flow-diagrams",
    label: "Flow Diagrams",
    description: "Application workflows",
    icon: FlowDiagramIcon,
    iconBgColor:
      "bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50",
    iconColor: "text-purple-600 dark:text-purple-400",
    hoverBgColor: "hover:bg-purple-50 dark:hover:bg-purple-900/20",
    action: "view-flow-diagrams", // Maps to Coming Soon
  },
  {
    id: "keyboard-shortcuts",
    label: "Keyboard Shortcuts",
    description: "Quick access commands",
    icon: KeyboardIcon,
    iconBgColor:
      "bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    hoverBgColor: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
    action: "view-keyboard-shortcuts",
  },
  {
    id: "video-tutorials",
    label: "Video Tutorials",
    description: "Visual guides & demos",
    icon: VideoIcon,
    iconBgColor:
      "bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    hoverBgColor: "hover:bg-amber-50 dark:hover:bg-amber-900/20",
    action: "view-video-tutorials",
  },
  {
    id: "contact-support",
    label: "Contact Support",
    description: "Get help from our team",
    icon: EmailIcon,
    iconBgColor:
      "bg-rose-100 dark:bg-rose-900/30 group-hover:bg-rose-200 dark:group-hover:bg-rose-900/50",
    iconColor: "text-rose-600 dark:text-rose-400",
    hoverBgColor: "hover:bg-rose-50 dark:hover:bg-rose-900/20",
    action: "contact-support",
  },
  {
    id: "database-schema",
    label: "Database Schema",
    description: "Explore tables & relationships",
    icon: DatabaseIcon,
    iconBgColor:
      "bg-cyan-100 dark:bg-cyan-900/30 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/50",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    hoverBgColor: "hover:bg-cyan-50 dark:hover:bg-cyan-900/20",
    action: "view-database-schema",
    permission: "system:schema:view",
  },
  {
    id: "api-docs",
    label: "API Documentation",
    description: "Endpoints & integration guide",
    icon: ApiIcon,
    iconBgColor:
      "bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50",
    iconColor: "text-orange-600 dark:text-orange-400",
    hoverBgColor: "hover:bg-orange-50 dark:hover:bg-orange-900/20",
    action: "view-api-docs",
    permission: "system:api:view",
  },
  {
    id: "server-architecture",
    label: "Server Architecture",
    description: "Interactive system deployment map",
    icon: DatabaseIcon,
    iconBgColor:
      "bg-teal-100 dark:bg-teal-900/30 group-hover:bg-teal-200 dark:group-hover:bg-teal-900/50",
    iconColor: "text-teal-600 dark:text-teal-400",
    hoverBgColor: "hover:bg-teal-50 dark:hover:bg-teal-900/20",
    action: "view-server-architecture",
    permission: "system:architecture:view",
  },
  {
    id: "user-workflows",
    label: "Platform User Workflows",
    description: "Interactive guides & manual PDFs.",
    icon: FlowDiagramIcon,
    iconBgColor:
      "bg-indigo-100 dark:bg-indigo-900/30 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    hoverBgColor: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
    action: "view-user-workflows",
  },
];
