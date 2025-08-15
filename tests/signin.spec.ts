import { test, expect } from "@playwright/test";

test.describe("Sign In Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signin");
  });

  test("should display the signin form", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 2 })).toContainText(
      "Sign in to your account",
    );
    await expect(
      page.getByRole("textbox", { name: "Email address" }),
    ).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("should have proper form labels and accessibility", async ({ page }) => {
    // Check form labels
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();

    // Check input attributes
    const emailInput = page.getByRole("textbox", { name: "Email address" });
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(emailInput).toHaveAttribute("autoComplete", "email");
    await expect(emailInput).toHaveAttribute("required");

    const passwordInput = page.getByLabel("Password");
    await expect(passwordInput).toHaveAttribute("type", "password");
    await expect(passwordInput).toHaveAttribute(
      "autoComplete",
      "current-password",
    );
    await expect(passwordInput).toHaveAttribute("required");
  });

  test("should show validation errors for empty form submission", async ({
    page,
  }) => {
    const submitButton = page.getByRole("button", { name: "Sign in" });

    // Try to submit empty form
    await submitButton.click();

    // Check if form validation prevents submission
    // Note: HTML5 validation behavior may vary between browsers
    await expect(page).toHaveURL("/signin");
  });

  test("should show validation error for invalid email format", async ({
    page,
  }) => {
    const emailInput = page.getByRole("textbox", { name: "Email address" });
    const passwordInput = page.getByLabel("Password");
    const submitButton = page.getByRole("button", { name: "Sign in" });

    await emailInput.fill("invalid-email");
    await passwordInput.fill("password123");

    // Try to submit with invalid email
    await submitButton.click();

    // Should stay on the same page due to validation
    await expect(page).toHaveURL("/signin");
  });

  test("should have proper form styling and focus states", async ({ page }) => {
    const emailInput = page.getByRole("textbox", { name: "Email address" });
    const passwordInput = page.getByLabel("Password");

    // Check initial state
    await expect(emailInput).toHaveClass(/border-gray-300/);

    // Check focus state
    await emailInput.focus();
    await expect(emailInput).toHaveClass(/focus:border-blue-500/);

    await passwordInput.focus();
    await expect(passwordInput).toHaveClass(/focus:border-blue-500/);
  });

  test("should display Google signin option", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Sign in with Google" }),
    ).toBeVisible();
    await expect(page.getByText("Or continue with")).toBeVisible();
  });

  test("should have link to signup page", async ({ page }) => {
    const signupLink = page.getByRole("link", { name: "create a new account" });
    await expect(signupLink).toHaveAttribute("href", "/signup");

    await signupLink.click();
    await expect(page).toHaveURL("/signup");
  });

  test("should handle form submission with valid credentials", async ({
    page,
  }) => {
    // Mock successful login response
    await page.route("**/api/auth/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    const emailInput = page.getByRole("textbox", { name: "Email address" });
    const passwordInput = page.getByLabel("Password");
    const submitButton = page.getByRole("button", { name: "Sign in" });

    await emailInput.fill("test@example.com");
    await passwordInput.fill("password123");

    // Submit form
    await submitButton.click();

    // Wait for navigation or check response
    // This will depend on your app's behavior after successful login
  });

  test("should handle server errors gracefully", async ({ page }) => {
    // Test with error in URL params
    await page.goto("/signin?error=Invalid%20credentials");

    await expect(page.getByText("Invalid credentials")).toBeVisible();
    await expect(page.locator(".text-red-600")).toBeVisible();
  });

  test("should handle success messages", async ({ page }) => {
    // Test with success message in URL params
    await page.goto("/signin?message=Account%20created%20successfully");

    await expect(page.getByText("Account created successfully")).toBeVisible();
    await expect(page.locator(".text-green-600")).toBeVisible();
  });

  test("should be responsive on different viewports", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Email address" }),
    ).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Email address" }),
    ).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Email address" }),
    ).toBeVisible();
  });

  test("should maintain form state during navigation", async ({ page }) => {
    const emailInput = page.getByRole("textbox", { name: "Email address" });
    const passwordInput = page.getByLabel("Password");

    await emailInput.fill("test@example.com");
    await passwordInput.fill("password123");

    // Navigate away and back
    await page.goto("/");
    await page.goto("/signin");

    // Form should be empty (as expected for security)
    await expect(emailInput).toHaveValue("");
    await expect(passwordInput).toHaveValue("");
  });

  test("should have proper dark mode support", async ({ page }) => {
    // Check if dark mode classes are present in the DOM
    const body = page.locator("body");
    const container = page
      .locator("div")
      .filter({ hasText: "Sign in to your account" })
      .first();

    // These checks verify the dark mode classes exist in the component
    await expect(container).toHaveClass(/dark:border-gray-800/);
  });

  test("should handle keyboard navigation", async ({ page }) => {
    const emailInput = page.getByRole("textbox", { name: "Email address" });
    const passwordInput = page.getByLabel("Password");
    const submitButton = page.getByRole("button", { name: "Sign in" });

    // Tab through form elements
    await page.keyboard.press("Tab");
    await expect(emailInput).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(passwordInput).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(submitButton).toBeFocused();
  });

  test("should handle form submission with Enter key", async ({ page }) => {
    const emailInput = page.getByRole("textbox", { name: "Email address" });
    const passwordInput = page.getByLabel("Password");

    await emailInput.fill("test@example.com");
    await passwordInput.fill("password123");

    // Submit form with Enter key
    await passwordInput.press("Enter");

    // Should attempt form submission
    // The actual behavior will depend on your app's implementation
  });
});
