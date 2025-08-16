import { expect, test } from "@playwright/test";

declare global {
  // Extend Playwright's expect with custom matchers if needed
  interface CustomMatchers<R> {
    toBeVisible(): R;
    toContainText(text: string): R;
    toHaveAttribute(attr: string, value?: string): R;
  }
}

export { expect, test };
