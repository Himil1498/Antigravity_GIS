import React from 'react';
import { kpiCards, activityTypes, healthMetrics, features } from '../data/index';
import { getColorClasses } from '../utils';

// KPI Cards Grid Section
export const KPICardsSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        🏗️ 8 Infrastructure KPI Cards (Your Data)
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {kpiCards.map((card, idx) => {
          const detailClasses = getColorClasses(card.color).split(' ').slice(2).join(' ');
          return (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${detailClasses}`}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{card.icon}</span>
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">{card.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{card.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-600">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">9th Card: Total Infrastructure</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Grand total across all types • Active vs Inactive summary
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            6 status breakdown: Active, Inactive, Maintenance, Planned, RFS, Damaged
          </p>
        </div>
      </div>
    </div>
  );
};

// Activity Types Section
export const ActivityTypesSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        📋 Activity Types (Color-Coded Dots)
      </h2>
      <div className="space-y-3">
        {activityTypes.map((activity, idx) => {
          const detailClasses = getColorClasses(activity.color).split(' ').slice(2).join(' ');
          return (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${detailClasses}`}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 bg-${activity.color}-500 rounded-full`}></div>
                <span className="text-2xl">{activity.icon}</span>
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200 capitalize">{activity.type}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Health Metrics Section
export const HealthMetricsSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        💚 3 System Health Metrics
      </h2>
      <div className="space-y-4">
        {healthMetrics.map((metric, idx) => {
          const detailClasses = getColorClasses(metric.color).split(' ').slice(2).join(' ');
          return (
            <div key={idx} className={`p-6 rounded-lg border-l-4 ${detailClasses}`}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{metric.icon}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">{metric.name}</h3>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p><strong>Calculation:</strong> {metric.calc}</p>
                    <p><strong>Thresholds:</strong> {metric.thresholds}</p>
                    <p><strong>Display:</strong> {metric.display}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold text-yellow-800 dark:text-yellow-200">Maintenance Alert</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Warning badge appears if any items are due for maintenance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Key Features Section
export const KeyFeaturesSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        ✨ Key Features
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature, idx) => {
          const detailClasses = getColorClasses(feature.color).split(' ').slice(2).join(' ');
          return (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${detailClasses}`}>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">{feature.icon}</span>
                <span>{feature.title}</span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

