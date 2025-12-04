describe('Request Form - Test 03 Category dropdown options', () => {
  beforeEach(() => {
    cy.visit('/requests');

    // Wait for the form title to be visible
    cy.contains('Request Form').should('be.visible');
  });

  it('should display all six category options in the dropdown', () => {
    // Click the Category dropdown to open it
    cy.get('[data-cy="category-select"]').click();

    // Expected category options
    const expectedCategories = [
      'Maintenance & Repairs',
      'Security & Safety',
      'Utilities',
      'Payment & Billing',
      'Amenities & Facilities',
      'Others',
    ];

    // Verify all category options are visible
    expectedCategories.forEach((category, index) => {
      cy.get(`[data-cy="category-option-${index}"]`)
        .should('be.visible')
        .should('have.text', category);
    });
  });

  it('should have exactly six category options', () => {
    // Click the Category dropdown to open it
    cy.get('[data-cy="category-select"]').click();

    // Count the total number of option elements
    cy.get('[data-cy^="category-option-"]').should('have.length', 6);
  });

  it('should allow selecting each category option individually', () => {
    const expectedCategories = [
      'Maintenance & Repairs',
      'Security & Safety',
      'Utilities',
      'Payment & Billing',
      'Amenities & Facilities',
      'Others',
    ];

    expectedCategories.forEach((category, index) => {
      // Open the dropdown
      cy.get('[data-cy="category-select"]').click();

      // Click the option
      cy.get(`[data-cy="category-option-${index}"]`).click();

      // Verify the selected category is displayed in the trigger
      cy.get('[data-cy="category-select"]').should('contain', category);

      // If not the last category, the dropdown will close after selection
      // For the next iteration, we'll click to open it again
    });
  });

  it('should close dropdown after selecting a category', () => {
    // Click the Category dropdown to open it
    cy.get('[data-cy="category-select"]').click();

    // Verify the first option is visible (dropdown is open)
    cy.get('[data-cy="category-option-0"]').should('be.visible');

    // Click the first option
    cy.get('[data-cy="category-option-0"]').click();

    // The dropdown should close after selection
    // We verify this by checking that the option no longer exists in the DOM
    cy.get('[data-cy="category-option-0"]').should('not.exist');

    // The selected category should be shown in the trigger
    cy.get('[data-cy="category-select"]').should('contain', 'Maintenance & Repairs');
  });

  it('should reopen dropdown when clicking the trigger again', () => {
    // Click the Category dropdown to open it
    cy.get('[data-cy="category-select"]').click();

    // Click the first option to select and close
    cy.get('[data-cy="category-option-0"]').click();

    // Verify dropdown is closed (option no longer exists in DOM)
    cy.get('[data-cy="category-option-0"]').should('not.exist');

    // Click the trigger again to reopen
    cy.get('[data-cy="category-select"]').click();

    // Verify the options are visible again
    cy.get('[data-cy="category-option-0"]').should('be.visible');
    cy.get('[data-cy="category-option-5"]').should('be.visible');
  });
});
