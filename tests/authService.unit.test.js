const authService = require('../services/authService');
const TestHelpers = require('./helpers/testHelpers');
const { testUsers } = require('./fixtures/testData');

describe('AuthService - Unit Tests', () => {

  beforeEach(async () => {
    // Create a test user before each test using helper
    await TestHelpers.createTestUser(testUsers.validUser);
  });

  describe('🔐 authenticateUser()', () => {
    it('should return success and token for valid credentials', async () => {
      const result = await authService.authenticateUser(
        testUsers.validUser.email, 
        testUsers.validUser.password
      );
      
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user).toHaveProperty('email', testUsers.validUser.email);
      expect(result.user).toHaveProperty('id');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should return error for invalid password', async () => {
      const result = await authService.authenticateUser(
        testUsers.validUser.email, 
        'wrongpassword'
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_PASSWORD');
      expect(result.message).toBe('Invalid password');
      expect(result.token).toBeUndefined();
    });

    it('should return error for unknown email', async () => {
      const result = await authService.authenticateUser(
        'unknown@example.com', 
        testUsers.validUser.password
      );
      
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
      const uniqueEmail = TestHelpers.generateUniqueEmail('newuser');
      const newUserData = {
        email: uniqueEmail,
        password: 'newpassword123'
      };

      const result = await authService.createUser(newUserData.email, newUserData.password);
      
      expect(result.success).toBe(true);
      expect(result.user).toHaveProperty('email', newUserData.email);
      expect(result.user).toHaveProperty('id');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should return error for existing user', async () => {
      const result = await authService.createUser(
        testUsers.validUser.email, 
        testUsers.validUser.password
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('USER_EXISTS');
      expect(result.message).toBe('User already exists');
    });
  });
});
