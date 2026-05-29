import React from "react";
import { RequestStats } from "../types/types";

interface StatsCardsProps {
  stats: RequestStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: "Total Requests",
      value: stats.totalRequests,
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      gradient: "from-indigo-500 to-indigo-600",
      bg: "from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20",
      border: "border-indigo-100 dark:border-indigo-900/30",
      textColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Pending",
      value: stats.pendingRequests,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      gradient: "from-amber-500 to-amber-600",
      bg: "from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20",
      border: "border-amber-100 dark:border-amber-900/30",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Approved",
      value: stats.approvedRequests,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      gradient: "from-emerald-500 to-emerald-600",
      bg: "from-white to-emerald-50 dark:from-gray-800 dark:to-emerald-900/20",
      border: "border-emerald-100 dark:border-emerald-900/30",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Rejected",
      value: stats.rejectedRequests,
      icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
      gradient: "from-rose-500 to-rose-600",
      bg: "from-white to-rose-50 dark:from-gray-800 dark:to-rose-900/20",
      border: "border-rose-100 dark:border-rose-900/30",
      textColor: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.bg} rounded-xl shadow-lg border-2 ${card.border} p-5 hover:shadow-xl transition-all duration-200`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${card.textColor} mb-1`}>
                {card.label}
              </p>
              <p className={`text-3xl font-bold ${card.textColor}`}>
                {card.value}
              </p>
            </div>
            <div
              className={`h-12 w-12 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}
            >
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
                  d={card.icon}
                />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;

