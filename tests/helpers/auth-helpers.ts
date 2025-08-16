import { Page, expect } from "@playwright/test";

// Authentication helper functions for Playwright tests

export const authHelpers = {
  /**
   * Sign in with email and password
   */
  async signIn(page: Page, email: string, password: string) {
    await page.goto("/signin");
    await page.getByRole("textbox", { name: "Email address" }).fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
  },

  /**
   * Sign in with Google (mocked)
   */
  async signInWithGoogle(page: Page) {
    await page.goto("/signin");
    await page.getByRole("button", { name: "Sign in with Google" }).click();
    // Mock Google OAuth response
    await page.route("**/auth/google**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });
  },

  /**
   * Sign out from the application
   */
  async signOut(page: Page) {
    await page.goto("/profile");
    await page.getByTestId("logout-button").click();
    await expect(page).toHaveURL(/.*\/$/);
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(page: Page): Promise<boolean> {
    await page.goto("/hub");
    const currentUrl = page.url();
    return !currentUrl.includes("/signin");
  },

  /**
   * Create a test user account
   */
  async createTestUser(page: Page, email: string, password: string) {
    await page.goto("/signup");
    await page.getByRole("textbox", { name: "Email address" }).fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByLabel("Confirm Password").fill(password);
    await page.getByRole("button", { name: "Create Account" }).click();

    // Wait for signup to complete
    await expect(page).not.toHaveURL(/.*\/signup/);
  },

  /**
   * Clean up test user
   */
  async cleanupTestUser(page: Page, email: string) {
    // This would typically involve calling an API to delete the test user
    // For now, we'll just sign out
    await authHelpers.signOut(page);
  },

  /**
   * Mock authentication API responses
   */
  async mockAuthAPI(page: Page) {
    // Mock successful login
    await page.route("**/api/auth/signin", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          user: {
            id: "test-user-id",
            email: "test@example.com",
            name: "Test User",
          },
        }),
      });
    });

    // Mock successful signup
    await page.route("**/api/auth/signup", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          user: {
            id: "test-user-id",
            email: "test@example.com",
            name: "Test User",
          },
        }),
      });
    });

    // Mock Google OAuth
    await page.route("**/auth/google**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          user: {
            id: "google-user-id",
            email: "google@example.com",
            name: "Google User",
          },
        }),
      });
    });
  },

  /**
   * Mock authentication errors
   */
  async mockAuthErrors(page: Page) {
    // Mock invalid credentials error
    await page.route("**/api/auth/signin", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Invalid credentials",
        }),
      });
    });

    // Mock email already exists error
    await page.route("**/api/auth/signup", async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Email already exists",
        }),
      });
    });
  },

  /**
   * Wait for authentication to complete
   */
  async waitForAuth(page: Page) {
    // Wait for navigation or specific element that indicates auth is complete
    await page.waitForURL(/.*\/(hub|profile|dashboard)/, { timeout: 10000 });
  },

  /**
   * Get authentication state from localStorage or cookies
   */
  async getAuthState(page: Page) {
    const authToken = await page.evaluate(() => {
      return (
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      );
    });
    return authToken;
  },

  /**
   * Set authentication state for testing
   */
  async setAuthState(page: Page, token: string) {
    await page.evaluate((token) => {
      localStorage.setItem("authToken", token);
    }, token);
  },
};

// Export for use in tests
export default authHelpers;
