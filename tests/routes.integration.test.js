const request = require('supertest');
const app = require('../server');

describe('API Routes - Integration Tests', () => {

  describe('GET /health', () => {
    it('should return server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message', 'Server is running');
    });
  });

  describe('POST /register', () => {
    it('should create a new user', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body.user).toHaveProperty('email', newUser.email);
    });

    it('should return 409 for duplicate email', async () => {
      const user = {
        email: 'duplicate@example.com',
        password: 'password123'
      };

      // Create user first time
      await request(app)
        .post('/register')
        .send(user)
        .expect(201);

      // Try to create same user again
      const response = await request(app)
        .post('/register')
        .send(user)
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'User already exists');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Route not found');
    });

    it('should return 404 for unknown POST routes', async () => {
      const response = await request(app)
        .post('/unknown-route')
        .send({ test: 'data' })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Route not found');
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in response', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin', '*');
    });

    it('should handle OPTIONS preflight requests', async () => {
      const response = await request(app)
        .options('/login')
        .expect(200);
    });
  });
});
