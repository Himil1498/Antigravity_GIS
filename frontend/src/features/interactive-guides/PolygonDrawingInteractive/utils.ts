// Utility function for color classes

type ColorMap = Record<string, string>;

export const getColorClasses = (color: string): string => {
  const colors: ColorMap = {
    green: "from-green-500 to-green-600 bg-green-50 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-200",
    purple: "from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900 border-purple-500 text-purple-800 dark:text-purple-200",
    blue: "from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-800 dark:text-blue-200",
    pink: "from-pink-500 to-pink-600 bg-pink-50 dark:bg-pink-900 border-pink-500 text-pink-800 dark:text-pink-200",
    orange: "from-orange-500 to-orange-600 bg-orange-50 dark:bg-orange-900 border-orange-500 text-orange-800 dark:text-orange-200",
    teal: "from-teal-500 to-teal-600 bg-teal-50 dark:bg-teal-900 border-teal-500 text-teal-800 dark:text-teal-200",
    indigo: "from-indigo-500 to-indigo-600 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 text-indigo-800 dark:text-indigo-200",
    violet: "from-violet-500 to-violet-600 bg-violet-50 dark:bg-violet-900 border-violet-500 text-violet-800 dark:text-violet-200"
  };
  return colors[color] || colors.green;
};

