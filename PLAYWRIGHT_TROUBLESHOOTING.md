# Playwright Troubleshooting Guide

## Common Issues and Solutions

### 1. WebServer Timeout Error

**Error**: `Error: Timed out waiting 120000ms from config.webServer`

**Cause**: Playwright is trying to start your development server but it's taking too long or failing to start.

**Solutions**:

#### Option A: Start Server Manually (Recommended)

```bash
# Terminal 1: Start your dev server
npm run dev

# Terminal 2: Run Playwright tests
npm run playwright:test:local
```

#### Option B: Use No-Server Configuration

```bash
# This will skip starting the web server
npm run playwright:test:no-server
```

#### Option C: Increase Timeout

The default timeout is 120 seconds. You can increase it in `playwright.config.ts`:

```typescript
webServer: {
  command: "npm run dev",
  url: "http://localhost:3000",
  timeout: 300000, // 5 minutes
}
```

### 2. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**: Kill the existing process or use a different port

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### 3. Server Not Responding

**Error**: `net::ERR_CONNECTION_REFUSED`

**Solutions**:

- Ensure your dev server is running and accessible at `http://localhost:3000`
- Check if the server is actually ready (not just started)
- Verify no firewall is blocking the connection

### 4. Slow Server Startup

**Solutions**:

- Use `reuseExistingServer: true` to reuse an already running server
- Start the server manually before running tests
- Use the local configuration: `npm run playwright:test:local`

## Configuration Options

### Main Configuration (`playwright.config.ts`)

- Automatically starts web server
- Good for CI/CD environments
- May timeout if server is slow to start

### Local Configuration (`playwright.config.local.ts`)

- No web server startup
- Assumes server is already running
- Faster test execution
- Better for development workflow

## Recommended Workflow

### For Development:

1. Start your dev server: `npm run dev`
2. Wait for server to be ready
3. Run tests: `npm run playwright:test:local`

### For CI/CD:

1. Use main configuration: `npm run playwright:test`
2. Ensure proper environment setup
3. Consider increasing timeout if needed

## Environment Variables

- `START_SERVER=false`: Skip web server startup
- `DEV_COMMAND`: Custom command to start dev server
- `CI`: Automatically detected for CI environments

## Debugging Tips

1. **Check Server Status**:

   ```bash
   curl http://localhost:3000
   ```

2. **Monitor Server Output**:

   ```bash
   npm run dev 2>&1 | tee server.log
   ```

3. **Use Headed Mode**:

   ```bash
   npm run playwright:test:headed
   ```

4. **Enable Tracing**:
   ```typescript
   use: {
     trace: 'on', // Always collect traces
   }
   ```

## Performance Optimization

- Use `reuseExistingServer: true` to avoid restarting server
- Run tests in parallel with `fullyParallel: true`
- Use appropriate worker count for your system
- Consider using `--project=chromium` for faster single-browser testing

## Common Commands

```bash
# Run all tests with auto-server
npm run playwright:test

# Run tests without starting server
npm run playwright:test:local

# Run tests in headed mode
npm run playwright:test:headed

# Run tests with UI
npm run playwright:test:ui

# Generate tests from actions
npm run playwright:codegen

# Install browsers
npx playwright install
```
