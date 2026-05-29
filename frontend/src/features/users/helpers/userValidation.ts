import { User } from '../../../types/auth/index';

/**
 * Validate user form data
 * Returns object with field names as keys and error messages as values
 */
export const validateForm = (
  formData: Partial<User>,
  users: User[],
  modalType: 'create' | 'edit' | 'view',
  currentUserId?: string
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Required fields
  if (!formData.username?.trim()) errors.username = 'Username is required';
  if (!formData.name?.trim()) errors.name = 'Name is required';
  if (!formData.email?.trim()) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
  if (!formData.phoneNumber?.trim()) errors.phoneNumber = 'Phone number is required';
  if (!formData.address?.street?.trim()) errors.street = 'Street is required';
  if (!formData.address?.city?.trim()) errors.city = 'City is required';
  if (!formData.address?.state?.trim()) errors.state = 'State is required';
  if (!formData.address?.pincode?.trim()) errors.pincode = 'Pincode is required';
  if (!formData.officeLocation?.trim()) errors.officeLocation = 'Office location is required';

  // Check for duplicate username/email (excluding current user in edit mode)
  const existingUser = users.find(user =>
    (user.username === formData.username || user.email === formData.email) &&
    (modalType === 'create' || user.id !== currentUserId)
  );
  if (existingUser) {
    if (existingUser.username === formData.username) errors.username = 'Username already exists';
    if (existingUser.email === formData.email) errors.email = 'Email already exists';
  }

  return errors;
};


