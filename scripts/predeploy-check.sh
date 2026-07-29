#!/usr/bin/env bash
# predeploy-check.sh — assert the tree is safe to ship to production (WS5).
#
# `vercel --prod` ships the LOCAL working tree. In a checkout shared by
# concurrent sessions that tree can hold another session's uncommitted work or
# be on a branch a sibling switched under you (see project_mettle_concurrent_
# sessions). Run this BEFORE any prod deploy — manually, in CI, or as a step in
# a deploy script. The pretool-deploy-guard.py hook enforces the same for Claude
# Bash calls; this covers the paths a hook can't (CI, non-Claude agents, humans).
#
# Exit 0 = safe. Exit 1 = blocked (dirty tree or branch drift). Bypass: set
# DEPLOY_GUARD_BYPASS=1.
#
# Usage:  scripts/predeploy-check.sh && vercel --prod

set -euo pipefail

[ "${DEPLOY_GUARD_BYPASS:-}" = "1" ] && exit 0

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "predeploy-check: not in a git repo, skipping." >&2
  exit 0
fi

dirty="$(git status --porcelain)"
if [ -n "$dirty" ]; then
  n="$(printf '%s\n' "$dirty" | grep -c . || true)"
  echo "BLOCKED: working tree has $n uncommitted change(s). A prod deploy ships" >&2
  echo "the local tree, which in a shared checkout may be another session's work." >&2
  echo "Commit or stash-by-path, then deploy from a clean tree." >&2
  echo "Override: DEPLOY_GUARD_BYPASS=1" >&2
  exit 1
fi

gitdir="$(git rev-parse --absolute-git-dir 2>/dev/null || true)"
if [ -n "$gitdir" ] && [ -f "$gitdir/session-branch" ]; then
  expected="$(tr -d '[:space:]' < "$gitdir/session-branch")"
  actual="$(git branch --show-current)"
  if [ -n "$expected" ] && [ "$expected" != "$actual" ]; then
    echo "BLOCKED: session expected branch '$expected' but HEAD is '$actual'." >&2
    echo "A concurrent session likely switched the checkout. Confirm what you're shipping." >&2
    echo "Override: DEPLOY_GUARD_BYPASS=1" >&2
    exit 1
  fi
fi

echo "predeploy-check: clean tree on $(git branch --show-current). Safe to deploy."
