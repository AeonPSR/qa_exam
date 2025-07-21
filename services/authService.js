const User = require('../models/User');
const jwt = require('jsonwebtoken');

class AuthService {
  
  // Generate JWT token
  generateToken(userId) {
    return jwt.sign(
      { userId }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
  }

  // Authenticate user with email and password
  async authenticateUser(email, password) {
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, error: 'EMAIL_NOT_FOUND', message: 'Email not found' };
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return { success: false, error: 'INVALID_PASSWORD', message: 'Invalid password' };
      }

      // Generate token
      const token = this.generateToken(user._id);
      
      return { 
        success: true, 
        token, 
        user: { 
          id: user._id, 
          email: user.email 
        } 
      };
    } catch (error) {
      return { success: false, error: 'SERVER_ERROR', message: 'Internal server error' };
    }
  }

  // Create a new user (for testing purposes)
  async createUser(email, password) {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return { success: false, error: 'USER_EXISTS', message: 'User already exists' };
      }

      const user = new User({ email, password });
      await user.save();
      
      return { 
        success: true, 
        user: { 
          id: user._id, 
          email: user.email 
        } 
      };
    } catch (error) {
      return { success: false, error: 'SERVER_ERROR', message: 'Failed to create user' };
    }
  }
}

module.exports = new AuthService();
