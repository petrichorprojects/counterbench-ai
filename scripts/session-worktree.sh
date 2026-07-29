#!/usr/bin/env bash
# session-worktree.sh — one isolated git worktree per agent session.
#
# WHY: multiple Claude/Codex sessions sharing one checkout clobber each other's
# branch, working tree, and stash (see _ops/PRD-concurrent-session-isolation.md).
# The fix is that every session that will WRITE works in its own worktree, and
# the primary checkout stays a read/inspection surface. This script is the WS1
# primitive that makes that cheap and standard.
#
# CONVENTION (the whole point — one location, not three):
#   <repo>/.worktrees/<slug>     always. Never /private/tmp, never .claude/worktrees.
#   `.worktrees/` is gitignored, so a sibling session's `git add -A` can't absorb it.
#
# USAGE:
#   scripts/session-worktree.sh new <slug> [base-branch]   # create + print cd path
#   scripts/session-worktree.sh list                        # show session worktrees
#   scripts/session-worktree.sh prune                        # remove merged/orphaned
#
# `new` creates worktree <repo>/.worktrees/<slug> on a fresh branch
# feat/<slug> off <base-branch> (default: origin/main, fetched first), records the
# session's expected branch for the git-safety hook, and seeds .claude so skills
# and hooks resolve inside the worktree. It prints the path to cd into; it does
# not cd for you (a script can't change the caller's shell).

set -euo pipefail

# The MAIN checkout root, resolved even when called from inside a worktree, so
# every session worktree lands in ONE place: <main>/.worktrees/. Using
# --show-toplevel would return the current worktree and nest them.
main_root() {
  local cdir
  cdir="$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null)" || return 1
  # Standard layout: common dir is <main>/.git, so the main worktree is its parent.
  dirname "$cdir"
}

cmd_new() {
  local slug="${1:?usage: session-worktree.sh new <slug> [base-branch]}"
  local base="${2:-origin/main}"
  local root; root="$(main_root)" || { echo "not in a git repo" >&2; exit 1; }
  local wt="$root/.worktrees/$slug"
  local branch="feat/$slug"

  if [ -e "$wt" ]; then
    echo "worktree already exists: $wt" >&2
    echo "$wt"
    return 0
  fi

  # Fetch so origin/* bases are current; ignore failure (offline is fine).
  case "$base" in origin/*) git -C "$root" fetch -q origin "${base#origin/}" || true ;; esac

  git -C "$root" worktree add "$wt" -b "$branch" "$base" >&2

  # Record the session's expected branch for pretool-git-safety.py branch-drift
  # check. Path-format absolute so it resolves from anywhere.
  local common; common="$(git -C "$wt" rev-parse --path-format=absolute --git-common-dir 2>/dev/null || true)"
  # In a worktree, per-worktree git dir differs from the common dir; write the
  # marker in the worktree's OWN git dir so each session has its own expectation.
  local wtgit; wtgit="$(git -C "$wt" rev-parse --absolute-git-dir 2>/dev/null || true)"
  [ -n "$wtgit" ] && printf '%s\n' "$branch" > "$wtgit/session-branch"

  # Seed .claude so gitignored skills/hooks/reference resolve inside the worktree.
  # Symlink (cheap, always current) rather than copy (drifts).
  if [ -d "$root/.claude" ] && [ ! -e "$wt/.claude" ]; then
    ln -s "$root/.claude" "$wt/.claude"
  fi

  echo "$wt"   # stdout = the path to cd into
}

cmd_list() {
  local root; root="$(main_root)"
  git -C "$root" worktree list | grep -F "/.worktrees/" || echo "(no session worktrees)"
}

cmd_prune() {
  local root; root="$(main_root)"
  # Remove git's stale administrative entries first.
  git -C "$root" worktree prune -v >&2 || true
  # Then remove session worktrees whose branch is fully merged into origin/main.
  git -C "$root" fetch -q origin main || true
  git -C "$root" worktree list --porcelain | awk '/^worktree /{p=$2} /^branch /{b=$2; if (p ~ /\/\.worktrees\//) print p" "b}' \
  | while read -r path ref; do
      local br="${ref#refs/heads/}"
      if git -C "$root" merge-base --is-ancestor "$ref" origin/main 2>/dev/null; then
        echo "pruning merged worktree: $path ($br)" >&2
        git -C "$root" worktree remove "$path" --force 2>/dev/null \
          && git -C "$root" branch -D "$br" 2>/dev/null || true
      fi
    done
}

case "${1:-}" in
  new)   shift; cmd_new "$@" ;;
  list)  cmd_list ;;
  prune) cmd_prune ;;
  *) echo "usage: session-worktree.sh {new <slug> [base] | list | prune}" >&2; exit 2 ;;
esac
