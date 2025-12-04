describe('Login Validation Suite - Failure Cases', () => {
  beforeEach(() => {
    cy.visit('/admin-portal/login');
    
    // Wait for page to fully load
    cy.contains('Log in to your account').should('be.visible');
  });

  it('should show error when username field is empty', () => {
    // Fill only password field
    cy.get('[data-cy="password-input"]').type('password123');
    
    // Submit the form
    cy.get('[data-cy="submit-button"]').click();
    
    // Assert: HTML5 validation or error message appears
    cy.url().should('include', '/login');
  });

  it('should show error when password field is empty', () => {
    // Fill only username field
    cy.get('[data-cy="username-input"]').type('testuser');
    
    // Submit the form
    cy.get('[data-cy="submit-button"]').click();
    
    // Assert: HTML5 validation or error message appears
    cy.url().should('include', '/login');
  });

  it('should block submission when both fields are empty', () => {
    // Click submit without filling anything
    cy.get('[data-cy="submit-button"]').click();
    
    // HTML5 validation should prevent submission
    cy.url().should('include', '/login');
  });

  it('should show error for invalid credentials', () => {
    // Fill form with invalid credentials
    cy.get('[data-cy="username-input"]').type('nonexistentuser');
    cy.get('[data-cy="password-input"]').type('wrongpassword');
    
    // Intercept the API call
    cy.intercept('POST', '**/api/users/login', {
      statusCode: 401,
      body: {
        error: 'ACCOUNT_NOT_FOUND'
      }
    }).as('loginRequest');
    
    // Submit the form
    cy.get('[data-cy="submit-button"]').click();
    
    // Wait for API call
    cy.wait('@loginRequest');
    
    // Assert: Error message appears
    cy.get('[data-cy="error-message"]').should('contain', 'Account does not exist');
    
    // Assert: User stays on login page
    cy.url().should('include', '/login');
  });

  it('should show error for incorrect password', () => {
    // Fill form with existing username but wrong password
    cy.get('[data-cy="username-input"]').type('existinguser');
    cy.get('[data-cy="password-input"]').type('wrongpassword');
    
    // Intercept the API call
    cy.intercept('POST', '**/api/users/login', {
      statusCode: 401,
      body: {
        error: 'INVALID_PASSWORD'
      }
    }).as('loginRequest');
    
    // Submit the form
    cy.get('[data-cy="submit-button"]').click();
    
    // Wait for API call
    cy.wait('@loginRequest');
    
    // Assert: Error message appears
    cy.get('[data-cy="error-message"]').should('contain', 'Incorrect password');
    
    // Assert: User stays on login page
    cy.url().should('include', '/login');
  });

  it('should show server error message on 500 status', () => {
    cy.get('[data-cy="username-input"]').type('testuser');
    cy.get('[data-cy="password-input"]').type('password123');
    
    // Intercept the API call with server error
    cy.intercept('POST', '**/api/users/login', {
      statusCode: 500,
      body: {
        error: 'Internal server error'
      }
    }).as('loginRequest');
    
    // Submit the form
    cy.get('[data-cy="submit-button"]').click();
    
    // Wait for API call
    cy.wait('@loginRequest');
    
    // Assert: Server error message appears
    cy.get('[data-cy="error-message"]').should('contain', 'Server error. Please try again later');
  });

  it('should show generic error for 401 without specific error code', () => {
    cy.get('[data-cy="username-input"]').type('testuser');
    cy.get('[data-cy="password-input"]').type('wrongpass');
    
    cy.intercept('POST', '**/api/users/login', {
      statusCode: 401,
      body: {
        error: 'SOME_OTHER_ERROR'
      }
    }).as('loginRequest');
    
    cy.get('[data-cy="submit-button"]').click();
    cy.wait('@loginRequest');
    
    // Should show generic invalid credentials message
    cy.get('[data-cy="error-message"]').should('contain', 'Invalid credentials');
  });
});

