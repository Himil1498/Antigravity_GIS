import React from "react";
import {
  KPICardData,
  InfrastructureStats,
} from "../types/infrastructure.types";

export const getInfraTypeCards = (
  stats: InfrastructureStats,
): KPICardData[] => [
  {
    title: "POP",
    value: stats.byItemType.POP,
    subtitle: `Point of Presence`,
    icon: <span className="text-4xl">🔴</span>,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
  {
    title: "Sub POP",
    value: stats.byItemType["Sub POP"],
    subtitle: `Sub Point of Presence`,
    icon: <span className="text-4xl">⭕</span>,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    title: "BTS-CO-LO",
    value: stats.byItemType["BTS-CO-LO"],
    subtitle: `Base Transceiver Station`,
    icon: <span className="text-4xl">📡</span>,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    title: "Bandwidth BTS",
    value: stats.byItemType["Bandwidth BTS"],
    subtitle: `Bandwidth BTS`,
    icon: <span className="text-4xl">📶</span>,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
  },
  {
    title: "Office Location",
    value: stats.byItemType["Office Location"],
    subtitle: `Office Sites`,
    icon: <span className="text-4xl">🏢</span>,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    title: "NNI",
    value: stats.byItemType.NNI,
    subtitle: `Network Node Interface`,
    icon: <span className="text-4xl">🔗</span>,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    title: "Data Center",
    value: stats.byItemType["Data Center"],
    subtitle: `Data Center Facilities`,
    icon: <span className="text-4xl">🏛️</span>,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    title: "Customers",
    value: stats.byItemType.Customer,
    subtitle: `Jio, Tata, Vodafone, Sify, Airtel`,
    icon: <span className="text-4xl">👥</span>,
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-900/20",
  },
];

export const getTotalCard = (stats: InfrastructureStats): KPICardData => ({
  title: "Total Infrastructure",
  value: stats.total,
  subtitle: `${stats.byStatus.Active || 0} active, ${
    stats.byStatus.Inactive || 0
  } inactive`,
  icon: (
    <svg
      className="w-10 h-10"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
  color: "text-blue-600",
  bgColor:
    "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
});

