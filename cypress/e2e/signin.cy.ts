describe("Sign In Page", () => {
  beforeEach(() => {
    cy.visit("/signin");
  });

  it("should display the signin form", () => {
    cy.get("h2").should("contain", "Sign in to your account");
    cy.get('input[name="email"]').should("be.visible");
    cy.get('input[name="password"]').should("be.visible");
    cy.get('button[type="submit"]').should("contain", "Sign in");
  });

  it("should have proper form labels and accessibility", () => {
    // Check form labels (sr-only but accessible)
    cy.get('label[for="email"]').should("contain", "Email address");
    cy.get('label[for="password"]').should("contain", "Password");

    // Check input attributes
    cy.get('input[name="email"]').should("have.attr", "type", "email");
    cy.get('input[name="email"]').should("have.attr", "autoComplete", "email");
    cy.get('input[name="email"]').should("have.attr", "required");

    cy.get('input[name="password"]').should("have.attr", "type", "password");
    cy.get('input[name="password"]').should(
      "have.attr",
      "autoComplete",
      "current-password",
    );
    cy.get('input[name="password"]').should("have.attr", "required");
  });

  it("should show validation errors for empty form submission", () => {
    cy.get('button[type="submit"]').click();

    // HTML5 validation should prevent submission and show browser validation
    cy.get('input[name="email"]:invalid').should("exist");
    cy.get('input[name="password"]:invalid').should("exist");
  });

  it("should show validation error for invalid email format", () => {
    cy.get('input[name="email"]').type("invalid-email");
    cy.get('input[name="password"]').type("password123");

    cy.get('button[type="submit"]').click();

    // Should show email validation error
    cy.get('input[name="email"]:invalid').should("exist");
  });

  it("should have proper form styling and focus states", () => {
    // Check initial state
    cy.get('input[name="email"]').should("have.class", "border-gray-300");

    // Check focus state
    cy.get('input[name="email"]').focus();
    cy.get('input[name="email"]').should("have.class", "focus:border-blue-500");

    cy.get('input[name="password"]').focus();
    cy.get('input[name="password"]').should(
      "have.class",
      "focus:border-blue-500",
    );
  });

  it("should display Google signin option", () => {
    cy.get("button").should("contain", "Sign in with Google");
    cy.get("span").should("contain", "Or continue with");
  });

  it("should have link to signup page", () => {
    cy.get('a[href="/signup"]').should("contain", "create a new account");
    cy.get('a[href="/signup"]').click();
    cy.url().should("include", "/signup");
  });

  it("should handle form submission with valid credentials", () => {
    // Mock successful login (you'll need to set up test data)
    cy.intercept("POST", "/api/auth/**", {
      statusCode: 200,
      body: { success: true },
    }).as("loginRequest");

    cy.get('input[name="email"]').type("test@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    // Wait for the request to complete
    cy.wait("@loginRequest");
  });

  it("should handle server errors gracefully", () => {
    // Test with error in URL params
    cy.visit("/signin?error=Invalid%20credentials");

    cy.get(".text-red-600").should("contain", "Invalid credentials");
  });

  it("should handle success messages", () => {
    // Test with success message in URL params
    cy.visit("/signin?message=Account%20created%20successfully");

    cy.get(".text-green-600").should("contain", "Account created successfully");
  });

  it("should be responsive on different viewports", () => {
    // Test mobile viewport
    cy.viewport(375, 667);
    cy.get("h2").should("be.visible");
    cy.get('input[name="email"]').should("be.visible");

    // Test tablet viewport
    cy.viewport(768, 1024);
    cy.get("h2").should("be.visible");
    cy.get('input[name="email"]').should("be.visible");

    // Test desktop viewport
    cy.viewport(1280, 720);
    cy.get("h2").should("be.visible");
    cy.get('input[name="email"]').should("be.visible");
  });

  it("should maintain form state during navigation", () => {
    cy.get('input[name="email"]').type("test@example.com");
    cy.get('input[name="password"]').type("password123");

    // Navigate away and back
    cy.visit("/");
    cy.visit("/signin");

    // Form should be empty (as expected for security)
    cy.get('input[name="email"]').should("have.value", "");
    cy.get('input[name="password"]').should("have.value", "");
  });

  it("should have proper dark mode support", () => {
    // Check if dark mode classes are present
    cy.get("body").should("have.class", "dark:bg-gray-900");
    cy.get("div").should("contain.class", "dark:border-gray-800");
  });
});
