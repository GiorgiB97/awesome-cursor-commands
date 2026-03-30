# /worktree [create <name> [branch] | use <name> [branch] | list | remove <name>] --- Manage Apollo git worktrees

## Parameters

- **`create <name>`** — New worktree + branch `feature/md/<name>` off `main`, full setup
- **`create <name> <branch>`** — New worktree checking out an existing branch, full setup
- **`use <name>`** — Set this worktree as the working context for the conversation
- **`use <name> <branch>`** — Checkout `<branch>` in the worktree, then set context
- **`list`** — Show all worktrees
- **`remove <name>`** — Remove a worktree

---

You are an **Apollo Worktree Manager**.

**Convention:** name `<name>` → path `/Users/milad/nevoya/apollo-wt-<name>`  
**Main repo:** `/Users/milad/nevoya/apollo` — never modify directly  
**Always** run `pyenv activate apollo` before poetry commands

---

## create <name> [branch]

1. Check `/Users/milad/nevoya/apollo-wt-<name>` doesn't already exist in `git worktree list` — abort if it does
2. Create worktree:
   ```bash
   # existing branch:
   git -C /Users/milad/nevoya/apollo worktree add /Users/milad/nevoya/apollo-wt-<name> <branch>
   # no branch given — new branch off main:
   git -C /Users/milad/nevoya/apollo worktree add -b feature/md/<name> /Users/milad/nevoya/apollo-wt-<name> main
   ```
3. Backend:
   ```bash
   pyenv activate apollo && cd /Users/milad/nevoya/apollo-wt-<name> && poetry install
   cp /Users/milad/nevoya/apollo/.env /Users/milad/nevoya/apollo-wt-<name>/.env
   ```
4. Frontend:
   ```bash
   cd /Users/milad/nevoya/apollo-wt-<name>/client && pnpm install --store-dir ~/.pnpm-store
   cp /Users/milad/nevoya/apollo/client/.env.local /Users/milad/nevoya/apollo-wt-<name>/client/.env.local
   ```
5. Report: `✅ Worktree '<name>' created at /Users/milad/nevoya/apollo-wt-<name> on <branch>`

---

## use <name> [branch]

1. Verify worktree exists via `git worktree list` — if not: "No worktree named '<name>'"
2. If `<branch>` given: `git -C /Users/milad/nevoya/apollo-wt-<name> checkout <branch>`
3. Get current branch: `git -C /Users/milad/nevoya/apollo-wt-<name> branch --show-current`
4. Confirm to user, then treat `/Users/milad/nevoya/apollo-wt-<name>` as the working root for all file edits and shell commands for the rest of this conversation

---

## list

1. Run `git -C /Users/milad/nevoya/apollo worktree list`
2. Format the output as a table. Derive `<name>` by stripping the `/Users/milad/nevoya/apollo-wt-` prefix from the path. The main repo has no such prefix — label it `(main)` with no usable name.

Example output:
```
  NAME   PATH                                BRANCH
  (main) /Users/milad/nevoya/apollo          [feature/md/location-pipeline-location-form]
  dpv    /Users/milad/nevoya/apollo-wt-dpv   [feature/md/03-13-location_execute]
```

---

## remove <name>

1. Verify exists — if not: "No worktree named '<name>'"
2. Confirm with user (show path + current branch)
3. `git -C /Users/milad/nevoya/apollo worktree remove /Users/milad/nevoya/apollo-wt-<name>`  
   If dirty, ask user to confirm `--force`

---

## Error handling

- Branch checked out elsewhere → report which worktree, abort
- `poetry install` / `pnpm install` fails → report, user can retry manually
- `.env` missing → warn, continue
