# CI/CD Setup with Playwright and Cypress Testing

This document describes the comprehensive CI/CD setup for the Word Flow application, including Playwright and Cypress testing workflows.

## 🚀 CI Workflows Overview

### 1. **PR Checks** (`.github/workflows/pr-checks.yml`)

- **Trigger**: On every pull request
- **Purpose**: Quick feedback for developers
- **Tests**: Lint, TypeScript check, build, Playwright (Chromium only)
- **Duration**: ~5-10 minutes

### 2. **Full Test Suite** (`.github/workflows/test.yml`)

- **Trigger**: Push to main/develop, PRs, daily at 2 AM UTC
- **Purpose**: Comprehensive testing across all platforms
- **Tests**: Full Playwright suite (all browsers + mobile), Cypress E2E
- **Duration**: ~15-25 minutes

### 3. **Nightly Tests** (`.github/workflows/nightly-tests.yml`)

- **Trigger**: Daily at 2 AM UTC, manual dispatch
- **Purpose**: Deep testing and regression detection
- **Tests**: Complete test suite with extended reporting
- **Duration**: ~20-30 minutes

## 🧪 Testing Strategy

### Playwright Tests

- **Desktop Browsers**: Chromium, Firefox, WebKit
- **Mobile Devices**: Pixel 5 (Android), iPhone 12 (iOS)
- **Features**: Screenshots, videos, traces on failure
- **Parallelization**: Full parallel execution for faster results

### Cypress Tests

- **Browser**: Chrome (headless)
- **Features**: Screenshots on failure, video recording
- **E2E Focus**: User journey and integration testing

## 📋 Prerequisites

### Required Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: External Services
BACKEND_URI=your_backend_url
```

### Node.js Version

- **Required**: Node.js 20.x or higher
- **Recommended**: Node.js 20 LTS

## 🛠️ Local Testing Commands

### Quick Tests

```bash
# Run all tests locally
npm run test:all

# Run specific test suites
npm run test:playwright:ci    # Playwright only
npm run test:cypress:ci       # Cypress only
npm run test:lint             # Lint + TypeScript check
npm run test:build            # Build check only
```

### Development Testing

```bash
# Playwright
npm run playwright:test       # Run all tests
npm run playwright:test:ui    # Interactive UI mode
npm run playwright:codegen    # Generate tests from interactions

# Cypress
npm run cypress:open          # Open Cypress UI
npm run cypress:run           # Run tests in terminal
```

## 🔧 CI Configuration

### Matrix Testing

The CI runs tests across multiple configurations:

- **Browsers**: Chromium, Firefox, WebKit
- **Devices**: Desktop, Mobile (Pixel 5, iPhone 12)
- **Platforms**: Ubuntu (GitHub Actions)

### Artifact Management

- **Playwright Reports**: HTML reports with traces
- **Screenshots**: On test failures
- **Videos**: Test execution recordings
- **Retention**: 30 days for PR artifacts, 90 days for nightly

### Caching Strategy

- **Dependencies**: npm cache for faster installs
- **Browsers**: Playwright browser cache
- **Build**: Next.js build cache

## 📊 Test Results & Reporting

### GitHub Actions Summary

Each workflow generates a comprehensive summary including:

- Test execution status
- Failure details
- Artifact links
- Performance metrics

### Artifact Downloads

- **Playwright**: HTML reports, traces, screenshots, videos
- **Cypress**: Screenshots, videos, test results

## 🚨 Troubleshooting

### Common Issues

#### 1. **Tests Failing in CI but Passing Locally**

- Check Node.js version compatibility
- Verify environment variables are set
- Check for timezone-related issues
- Ensure all dependencies are properly installed

#### 2. **Browser Installation Issues**

```bash
# Force reinstall Playwright browsers
npx playwright install --force
```

#### 3. **Test Timeouts**

- Increase timeout values in config files
- Check for slow external dependencies
- Verify server startup time

#### 4. **Memory Issues**

- Reduce parallel workers in CI
- Use `--max-old-space-size` for Node.js
- Optimize test data and fixtures

### Debug Commands

```bash
# Debug Playwright tests
DEBUG=pw:api npm run playwright:test

# Debug Cypress tests
DEBUG=cypress:* npm run cypress:run

# Check browser installations
npx playwright --version
npx playwright install --dry-run
```

## 🔄 Workflow Customization

### Adding New Test Suites

1. Create new test files in `tests/` or `cypress/e2e/`
2. Update workflow files to include new tests
3. Add appropriate artifact collection
4. Update test summary generation

### Modifying Test Matrix

Edit the matrix configuration in workflow files:

```yaml
strategy:
  matrix:
    browser: [chromium, firefox, webkit, edge] # Add new browsers
    device: [Pixel 5, iPhone 12, Galaxy S21] # Add new devices
```

### Environment-Specific Configurations

Create environment-specific config files:

- `playwright.config.ci.ts` - CI-specific settings
- `cypress.config.ci.ts` - CI-specific settings

## 📈 Performance Optimization

### Test Execution Speed

- **Parallelization**: Full parallel execution enabled
- **Browser Reuse**: Shared browser instances where possible
- **Caching**: Aggressive caching of dependencies and browsers
- **Selective Testing**: Run only changed tests in PRs

### Resource Management

- **Memory**: Optimized Node.js memory settings
- **CPU**: Efficient worker distribution
- **Storage**: Compressed artifacts and smart retention

## 🔐 Security Considerations

### Secrets Management

- Use GitHub Secrets for sensitive data
- Never commit API keys or credentials
- Rotate secrets regularly
- Use least-privilege access

### Test Data

- Use mock data for external services
- Avoid real user data in tests
- Clean up test data after execution
- Use isolated test environments

## 📚 Additional Resources

### Documentation

- [Playwright Testing Guide](https://playwright.dev/docs/intro)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### Community

- [Playwright Discord](https://discord.gg/playwright)
- [Cypress Community](https://community.cypress.io/)
- [GitHub Actions Community](https://github.com/actions/community)

---

## 🎯 Next Steps

1. **Review and customize** the workflow configurations
2. **Set up environment variables** in GitHub repository secrets
3. **Test the workflows** with a sample PR
4. **Monitor performance** and optimize as needed
5. **Add team-specific** testing requirements

For questions or issues, please refer to the troubleshooting section or create an issue in the repository.
