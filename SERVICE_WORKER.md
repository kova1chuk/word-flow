# 🚀 Service Worker Cache Management

This project includes an intelligent service worker that manages caching for optimal performance while preventing auth-related issues.

## ✨ Features

### 🏠 **Localhost Development Mode**

- **Caching disabled** on `localhost`, `127.0.0.1`, and `::1`
- Always fetches fresh content during development
- No cache invalidation needed during development

### 🏭 **Production Mode**

- **Smart caching** enabled for performance
- **Auth-aware caching** - won't cache responses with auth errors
- **Automatic cache versioning** based on git commits

### 🔄 **Automatic Version Management**

- Cache version updates automatically on every commit
- Uses git commit hash for unique cache names (e.g., `word-flow-d6db3f5`)
- Prevents stale cache issues in production

## 🛠️ **Available Scripts**

```bash
# Manually update service worker cache version
npm run sw:version

# Update cache version and stage for commit
npm run sw:version:commit

# Install git hooks (run automatically on npm install)
npm run hooks:install
```

## 🔧 **How It Works**

### Development (Localhost)

```javascript
// Service worker detects localhost and disables caching
if (isLocalhost) {
  // Always fetch fresh content, no caching
  event.respondWith(fetch(event.request));
}
```

### Production

```javascript
// Smart caching with auth error detection
if (text.includes("AuthApiError") || text.includes("Invalid Refresh Token")) {
  console.log("🚫 SW: Not caching response with auth error");
  return response; // Don't cache this response
}
```

### Git Hook Automation

1. **Pre-commit hook** runs before each commit
2. **Updates cache version** using current git hash
3. **Adds updated file** to the commit automatically

## 🐛 **Troubleshooting**

### Cache Issues

If you encounter caching problems:

```bash
# Force update cache version
npm run sw:version

# Clear browser cache manually
# Open DevTools > Application > Storage > Clear site data
```

### Git Hook Not Working

If the pre-commit hook isn't running:

```bash
# Reinstall hooks
npm run hooks:install

# Check git config
git config core.hooksPath
# Should output: .githooks
```

### Hard Refresh vs Normal Refresh

- **Cmd+R (normal)**: Uses cached content when available
- **Cmd+Shift+R (hard)**: Bypasses all caches
- **Localhost**: Both behave the same (no caching)

## 📁 **File Structure**

```
├── public/sw.js                 # Service worker with smart caching
├── scripts/update-sw-version.js # Auto-versioning script
├── .githooks/pre-commit         # Git pre-commit hook
└── SERVICE_WORKER.md           # This documentation
```

## 🔍 **Console Messages**

Look for these helpful console messages:

**Development:**

```
🔧 SW: Running on localhost (caching disabled)
🚫 SW: Skipping cache installation on localhost
```

**Production:**

```
🔧 SW: Running on production (caching enabled)
🚫 SW: Not caching response with auth error
```

**Version Updates:**

```
✅ Updated service worker cache version to: word-flow-d6db3f5
📝 Added updated service worker to git
```

This system ensures optimal performance in production while preventing auth-related caching issues that could confuse users! 🎉
