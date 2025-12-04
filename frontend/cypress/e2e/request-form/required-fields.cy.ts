describe('Request Form - Test 01 Required field blocks submission', () => {
  beforeEach(() => {
    cy.visit('/requests');

    // Wait for the form title to be visible
    cy.contains('Request Form').should('be.visible');
  });

  it('should block submission when Name is empty (Required field)', () => {
    // Fill all required fields except Name
    cy.get('[data-cy="unit-input"]').type('Unit A');
    cy.get('[data-cy="apartment-input"]').type('Maple Residences');
    // leave Name blank (do NOT fill it)
    cy.get('[data-cy="phone-input"]').type('09123456789');

    // Subject and description
    cy.get('[data-cy="subject-input"]').type('Leaky faucet');
    cy.get('[data-cy="description-input"]').type('Water leaking in the kitchen sink');

    // Select a category by opening the select and picking an item using data-cy
    cy.get('[data-cy="category-select"]').click();
    // Wait for the dropdown to appear and click the first option
    cy.get('[data-cy="category-option-0"]', { timeout: 10000 }).should('be.visible').click();

    // reCAPTCHA is stubbed in support/e2e.ts, so no need to interact with it.
    // The form will use the mocked token from the stub.

    // Submit the form
    cy.get('[data-cy="submit-button"]').click();

    // Assert: An alert appears saying "Please fill all required fields!"
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Please fill all required fields');
    });

    // Assert: User stays on the same page (no navigation occurred)
    cy.url().should('include', '/requests');

    // Verify the Name input is still empty (no data was sent)
    cy.get('[data-cy="name-input"]').should('have.value', '');
  });

  it('should block submission when Unit Number is empty (Required field)', () => {
    // leave Unit Number blank
    cy.get('[data-cy="apartment-input"]').type('Maple Residences');
    cy.get('[data-cy="name-input"]').type('Juan Dela Cruz');
    cy.get('[data-cy="phone-input"]').type('09123456789');

    // Subject and description
    cy.get('[data-cy="subject-input"]').type('Leaky faucet');
    cy.get('[data-cy="description-input"]').type('Water leaking in the kitchen sink');

    // Select a category
    cy.get('[data-cy="category-select"]').click();
    cy.get('[data-cy="category-option-0"]', { timeout: 10000 }).should('be.visible').click();

    // Submit the form
    cy.get('[data-cy="submit-button"]').click();

    // Assert: An alert appears saying "Please fill all required fields!"
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Please fill all required fields');
    });

    // Assert: User stays on the same page
    cy.url().should('include', '/requests');

    // Verify the Unit Number input is still empty
    cy.get('[data-cy="unit-input"]').should('have.value', '');
  });

  it('should block submission when Apartment Name is empty (Required field)', () => {
    cy.get('[data-cy="unit-input"]').type('Unit A');
    // leave Apartment Name blank
    cy.get('[data-cy="name-input"]').type('Juan Dela Cruz');
    cy.get('[data-cy="phone-input"]').type('09123456789');

    // Subject and description
    cy.get('[data-cy="subject-input"]').type('Leaky faucet');
    cy.get('[data-cy="description-input"]').type('Water leaking in the kitchen sink');

    // Select a category
    cy.get('[data-cy="category-select"]').click();
    cy.get('[data-cy="category-option-0"]', { timeout: 10000 }).should('be.visible').click();

    // Submit the form
    cy.get('[data-cy="submit-button"]').click();

    // Assert: An alert appears saying "Please fill all required fields!"
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Please fill all required fields');
    });

    // Assert: User stays on the same page
    cy.url().should('include', '/requests');

    // Verify the Apartment Name input is still empty
    cy.get('[data-cy="apartment-input"]').should('have.value', '');
  });

  it('should block submission when Phone Number is empty (Required field)', () => {
    cy.get('[data-cy="unit-input"]').type('Unit A');
    cy.get('[data-cy="apartment-input"]').type('Maple Residences');
    cy.get('[data-cy="name-input"]').type('Juan Dela Cruz');
    // leave Phone Number blank

    // Subject and description
    cy.get('[data-cy="subject-input"]').type('Leaky faucet');
    cy.get('[data-cy="description-input"]').type('Water leaking in the kitchen sink');

    // Select a category
    cy.get('[data-cy="category-select"]').click();
    cy.get('[data-cy="category-option-0"]', { timeout: 10000 }).should('be.visible').click();

    // Submit the form
    cy.get('[data-cy="submit-button"]').click();

    // Assert: An alert appears saying "Please fill all required fields!"
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Please fill all required fields');
    });

    // Assert: User stays on the same page
    cy.url().should('include', '/requests');

    // Verify the Phone Number input is still empty
    cy.get('[data-cy="phone-input"]').should('have.value', '');
  });

  it('should block submission when Category is not selected (Required field)', () => {
    cy.get('[data-cy="unit-input"]').type('Unit A');
    cy.get('[data-cy="apartment-input"]').type('Maple Residences');
    cy.get('[data-cy="name-input"]').type('Juan Dela Cruz');
    cy.get('[data-cy="phone-input"]').type('09123456789');

    // Subject and description
    cy.get('[data-cy="subject-input"]').type('Leaky faucet');
    cy.get('[data-cy="description-input"]').type('Water leaking in the kitchen sink');

    // leave Category unselected - do NOT click on it

    // Submit the form
    cy.get('[data-cy="submit-button"]').click();

    // Assert: An alert appears saying "Please fill all required fields!"
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Please fill all required fields');
    });

    // Assert: User stays on the same page
    cy.url().should('include', '/requests');
  });

  it('should block submission when Subject is empty (Required field)', () => {
    cy.get('[data-cy="unit-input"]').type('Unit A');
    cy.get('[data-cy="apartment-input"]').type('Maple Residences');
    cy.get('[data-cy="name-input"]').type('Juan Dela Cruz');
    cy.get('[data-cy="phone-input"]').type('09123456789');

    // leave Subject blank
    cy.get('[data-cy="description-input"]').type('Water leaking in the kitchen sink');

    // Select a category
    cy.get('[data-cy="category-select"]').click();
    cy.get('[data-cy="category-option-0"]', { timeout: 10000 }).should('be.visible').click();

    // Submit the form
    cy.get('[data-cy="submit-button"]').click();

    // Assert: An alert appears saying "Please fill all required fields!"
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Please fill all required fields');
    });

    // Assert: User stays on the same page
    cy.url().should('include', '/requests');

    // Verify the Subject input is still empty
    cy.get('[data-cy="subject-input"]').should('have.value', '');
  });

  it('should block submission when Description is empty (Required field)', () => {
    cy.get('[data-cy="unit-input"]').type('Unit A');
    cy.get('[data-cy="apartment-input"]').type('Maple Residences');
    cy.get('[data-cy="name-input"]').type('Juan Dela Cruz');
    cy.get('[data-cy="phone-input"]').type('09123456789');

    // Subject
    cy.get('[data-cy="subject-input"]').type('Leaky faucet');
    // leave Description blank

    // Select a category
    cy.get('[data-cy="category-select"]').click();
    cy.get('[data-cy="category-option-0"]', { timeout: 10000 }).should('be.visible').click();

    // Submit the form
    cy.get('[data-cy="submit-button"]').click();

    // Assert: An alert appears saying "Please fill all required fields!"
    cy.on('window:alert', (alertText) => {
      expect(alertText).to.include('Please fill all required fields');
    });

    // Assert: User stays on the same page
    cy.url().should('include', '/requests');

    // Verify the Description input is still empty
    cy.get('[data-cy="description-input"]').should('have.value', '');
  });
});
