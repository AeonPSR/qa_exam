const request = require('supertest');
const app = require('../server');
const TestHelpers = require('./helpers/testHelpers');
const { testUsers, loginRequests, expectedResponses } = require('./fixtures/testData');

describe('POST /api/login - Integration Tests', () => {
  
  beforeEach(async () => {
    // Create a test user before each test using helper
    await TestHelpers.createTestUser(testUsers.validUser);
  });

  describe('✅ Successful Login', () => {
    it('should return 200 and JWT token for valid credentials', async () => {
      const response = await TestHelpers.makeLoginRequest(app, loginRequests.validLogin)
        .expect(200);

      // Use helper to assert successful login
      TestHelpers.assertSuccessfulLogin(response, testUsers.validUser);
    });
  });

  describe('❌ Incorrect Password', () => {
    it('should return 401 for wrong password', async () => {
      const response = await TestHelpers.makeLoginRequest(app, loginRequests.wrongPassword)
        .expect(401);

      TestHelpers.assertErrorResponse(response, expectedResponses.invalidPassword);
    });

    it('should return 400 for empty password', async () => {
      const response = await TestHelpers.makeLoginRequest(app, loginRequests.missingPassword)
        .expect(400);

      TestHelpers.assertErrorResponse(response, expectedResponses.missingCredentials);
    });
  });

  describe('❌ Unknown User', () => {
    it('should return 401 for unknown email', async () => {
      const response = await TestHelpers.makeLoginRequest(app, loginRequests.unknownEmail)
        .expect(401);

      TestHelpers.assertErrorResponse(response, expectedResponses.emailNotFound);
    });

    it('should return 400 for missing email', async () => {
      const response = await TestHelpers.makeLoginRequest(app, loginRequests.missingEmail)
        .expect(400);

      TestHelpers.assertErrorResponse(response, expectedResponses.missingCredentials);
    });
  });

  describe('🔍 Input Validation', () => {
    it('should return 400 for missing both email and password', async () => {
      const response = await TestHelpers.makeLoginRequest(app, loginRequests.emptyCredentials)
        .expect(400);

      TestHelpers.assertErrorResponse(response, expectedResponses.missingCredentials);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/login')
        .set('Content-Type', 'application/json')
        .send('{"email": "test@example.com", "password":}') // Invalid JSON
        .expect(400);

      TestHelpers.assertErrorResponse(response, expectedResponses.invalidJson);
    });
  });

  describe('🌐 Multiple Login Attempts', () => {
    it('should allow multiple successful logins for same user', async () => {
      // First login
      const response1 = await TestHelpers.makeLoginRequest(app, loginRequests.validLogin)
        .expect(200);

      // Small delay to ensure different timestamps
      await TestHelpers.wait(1000);

      // Second login
      const response2 = await TestHelpers.makeLoginRequest(app, loginRequests.validLogin)
        .expect(200);

      expect(response1.body.token).toBeDefined();
      expect(response2.body.token).toBeDefined();
      // Tokens should be different (different timestamps)
      expect(response1.body.token).not.toBe(response2.body.token);
    });
  });
});
