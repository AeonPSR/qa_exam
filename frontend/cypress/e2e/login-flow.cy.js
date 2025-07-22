describe('E2E Login Flow - Complete User Journey', () => {
  const testUser = {
    email: 'e2e.test@example.com',
    password: 'e2eTestPassword123'
  }

  before(() => {
    // Ensure API is running before tests
    cy.waitForAPI()
    
    // Create test user in the database
    cy.createTestUser(testUser.email, testUser.password)
  })

  after(() => {
    // Cleanup test user after tests
    cy.cleanupTestUser(testUser.email)
  })

  beforeEach(() => {
    // Visit the frontend application
    cy.visit('/')
  })

  // ✅ Test 1: Application loads correctly
  describe('Application Loading', () => {
    it('should load the login page with all elements', () => {
      // Verify page title and main heading
      cy.contains('🔐 Login').should('be.visible')
      
      // Verify form elements are present
      cy.get('input[type="email"]').should('be.visible')
      cy.get('input[type="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
      
      // Verify initial state
      cy.get('button[type="submit"]').should('be.disabled')
    })
  })

  // ✅ Test 2: Complete successful login flow
  describe('Successful Login Flow', () => {
    it('should complete full login workflow with real API calls', () => {
      // Step 1: Fill in email field
      cy.get('input[type="email"]')
        .should('be.visible')
        .type(testUser.email)
        .should('have.value', testUser.email)

      // Step 2: Fill in password field
      cy.get('input[type="password"]')
        .should('be.visible')
        .type(testUser.password)
        .should('have.value', testUser.password)

      // Step 3: Verify button becomes enabled
      cy.get('button[type="submit"]').should('not.be.disabled')

      // Step 4: Intercept the API call to verify it happens
      cy.intercept('POST', 'http://localhost:3000/api/login').as('loginRequest')

      // Step 5: Submit the form
      cy.get('button[type="submit"]').click()

      // Step 6: Verify loading state appears
      cy.contains('Logging in...').should('be.visible')

      // Step 7: Wait for API call and verify it was made
      cy.wait('@loginRequest').then((interception) => {
        // Verify the request payload
        expect(interception.request.body).to.deep.equal({
          email: testUser.email,
          password: testUser.password
        })
        
        // Verify the response
        expect(interception.response.statusCode).to.equal(200)
        expect(interception.response.body).to.have.property('success', true)
        expect(interception.response.body.user).to.have.property('email', testUser.email)
      })

      // Step 8: Verify success state appears
      cy.contains('✅ Welcome!').should('be.visible')
      cy.contains(testUser.email).should('be.visible')

      // Step 9: Verify form is cleared after successful login
      cy.get('input[type="email"]').should('have.value', '')
      cy.get('input[type="password"]').should('have.value', '')

      // Step 10: Verify logout functionality
      cy.get('button').contains('Logout').should('be.visible').click()
      
      // Step 11: Verify return to login state
      cy.contains('✅ Welcome!').should('not.exist')
      cy.get('button[type="submit"]').should('be.visible')
    })
  })

  // ✅ Test 3: Error handling with real API
  describe('Error Handling', () => {
    it('should handle invalid credentials error', () => {
      // Fill form with invalid credentials
      cy.get('input[type="email"]').type('invalid@email.com')
      cy.get('input[type="password"]').type('wrongpassword')
      
      // Intercept the API call
      cy.intercept('POST', 'http://localhost:3000/api/login').as('loginRequest')
      
      // Submit form
      cy.get('button[type="submit"]').click()
      
      // Wait for API call
      cy.wait('@loginRequest')
      
      // Verify error message appears
      cy.contains('Login failed').should('be.visible')
    })

    it('should handle network connectivity issues', () => {
      // Simulate network failure
      cy.intercept('POST', 'http://localhost:3000/api/login', {
        forceNetworkError: true
      }).as('networkError')
      
      // Fill and submit form
      cy.get('input[type="email"]').type(testUser.email)
      cy.get('input[type="password"]').type(testUser.password)
      cy.get('button[type="submit"]').click()
      
      // Wait for network error
      cy.wait('@networkError')
      
      // Verify network error message
      cy.contains('Network error').should('be.visible')
    })
  })

  // ✅ Test 4: Form validation in real browser
  describe('Form Validation', () => {
    it('should validate email format in real browser', () => {
      // Test invalid email format
      cy.get('input[type="email"]').type('invalid-email')
      cy.get('input[type="password"]').type('password123')
      
      // Button should remain disabled
      cy.get('button[type="submit"]').should('be.disabled')
      
      // Fix email format
      cy.get('input[type="email"]').clear().type('valid@email.com')
      
      // Button should become enabled
      cy.get('button[type="submit"]').should('not.be.disabled')
    })

    it('should validate password length', () => {
      cy.get('input[type="email"]').type('test@example.com')
      
      // Test short password
      cy.get('input[type="password"]').type('123')
      cy.get('button[type="submit"]').should('be.disabled')
      
      // Test valid password
      cy.get('input[type="password"]').clear().type('validpassword')
      cy.get('button[type="submit"]').should('not.be.disabled')
    })
  })

  // ✅ Test 5: Cross-browser UI testing
  describe('UI and Responsiveness', () => {
    it('should render correctly on different viewport sizes', () => {
      // Test mobile viewport
      cy.viewport(375, 667)
      cy.get('input[type="email"]').should('be.visible')
      cy.get('input[type="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
      
      // Test tablet viewport
      cy.viewport(768, 1024)
      cy.get('input[type="email"]').should('be.visible')
      cy.get('input[type="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
      
      // Test desktop viewport
      cy.viewport(1280, 720)
      cy.get('input[type="email"]').should('be.visible')
      cy.get('input[type="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
    })

    it('should have proper accessibility attributes', () => {
      // Check for proper labels
      cy.get('label[for="email"]').should('exist')
      cy.get('label[for="password"]').should('exist')
      
      // Check for proper input attributes
      cy.get('input[type="email"]').should('have.attr', 'required')
      cy.get('input[type="password"]').should('have.attr', 'required')
      
      // Check for proper button attributes
      cy.get('button[type="submit"]').should('have.attr', 'type', 'submit')
    })
  })
})
