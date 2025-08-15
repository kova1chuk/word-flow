// Authentication helper functions for Cypress tests

export const authHelpers = {
  /**
   * Sign in with email and password
   */
  signIn: (email: string, password: string) => {
    cy.visit("/signin");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
  },

  /**
   * Sign in with Google (mocked)
   */
  signInWithGoogle: () => {
    cy.visit("/signin");
    cy.get("button").contains("Sign in with Google").click();
    // Mock Google OAuth response
    cy.intercept("GET", "**/auth/google**", {
      statusCode: 200,
      body: { success: true },
    });
  },

  /**
   * Sign out from the application
   */
  signOut: () => {
    cy.visit("/profile");
    cy.get('[data-testid="logout-button"]').click();
    cy.url().should("include", "/");
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    cy.visit("/hub");
    // If redirected to signin, user is not authenticated
    cy.url().then((url) => {
      if (url.includes("/signin")) {
        return false;
      }
      return true;
    });
  },

  /**
   * Create a test user account
   */
  createTestUser: (email: string, password: string) => {
    cy.visit("/signup");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="confirmPassword"]').type(password);
    cy.get('button[type="submit"]').click();

    // Wait for signup to complete
    cy.url().should("not.include", "/signup");
  },

  /**
   * Clean up test user
   */
  cleanupTestUser: (email: string) => {
    // This would typically involve calling an API to delete the test user
    // For now, we'll just sign out
    authHelpers.signOut();
  },

  /**
   * Mock authentication API responses
   */
  mockAuthAPI: () => {
    // Mock successful login
    cy.intercept("POST", "**/api/auth/signin", {
      statusCode: 200,
      body: {
        success: true,
        user: {
          id: "test-user-id",
          email: "test@example.com",
          name: "Test User",
        },
      },
    }).as("signinRequest");

    // Mock successful signup
    cy.intercept("POST", "**/api/auth/signup", {
      statusCode: 201,
      body: {
        success: true,
        user: {
          id: "test-user-id",
          email: "test@example.com",
          name: "Test User",
        },
      },
    }).as("signupRequest");

    // Mock Google OAuth
    cy.intercept("GET", "**/auth/google**", {
      statusCode: 200,
      body: {
        success: true,
        user: {
          id: "google-user-id",
          email: "google@example.com",
          name: "Google User",
        },
      },
    }).as("googleAuthRequest");
  },

  /**
   * Mock authentication errors
   */
  mockAuthErrors: () => {
    // Mock invalid credentials error
    cy.intercept("POST", "**/api/auth/signin", {
      statusCode: 401,
      body: {
        error: "Invalid credentials",
      },
    }).as("signinError");

    // Mock email already exists error
    cy.intercept("POST", "**/api/auth/signup", {
      statusCode: 409,
      body: {
        error: "Email already exists",
      },
    }).as("signupError");
  },
};

// Export for use in tests
export default authHelpers;
