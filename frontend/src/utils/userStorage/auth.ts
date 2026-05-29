
import type { User } from '../../types/auth/index';
import { getUsersFromStorage, updateUserInStorage } from './crud';

/**
 * Validate user credentials for login
 */
export const validateUserCredentials = (email: string, password: string): User | null => {
  try {
    const users = getUsersFromStorage();
    const user = users.find(u => u.email === email);

    if (!user) {
      return null;
    }

    // In development, accept any password
    // In production, this would validate against hashed password
    if (process.env.NODE_ENV === 'development' || user.password === password) {
      // Update login history
      const updatedUser = {
        ...user,
        lastLogin: new Date().toISOString(),
        loginHistory: [
          ...(user.loginHistory || []),
          {
            timestamp: new Date(),
            location: 'Web Application'
          }
        ]
      };

      updateUserInStorage(user.id, {
        lastLogin: updatedUser.lastLogin,
        loginHistory: updatedUser.loginHistory
      });

      return updatedUser;
    }

    return null;
  } catch (error) {
    console.error('Error validating credentials:', error);
    return null;
  }
};

