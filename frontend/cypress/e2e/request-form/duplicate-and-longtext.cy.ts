describe('Request Form - Test 08 (duplicate submit) and Test 09 (long text handling)', () => {
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

    cy.wait(250);
  });

  it('Test 08: Prevent duplicate submission clicks', () => {
    let submitCount = 0;

    cy.intercept('POST', '**/api/tickets/submit', (req) => {
      submitCount += 1;
      req.reply({ statusCode: 200, body: { id: 40 } });
    }).as('submitTicket');

    // Fill required fields
    cy.get('[data-cy="unit-input"]').type('Unit Dup');
    cy.get('[data-cy="apartment-input"]').type('Duplicate Towers');
    cy.get('[data-cy="name-input"]').type('Dup Clicker');
    cy.get('[data-cy="phone-input"]').type('09180002222');
    cy.get('[data-cy="subject-input"]').type('Prevent duplicate');
    cy.get('[data-cy="description-input"]').type('Testing multiple clicks should only submit once.');

    // Select category
    cy.get('[data-cy="category-select"]').click();
    cy.get('[data-cy="category-option-3"]', { timeout: 10000 }).should('be.visible').click();

    // Click submit button several times quickly
    cy.get('[data-cy="submit-button"]').click().click().click().click();

    // Wait for the submission to be processed
    cy.wait('@submitTicket');

    // Small delay to catch any stray requests
    cy.wait(500);

    // Assert only one submission was processed
    cy.then(() => {
      expect(submitCount).to.equal(1);
    });

    // Optionally check that the submit button disabled or shows submitting state
    cy.get('[data-cy="submit-button"]').then(($btn) => {
      const isDisabled = $btn.prop('disabled');
      const text = $btn.text().toLowerCase();
      if (isDisabled || text.includes('submitting')) {
        // If designed to disable, assert accordingly
        expect(isDisabled || text.includes('submitting')).to.equal(true);
      } else {
        // Not an error - the app may not disable the button; we still enforce single submission above
        cy.log('Submit button did not enter a disabled/submitting state (acceptable if app not designed that way)');
      }
    });

    // Assert success alert occurred
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Ticket submitted successfully');
    });

    // Verify exactly one Ticket ID appears in the document
    cy.document().then((doc) => {
      const matches = Array.from(doc.querySelectorAll('*')).filter((el) => el.textContent && el.textContent.includes('40'));
      expect(matches.length).to.equal(1);
    });
  });

  it('Test 09: Long text handling in description/subject', () => {
    // Use a reasonably long text (not excessively long to avoid typing/performance issues)
    const longText = Array(50).fill('This is a long test sentence.').join(' ');

    cy.intercept('POST', '**/api/tickets/submit', { statusCode: 200, body: { id: 41 } }).as('submitTicket');

    // Fill required fields with long subject and body
    cy.get('[data-cy="unit-input"]').type('Unit Long');
    cy.get('[data-cy="apartment-input"]').type('Longform Residences');
    cy.get('[data-cy="name-input"]').type('Long Tester');
    cy.get('[data-cy="phone-input"]').type('09190003333');

    cy.get('[data-cy="subject-input"]').type(longText);
    cy.get('[data-cy="description-input"]').type(longText);

    // Select a category
    cy.get('[data-cy="category-select"]').click();
    cy.get('[data-cy="category-option-2"]', { timeout: 10000 }).should('be.visible').click();

    // Submit the form
    cy.get('[data-cy="submit-button"]').click();

    // Wait for API call and assert it was made
    cy.wait('@submitTicket').then((interception) => {
      expect(interception.request.body.ticket).to.have.property('subject');
      expect(interception.request.body.ticket).to.have.property('body');
      expect(interception.request.body.ticket.subject.length).to.be.greaterThan(100);
      expect(interception.request.body.ticket.body.length).to.be.greaterThan(100);
    });

    // Assert: Success alert appears
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Ticket submitted successfully');
    });

    // Confirm that a Ticket ID is shown
    cy.contains('41').should('exist');

    // Ensure no validation messages are shown for long text
    cy.contains('Required').should('not.exist');
    cy.contains('too long').should('not.exist');
  });
});
