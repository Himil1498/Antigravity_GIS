
import { RegionZone } from './types';

export const ZONES_STORAGE_KEY = 'gis_region_zones';
export const ZONE_ASSIGNMENTS_STORAGE_KEY = 'gis_zone_assignments';

// Default zones for Indian states
export const DEFAULT_ZONES: Omit<RegionZone, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'North Zone',
    description: 'Northern states and UTs',
    color: '#3B82F6', // Blue
    states: [
      'Punjab',
      'Haryana',
      'Delhi',
      'Himachal Pradesh',
      'Uttarakhand',
      'Chandigarh',
      'Jammu and Kashmir',
      'Ladakh'
    ]
  },
  {
    name: 'South Zone',
    description: 'Southern states and UTs',
    color: '#10B981', // Green
    states: [
      'Karnataka',
      'Tamil Nadu',
      'Kerala',
      'Andhra Pradesh',
      'Telangana',
      'Puducherry',
      'Lakshadweep',
      'Andaman and Nicobar Islands'
    ]
  },
  {
    name: 'East Zone',
    description: 'Eastern states and UTs',
    color: '#F59E0B', // Orange
    states: [
      'West Bengal',
      'Bihar',
      'Jharkhand',
      'Odisha',
      'Assam',
      'Arunachal Pradesh',
      'Manipur',
      'Meghalaya',
      'Mizoram',
      'Nagaland',
      'Sikkim',
      'Tripura'
    ]
  },
  {
    name: 'West Zone',
    description: 'Western states and UTs',
    color: '#EF4444', // Red
    states: [
      'Maharashtra',
      'Gujarat',
      'Goa',
      'Rajasthan',
      'Dadra and Nagar Haveli and Daman and Diu'
    ]
  },
  {
    name: 'Central Zone',
    description: 'Central states',
    color: '#8B5CF6', // Purple
    states: [
      'Madhya Pradesh',
      'Chhattisgarh',
      'Uttar Pradesh'
    ]
  }
];

