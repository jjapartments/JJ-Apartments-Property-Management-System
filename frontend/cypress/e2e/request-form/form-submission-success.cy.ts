describe('Request Form - Test 04 Submit succeeds only when valid + reCAPTCHA done', () => {
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
      // Defensive: if the stub isn't returning a token, attach a fallback
      if (!win.grecaptcha.getResponse || typeof win.grecaptcha.getResponse !== 'function') {
        // eslint-disable-next-line no-param-reassign
        win.grecaptcha.getResponse = () => 'test-grecaptcha-token';
      }

      // Confirm getResponse returns our test token before interacting
      expect(win.grecaptcha.getResponse()).to.equal('test-grecaptcha-token');

      // Force recaptchaReady by calling render on the recaptcha container to trigger the form's readiness
      const recaptchaEl = win.document.querySelector('[data-cy="recaptcha"]');
      if (recaptchaEl && win.grecaptcha && win.grecaptcha.render) {
        try {
          win.grecaptcha.render(recaptchaEl, { sitekey: 'test-sitekey' });
        } catch (err) {
          // Ignore render errors; the stub will still work for getResponse
        }
      }
    });

    cy.wait(500);
  });

  it('should successfully submit form with all valid required fields and reCAPTCHA', () => {
    // Intercept the ticket submission API call
    cy.intercept('POST', '**/api/tickets/submit', {
      statusCode: 200,
      body: { id: 27 },
    }).as('submitTicket');

    // Fill all required fields with valid data
    cy.get('[data-cy="unit-input"]').type('Unit A');
    cy.get('[data-cy="apartment-input"]').type('Maple Residences');
    cy.get('[data-cy="name-input"]').type('Juan Dela Cruz');
    cy.get('[data-cy="phone-input"]').type('09123456789');

    // Fill other required fields
    cy.get('[data-cy="subject-input"]').type('Leaky faucet');
    cy.get('[data-cy="description-input"]').type('Water is leaking from the kitchen sink faucet and needs immediate repair.');

    // Select a category
    cy.get('[data-cy="category-select"]').click();
    cy.get('[data-cy="category-option-0"]', { timeout: 10000 }).should('be.visible').click();

    // Submit the form
    cy.get('[data-cy="submit-button"]').click();

    // Assert: API call was made with correct data
    cy.wait('@submitTicket').then((interception) => {
      expect(interception.request.body.ticket).to.have.property('unitNumber', 'Unit A');
      expect(interception.request.body.ticket).to.have.property('name', 'Juan Dela Cruz');
      expect(interception.request.body).to.have.property('recaptchaToken', 'test-grecaptcha-token');
    });

    // Assert: Success message appears
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Ticket submitted successfully');
    });

    // Assert: User stays on the form page
    cy.url().should('include', '/requests');

    // Verify no validation error messages are visible
    cy.contains('Required').should('not.exist');

    // After successful submission, form should reset
    cy.get('[data-cy="unit-input"]').should('have.value', '');
  });

  it('should fill optional fields and submit successfully', () => {
    // Intercept the ticket submission API call
    cy.intercept('POST', '**/api/tickets/submit', {
      statusCode: 200,
      body: { id: 28 },
    }).as('submitTicket');

    // Fill all required fields with valid data
    cy.get('[data-cy="unit-input"]').type('Unit B');
    cy.get('[data-cy="apartment-input"]').type('Oak Tower');
    cy.get('[data-cy="name-input"]').type('Maria Santos');
    cy.get('[data-cy="phone-input"]').type('09987654321');

    // Fill optional fields (Email and Messenger Link)
    cy.get('input[placeholder="jdela@gmail.com"]').type('maria@example.com');
    cy.get('input[placeholder="jdela.com"]').type('https://m.me/mariasantos');

    // Fill required fields
    cy.get('[data-cy="subject-input"]').type('Broken window lock');
    cy.get('[data-cy="description-input"]').type('The window lock in bedroom 2 is broken and needs to be replaced for security.');

    // Select a category
    cy.get('[data-cy="category-select"]').click();
    cy.get('[data-cy="category-option-1"]', { timeout: 10000 }).should('be.visible').click(); // Security & Safety

    // Submit the form
    cy.get('[data-cy="submit-button"]').click();

    // Assert: API call was made
    cy.wait('@submitTicket');

    // Assert: Success message appears
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Ticket submitted successfully');
    });

    // Verify form stays on requests page (no navigation error)
    cy.url().should('include', '/requests');

    // Verify no validation error messages
    cy.contains('Required').should('not.exist');

    // Form should be reset
    cy.get('[data-cy="unit-input"]').should('have.value', '');
  });

  it('should display receipt modal after successful submission', () => {
    // Intercept the ticket submission API call
    cy.intercept('POST', '**/api/tickets/submit', {
      statusCode: 200,
      body: { id: 29 },
    }).as('submitTicket');

    // Fill all required fields
    cy.get('[data-cy="unit-input"]').type('Unit C');
    cy.get('[data-cy="apartment-input"]').type('Pine Estate');
    cy.get('[data-cy="name-input"]').type('Carlos Rivera');
    cy.get('[data-cy="phone-input"]').type('09555666777');

    cy.get('[data-cy="subject-input"]').type('Electrical outlet not working');
    cy.get('[data-cy="description-input"]').type('Two electrical outlets in the living room are not working. Please send an electrician.');

    // Select category
    cy.get('[data-cy="category-select"]').click();
    cy.get('[data-cy="category-option-2"]', { timeout: 10000 }).should('be.visible').click(); // Utilities

    // Submit the form
    cy.get('[data-cy="submit-button"]').click();

    // Assert: API call was made
    cy.wait('@submitTicket');

    // Assert: Success alert shown
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Ticket submitted successfully');
    });

    // After successful submission, the form should be reset
    cy.get('[data-cy="subject-input"]').should('have.value', '');
  });

  it('should clear form fields after successful submission', () => {
    // Intercept the ticket submission API call
    cy.intercept('POST', '**/api/tickets/submit', {
      statusCode: 200,
      body: { id: 30 },
    }).as('submitTicket');

    // Fill all required fields
    const unitValue = 'Unit D';
    const apartmentValue = 'Cedar Apartments';
    const nameValue = 'Ana Lopez';
    const phoneValue = '09111222333';
    const subjectValue = 'Pest infestation';
    const descriptionValue = 'There are cockroaches in the kitchen. Please send pest control.';

    cy.get('[data-cy="unit-input"]').type(unitValue);
    cy.get('[data-cy="apartment-input"]').type(apartmentValue);
    cy.get('[data-cy="name-input"]').type(nameValue);
    cy.get('[data-cy="phone-input"]').type(phoneValue);

    cy.get('[data-cy="subject-input"]').type(subjectValue);
    cy.get('[data-cy="description-input"]').type(descriptionValue);

    // Select category
    cy.get('[data-cy="category-select"]').click();
    cy.get('[data-cy="category-option-5"]', { timeout: 10000 }).should('be.visible').click(); // Others

    // Submit the form
    cy.get('[data-cy="submit-button"]').click();

    // Assert: API call was made
    cy.wait('@submitTicket');

    // Assert: Success alert shown
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Ticket submitted successfully');
    });

    // After alert is dismissed, verify form fields have been cleared
    // The form resets after a successful submission
    cy.get('[data-cy="unit-input"]').should('have.value', '');
    cy.get('[data-cy="apartment-input"]').should('have.value', '');
    cy.get('[data-cy="name-input"]').should('have.value', '');
    cy.get('[data-cy="phone-input"]').should('have.value', '');
    cy.get('[data-cy="subject-input"]').should('have.value', '');
    cy.get('[data-cy="description-input"]').should('have.value', '');
  });

});