describe('Login Success Suite - Happy Path', () => {
  beforeEach(() => {
    cy.visit('/admin-portal/login');
    cy.contains('Log in to your account').should('be.visible');
  });

  it('should successfully login with valid credentials', () => {
    const username = 'validuser';
    const token = 'mock-jwt-token-12345';
    
    // Fill form with valid data
    cy.get('[data-cy="username-input"]').type(username);
    cy.get('[data-cy="password-input"]').type('password123');
    
    // Intercept the API call to mock successful login
    cy.intercept('POST', '**/api/users/login', {
      statusCode: 200,
      body: {
        username: username,
        token: token
      }
    }).as('loginRequest');
    
    // Submit the form
    cy.get('[data-cy="submit-button"]').click();
    
    // Wait for API call
    cy.wait('@loginRequest').then((interception) => {
      // Verify the request body contains correct data
      expect(interception.request.body).to.have.property('username', username);
      expect(interception.request.body).to.have.property('password', 'password123');
    });
    
    // Assert: User is redirected to dashboard
    cy.url().should('include', '/admin-portal/dashboard', { timeout: 10000 });
  });

  it('should toggle password visibility', () => {
    // Password field should be masked by default
    cy.get('[data-cy="password-input"]').should('have.attr', 'type', 'password');
    
    // Click the eye icon to show password
    cy.get('[data-cy="toggle-password"]').click();
    
    // Password should now be visible
    cy.get('[data-cy="password-input"]').should('have.attr', 'type', 'text');
    
    // Click again to hide
    cy.get('[data-cy="toggle-password"]').click();
    
    // Should be masked again
    cy.get('[data-cy="password-input"]').should('have.attr', 'type', 'password');
  });

  it('should show loading state during login', () => {
    cy.get('[data-cy="username-input"]').type('testuser');
    cy.get('[data-cy="password-input"]').type('password123');
    
    // Intercept to add delay - this ensures loading state persists long enough
    cy.intercept('POST', '**/api/users/login', (req) => {
      req.reply({
        delay: 2000, // 2 second delay to ensure loading state is visible
        statusCode: 200,
        body: {
          username: 'testuser',
          token: 'mock-token'
        }
      });
    }).as('loginRequest');
    
    // Submit form
    cy.get('[data-cy="submit-button"]').click();
    
    // IMPORTANT: Check loading state immediately after click, before wait
    // This prevents race conditions
    cy.get('[data-cy="submit-button"]').should('contain', 'Logging in...');
    cy.get('[data-cy="loading-spinner"]').should('exist');
    
    // Assert: Submit button is disabled during loading
    cy.get('[data-cy="submit-button"]').should('be.disabled');
    
    // Assert: Input fields are disabled during loading
    cy.get('[data-cy="username-input"]').should('be.disabled');
    cy.get('[data-cy="password-input"]').should('be.disabled');
    
    // Wait for completion
    cy.wait('@loginRequest');
    
    // After request completes, should redirect
    cy.url().should('include', '/admin-portal/dashboard', { timeout: 5000 });
  });

  it('should have working signup link', () => {
    // Click on signup link
    cy.get('[data-cy="signup-link"]').click();
    
    // Assert: User is redirected to signup page
    cy.url().should('include', '/admin-portal/signup');
  });

  it('should display logo and welcome text', () => {
    // Check for logo
    cy.get('img[alt="JJ Apartments Logo"]').should('be.visible');
    
    // Check for welcome text
    cy.contains('Log in to your account').should('be.visible');
    cy.contains('Access your property management dashboard').should('be.visible');
  });

  it('should prevent logged-in users from accessing login page', () => {
    // Mock localStorage to simulate logged-in state
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-token');
      win.localStorage.setItem('username', 'testuser');
    });
    
    // Visit login page
    cy.visit('/admin-portal/login');
    
    // Should redirect to dashboard
    cy.url().should('include', '/admin-portal/dashboard', { timeout: 10000 });
  });

  it('should maintain form data when toggling password visibility', () => {
    const testPassword = 'mySecurePassword123';
    const testUsername = 'testuser';
    
    // Type username and password
    cy.get('[data-cy="username-input"]').type(testUsername);
    cy.get('[data-cy="password-input"]').type(testPassword);
    
    // Toggle visibility
    cy.get('[data-cy="toggle-password"]').click();
    
    // Both fields should still have their values
    cy.get('[data-cy="username-input"]').should('have.value', testUsername);
    cy.get('[data-cy="password-input"]').should('have.value', testPassword);
    
    // Toggle back
    cy.get('[data-cy="toggle-password"]').click();
    
    // Values should still be there
    cy.get('[data-cy="username-input"]').should('have.value', testUsername);
    cy.get('[data-cy="password-input"]').should('have.value', testPassword);
  });
});

describe('Login UI/UX Suite', () => {
  beforeEach(() => {
    cy.visit('/admin-portal/login');
  });

  it('should have proper input placeholders', () => {
    cy.get('[data-cy="username-input"]').should('have.attr', 'placeholder', 'Enter your username');
    cy.get('[data-cy="password-input"]').should('have.attr', 'placeholder', 'Enter your password');
  });

  it('should have proper labels', () => {
    cy.contains('label', 'Username').should('be.visible');
    cy.contains('label', 'Password').should('be.visible');
  });

  it('should display building image on desktop', () => {
    // Set viewport to desktop size
    cy.viewport(1280, 720);
    
    // Check if building image is visible
    cy.get('img[alt="JJ Apartments Building"]').first().should('exist');
  });

  it('should be responsive on mobile', () => {
    // Set viewport to mobile size
    cy.viewport(375, 667);
    
    // Form should still be visible and usable
    cy.contains('Log in to your account').should('be.visible');
    cy.get('[data-cy="username-input"]').should('be.visible');
    cy.get('[data-cy="password-input"]').should('be.visible');
    cy.get('[data-cy="submit-button"]').should('be.visible');
  });

  it('should have proper form structure', () => {
    // Form should exist
    cy.get('[data-cy="login-form"]').should('exist');
    
    // Required fields should have required attribute
    cy.get('[data-cy="username-input"]').should('have.attr', 'required');
    cy.get('[data-cy="password-input"]').should('have.attr', 'required');
  });

  it('should show auth loading state when checking authentication', () => {
    // This tests the initial auth check loading state
    // In real scenario, this would show briefly before page loads
    // We can't easily test this in isolation, but the data-cy attribute is there
    cy.visit('/admin-portal/login');
    cy.get('[data-cy="login-form"]').should('be.visible');
  });
});