import { useState } from 'react';
import axios from 'axios';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);

  // Computed properties (as functions)
  const isValidEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email.length > 0 && emailRegex.test(email);
  };

  const isValidPassword = () => {
    return password.length >= 6;
  };

  const isFormValid = () => {
    return isValidEmail() && isValidPassword();
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.post('http://localhost:3000/api/login', {
        email,
        password
      });

      if (response.data.success) {
        setUser(response.data.user);
        setSuccessMessage(`Welcome ${response.data.user.email}!`);
        clearForm();
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data.message || 'Unknown error';
        
        switch (status) {
          case 401:
            setErrorMessage(`Login failed: ${message}`);
            break;
          case 400:
            setErrorMessage(`Invalid data: ${message}`);
            break;
          case 404:
            setErrorMessage('Service not found');
            break;
          case 500:
            setErrorMessage('Server error');
            break;
          default:
            setErrorMessage(`Error ${status}: ${message}`);
        }
      } else if (error.request) {
        setErrorMessage('Network error: Unable to contact server');
      } else {
        setErrorMessage('Unexpected error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setSuccessMessage('');
    setErrorMessage('');
  };

  return (
    <div className="container">
      <div className="login-card">
        <div className="header">
          <h1>🔐 Login</h1>
        </div>

        {/* Alert Messages */}
        {errorMessage && !successMessage && (
          <div className="alert error error-message">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="alert success success-message">
            {successMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="form-input"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !isFormValid()}
            className="login-button"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* User Info (after successful login) */}
        {user && (
          <div className="user-info">
            <h3>✅ Welcome!</h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
        }

        .login-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          padding: 40px;
          width: 100%;
          max-width: 400px;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
        }

        .header h1 {
          color: #333;
          margin: 0 0 10px 0;
          font-size: 2em;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .alert.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 600;
          color: #333;
          font-size: 0.9em;
        }

        .form-input {
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1em;
          transition: border-color 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-input:disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
        }

        .login-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 14px 20px;
          font-size: 1em;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.3s ease;
          margin-top: 10px;
        }

        .login-button:hover:not(:disabled) {
          opacity: 0.9;
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .user-info {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
          text-align: center;
        }

        .user-info h3 {
          color: #28a745;
          margin: 0 0 15px 0;
        }

        .user-info p {
          margin: 8px 0;
          color: #333;
        }

        .logout-button {
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 0.9em;
          cursor: pointer;
          margin-top: 15px;
          transition: background-color 0.3s ease;
        }

        .logout-button:hover {
          background-color: #5a6268;
        }
      `}</style>
    </div>
  );
};

export default LoginForm;
