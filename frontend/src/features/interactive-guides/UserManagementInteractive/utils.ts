import { ColorMap } from './types';

/**
 * Returns Tailwind CSS classes for a given color theme
 * Used for consistent styling across all sections of the guide
 */
export const getColorClasses = (color: string): string => {
  const colors: ColorMap = {
    red: "from-red-500 to-red-600 bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200",
    blue: "from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-800 dark:text-blue-200",
    green: "from-green-500 to-green-600 bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200",
    indigo: "from-indigo-500 to-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-800 dark:text-indigo-200",
    purple: "from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-800 dark:text-purple-200",
    pink: "from-pink-500 to-pink-600 bg-pink-50 dark:bg-pink-900/20 border-pink-500 text-pink-800 dark:text-pink-200",
    orange: "from-orange-500 to-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-800 dark:text-orange-200",
    teal: "from-teal-500 to-teal-600 bg-teal-50 dark:bg-teal-900/20 border-teal-500 text-teal-800 dark:text-teal-200",
    cyan: "from-cyan-500 to-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-500 text-cyan-800 dark:text-cyan-200",
    violet: "from-violet-500 to-violet-600 bg-violet-50 dark:bg-violet-900/20 border-violet-500 text-violet-800 dark:text-violet-200",
    yellow: "from-yellow-500 to-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-200",
    gray: "from-gray-500 to-gray-600 bg-gray-50 dark:bg-gray-700 border-gray-500 text-gray-800 dark:text-gray-200",
    amber: "from-amber-500 to-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-800 dark:text-amber-200",
    emerald: "from-emerald-500 to-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-800 dark:text-emerald-200",
  };
  return colors[color] || colors.blue;
};

