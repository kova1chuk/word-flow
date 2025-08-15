// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with email and password
       * @example cy.login('user@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>;

      /**
       * Custom command to wait for page load
       * @example cy.waitForPageLoad()
       */
      waitForPageLoad(): Chainable<void>;

      /**
       * Custom command to sign in with Google OAuth
       * @example cy.signInWithGoogle()
       */
      signInWithGoogle(): Chainable<void>;

      /**
       * Custom command to create a test user account
       * @example cy.createTestUser('test@example.com', 'password123')
       */
      createTestUser(email: string, password: string): Chainable<void>;

      /**
       * Custom command to check if user is authenticated
       * @example cy.isAuthenticated()
       */
      isAuthenticated(): Chainable<boolean>;

      /**
       * Custom command to wait for authentication to complete
       * @example cy.waitForAuth()
       */
      waitForAuth(): Chainable<void>;
    }
  }
}

// Custom command to login
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/signin");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Custom command to logout
Cypress.Commands.add("logout", () => {
  cy.visit("/profile");
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should("include", "/");
});

// Custom command to wait for page load
Cypress.Commands.add("waitForPageLoad", () => {
  cy.get("body").should("not.have.class", "loading");
  cy.get('[data-testid="loading-spinner"]').should("not.exist");
});

// Custom command to sign in with Google
Cypress.Commands.add("signInWithGoogle", () => {
  cy.visit("/signin");
  cy.get("button").contains("Sign in with Google").click();
  // Mock Google OAuth response
  cy.intercept("GET", "**/auth/google**", {
    statusCode: 200,
    body: { success: true },
  });
});

// Custom command to create test user
Cypress.Commands.add("createTestUser", (email: string, password: string) => {
  cy.visit("/signup");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('input[name="confirmPassword"]').type(password);
  cy.get('button[type="submit"]').click();

  // Wait for signup to complete
  cy.url().should("not.include", "/signup");
});

// Custom command to check authentication status
Cypress.Commands.add("isAuthenticated", () => {
  cy.visit("/hub");
  // If redirected to signin, user is not authenticated
  cy.url().then((url) => {
    if (url.includes("/signin")) {
      return false;
    }
    return true;
  });
});

// Custom command to wait for authentication
Cypress.Commands.add("waitForAuth", () => {
  // Wait for navigation to authenticated page
  cy.url().should("not.include", "/signin");
  cy.url().should("not.include", "/signup");
});

export {};
