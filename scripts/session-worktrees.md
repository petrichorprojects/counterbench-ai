# Session worktrees — concurrent-session isolation (WS1)

Pilot of `_ops/PRD-concurrent-session-isolation.md`. This is how multiple Claude/Codex
sessions work in this repo at the same time without clobbering each other.

## The rule

**The primary checkout is read-only to agents.** Any session that will WRITE works in its
own worktree at `<repo>/.worktrees/<slug>`. One location, always. Not `/private/tmp`, not
`.claude/worktrees/` — those three competing conventions are what produced the sprawl the
PRD documents.

Why this exists: git working state (branch, working tree, index, stash) is global to a
checkout. Two sessions sharing one checkout switch each other's branch, capture each other's
stash, and leak each other's dirty tree to `vercel --prod`. A worktree gives each session its
own branch + tree + index, so none of that can happen.

## Usage

```bash
# start an isolated session (creates <repo>/.worktrees/<slug> on feat/<slug> off origin/main)
scripts/session-worktree.sh new my-task
cd "$(scripts/session-worktree.sh new my-task)"   # or cd the printed path

scripts/session-worktree.sh list     # show session worktrees
scripts/session-worktree.sh prune    # remove worktrees whose branch merged into origin/main
```

`new` also:
- writes the session's expected branch to the worktree's git dir (`session-branch`), which
  `~/.claude/hooks/pretool-git-safety.py` reads to block a commit/push after another session
  switches your branch out from under you;
- symlinks `.claude` into the worktree so gitignored skills/hooks/reference resolve.

## How the pieces fit

| Piece | Role |
|---|---|
| `scripts/session-worktree.sh` | Creates the isolated worktree at the standard path (this WS1). |
| `~/.claude/hooks/pretool-git-safety.py` | Blocks blind `git stash` and branch-drift commits (WS2). Reads the `session-branch` marker this script writes. |
| `scripts/lib/resolve-canonical.mjs` | Content-keyed path resolution so a file moved across sessions doesn't break its readers (WS4). |
| `~/.claude/hooks/sessionstart-session-registry.py` | Records each session in `.orchestra/session-registry.json` + writes the `session-branch` marker; `--who` shows other live sessions; TTL-reaps dead ones (WS3). |
| `~/.claude/hooks/pretool-deploy-guard.py` + `scripts/predeploy-check.sh` | Block `vercel --prod` from a dirty tree or a drifted branch (WS5). The hook covers Claude; the script covers CI / humans / other agents. |

## Before you claim an area

Run this to see who else is live in the repo, so two sessions don't fix the same file:

```bash
python3 ~/.claude/hooks/sessionstart-session-registry.py --who
```

## Remaining wiring (owner: Phil)

- `.gitignore`: add `.worktrees/` (agents are hook-blocked from editing .gitignore). Belt-and-suspenders so a sibling session's `git add -A` can never absorb a worktree.
- `settings.json`: wire `pretool-git-safety.py` (see `_ops/PRD-concurrent-session-isolation-BUILD-LOG.md`).
- A one-line pointer to this doc from `CLAUDE.md §3 Git` (CLAUDE.md is edited under concurrent churn; left to Phil to avoid a conflicting write).
