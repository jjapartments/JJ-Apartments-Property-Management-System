describe('Request Form - Tests 06 & 07 (optional fields + clean initial state)', () => {
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

  it('Test 06: Optional fields are truly optional - submits without Email and Messenger', () => {
    // Intercept the ticket submission API call
    cy.intercept('POST', '**/api/tickets/submit', {
      statusCode: 200,
      body: { id: 31 },
    }).as('submitTicket');

    // Fill all required fields with valid data, leave optional fields empty
    const unitValue = 'Unit X';
    const apartmentValue = 'Willow Park';
    const nameValue = 'Test Optional';
    const phoneValue = '09170001111';
    const subjectValue = 'Optional fields test';
    const descriptionValue = 'This ticket verifies optional fields may be empty.';

    cy.get('[data-cy="unit-input"]').type(unitValue);
    cy.get('[data-cy="apartment-input"]').type(apartmentValue);
    cy.get('[data-cy="name-input"]').type(nameValue);
    cy.get('[data-cy="phone-input"]').type(phoneValue);

    // Leave Email and Messenger empty intentionally

    cy.get('[data-cy="subject-input"]').type(subjectValue);
    cy.get('[data-cy="description-input"]').type(descriptionValue);

    // Select a category
    cy.get('[data-cy="category-select"]').click();
    cy.get('[data-cy="category-option-0"]', { timeout: 10000 }).should('be.visible').click();

    // Submit the form
    cy.get('[data-cy="submit-button"]').click();

    // Assert: API call was made and payload contains expected fields
    cy.wait('@submitTicket').then((interception) => {
      expect(interception.request.body.ticket).to.have.property('unitNumber', unitValue);
      expect(interception.request.body.ticket).to.have.property('apartmentName', apartmentValue);
      expect(interception.request.body.ticket).to.have.property('name', nameValue);
      expect(interception.request.body.ticket).to.have.property('phoneNumber', phoneValue);
      // Optional fields should be present but empty strings
      expect(interception.request.body.ticket).to.have.property('email').that.satisfies((v: any) => v === '' || v === null || v === undefined);
      expect(interception.request.body.ticket).to.have.property('messengerLink').that.satisfies((v: any) => v === '' || v === null || v === undefined);
      // recaptcha token should be present from stub
      expect(interception.request.body).to.have.property('recaptchaToken', 'test-grecaptcha-token');

      // Response should include an id (Ticket ID)
      if (!interception.response) {
        throw new Error('No response received for submitTicket interception');
      }
      expect(interception.response.body).to.have.property('id');
    });

    // Assert: Success message appears
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Ticket submitted successfully');
    });

    // Confirm that a Ticket ID is shown somewhere in the UI (receipt modal or similar)
    cy.contains('31').should('exist');
  });

  it('Test 07: Clean initial (empty) state - all fields empty and no messages', () => {
    // Check that all required inputs are empty on first open
    cy.get('[data-cy="unit-input"]').should('have.value', '');
    cy.get('[data-cy="apartment-input"]').should('have.value', '');
    cy.get('[data-cy="name-input"]').should('have.value', '');
    cy.get('[data-cy="phone-input"]').should('have.value', '');
    cy.get('[data-cy="subject-input"]').should('have.value', '');
    cy.get('[data-cy="description-input"]').should('have.value', '');

    // Category should not show any selected value from the known list
    const categories = [
      'Maintenance & Repairs',
      'Security & Safety',
      'Utilities',
      'Payment & Billing',
      'Amenities & Facilities',
      'Others',
    ];

    cy.get('[data-cy="category-select"]').should('exist').then(($el) => {
      const text = $el.text().trim();
      // If a placeholder is present it should not equal any category label
      expect(categories.includes(text)).to.be.false;
    });

    // No validation messages should be present
    cy.contains('Required').should('not.exist');

    // No success message should be present
    cy.contains('Ticket submitted successfully').should('not.exist');
  });
});
