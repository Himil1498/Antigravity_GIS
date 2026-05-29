import React from 'react';
import { TableCellsIcon, ArrowPathIcon, MapIcon } from '@heroicons/react/24/outline';

export type ToolTab = 'excel-to-kml' | 'kml-to-excel' | 'viewer' | 'kml-kmz';

export interface ToolTabConfig {
  id: ToolTab;
  name: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  borderColor: string;
  path: string;
}

export const toolTabs: ToolTabConfig[] = [
  {
    id: 'excel-to-kml',
    name: 'Excel to KML/KMZ',
    description: 'Convert Excel spreadsheets (.xlsx, .xls) into Google Earth KML files.',
    icon: <TableCellsIcon className="w-5 h-5" />,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-500',
    path: '/tools/excel-to-kml',
  },
  {
    id: 'kml-to-excel',
    name: 'KML/KMZ to Excel',
    description: 'Extract points and metadata from KML or KMZ files into a tabular Excel file.',
    icon: <TableCellsIcon className="w-5 h-5" />,
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
    borderColor: 'border-violet-500',
    path: '/tools/kml-to-excel',
  },
  {
    id: 'viewer',
    name: 'KML/KMZ Viewer',
    description: 'Visualize and verify your local KML and KMZ files directly on the interactive map.',
    icon: <MapIcon className="w-5 h-5" />,
    bgColor: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
    borderColor: 'border-fuchsia-500',
    path: '/tools/viewer',
  },
  {
    id: 'kml-kmz',
    name: 'KML ↔ KMZ Converter',
    description: 'Instantly convert between KML and compressed KMZ files in your browser.',
    icon: <ArrowPathIcon className="w-5 h-5" />,
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500',
    path: '/tools/kml-kmz',
  }
];
