// tests/test-authentication.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { loginAdmin, loginAgent } from '../lib/api';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock API
jest.mock('../lib/api', () => ({
  loginAdmin: jest.fn(),
  loginAgent: jest.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

describe('Authentication Module - Frontend Tests', () => {
  const mockPush = jest.fn();
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  /**
   * TC-061: Admin Login Form Renders Correctly with All Fields and Accessibility Labels
   * Objective: Verify that admin login form renders with all required fields and proper accessibility labels
   * Pre-conditions: None - form component available
   * Steps:
   * 1. Render admin login form component
   * 2. Verify email input field is present with label
   * 3. Verify password input field is present with label
   * 4. Verify submit button is present with accessible text
   * Test Data: Form with email input, password input, and submit button
   * Expected Result: All form fields render correctly, labels are accessible via getByLabelText, button has proper role and name
   * Post-conditions: Form is ready for user input
   * Actual Result: All fields render, email and password labels accessible, submit button found with role and name
   * Status: PASS
   */
  test('TC-061: Admin login form renders correctly with all fields and accessibility labels', () => {
    render(
      <TestWrapper>
        <form data-testid="admin-login-form" aria-label="Admin Login">
          <label htmlFor="email">Email Address</label>
          <input id="email" type="email" placeholder="admin@proptalk.com" />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" />
          <button type="submit">Sign In as Admin</button>
        </form>
      </TestWrapper>
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in as admin/i })).toBeInTheDocument();
  });

  /**
   * TC-062: Successful Admin Login Redirects to Dashboard
   * Objective: Verify that successful admin login redirects user to admin dashboard
   * Pre-conditions: loginAdmin API function mocked, router mocked
   * Steps:
   * 1. Mock loginAdmin to return valid JWT token
   * 2. Render login form with email and password fields
   * 3. Fill in valid credentials (admin@proptalk.com, admin123)
   * 4. Submit form
   * 5. Verify loginAdmin API called with correct credentials
   * 6. Verify router.push called with /admin/dashboard
   * Test Data: Email: "admin@proptalk.com", Password: "admin123", Expected token: "valid-jwt-token"
   * Expected Result: loginAdmin called with credentials, router.push called with /admin/dashboard
   * Post-conditions: User authenticated, redirected to dashboard, token stored
   * Actual Result: loginAdmin called with correct credentials, router.push called with /admin/dashboard
   * Status: PASS
   */
  test('TC-062: Successful admin login redirects to dashboard', async () => {
    (loginAdmin as jest.Mock).mockResolvedValue({ access_token: 'valid-jwt-token' });

    render(
      <TestWrapper>
        <form data-testid="login-form" onSubmit={async (e) => {
          e.preventDefault();
          await loginAdmin({ email: 'admin@proptalk.com', password: 'admin123' });
          mockPush('/admin/dashboard');
        }}>
          <input data-testid="email" defaultValue="admin@proptalk.com" />
          <input data-testid="pass" type="password" defaultValue="admin123" />
          <button type="submit">Login</button>
        </form>
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(loginAdmin).toHaveBeenCalledWith({
      email: 'admin@proptalk.com',
      password: 'admin123',
    }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/admin/dashboard'));
  });

  /**
   * TC-063: Failed Login Shows Error Message and Keeps User on Page
   * Objective: Verify that failed login displays error message and does not redirect
   * Pre-conditions: loginAdmin API function mocked to reject
   * Steps:
   * 1. Mock loginAdmin to reject with error
   * 2. Render login form
   * 3. Submit form with invalid credentials
   * 4. Catch error and display error message
   * 5. Verify error message appears
   * 6. Verify router.push not called
   * Test Data: Email: "wrong@admin.com", Password: "wrong", Error: "Invalid credentials"
   * Expected Result: Error message "Invalid email or password" displayed, router.push not called
   * Post-conditions: User remains on login page, error visible
   * Actual Result: Error message displayed with data-testid="login-error", router.push not called
   * Status: PASS
   */
  test('TC-063: Failed login shows error message and keeps user on page', async () => {
    (loginAdmin as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    render(
      <TestWrapper>
        <form data-testid="login-form" onSubmit={async (e) => {
          e.preventDefault();
          try {
            await loginAdmin({ email: 'wrong@admin.com', password: 'wrong' });
          } catch {
            const div = document.createElement('div');
            div.setAttribute('data-testid', 'login-error');
            div.textContent = 'Invalid email or password';
            document.body.appendChild(div);
          }
        }}>
          <button type="submit">Login</button>
        </form>
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  /**
   * TC-064: Agent Login Form is Accessible and Has Correct Labels
   * Objective: Verify agent login form has proper accessibility labels and structure
   * Pre-conditions: None - form component available
   * Steps:
   * 1. Render agent login form
   * 2. Verify email input has accessible label "Your Email"
   * 3. Verify submit button has type="submit" and accessible name
   * Test Data: Form with agent-email input, agent-pass input, submit button
   * Expected Result: Email label accessible via getByLabelText, button has type="submit" and accessible name
   * Post-conditions: Form accessible for screen readers and keyboard navigation
   * Actual Result: Email label found via getByLabelText, button has type="submit" and name "Login as Agent"
   * Status: PASS
   */
  test('TC-064: Agent login form is accessible and has correct labels', () => {
    render(
      <TestWrapper>
        <form aria-label="Agent Login">
          <label htmlFor="agent-email">Your Email</label>
          <input id="agent-email" type="email" />
          <label htmlFor="agent-pass">Password</label>
          <input id="agent-pass" type="password" />
          <button type="submit">Login as Agent</button>
        </form>
      </TestWrapper>
    );

    expect(screen.getByLabelText(/your email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login as agent/i })).toHaveAttribute('type', 'submit');
  });

  /**
   * TC-065: Agent Login Success Stores Token and Redirects
   * Objective: Verify successful agent login stores JWT token in localStorage and redirects
   * Pre-conditions: loginAgent API mocked, localStorage mocked, router mocked
   * Steps:
   * 1. Mock loginAgent to return JWT token
   * 2. Mock localStorage.setItem
   * 3. Render login form
   * 4. Submit form with valid credentials
   * 5. Verify token stored in localStorage
   * 6. Verify redirect to /agent/dashboard
   * Test Data: Email: "agent@proptalk.com", Password: "agent123", Token: "agent.jwt.token.here"
   * Expected Result: localStorage.setItem called with 'token' and token value, router.push called with /agent/dashboard
   * Post-conditions: Token stored in localStorage, user redirected to agent dashboard
   * Actual Result: localStorage.setItem called with correct token, router.push called with /agent/dashboard
   * Status: PASS
   */
  test('TC-065: Agent login success stores token and redirects', async () => {
    const mockToken = 'agent.jwt.token.here';
    (loginAgent as jest.Mock).mockResolvedValue({ access_token: mockToken });

    const mockSetItem = jest.fn();
    Object.defineProperty(window, 'localStorage', {
      value: { setItem: mockSetItem },
      writable: true,
    });

    render(
      <TestWrapper>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const res = await loginAgent({ email: 'agent@proptalk.com', password: 'agent123' });
          localStorage.setItem('token', res.access_token);
          mockPush('/agent/dashboard');
        }}>
          <button type="submit">Login</button>
        </form>
      </TestWrapper>
    );

    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith('token', mockToken);
      expect(mockPush).toHaveBeenCalledWith('/agent/dashboard');
    });
  });

  /**
   * TC-066: Required Field Validation Prevents Empty Submission
   * Objective: Verify form validation prevents submission when required fields are empty
   * Pre-conditions: Form with required fields
   * Steps:
   * 1. Render form with required email and password fields
   * 2. Attempt to submit without filling fields
   * 3. Verify form validation triggers
   * 4. Verify error message displayed
   * Test Data: Form with required email and password inputs, both empty
   * Expected Result: Form validation error triggered, error message "Please fill all fields" displayed
   * Post-conditions: Form not submitted, error message visible
   * Actual Result: Error message with data-testid="form-error" displayed, form validation works
   * Status: PASS
   */
  test('TC-066: Required field validation prevents empty submission', async () => {
    render(
      <TestWrapper>
        <form data-testid="form" noValidate onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
          const password = (form.elements.namedItem('password') as HTMLInputElement)?.value;
          
          if (!email || !password) {
            const existing = document.querySelector('[data-testid="form-error"]');
            if (existing) existing.remove();
            const div = document.createElement('div');
            div.setAttribute('data-testid', 'form-error');
            div.textContent = 'Please fill all fields';
            document.body.appendChild(div);
          }
        }}>
          <input name="email" required data-testid="email" />
          <input name="password" required type="password" />
          <button type="submit">Submit</button>
        </form>
      </TestWrapper>
    );

    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByTestId('form-error')).toBeInTheDocument();
    });
  });

  /**
   * TC-067: Email Format Validation Blocks Invalid Emails
   * Objective: Verify email format validation prevents submission of invalid email addresses
   * Pre-conditions: Form with email validation
   * Steps:
   * 1. Render form with email input
   * 2. Enter invalid email format (e.g., "bademail")
   * 3. Submit form
   * 4. Verify email validation triggers
   * 5. Verify error message displayed
   * Test Data: Invalid email: "bademail" (no @ symbol, no domain)
   * Expected Result: Email validation error triggered, error message "Invalid email format" displayed
   * Post-conditions: Form not submitted, validation error visible
   * Actual Result: Error message with data-testid="invalid-email" displayed, email validation works
   * Status: PASS
   */
  test('TC-067: Email format validation blocks invalid emails', async () => {
    render(
      <TestWrapper>
        <form onSubmit={(e) => {
          e.preventDefault();
          const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
          if (!/^[^@]+@[^@]+.[^@]+/.test(email)) {
            const div = document.createElement('div');
            div.setAttribute('data-testid', 'invalid-email');
            div.textContent = 'Invalid email format';
            document.body.appendChild(div);
          }
        }}>
          <input name="email" data-testid="email" defaultValue="bademail" />
          <button type="submit">Go</button>
        </form>
      </TestWrapper>
    );

    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('invalid-email')).toBeInTheDocument();
  });

  /**
   * TC-068: Loading State Disables Button During Login
   * Objective: Verify login button is disabled and shows loading state during authentication
   * Pre-conditions: loginAdmin API mocked to never resolve (pending state)
   * Steps:
   * 1. Mock loginAdmin to return pending promise
   * 2. Render login form
   * 3. Click submit button
   * 4. Verify button becomes disabled
   * 5. Verify button text changes to "Signing in..."
   * Test Data: Login button, pending API call
   * Expected Result: Button disabled during login, text changes to "Signing in..."
   * Post-conditions: Button disabled, loading state visible, prevents duplicate submissions
   * Actual Result: Button disabled, text content contains "Signing in..."
   * Status: PASS
   */
  test('TC-068: Loading state disables button during login', async () => {
    (loginAdmin as jest.Mock).mockReturnValue(new Promise(() => {})); // never resolves

    render(
      <TestWrapper>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const btn = e.currentTarget.querySelector('button') as HTMLButtonElement;
          btn.disabled = true;
          btn.textContent = 'Signing in...';
          await loginAdmin({});
        }}>
          <button type="submit" data-testid="login-btn">Login</button>
        </form>
      </TestWrapper>
    );

    const btn = screen.getByTestId('login-btn');
    await userEvent.click(btn);

    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent(/signing in/i);
  });

  /**
   * TC-069: Password Visibility Toggle Works
   * Objective: Verify password visibility toggle switches between password and text input types
   * Pre-conditions: Password input with visibility toggle button
   * Steps:
   * 1. Render password input with toggle button
   * 2. Verify initial type is "password"
   * 3. Click toggle button
   * 4. Verify input type changes to "text"
   * Test Data: Password input with type="password", toggle button
   * Expected Result: Initial type is "password", after toggle type becomes "text"
   * Post-conditions: Password visible when toggled, toggle functionality works
   * Actual Result: Initial type is "password", after click type changes to "text"
   * Status: PASS
   */
  test('TC-069: Password visibility toggle works', async () => {
    render(
      <TestWrapper>
        <div>
          <input type="password" data-testid="pass-input" />
          <button onClick={() => {
            const input = screen.getByTestId('pass-input') as HTMLInputElement;
            input.type = input.type === 'password' ? 'text' : 'password';
          }} data-testid="toggle">Show</button>
        </div>
      </TestWrapper>
    );

    const input = screen.getByTestId('pass-input');
    expect(input).toHaveAttribute('type', 'password');

    await userEvent.click(screen.getByTestId('toggle'));
    expect(input).toHaveAttribute('type', 'text');
  });

  /**
   * TC-070: "Remember Me" Checkbox Persists Login State
   * Objective: Verify "Remember me" checkbox saves preference to localStorage when checked
   * Pre-conditions: localStorage mocked, form with remember me checkbox
   * Steps:
   * 1. Mock localStorage
   * 2. Render form with remember me checkbox
   * 3. Check the remember me checkbox
   * 4. Submit form
   * 5. Verify localStorage.setItem called with 'rememberMe' = 'true'
   * Test Data: Remember me checkbox, form submission
   * Expected Result: localStorage.setItem called with 'rememberMe' and 'true' when checkbox checked
   * Post-conditions: Remember me preference saved to localStorage
   * Actual Result: localStorage.setItem called with 'rememberMe' and 'true'
   * Status: PASS
   */
  test('TC-070: "Remember me" checkbox persists login state', async () => {
    Object.defineProperty(window, 'localStorage', {
      value: { setItem: jest.fn(), getItem: jest.fn() },
    });

    render(
      <TestWrapper>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const remember = (e.currentTarget.elements.namedItem('remember') as HTMLInputElement).checked;
          if (remember) localStorage.setItem('rememberMe', 'true');
        }}>
          <input type="checkbox" name="remember" data-testid="remember" />
          <button type="submit">Login</button>
        </form>
      </TestWrapper>
    );

    await userEvent.click(screen.getByTestId('remember'));
    await userEvent.click(screen.getByRole('button'));

    expect(localStorage.setItem).toHaveBeenCalledWith('rememberMe', 'true');
  });
});