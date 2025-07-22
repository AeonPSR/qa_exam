// Custom commands for Cypress E2E tests

// Command to create a test user in the database
Cypress.Commands.add('createTestUser', (email, password) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/api/register',
    body: {
      email: email,
      password: password
    },
    failOnStatusCode: false
  })
})

// Command to clean up test users
Cypress.Commands.add('cleanupTestUser', (email) => {
  // This would ideally call a cleanup endpoint or directly manipulate the database
  // For now, we'll just log it
  cy.log(`Cleanup test user: ${email}`)
})

// Command to wait for API to be ready
Cypress.Commands.add('waitForAPI', () => {
  cy.request({
    method: 'GET',
    url: 'http://localhost:3000/api/health',
    failOnStatusCode: false,
    timeout: 30000
  }).then((response) => {
    if (response.status !== 200) {
      throw new Error('API is not ready')
    }
  })
})
