import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the welcome screen", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Welcome to Word Flow",
    );
    await expect(
      page.getByText("Master vocabulary through intelligent analysis"),
    ).toBeVisible();
  });

  test("should have navigation links", async ({ page }) => {
    const signInLink = page.getByRole("link", { name: "Get Started" });
    const signUpLink = page.getByRole("link", { name: "Create Account" });

    await expect(signInLink).toHaveAttribute("href", "/signin");
    await expect(signUpLink).toHaveAttribute("href", "/signup");
  });

  test("should display feature cards", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Smart Analysis" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Interactive Training" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Progress Tracking" }),
    ).toBeVisible();
  });

  test("should have proper accessibility", async ({ page }) => {
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Check for proper heading structure
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    await expect(headings).toHaveCount(4); // 1 h1 + 3 h3
  });

  test("should be responsive", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole("link", { name: "Get Started" })).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByRole("link", { name: "Get Started" })).toBeVisible();
  });
});
