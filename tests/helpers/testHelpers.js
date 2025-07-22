const request = require('supertest');
const User = require('../../models/User');
const { testUsers } = require('../fixtures/testData');

/**
 * Test helper functions for database operations and API requests
 */
class TestHelpers {
  
  /**
   * Create a test user in the database
   * @param {Object} userData - User data to create
   * @returns {Promise<Object>} Created user document
   */
  static async createTestUser(userData = testUsers.validUser) {
    const user = new User(userData);
    return await user.save();
  }
  
  /**
   * Create multiple test users
   * @param {Array} usersData - Array of user data objects
   * @returns {Promise<Array>} Array of created user documents
   */
  static async createMultipleUsers(usersData) {
    const users = [];
    for (const userData of usersData) {
      const user = await this.createTestUser(userData);
      users.push(user);
    }
    return users;
  }
  
  /**
   * Make a login request to the API
   * @param {Object} app - Express app instance
   * @param {Object} credentials - Login credentials
   * @returns {Object} Supertest request object (for chaining .expect())
   */
  static makeLoginRequest(app, credentials) {
    return request(app)
      .post('/api/login')
      .send(credentials);
  }
  
  /**
   * Make a register request to the API
   * @param {Object} app - Express app instance
   * @param {Object} userData - User registration data
   * @returns {Object} Supertest request object (for chaining .expect())
   */
  static makeRegisterRequest(app, userData) {
    return request(app)
      .post('/api/register')
      .send(userData);
  }
  
  /**
   * Assert successful login response structure
   * @param {Object} response - API response
   * @param {Object} expectedUser - Expected user data
   */
  static assertSuccessfulLogin(response, expectedUser) {
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    
    // Verify user data
    expect(response.body.user).toHaveProperty('email', expectedUser.email);
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user).not.toHaveProperty('password');
    
    // Verify JWT token format
    expect(response.body.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
  }
  
  /**
   * Assert error response structure
   * @param {Object} response - API response
   * @param {Object} expectedError - Expected error data
   */
  static assertErrorResponse(response, expectedError) {
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', expectedError.message);
    expect(response.body).not.toHaveProperty('token');
  }
  
  /**
   * Assert successful user creation response
   * @param {Object} response - API response
   * @param {Object} expectedUser - Expected user data
   */
  static assertUserCreated(response, expectedUser) {
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'User created successfully');
    expect(response.body).toHaveProperty('user');
    
    expect(response.body.user).toHaveProperty('email', expectedUser.email);
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user).not.toHaveProperty('password');
  }
  
  /**
   * Generate unique email for testing
   * @param {string} prefix - Email prefix
   * @returns {string} Unique email address
   */
  static generateUniqueEmail(prefix = 'test') {
    const timestamp = Date.now();
    return `${prefix}-${timestamp}@example.com`;
  }
  
  /**
   * Wait for a specified amount of time (for testing time-sensitive operations)
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise} Promise that resolves after the specified time
   */
  static async wait(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = TestHelpers;
