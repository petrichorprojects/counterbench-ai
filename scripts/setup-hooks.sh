#!/usr/bin/env bash
# scripts/setup-hooks.sh — activate the repo's tracked git hooks.
#
# core.hooksPath is a LOCAL git config that clone does not carry, so each fresh
# checkout runs this once. It points git at .githooks/, which holds the
# pre-commit main-guard that binds every git client (Codex, other agents, humans)
# to the "no direct commits to main" policy. Idempotent.
set -euo pipefail
root="$(git rev-parse --show-toplevel)"
git -C "$root" config core.hooksPath .githooks
echo "core.hooksPath -> .githooks (pre-commit main-guard active for all git clients in $(basename "$root"))"
