
import type { User } from '../../types/auth/index';

/**
 * Validate user data before import
 */
export const validateUserData = (user: Partial<User>): string[] => {
  const errors: string[] = [];

  if (!user.username || user.username.trim() === '') {
    errors.push('Username is required');
  }

  if (!user.name || user.name.trim() === '') {
    errors.push('Full name is required');
  }

  if (!user.email || user.email.trim() === '') {
    errors.push('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(user.email)) {
    errors.push('Email is invalid');
  }

  if (!user.phoneNumber || user.phoneNumber.trim() === '') {
    errors.push('Phone number is required');
  }

  if (!user.address || !user.address.street || user.address.street.trim() === '') {
    errors.push('Street address is required');
  }

  if (!user.address || !user.address.city || user.address.city.trim() === '') {
    errors.push('City is required');
  }

  if (!user.address || !user.address.state || user.address.state.trim() === '') {
    errors.push('State is required');
  }

  if (!user.address || !user.address.pincode || user.address.pincode.trim() === '') {
    errors.push('Pincode is required');
  }

  if (!user.officeLocation || user.officeLocation.trim() === '') {
    errors.push('Office location is required');
  }

  if (!user.role || !['Admin', 'Manager', 'Technician', 'User'].includes(user.role)) {
    errors.push('Valid role is required (Admin, Manager, Technician, or User)');
  }

  return errors;
};

