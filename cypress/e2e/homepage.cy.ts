describe("Homepage", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display the welcome screen", () => {
    cy.get("h1").should("contain", "Welcome to Word Flow");
    cy.get("p").should(
      "contain",
      "Master vocabulary through intelligent analysis",
    );
  });

  it("should have navigation links", () => {
    cy.get('a[href="/signin"]').should("contain", "Get Started");
    cy.get('a[href="/signup"]').should("contain", "Create Account");
  });

  it("should display feature cards", () => {
    cy.get("h3").should("contain", "Smart Analysis");
    cy.get("h3").should("contain", "Interactive Training");
    cy.get("h3").should("contain", "Progress Tracking");
  });

  it("should have proper accessibility", () => {
    cy.get("main").should("exist");
    cy.get("h1").should("exist");
    cy.get("img").should("have.attr", "alt");
  });
});
