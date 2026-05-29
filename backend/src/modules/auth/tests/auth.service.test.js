const authService = require('../auth.service');
const { pool } = require('../../../config/database');
const { hashPassword, comparePassword } = require('../../../shared/utils/bcrypt');

// Mock dependencies
jest.mock('../../../config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

jest.mock('../../../shared/utils/bcrypt', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn()
}));

jest.mock('../../../shared/services/email', () => ({
  sendVerificationEmail: jest.fn()
}));

jest.mock('../../notification/services/notification.service', () => ({
  notifyAllAdmins: jest.fn()
}));

describe('Auth Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserByIdentifier', () => {
    it('should find user by email', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      pool.query.mockResolvedValue([[mockUser]]);

      const result = await authService.findUserByIdentifier('test@example.com');
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE u.email = ? OR u.username = ?'),
        ['test@example.com', 'test@example.com']
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('registerUser', () => {
    it('should register new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        full_name: 'New User'
      };

      pool.query
        .mockResolvedValueOnce([[]]) // Check existing
        .mockResolvedValueOnce([{ insertId: 1 }]); // Insert

      hashPassword.mockResolvedValue('hashed_pw');

      const result = await authService.registerUser(userData);

      expect(pool.query).toHaveBeenNthCalledWith(1, 
        expect.stringContaining('SELECT id FROM users'), 
        ['new@example.com', 'newuser']
      );
      expect(hashPassword).toHaveBeenCalledWith('password123');
      expect(result.id).toBe(1);
    });

    it('should throw error if user exists', async () => {
      pool.query.mockResolvedValueOnce([[{ id: 1 }]]); // User exists

      await expect(authService.registerUser({
        username: 'existing',
        email: 'exist@example.com',
        password: 'pw'
      })).rejects.toThrow('User with this email or username already exists');
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password', async () => {
      comparePassword.mockResolvedValue(true);
      const result = await authService.validatePassword('pw', 'hash');
      expect(result).toBe(true);
    });
  });
});
