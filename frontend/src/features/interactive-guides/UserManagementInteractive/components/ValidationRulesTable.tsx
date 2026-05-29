import React from 'react';
import { validationRules } from '../constants';

const ValidationRulesTable: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        ⚠️ Form Validation Rules
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th className="text-left p-4 text-gray-600 dark:text-gray-400">
                Field
              </th>
              <th className="text-left p-4 text-gray-600 dark:text-gray-400">
                Validation Rule
              </th>
            </tr>
          </thead>
          <tbody>
            {validationRules.map((rule, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 dark:border-gray-700"
              >
                <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">
                  {rule.field}
                </td>
                <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                  {rule.rule}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ValidationRulesTable;

