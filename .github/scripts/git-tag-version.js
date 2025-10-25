#!/usr/bin/env node

/**
 * Automatic Git Tagging Script for Semantic Versioning
 * Compatible with both Windows and Unix systems
 * 
 * Usage: node git-tag-version.js -v [major|minor|patch]
 * Example: node git-tag-version.js -v major
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
let versionType = 'patch'; // default

for (let i = 0; i < args.length; i++) {
  if (args[i] === '-v' && i + 1 < args.length) {
    versionType = args[i + 1];
  }
}

// Validate version type
if (!['major', 'minor', 'patch'].includes(versionType)) {
  console.error(`❌ Error: Invalid version type "${versionType}"`);
  console.error('Usage: node git-tag-version.js -v [major|minor|patch]');
  process.exit(1);
}

console.log('🔖 Starting automatic git tagging...');
console.log(`📊 Version type: ${versionType}`);

try {
  // Fetch and unshallow if necessary
  console.log('📥 Fetching latest tags...');
  try {
    execSync('git fetch --prune --unshallow 2>/dev/null', { stdio: 'pipe' });
  } catch (e) {
    // Already unshallowed, continue
  }

  // Get current version
  let currentVersion = '';
  try {
    currentVersion = execSync('git describe --abbrev=0 --tags 2>/dev/null', { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
  } catch (e) {
    currentVersion = '';
  }

  if (!currentVersion) {
    currentVersion = 'v0.1.0';
    console.log('📌 No previous tags found, starting from v0.1.0');
  } else {
    console.log(`📌 Current version: ${currentVersion}`);
  }

  // Parse version
  const versionMatch = currentVersion.match(/v(\d+)\.(\d+)\.(\d+)/);
  if (!versionMatch) {
    console.error(`❌ Error: Invalid version format "${currentVersion}"`);
    console.error('Expected format: vX.Y.Z (e.g., v1.0.0)');
    process.exit(1);
  }

  let [, major, minor, patch] = versionMatch.map(Number);

  // Increment version
  switch (versionType) {
    case 'major':
      major++;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor++;
      patch = 0;
      break;
    case 'patch':
      patch++;
      break;
  }

  const newTag = `v${major}.${minor}.${patch}`;
  console.log(`✨ New version: ${newTag}`);

  // Check if commit is already tagged
  const currentCommit = execSync('git rev-parse HEAD', { 
    encoding: 'utf-8' 
  }).trim();
  
  let isAlreadyTagged = false;
  try {
    execSync(`git describe --contains ${currentCommit}`, { 
      stdio: 'pipe'
    });
    isAlreadyTagged = true;
  } catch (e) {
    isAlreadyTagged = false;
  }

  if (isAlreadyTagged) {
    console.log('⏭️  Commit is already tagged, skipping new tag');
  } else {
    // Create and push tag
    console.log(`🏷️  Creating tag ${newTag}...`);
    execSync(`git tag ${newTag}`);
    
    console.log('📤 Pushing tag...');
    execSync('git push --tags');
    
    console.log('📤 Pushing branch...');
    execSync('git push');
    
    console.log(`✅ Successfully tagged with ${newTag}`);
  }

  // Output for GitHub Actions
  console.log(`\n::set-output name=git-tag::${newTag}`);
  console.log(`::set-output name=image-tag::${newTag.substring(1)}`); // sin la 'v'

} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}
