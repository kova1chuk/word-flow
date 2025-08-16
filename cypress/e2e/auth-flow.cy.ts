import authHelpers from "../support/auth-helpers";

describe("Authentication Flow", () => {
  beforeEach(() => {
    // Mock authentication API responses
    authHelpers.mockAuthAPI();
  });

  describe("Sign In Flow", () => {
    it("should successfully sign in with valid credentials", () => {
      const testEmail = "test@example.com";
      const testPassword = "password123";

      // Sign in
      authHelpers.signIn(testEmail, testPassword);

      // Wait for authentication request
      cy.wait("@signinRequest");

      // Should redirect to authenticated page
      cy.url().should("not.include", "/signin");
      cy.url().should("include", "/hub");
    });

    it("should handle invalid credentials gracefully", () => {
      // Mock authentication errors
      authHelpers.mockAuthErrors();

      const testEmail = "invalid@example.com";
      const testPassword = "wrongpassword";

      // Attempt to sign in with invalid credentials
      authHelpers.signIn(testEmail, testPassword);

      // Wait for error response
      cy.wait("@signinError");

      // Should show error message
      cy.get(".text-red-600").should("contain", "Invalid credentials");
      cy.url().should("include", "/signin");
    });

    it("should handle Google OAuth sign in", () => {
      // Mock Google OAuth
      cy.intercept("GET", "**/auth/google**", {
        statusCode: 200,
        body: { success: true },
      }).as("googleAuth");

      // Click Google sign in button
      cy.visit("/signin");
      cy.get("button").contains("Sign in with Google").click();

      // Wait for Google OAuth request
      cy.wait("@googleAuth");

      // Should redirect to authenticated page
      cy.url().should("not.include", "/signin");
    });
  });

  describe("Sign Up Flow", () => {
    it("should successfully create a new account", () => {
      const testEmail = "newuser@example.com";
      const testPassword = "newpassword123";

      // Create test user
      authHelpers.createTestUser(testEmail, testPassword);

      // Wait for signup request
      cy.wait("@signupRequest");

      // Should redirect to authenticated page
      cy.url().should("not.include", "/signup");
      cy.url().should("include", "/hub");
    });

    it("should handle duplicate email registration", () => {
      // Mock authentication errors
      authHelpers.mockAuthErrors();

      const testEmail = "existing@example.com";
      const testPassword = "password123";

      // Attempt to create account with existing email
      authHelpers.createTestUser(testEmail, testPassword);

      // Wait for error response
      cy.wait("@signupError");

      // Should show error message
      cy.get(".text-red-600").should("contain", "Email already exists");
      cy.url().should("include", "/signup");
    });
  });

  describe("Authentication State Management", () => {
    it("should maintain authentication state across page refreshes", () => {
      const testEmail = "persistent@example.com";
      const testPassword = "password123";

      // Sign in
      authHelpers.signIn(testEmail, testPassword);
      cy.wait("@signinRequest");

      // Verify we're authenticated
      cy.url().should("include", "/hub");

      // Refresh the page
      cy.reload();

      // Should still be authenticated
      cy.url().should("include", "/hub");
      cy.url().should("not.include", "/signin");
    });

    it("should redirect unauthenticated users to signin", () => {
      // Try to access protected route without authentication
      cy.visit("/hub");

      // Should redirect to signin
      cy.url().should("include", "/signin");
    });

    it("should allow authenticated users to access protected routes", () => {
      const testEmail = "authorized@example.com";
      const testPassword = "password123";

      // Sign in
      authHelpers.signIn(testEmail, testPassword);
      cy.wait("@signinRequest");

      // Should be able to access protected routes
      cy.visit("/profile");
      cy.url().should("include", "/profile");

      cy.visit("/dictionary");
      cy.url().should("include", "/dictionary");

      cy.visit("/training");
      cy.url().should("include", "/training");
    });
  });

  describe("Sign Out Flow", () => {
    it("should successfully sign out and clear authentication", () => {
      const testEmail = "signout@example.com";
      const testPassword = "password123";

      // Sign in first
      authHelpers.signIn(testEmail, testPassword);
      cy.wait("@signinRequest");

      // Verify we're authenticated
      cy.url().should("include", "/hub");

      // Sign out
      authHelpers.signOut();

      // Should redirect to home page
      cy.url().should("include", "/");

      // Try to access protected route
      cy.visit("/hub");

      // Should redirect to signin
      cy.url().should("include", "/signin");
    });
  });

  describe("Form Validation", () => {
    it("should validate required fields", () => {
      cy.visit("/signin");

      // Try to submit empty form
      cy.get('button[type="submit"]').click();

      // Should show validation errors
      cy.get('input[name="email"]:invalid').should("exist");
      cy.get('input[name="password"]:invalid').should("exist");
    });

    it("should validate email format", () => {
      cy.visit("/signin");

      // Enter invalid email
      cy.get('input[name="email"]').type("invalid-email");
      cy.get('input[name="password"]').type("password123");

      // Try to submit
      cy.get('button[type="submit"]').click();

      // Should show email validation error
      cy.get('input[name="email"]:invalid').should("exist");
    });

    it("should validate password length", () => {
      cy.visit("/signin");

      // Enter short password
      cy.get('input[name="email"]').type("test@example.com");
      cy.get('input[name="password"]').type("123");

      // Try to submit
      cy.get('button[type="submit"]').click();

      // Should show password validation error
      cy.get('input[name="password"]:invalid').should("exist");
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", () => {
      // Mock network error
      cy.intercept("POST", "**/api/auth/signin", {
        forceNetworkError: true,
      }).as("networkError");

      const testEmail = "network@example.com";
      const testPassword = "password123";

      // Attempt to sign in
      authHelpers.signIn(testEmail, testPassword);

      // Wait for network error
      cy.wait("@networkError");

      // Should handle error gracefully
      cy.url().should("include", "/signin");
    });

    it("should handle server errors gracefully", () => {
      // Mock server error
      cy.intercept("POST", "**/api/auth/signin", {
        statusCode: 500,
        body: { error: "Internal server error" },
      }).as("serverError");

      const testEmail = "server@example.com";
      const testPassword = "password123";

      // Attempt to sign in
      authHelpers.signIn(testEmail, testPassword);

      // Wait for server error
      cy.wait("@serverError");

      // Should handle error gracefully
      cy.url().should("include", "/signin");
    });
  });

  describe("Security Features", () => {
    it("should not expose sensitive information in URLs", () => {
      const testEmail = "security@example.com";
      const testPassword = "password123";

      // Sign in
      authHelpers.signIn(testEmail, testPassword);
      cy.wait("@signinRequest");

      // Check that password is not in URL
      cy.url().should("not.include", testPassword);
      cy.url().should("not.include", encodeURIComponent(testPassword));
    });

    it("should clear form data after submission", () => {
      cy.visit("/signin");

      // Fill form
      cy.get('input[name="email"]').type("test@example.com");
      cy.get('input[name="password"]').type("password123");

      // Submit form
      cy.get('button[type="submit"]').click();

      // Form should be cleared (security best practice)
      cy.get('input[name="email"]').should("have.value", "");
      cy.get('input[name="password"]').should("have.value", "");
    });
  });
});
