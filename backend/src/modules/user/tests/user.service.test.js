const userService = require('../user.service');
const { pool } = require('../../../config/database');
const { hashPassword } = require('../../../shared/utils/bcrypt');

// Mock dependencies
jest.mock('../../../config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

jest.mock('../../../utils/bcrypt', () => ({
  hashPassword: jest.fn()
}));

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserByEmailOrUsername', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      pool.query.mockResolvedValue([[mockUser]]);

      const result = await userService.findUserByEmailOrUsername('test@example.com', 'testuser');
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users'),
        ['test@example.com', 'testuser']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when not found', async () => {
      pool.query.mockResolvedValue([[]]);

      const result = await userService.findUserByEmailOrUsername('test@example.com', 'testuser');
      
      expect(result).toBeUndefined();
    });
  });

  describe('createUser', () => {
    it('should hash password and create user', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        full_name: 'New User',
        role: 'viewer'
      };
      
      hashPassword.mockResolvedValue('hashed_password');
      pool.query.mockResolvedValue([{ insertId: 10 }]);

      const userId = await userService.createUser(userData);

      expect(hashPassword).toHaveBeenCalledWith('password123');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining(['newuser', 'new@example.com', 'hashed_password'])
      );
      expect(userId).toBe(10);
    });
  });

  // Add more tests for other methods...
});
