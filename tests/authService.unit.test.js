const authService = require('../services/authService');
const User = require('../models/User');

describe('AuthService - Unit Tests', () => {
  
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(async () => {
    // Create a test user before each test
    const user = new User(testUser);
    await user.save();
  });

  describe('🔐 authenticateUser()', () => {
    it('should return success and token for valid credentials', async () => {
      const result = await authService.authenticateUser(testUser.email, testUser.password);
      
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user).toHaveProperty('email', testUser.email);
      expect(result.user).toHaveProperty('id');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should return error for invalid password', async () => {
      const result = await authService.authenticateUser(testUser.email, 'wrongpassword');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_PASSWORD');
      expect(result.message).toBe('Invalid password');
      expect(result.token).toBeUndefined();
    });

    it('should return error for unknown email', async () => {
      const result = await authService.authenticateUser('unknown@example.com', testUser.password);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('EMAIL_NOT_FOUND');
      expect(result.message).toBe('Email not found');
      expect(result.token).toBeUndefined();
    });
  });

  describe('🔑 generateToken()', () => {
    it('should generate a valid JWT token', () => {
      const userId = '507f1f77bcf86cd799439011'; // Mock ObjectId
      const token = authService.generateToken(userId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });
  });

  describe('👤 createUser()', () => {
    it('should create a new user successfully', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'newpassword123'
      };

      const result = await authService.createUser(newUser.email, newUser.password);
      
      expect(result.success).toBe(true);
      expect(result.user).toHaveProperty('email', newUser.email);
      expect(result.user).toHaveProperty('id');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should return error for existing user', async () => {
      const result = await authService.createUser(testUser.email, testUser.password);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('USER_EXISTS');
      expect(result.message).toBe('User already exists');
    });
  });
});
