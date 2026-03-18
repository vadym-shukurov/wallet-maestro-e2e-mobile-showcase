#!/usr/bin/env bash
# Remove node_modules from git history to fix GitHub secret scanning alerts.
# The Google API key in @react-native/debugger-frontend is a third-party
# dependency leak — we must never commit node_modules.
#
# Run from repo root. Creates a backup branch first.
# After running: git push --force
#
# Alternative: use git-filter-repo (faster): pip install git-filter-repo
#   git filter-repo --path node_modules --invert-paths --force

set -euo pipefail

echo "WARNING: This rewrites git history. Ensure you have a backup."
echo "Creating backup branch backup-before-filter..."
git branch backup-before-filter 2>/dev/null || true

echo "Removing node_modules from all commits..."
git filter-branch --force --index-filter 'git rm -rf --cached --ignore-unmatch node_modules' --prune-empty HEAD

echo "Done. To push: git push --force"
echo "To restore: git reset --hard backup-before-filter"
