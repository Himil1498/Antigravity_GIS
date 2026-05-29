import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
  icon: React.ReactNode;
}

interface InfoFieldProps {
  label: string;
  value: string | undefined;
  className?: string;
  icon: React.ReactNode;
}

interface SectionHeaderProps {
  title: string;
  color: string;
  icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div
    className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium opacity-90">{label}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
      <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
        {icon}
      </div>
    </div>
  </div>
);

export const InfoField: React.FC<InfoFieldProps> = ({
  icon,
  label,
  value,
  className = ""
}) => (
  <div className={`flex items-start space-x-4 ${className}`}>
    <div className="flex-shrink-0">
      <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
        <div className="text-blue-600 dark:text-blue-400">{icon}</div>
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="text-gray-900 dark:text-gray-100 font-semibold mt-1 break-all">
        {value || "N/A"}
      </p>
    </div>
  </div>
);

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  color
}) => (
  <div
    className={`flex items-center space-x-3 mb-6 pb-4 border-b-2 ${color}`}
  >
    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
      {title}
    </h3>
  </div>
);

