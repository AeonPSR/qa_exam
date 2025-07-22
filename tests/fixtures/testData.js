// Test data fixtures for consistent testing
const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'password123'
  },
  
  adminUser: {
    email: 'admin@example.com',
    password: 'admin123'
  },
  
  invalidEmailUser: {
    email: 'invalid-email',
    password: 'password123'
  },
  
  shortPasswordUser: {
    email: 'user@example.com',
    password: '123'
  }
};

const loginRequests = {
  validLogin: {
    email: testUsers.validUser.email,
    password: testUsers.validUser.password
  },
  
  wrongPassword: {
    email: testUsers.validUser.email,
    password: 'wrongpassword'
  },
  
  unknownEmail: {
    email: 'unknown@example.com',
    password: 'password123'
  },
  
  missingEmail: {
    password: 'password123'
  },
  
  missingPassword: {
    email: testUsers.validUser.email
  },
  
  emptyCredentials: {}
};

const expectedResponses = {
  loginSuccess: {
    success: true,
    message: 'Login successful'
  },
  
  invalidPassword: {
    success: false,
    message: 'Invalid password'
  },
  
  emailNotFound: {
    success: false,
    message: 'Email not found'
  },
  
  missingCredentials: {
    success: false,
    message: 'Email and password are required'
  },
  
  invalidJson: {
    success: false,
    message: 'Invalid JSON format'
  },
  
  userCreated: {
    success: true,
    message: 'User created successfully'
  },
  
  userExists: {
    success: false,
    message: 'User already exists'
  }
};

module.exports = {
  testUsers,
  loginRequests,
  expectedResponses
};
