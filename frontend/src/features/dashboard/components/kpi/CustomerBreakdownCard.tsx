import React from "react";
import { KPICardData, InfrastructureStats } from '../../types/infrastructure.types';

interface CustomerBreakdownCardProps {
  card: KPICardData;
  stats: InfrastructureStats;
}

const CustomerBreakdownCard: React.FC<CustomerBreakdownCardProps> = ({
  card,
  stats,
}) => {
  const customers = [
    {
      name: "Jio",
      key: "Reliance Jio Infocomm Limited",
      icon: "📱",
      color: "text-blue-700 dark:text-blue-400",
    },
    {
      name: "Tata",
      key: "Tata Communications Limited",
      icon: "📞",
      color: "text-indigo-700 dark:text-indigo-400",
    },
    {
      name: "Vodafone",
      key: "Vodafone Idea Limited",
      icon: "📡",
      color: "text-red-700 dark:text-red-400",
    },
    {
      name: "Sify",
      key: "SIFY Technologies Limited",
      icon: "🌐",
      color: "text-teal-700 dark:text-teal-400",
    },
    {
      name: "Airtel",
      key: "Bharti Airtel Limited",
      icon: "📶",
      color: "text-rose-700 dark:text-rose-400",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
      <div className={`${card.bgColor} p-4 flex items-center justify-between`}>
        <div className={card.color}>{card.icon}</div>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          {card.title}
        </h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {card.value}
        </p>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
          {customers.map((customer) => (
            <div
              key={customer.key}
              className="flex items-center justify-between"
            >
              <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <span className="text-sm">{customer.icon}</span>
                <span className="truncate">{customer.name}</span>
              </span>
              <span className={`text-xs font-bold ${customer.color}`}>
                {
                  stats.byCustomer[
                    customer.key as keyof typeof stats.byCustomer
                  ]
                }
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={`${card.bgColor} h-1`}>
        <div
          className={`h-full ${card.color.replace("text-", "bg-")}`}
          style={{
            width: `${Math.min(((card.value as number) / 100) * 100, 100)}%`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default CustomerBreakdownCard;

