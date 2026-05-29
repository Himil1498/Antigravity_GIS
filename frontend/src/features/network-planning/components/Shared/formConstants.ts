import {
  Building2,
  Server,
  Database,
  Network,
  CheckSquare,
  Pause,
  Wrench,
  ClipboardList,
  Rocket,
  AlertTriangle,
  RadioTower,
  Home,
  Box,
  Construction,
  Zap,
  Sun,
  Plug,
  Battery,
  Settings,
} from "lucide-react";

export const TYPE_OPTIONS = [
  {
    id: "POP",
    name: "POP",
    icon: Building2,
    desc: "Point of Presence",
    color: "text-indigo-600",
  },
  {
    id: "Sub POP",
    name: "Sub POP",
    icon: Server,
    desc: "Secondary Point",
    color: "text-cyan-600",
  },
  {
    id: "Data Center",
    name: "Data Center",
    icon: Database,
    desc: "Data Storage Facility",
    color: "text-blue-600",
  },
  {
    id: "NNI",
    name: "NNI",
    icon: Network,
    desc: "Network to Network Interface",
    color: "text-violet-600",
  },
];

export const STATUS_OPTIONS = [
  {
    id: "Active",
    name: "Active",
    icon: CheckSquare,
    desc: "Currently operational",
    color: "text-emerald-500",
  },
  {
    id: "Inactive",
    name: "Inactive",
    icon: Pause,
    desc: "Not in use",
    color: "text-blue-500",
  },
  {
    id: "Maintenance",
    name: "Maintenance",
    icon: Wrench,
    desc: "Under maintenance",
    color: "text-purple-500",
  },
  {
    id: "Planned",
    name: "Planned",
    icon: ClipboardList,
    desc: "Planning stage",
    color: "text-amber-600",
  },
  {
    id: "RFS",
    name: "RFS",
    icon: Rocket,
    desc: "Ready for Service",
    color: "text-pink-500",
  },
  {
    id: "Damaged",
    name: "Damaged",
    icon: AlertTriangle,
    desc: "Needs repair",
    color: "text-red-500",
  },
];

export const STRUCTURE_TYPE_OPTIONS = [
  {
    id: "Tower",
    name: "Tower",
    icon: RadioTower,
    desc: "Tower structure",
    color: "text-orange-600",
  },
  {
    id: "Building",
    name: "Building",
    icon: Building2,
    desc: "Building structure",
    color: "text-slate-600",
  },
  {
    id: "Ground",
    name: "Ground",
    icon: Construction,
    desc: "Ground installation",
    color: "text-amber-700",
  },
  {
    id: "Rooftop",
    name: "Rooftop",
    icon: Home,
    desc: "Rooftop installation",
    color: "text-emerald-600",
  },
  {
    id: "Other",
    name: "Other",
    icon: Box,
    desc: "Other structure type",
    color: "text-gray-500",
  },
];

export const POWER_SOURCE_OPTIONS = [
  {
    id: "Grid",
    name: "Grid",
    icon: Zap,
    desc: "Electric grid power",
    color: "text-yellow-500",
  },
  {
    id: "Solar",
    name: "Solar",
    icon: Sun,
    desc: "Solar power",
    color: "text-orange-500",
  },
  {
    id: "Generator",
    name: "Generator",
    icon: Plug,
    desc: "Generator power",
    color: "text-red-500",
  },
  {
    id: "Hybrid",
    name: "Hybrid",
    icon: Battery,
    desc: "Hybrid power system",
    color: "text-green-500",
  },
  {
    id: "Other",
    name: "Other",
    icon: Settings,
    desc: "Other power source",
    color: "text-gray-500",
  },
];

export const REGION_OPTIONS = [
  { id: "North", name: "North" },
  { id: "South", name: "South" },
  { id: "West", name: "West" },
  { id: "East", name: "East" },
  { id: "North-East", name: "North-East" },
];

