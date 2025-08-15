# Testing Guide

// TODO: Add tests to CI

This project includes **Cypress**, **Playwright**, and **Puppeteer** for comprehensive testing coverage.

## Cypress

Cypress is used for end-to-end (E2E) testing and component testing.

### Installation

```bash
npm install
```

### Running Tests

#### E2E Tests

```bash
# Open Cypress Test Runner (interactive mode)
npm run cypress:open

# Run all E2E tests in headless mode
npm run cypress:run

# Run tests in headless mode (CI-friendly)
npm run cypress:run:headless

# Alternative command
npm run test:e2e
```

#### Component Tests

```bash
# Open Cypress Component Test Runner
npm run cypress:open --component

# Run component tests in headless mode
npm run cypress:run --component
```

### Configuration

- **Config file**: `cypress.config.ts`
- **E2E tests**: `cypress/e2e/`
- **Component tests**: `cypress/component/`
- **Support files**: `cypress/support/`

### Custom Commands

The following custom commands are available:

- `cy.login(email, password)` - Login with credentials
- `cy.logout()` - Logout from the application
- `cy.waitForPageLoad()` - Wait for page to finish loading

### Example Test

```typescript
describe("Homepage", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display the welcome screen", () => {
    cy.get("h1").should("contain", "Welcome to Word Flow");
  });
});
```

## Playwright

Playwright is used for cross-browser E2E testing with better performance and reliability.

### Installation

```bash
# Install Playwright browsers
npm run playwright:install
```

### Running Tests

```bash
# Run all tests
npm run playwright:test

# Run tests in headed mode (see browser)
npm run playwright:test:headed

# Open Playwright UI mode
npm run playwright:test:ui

# Generate tests from user actions
npm run playwright:codegen
```

### Configuration

- **Config file**: `playwright.config.ts`
- **Test directory**: `tests/`
- **Supports**: Chromium, Firefox, WebKit, and mobile browsers

### Example Test

```typescript
import { test, expect } from "@playwright/test";

test("should display welcome screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Welcome to Word Flow",
  );
});
```

## Puppeteer

Puppeteer is used for advanced browser automation, screenshot capture, PDF generation, and performance testing.

### Installation

```bash
npm install
```

### Running Scripts

```bash
# Take screenshots of the homepage
npm run puppeteer:screenshot

# Generate PDFs of the homepage
npm run puppeteer:pdf

# Run comprehensive tests and validation
npm run puppeteer:test
```

### Features

- **Screenshot Capture**: Desktop and mobile viewport screenshots
- **PDF Generation**: Standard and print-optimized PDFs
- **Performance Testing**: Load times, paint metrics, and performance analysis
- **Accessibility Testing**: Alt attributes, heading structure validation
- **Responsive Testing**: Multiple viewport testing
- **Content Validation**: Text content and link verification

### Example Usage

```javascript
// Basic screenshot
await page.screenshot({
  path: "screenshots/homepage.png",
  fullPage: true,
});

// PDF generation
await page.pdf({
  path: "exports/homepage.pdf",
  format: "A4",
  printBackground: true,
});
```

### Output Directories

- **Screenshots**: `screenshots/` - Contains all captured screenshots
- **Exports**: `exports/` - Contains generated PDFs
- **Test Results**: Includes performance metrics and accessibility reports

## Test Structure

```
├── cypress/
│   ├── e2e/           # E2E test specs
│   ├── component/     # Component test specs
│   └── support/       # Support files and commands
├── tests/             # Playwright test specs
├── scripts/           # Puppeteer automation scripts
│   ├── puppeteer-screenshot.js
│   ├── puppeteer-pdf.js
│   └── puppeteer-test.js
├── cypress.config.ts  # Cypress configuration
├── playwright.config.ts # Playwright configuration
└── TESTING.md         # This file
```

## Best Practices

### Writing Tests

1. **Use descriptive test names** that explain what is being tested
2. **Follow the AAA pattern**: Arrange, Act, Assert
3. **Use data-testid attributes** for reliable element selection
4. **Keep tests independent** - each test should be able to run alone
5. **Use proper assertions** - be specific about what you're checking

### Test Data

- Use fixtures for test data
- Clean up test data after tests
- Use unique identifiers to avoid conflicts

### Performance

- Run tests in parallel when possible
- Use appropriate timeouts
- Avoid unnecessary waits

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run build
      - run: npm run cypress:run:headless
      - run: npm run playwright:test
      - run: npm run puppeteer:test
```

## Troubleshooting

### Common Issues

1. **Tests failing in CI but passing locally**
   - Check for environment differences
   - Ensure proper timeouts
   - Verify test data setup

2. **Element not found**
   - Use `data-testid` attributes
   - Check for dynamic content loading
   - Verify element visibility

3. **Flaky tests**
   - Add proper waits
   - Use reliable selectors
   - Check for race conditions

### Debug Mode

- **Cypress**: Use `cypress:open` for interactive debugging
- **Playwright**: Use `playwright:test:headed` to see browser actions
- **Puppeteer**: Modify scripts to use `headless: false` for visible browser

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Puppeteer Documentation](https://pptr.dev/)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles)
- [Accessibility Testing](https://www.deque.com/axe/)
