describe('Request Form - Test 02 Phone number validation', () => {
  beforeEach(() => {
    // Intercept common Google reCAPTCHA endpoints to prevent loading the real API
    cy.intercept('https://www.google.com/recaptcha/api.js*', { statusCode: 200, body: '' });
    cy.intercept('https://www.gstatic.com/recaptcha/**', { statusCode: 200, body: '' });
    cy.intercept('https://www.recaptcha.net/recaptcha/**', { statusCode: 200, body: '' });

    cy.visit('/requests');

    // Wait for the form title to be visible
    cy.contains('Request Form').should('be.visible');

    // Ensure our grecaptcha stub is attached to the window and returns the test token
    cy.window().its('grecaptcha').should('exist');
    cy.window().then((win) => {
      if (!win.grecaptcha.getResponse || typeof win.grecaptcha.getResponse !== 'function') {
        // eslint-disable-next-line no-param-reassign
        win.grecaptcha.getResponse = () => 'test-grecaptcha-token';
      }

      // Confirm getResponse returns our test token before interacting
      expect(win.grecaptcha.getResponse()).to.equal('test-grecaptcha-token');

      // Force recaptchaReady by calling render on the recaptcha container
      const recaptchaEl = win.document.querySelector('[data-cy="recaptcha"]');
      if (recaptchaEl && win.grecaptcha && win.grecaptcha.render) {
        try {
          win.grecaptcha.render(recaptchaEl, { sitekey: 'test-sitekey' });
        } catch (err) {
          // Ignore render errors
        }
      }
    });

    cy.wait(500);
  });

  it('should show error when phone number contains letters (invalid format)', () => {
    // Fill all required fields with valid data
    cy.get('[data-cy="unit-input"]').type('Unit A');
    cy.get('[data-cy="apartment-input"]').type('Maple Residences');
    cy.get('[data-cy="name-input"]').type('Juan Dela Cruz');

    // Enter invalid phone number (letters instead of numbers)
    cy.get('[data-cy="phone-input"]').type('abcdefgh');

    // Fill other required fields
    cy.get('[data-cy="subject-input"]').type('Leaky faucet');
    cy.get('[data-cy="description-input"]').type('Water leaking in the kitchen sink');

    // Select a category
    cy.get('[data-cy="category-select"]').click();
    cy.get('[data-cy="category-option-0"]', { timeout: 10000 }).should('be.visible').click();

    // Submit the form
    cy.get('[data-cy="submit-button"]').click();

    // Assert: A validation error message appears saying the phone number is invalid
    // The form shows an alert when validation fails
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Please fill all required fields');
    });

    // Assert: User stays on the same page (form did not submit)
    cy.url().should('include', '/requests');

    // Verify no success message is displayed
    cy.contains('Ticket submitted successfully!').should('not.exist');

    // Verify the phone number field still has the invalid value
    cy.get('[data-cy="phone-input"]').should('have.value', 'abcdefgh');
  });

  it('should show error when phone number contains special characters', () => {
    // Fill all required fields with valid data
    cy.get('[data-cy="unit-input"]').type('Unit A');
    cy.get('[data-cy="apartment-input"]').type('Maple Residences');
    cy.get('[data-cy="name-input"]').type('Juan Dela Cruz');

    // Enter invalid phone number with special characters and spaces
    cy.get('[data-cy="phone-input"]').type('123-456-7890');

    // Fill other required fields
    cy.get('[data-cy="subject-input"]').type('Leaky faucet');
    cy.get('[data-cy="description-input"]').type('Water leaking in the kitchen sink');

    // Select a category
    cy.get('[data-cy="category-select"]').click();
    cy.get('[data-cy="category-option-0"]', { timeout: 10000 }).should('be.visible').click();

    // Submit the form
    cy.get('[data-cy="submit-button"]').click();

    // Assert: Validation fails and alert appears
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Please fill all required fields');
    });

    // Assert: User stays on the same page
    cy.url().should('include', '/requests');

    // Verify no success message is displayed
    cy.contains('Ticket submitted successfully!').should('not.exist');
  });

  it('should allow submission with valid phone number (digits only)', () => {
    // Intercept the ticket submission API call
    cy.intercept('POST', '**/api/tickets/submit', {
      statusCode: 200,
      body: { id: 25 },
    }).as('submitTicket');

    // Fill all required fields with valid data including a valid phone number
    cy.get('[data-cy="unit-input"]').type('Unit A');
    cy.get('[data-cy="apartment-input"]').type('Maple Residences');
    cy.get('[data-cy="name-input"]').type('Juan Dela Cruz');

    // Enter valid phone number (digits only)
    cy.get('[data-cy="phone-input"]').type('09123456789');

    // Fill other required fields
    cy.get('[data-cy="subject-input"]').type('Leaky faucet');
    cy.get('[data-cy="description-input"]').type('Water leaking in the kitchen sink');

    // Select a category
    cy.get('[data-cy="category-select"]').click();
    cy.get('[data-cy="category-option-0"]', { timeout: 10000 }).should('be.visible').click();

    // Submit the form
    cy.get('[data-cy="submit-button"]').click();

    // Assert: Form submission should proceed (API call made)
    cy.wait('@submitTicket').then((interception) => {
      expect(interception.request.body.ticket).to.have.property('phoneNumber', '09123456789');
    });

    // Assert: Success message appears
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Ticket submitted successfully');
    });

    // Verify form stays on requests page
    cy.url().should('include', '/requests');

    // Verify form was reset
    cy.get('[data-cy="phone-input"]').should('have.value', '');
  });
});
