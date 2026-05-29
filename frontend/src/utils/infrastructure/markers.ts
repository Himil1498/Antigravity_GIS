
import type { InfrastructureType, CustomerType } from '../../types/gisToolTypes/index';
import { STATUS_COLORS } from './config';
import { getCustomerIcon, getInfrastructureIcon } from './helpers';

/**
 * Create custom marker icon using emoji and canvas
 */
const createCustomMarkerIcon = (
  emoji: string,
  color: string,
  isUserData: boolean = false,
  size: number = 32
): google.maps.Icon => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;

  canvas.width = size;
  canvas.height = size;

  // Draw background circle
  context.fillStyle = isUserData ? '#9C27B0' : color;
  context.beginPath();
  context.arc(size / 2, size / 2, size / 2 - 2, 0, 2 * Math.PI);
  context.fill();

  // Draw white border
  context.strokeStyle = isUserData ? '#FFD700' : '#ffffff';
  context.lineWidth = isUserData ? 3 : 2;
  context.stroke();

  // Draw emoji in center
  context.font = `${size * 0.5}px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(emoji, size / 2, size / 2);

  return {
    url: canvas.toDataURL(),
    size: new google.maps.Size(size, size),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(size / 2, size / 2),
    scaledSize: new google.maps.Size(size, size)
  };
};

/**
 * Get Google Maps marker icon for infrastructure
 */
export const getMapMarkerIcon = (
  type: InfrastructureType,
  status: string = 'Active',
  isUserData: boolean = false,
  customerName?: CustomerType
): google.maps.Icon => {
  // Use customer-specific icon for Customer type
  const config = type === 'Customer' && customerName
    ? getCustomerIcon(customerName)
    : getInfrastructureIcon(type);

  const statusColor = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  let color = statusColor ? statusColor(config.color) : config.color;

  // Determine size based on user data
  const size = isUserData ? 36 : 32;

  return createCustomMarkerIcon(config.emoji, color, isUserData, size);
};

