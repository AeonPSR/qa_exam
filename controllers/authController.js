const authService = require('../services/authService');

class AuthController {
  
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Authenticate user
      const result = await authService.authenticateUser(email, password);

      if (!result.success) {
        const statusCode = result.error === 'EMAIL_NOT_FOUND' || result.error === 'INVALID_PASSWORD' ? 401 : 500;
        return res.status(statusCode).json({
          success: false,
          message: result.message
        });
      }

      // Success
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: result.token,
        user: result.user
      });

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Helper method to create users (debug)
  async register(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await authService.createUser(email, password);

      if (!result.success) {
        const statusCode = result.error === 'USER_EXISTS' ? 409 : 500;
        return res.status(statusCode).json({
          success: false,
          message: result.message
        });
      }

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: result.user
      });

    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new AuthController();
