import React from "react";
import { KPICardData, InfrastructureStats } from '../../types/infrastructure.types';

interface TotalCardProps {
  card: KPICardData;
  stats: InfrastructureStats;
}

const TotalCard: React.FC<TotalCardProps> = ({ card, stats }) => {
  const statusItems = [
    {
      label: "Active",
      value: stats.byStatus.Active || 0,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "Inactive",
      value: stats.byStatus.Inactive || 0,
      color: "text-red-600 dark:text-red-400",
    },
    {
      label: "Maintenance",
      value: stats.byStatus.Maintenance || 0,
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Planned",
      value: stats.byStatus.Planned || 0,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "RFS",
      value: stats.byStatus.RFS || 0,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Damaged",
      value: stats.byStatus.Damaged || 0,
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border-2 border-blue-200 dark:border-blue-700">
      <div className={`${card.bgColor} p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className={`${card.color} bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg`}
            >
              {card.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {card.subtitle}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
              {card.value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total Items
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Status Breakdown
        </h4>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {statusItems.map((item) => (
            <div key={item.label} className="text-center">
              <div className={`text-2xl font-bold ${item.color}`}>
                {item.value}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TotalCard;

