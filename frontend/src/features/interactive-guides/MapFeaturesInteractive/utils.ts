// Utility function for color classes
import { ColorClasses } from './types';

type ColorMap = Record<string, ColorClasses>;

export const getColorClasses = (color: string): ColorClasses => {
  const colors: ColorMap = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-700 dark:text-green-300",
      border: "border-green-200 dark:border-green-800",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-200 dark:border-purple-800",
    },
    cyan: {
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
      text: "text-cyan-700 dark:text-cyan-300",
      border: "border-cyan-200 dark:border-cyan-800",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-700 dark:text-orange-300",
      border: "border-orange-200 dark:border-orange-800",
    },
    pink: {
      bg: "bg-pink-50 dark:bg-pink-900/20",
      text: "text-pink-700 dark:text-pink-300",
      border: "border-pink-200 dark:border-pink-800",
    },
    indigo: {
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      text: "text-indigo-700 dark:text-indigo-300",
      border: "border-indigo-200 dark:border-indigo-800",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-700 dark:text-red-300",
      border: "border-red-200 dark:border-red-800",
    },
    yellow: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      text: "text-yellow-700 dark:text-yellow-300",
      border: "border-yellow-200 dark:border-yellow-800",
    },
  };
  return colors[color] || colors.blue;
};

