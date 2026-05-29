import React from 'react';
import { tabsOverview } from '../constants';
import { getColorClasses } from '../utils';

const TabsOverviewSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        Six Administration Tabs Overview
      </h2>
      <div className="space-y-4">
        {tabsOverview.map((tab) => {
          const colorClasses = getColorClasses(tab.color);
          const detailClasses = colorClasses.split(" ").slice(2).join(" ");
          return (
            <div
              key={tab.number}
              className={`p-4 rounded-lg border-l-4 ${detailClasses}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{tab.number}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {tab.purpose}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tab.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TabsOverviewSection;

