#!/usr/bin/env node

/* eslint-disable */
// This is a Node.js utility script, not part of the main TypeScript project
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

// Get the current git commit hash
function getGitHash() {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
  } catch {
    console.warn("⚠️  Could not get git hash, using timestamp instead");
    return Date.now().toString(36);
  }
}

// Update service worker cache version
function updateServiceWorkerVersion() {
  const swPath = path.join(__dirname, "..", "public", "sw.js");

  if (!fs.existsSync(swPath)) {
    console.error("❌ Service worker file not found at:", swPath);
    process.exit(1);
  }

  // Read the current service worker file
  let swContent = fs.readFileSync(swPath, "utf-8");

  // Get new version
  const newVersion = `word-flow-${getGitHash()}`;

  // Replace the CACHE_NAME
  const updatedContent = swContent.replace(
    /const CACHE_NAME = "word-flow-[^"]+";/,
    `const CACHE_NAME = "${newVersion}";`,
  );

  // Check if we made a change
  if (updatedContent === swContent) {
    console.log("ℹ️  Service worker cache version already up to date");
    return false;
  }

  // Write the updated file
  fs.writeFileSync(swPath, updatedContent);

  console.log(`✅ Updated service worker cache version to: ${newVersion}`);
  return true;
}

// Run the update
if (require.main === module) {
  const wasUpdated = updateServiceWorkerVersion();

  // If running in git hook context and file was updated, add it to git
  if (wasUpdated && process.env.GIT_HOOK) {
    try {
      execSync("git add public/sw.js", { stdio: "inherit" });
      console.log("📝 Added updated service worker to git");
    } catch (error) {
      console.warn("⚠️  Could not add service worker to git:", error.message);
    }
  }
}

module.exports = { updateServiceWorkerVersion };
