
import type { InfrastructureItem } from "./types";

/**
 * Escape XML special characters
 */
export function escapeXML(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Escape CSV special characters
 */
export function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);

  // If contains comma, newline, or double quote, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Trigger file download in browser
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate export data
 */
export function validateExportData(data: InfrastructureItem[]): { valid: boolean; message?: string } {
  if (!data || data.length === 0) {
    return { valid: false, message: 'No data available to export' };
  }

  // Check if data has required fields
  const hasCoordinates = data.every(item =>
    item.latitude !== undefined &&
    item.longitude !== undefined &&
    !isNaN(item.latitude) &&
    !isNaN(item.longitude)
  );

  if (!hasCoordinates) {
    return { valid: false, message: 'Some items are missing valid coordinates' };
  }

  return { valid: true };
}

