
import type { InfrastructureItem } from '../types';

/**
 * Convert infrastructure/customer data to JSON format
 */
export function generateJSON(data: InfrastructureItem[]): Blob {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  return blob;
}

