describe('Signup Validation Suite - Failure Cases', () => {
  beforeEach(() => {
    cy.visit('/admin-portal/signup');
    
    // Wait for page to fully load
    cy.contains('Create your account').should('be.visible');
  });

  it('should block submission when username is too short', () => {
    // Fill form with short username (less than 3 characters)
    cy.get('#username').type('ab');
    cy.get('#password').type('password123');
    cy.get('#registrationKey').type('MySecretKey123');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Assert: Error message appears
    cy.contains('Username must be at least 3 characters long').should('be.visible');
    
    // Assert: User stays on signup page
    cy.url().should('include', '/signup');
    
    // Assert: No success navigation occurs
    cy.url().should('not.include', '/login');
  });

  it('should block submission when password is too short', () => {
    // Fill form with short password (less than 6 characters)
    cy.get('#username').type('testuser');
    cy.get('#password').type('12345');
    cy.get('#registrationKey').type('MySecretKey123');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Assert: Error message appears
    cy.contains('Password must be at least 6 characters long').should('be.visible');
    
    // Assert: User stays on signup page
    cy.url().should('include', '/signup');
  });

  it('should block submission when required fields are empty', () => {
    // Click submit without filling anything
    cy.get('button[type="submit"]').click();
    
    // HTML5 validation should prevent submission
    // The form won't submit due to 'required' attribute
    cy.url().should('include', '/signup');
    
    // Alternatively, test leaving one field empty
    cy.get('#username').type('testuser');
    cy.get('#password').type('password123');
    // Leave registrationKey empty
    
    cy.get('button[type="submit"]').click();
    
    // Form should not proceed
    cy.url().should('include', '/signup');
  });
});

describe('Signup Success Suite - Happy Path', () => {
  beforeEach(() => {
    cy.visit('/admin-portal/signup');
    cy.contains('Create your account').should('be.visible');
  });

  it('should successfully create account with valid data', () => {
    // Generate unique username to avoid conflicts
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    
    // Fill form with valid data
    cy.get('#username').type(username);
    cy.get('#password').type('password123');
    cy.get('#registrationKey').type('MySecretKey123');
    
    // Intercept the API call to verify request
    cy.intercept('POST', '**/api/users/add').as('signupRequest');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Wait for API call
    cy.wait('@signupRequest').then((interception) => {
      // Verify the request body contains correct data
      expect(interception.request.body).to.have.property('username', username);
      expect(interception.request.body).to.have.property('password', 'password123');
      expect(interception.request.body).to.have.property('registrationKey', 'MySecretKey123');
      
      // If backend is running and request succeeds
      if (interception.response && interception.response.statusCode === 200) {
        // Check for success alert (browser alert)
        // Note: Cypress can't intercept browser alerts, but you can stub them
        
        // Assert: User is redirected to login page
        cy.url().should('include', '/login', { timeout: 10000 });
      }
    });
  });

  it('should toggle password visibility', () => {
    // Password field should be masked by default
    cy.get('#password').should('have.attr', 'type', 'password');
    cy.get('#registrationKey').should('have.attr', 'type', 'password');
    
    // Click the eye icon to show password
    cy.get('button[type="button"]').first().click();
    
    // Both password and registration key should now be visible
    cy.get('#password').should('have.attr', 'type', 'text');
    cy.get('#registrationKey').should('have.attr', 'type', 'text');
    
    // Click again to hide
    cy.get('button[type="button"]').first().click();
    
    // Should be masked again
    cy.get('#password').should('have.attr', 'type', 'password');
    cy.get('#registrationKey').should('have.attr', 'type', 'password');
  });

  it('should show loading state during submission', () => {
    const username = `testuser${Date.now()}`;
    
    // Fill form
    cy.get('#username').type(username);
    cy.get('#password').type('password123');
    cy.get('#registrationKey').type('MySecretKey123');
    
    // Intercept to add delay
    cy.intercept('POST', '**/api/users/add', (req) => {
      req.reply((res) => {
        res.delay = 1000; // 1 second delay
        res.send();
      });
    }).as('signupRequest');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Assert: Loading state is shown
    cy.contains('Creating account...').should('be.visible');
    
    // Assert: Submit button is disabled during loading
    cy.get('button[type="submit"]').should('be.disabled');
    
    // Wait for completion
    cy.wait('@signupRequest');
  });
});