import React from 'react';
import { roles, rowActions, formSections, tableColumns } from '../constants';
import { getColorClasses } from '../utils';

// User Roles Section
export const UserRolesSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        🛡️ User Roles (4 Types)
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {roles.map((role, idx) => {
          const colorClasses = getColorClasses(role.color);
          const detailClasses = colorClasses.split(" ").slice(2).join(" ");
          return (
            <div
              key={idx}
              className={`p-4 rounded-lg border-l-4 ${detailClasses}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{role.icon}</span>
                <div>
                  <p className="font-bold text-lg text-gray-800 dark:text-gray-200">
                    {role.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {role.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Row Actions Section
export const RowActionsSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        🎯 Row-Level Actions (7 per User)
      </h2>
      <div className="space-y-3">
        {rowActions.map((action, idx) => {
          const colorClasses = getColorClasses(action.color);
          const detailClasses = colorClasses.split(" ").slice(2).join(" ");
          return (
            <div
              key={idx}
              className={`p-4 rounded-lg border-l-4 ${detailClasses}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{action.icon}</span>
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    {action.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Form Sections Display
export const FormSectionsDisplay: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        📝 Create/Edit User Form (4 Sections)
      </h2>
      <div className="space-y-4">
        {formSections.map((section) => {
          const colorClasses = getColorClasses(section.color);
          const [gradientFrom, gradientTo] = colorClasses.split(" ");
          const detailClasses = colorClasses.split(" ").slice(2).join(" ");
          return (
            <div
              key={section.num}
              className={`p-4 rounded-lg border-l-4 ${detailClasses}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
                >
                  {section.num}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">
                    {section.title}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {section.fields.map((field, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-700 dark:text-gray-300"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                    {section.notes}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Table Columns Grid
export const TableColumnsGrid: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        📊 Table Columns (9 Columns)
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        {tableColumns.map((col) => (
          <div
            key={col.num}
            className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-lg border border-violet-200 dark:border-violet-700"
          >
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm">
                {col.num}
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-200">
                  {col.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {col.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

