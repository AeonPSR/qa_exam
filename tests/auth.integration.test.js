const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('POST /login - Integration Tests', () => {
  
  // Test data
  const testUser = {
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(async () => {
    // Create a test user before each test
    const user = new User(testUser);
    await user.save();
  });

  describe('✅ Successful Login', () => {
    it('should return 200 and JWT token for valid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      // Check response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      
      // Check user data
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('password'); // Password should not be returned
      
      // Check token format (JWT has 3 parts separated by dots)
      expect(response.body.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });
  });

  describe('❌ Incorrect Password', () => {
    it('should return 401 for wrong password', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid password');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should return 401 for empty password', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: testUser.email,
          password: ''
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Email and password are required');
    });
  });

  describe('❌ Unknown User', () => {
    it('should return 401 for unknown email', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'unknown@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Email not found');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Email and password are required');
    });
  });

  describe('🔍 Input Validation', () => {
    it('should return 400 for missing both email and password', async () => {
      const response = await request(app)
        .post('/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Email and password are required');
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/login')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com", "password":}') // Invalid JSON
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid JSON format');
    });
  });

  describe('🌐 Multiple Login Attempts', () => {
    it('should allow multiple successful logins for same user', async () => {
      // First login
      const response1 = await request(app)
        .post('/login')
        .send(testUser)
        .expect(200);

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Second login
      const response2 = await request(app)
        .post('/login')
        .send(testUser)
        .expect(200);

      expect(response1.body.token).toBeDefined();
      expect(response2.body.token).toBeDefined();
      // Tokens should be different (different timestamps)
      expect(response1.body.token).not.toBe(response2.body.token);
    });
  });
});
