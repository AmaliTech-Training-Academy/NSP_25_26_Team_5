#!/bin/bash
# Configure branch protection rules for the repository via GitHub API.
# 
# Rules applied:
#   1. No direct push to main — require a pull request to merge
#   2. No force push
#   3. PR requires at least one approval to merge
#
# Prerequisites:
#   - You must have ADMIN rights on the repo (owner, or org admin/maintainer).
#     If you're only a collaborator without admin, ask the repo owner to run this
#     or to set the rules in GitHub: Settings → Branches → Add rule.
#   - GITHUB_TOKEN (PAT with repo scope, from an account with admin on the repo)
#   - Owner and repo name (or run from repo root and use gh to detect them)
#
# Usage:
#   export GITHUB_TOKEN=ghp_xxx
#   ./setup-branch-rules.sh [owner/repo] [branch]
#
# Examples:
#   ./setup-branch-rules.sh                    # use gh to get owner/repo, protect 'main'
#   ./setup-branch-rules.sh myorg/my-repo      # protect main on myorg/my-repo
#   ./setup-branch-rules.sh myorg/my-repo main

set -e

REPO="${1:-}"
BRANCH="${2:-main}"

if [ -z "$REPO" ]; then
  if command -v gh &>/dev/null; then
    REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null) || true
  fi
  if [ -z "$REPO" ]; then
    echo "Usage: $0 <owner/repo> [branch]"
    echo "Example: $0 myorg/NSP_25_26_Team_5 main"
    echo "Or set repo via: gh repo view (run from repo root) and run without args."
    exit 1
  fi
fi

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN is not set."
  echo "Create a token at: https://github.com/settings/tokens (scope: repo)"  
  exit 1
fi

API_URL="https://api.github.com/repos/${REPO}/branches/${BRANCH}/protection"

# 1. Require PR before merge (no direct push)
# 2. Require 1 approval
# 3. No force push
BODY=$(cat <<EOF
{
  "required_status_checks": null,
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
EOF
)

echo "Setting branch protection for ${REPO} branch '${BRANCH}'..."
HTTP=$(curl -s -w "%{http_code}" -o /tmp/branch-protection-response.json \
  -X PUT "$API_URL" \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d "$BODY")

if [ "$HTTP" = "200" ]; then
  echo "Done. Rules applied: require PR, 1 review, no force push."
else
  echo "Request failed (HTTP $HTTP)."
  if [ "$HTTP" = "403" ]; then
    echo "→ You need ADMIN on the repo to set branch protection. Ask the owner/org admin to run this script or set rules in GitHub Settings → Branches."
  fi
  echo "Response:"
  cat /tmp/branch-protection-response.json | head -50
  exit 1
fi
