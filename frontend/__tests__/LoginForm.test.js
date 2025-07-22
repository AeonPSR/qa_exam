import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../components/LoginForm';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('LoginForm - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Test 1: Présence des champs
  describe('Presence of Form Fields', () => {
    test('should render email input field', () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'Email');
    });

    test('should render password input field', () => {
      render(<LoginForm />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('placeholder', 'Password');
    });

    test('should render login button', () => {
      render(<LoginForm />);
      
      const loginButton = screen.getByRole('button', { name: /login/i });
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveAttribute('type', 'submit');
    });

    test('should have proper form structure', () => {
      render(<LoginForm />);
      
      // Check for form element by finding it in the DOM
      const formElement = document.querySelector('form');
      expect(formElement).toBeInTheDocument();
      
      const inputs = screen.getAllByRole('textbox');
      const passwordInput = screen.getByLabelText(/password/i);
      expect(inputs).toHaveLength(1); // Only email is textbox, password is different
      expect(passwordInput).toBeInTheDocument();
    });
  });

  // ✅ Test 2: Réaction au clic / changement
  describe('User Interactions', () => {
    test('should update email on input change', async () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    test('should update password on input change', async () => {
      render(<LoginForm />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      expect(passwordInput).toHaveValue('password123');
    });

    test('should handle form submission', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          user: { email: 'test@example.com', id: '123' }
        }
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/login', {
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    test('should enable/disable submit button based on form validity', () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      // Initially disabled (empty form)
      expect(submitButton).toBeDisabled();

      // Fill only email - still disabled
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(submitButton).toBeDisabled();

      // Fill both email and password - enabled
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      expect(submitButton).toBeEnabled();

      // Clear email - disabled again
      fireEvent.change(emailInput, { target: { value: '' } });
      expect(submitButton).toBeDisabled();
    });
  });

  // ✅ Test 3: Form Validation
  describe('Form Validation', () => {
    test('should show loading state during login', async () => {
      // Mock a delayed response
      mockedAxios.post.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          data: { success: true, user: { email: 'test@example.com', id: '123' } }
        }), 100))
      );

      render(<LoginForm />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      // Should show loading state
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeInTheDocument();
      });
    });

    test('should validate email format', () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      // Test invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      expect(submitButton).toBeDisabled();

      // Test valid email
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(submitButton).toBeEnabled();
    });

    test('should validate password length', () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      // Test short password
      fireEvent.change(passwordInput, { target: { value: '123' } });
      expect(submitButton).toBeDisabled();

      // Test valid password
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      expect(submitButton).toBeEnabled();
    });
  });

  // ✅ Test 4: Error/Success Message Display
  describe('Message Display', () => {
    test('should display error message on login failure', async () => {
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'Invalid credentials' }
        }
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login failed: Invalid credentials')).toBeInTheDocument();
      });
    });

    test('should display success message on login success', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          success: true,
          user: { email: 'test@example.com', id: '123' }
        }
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Check for the welcome heading and email display
        expect(screen.getByText('✅ Welcome!')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });

    test('should handle network errors', async () => {
      mockedAxios.post.mockRejectedValue({
        request: {}
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error: Unable to contact server')).toBeInTheDocument();
      });
    });
  });
});
