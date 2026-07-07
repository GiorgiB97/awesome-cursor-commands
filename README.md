# Awesome Cursor Commands

Contract-driven custom commands for Cursor IDE. Each command is a binding execution contract: explicit prohibitions, phased protocols with gates, standardized abort handling, and a compliance checklist the agent must pass before responding. The result is predictable, professional workflows for code review, testing, documentation, debugging, and more.

---

## Table of Contents

1. [Overview](#overview)
2. [Command Format](#command-format)
3. [Repository Structure](#repository-structure)
4. [Installation](#installation)
5. [Available Commands](#available-commands)
   - [/task](#task-task-context) - Complete coding tasks
   - [/review](#review-extra-prompt-file1-file2-) - Code review
   - [/branchreview](#branchreview-basebranch) - Branch comparison review
   - [/stackreview](#stackreview-extra-prompt-file1-file2-) - Uncommitted review with stack context
   - [/fix](#fix-severity) - Automated fix agent
   - [/fixmr](#fixmr-mr_id_or_url) - Fix MR/PR comments
   - [/a11y](#a11y-extra-prompt) - Accessibility audit
   - [/refactor](#refactor-file) - Code quality improvement
   - [/tests](#tests) - Test generation
   - [/debug](#debug-explain-issue) - Systematic debugging
   - [/doc](#doc-extra-prompt-file1-file2-) - Add documentation
   - [/simplify](#simplify-file1-file2-) - Simplify usages
   - [/humanize](#humanize-level---notypo-file1-file2-) - Make AI output feel human-written
   - [/knowledge](#knowledge-keyword-scan-root) - Deep-dive knowledge documents
   - [/description](#description-pr-title) - Generate PR descriptions
   - [/codesplit](#codesplit-num_splitsanalyze) - Logical PR splitter (stash-based)
   - [/history](#history-question-file1-file2-) - Git history analyzer
   - [/generatecommand](#generatecommand-description) - Generate new commands
6. [Workflows](#workflows)
7. [Tips & Best Practices](#tips--best-practices)

---

## Overview

These commands provide a complete development workflow:

**Code Quality:**
- `/review` - Comprehensive code review of staged/unstaged changes
- `/branchreview` - Review changes between branches
- `/stackreview` - Review uncommitted changes with branch stack context
- `/fix` - Automated fix agent based on review findings
- `/fixmr` - Fix unresolved review comments from GitHub/GitLab MRs/PRs
- `/a11y` - Accessibility audit (WCAG 2.1 A/AA compliance)
- `/simplify` - Check for duplicates, refactor candidates, docstring verbose-ness and etc

**Development:**
- `/task` - Elite software engineer for any coding task
- `/refactor` - Improve code quality while maintaining functionality
- `/tests` - Generate comprehensive unit tests
- `/debug` - Systematic debugging and issue resolution

**Documentation & Tools:**
- `/doc` - Add inline documentation directly to files
- `/humanize` - Rewrite AI-generated code and text to feel human-written
- `/knowledge` - Generate a deep-dive knowledge document via 10 parallel agents
- `/description` - Generate PR descriptions from git diff
- `/codesplit` - Logical PR splitter (stash-based, dependency-aware)
- `/history` - AI-powered git history analyzer
- `/generatecommand` - Generate new commands matching this format

---

## Command Format

Every command follows the same enforced structure (the "Fable" contract format). This is what makes the agents obedient: nothing is advisory, everything is mandatory.

- **Role**: A senior persona plus an explicit statement that the document is a binding execution contract; deviation is a critical failure.
- **Operating Contract**: Numbered **Non-Negotiable Prohibitions** (MUST NOT rules such as never commit/push, never fabricate findings, never expand scope), **Mandatory Behaviors** (MUST rules), and a **Precedence** clause: your extra prompt can narrow or extend scope, but it can never override a prohibition. Conflicts are surfaced, not silently obeyed.
- **Execution Protocol**: Numbered phases, always starting with **Phase 0: Preflight and Scope Lock** (verify preconditions with exact commands, lock the in-scope targets). Every phase ends with a `GATE:` line; the agent cannot skip, merge, or reorder phases.
- **Output Contract**: Exact markdown templates (and JSONL schemas where applicable) that must not be omitted, reordered, or renamed.
- **Failure Modes**: Every bad situation (missing preconditions, empty diff, tool failure, conflicting instructions) maps to a required behavior, using a standardized format:

```
ABORTED: <reason>
Required to proceed: <what you must provide or fix>
```

- **Compliance Checklist**: A final self-audit the agent must pass before delivering any output.

All commands use RFC 2119 keywords (MUST, MUST NOT, NEVER), plain ASCII, and bracketed severity labels like `[BLOCKER]` / `[MAJOR]` / `[MINOR]` / `[NIT]`.

---

## Repository Structure

```
commands/
  *.md                     # Active commands (Fable contract format)
  models/
    fable/                 # Fable-format masters (same as top level)
    opus/                  # Original legacy versions, kept for reference
  helpers/
    fetch-mr-comments.js   # Helper script used by /fixmr
```

The top-level `commands/*.md` files are the ones you install. The `models/` folder holds per-model variants of the same command set.

---

## Installation

Place command files in: `~/.cursor/commands/`

```bash
# Clone this repo
git clone https://github.com/yourusername/awesome-cursor-commands.git

# Copy the active commands to Cursor (top-level .md files only)
cp awesome-cursor-commands/commands/*.md ~/.cursor/commands/

# Copy the /fixmr helper script
mkdir -p ~/.cursor/commands/helpers
cp awesome-cursor-commands/commands/helpers/* ~/.cursor/commands/helpers/

# Cursor automatically loads commands on next use
```

---

## Available Commands

### `/task [task context]`
**Elite software engineer executing any coding task through a gated, phased protocol.**

**Phases:** Preflight & Scope Lock -> Analysis & Planning -> Implementation -> Verification & Testing -> Documentation & Handoff

Phase 0 classifies the task type (feature, bug fix, refactor, ambiguous, large) and locks scope before any code is touched. Each phase must pass its gate before the next begins.

**Examples:**
```bash
/task Create a user profile page with avatar upload
/task Add pagination to users table with 20 items per page
/task Fix bug where form submits twice on Enter key
```

---

### `/review [extra prompt] [@file1] [@file2] ...`
**Comprehensive code review with structured findings.**

**Target:** Changed files (default) OR specific files with @ notation

**Severity:** `[BLOCKER]` | `[MAJOR]` | `[MINOR]` | `[NIT]`

**Output:** A "Findings by Severity" report in conversation (no files created). The section names are a parsing contract consumed by `/fix`. Review is strictly read-only: it never modifies code, commits, or invents findings without real file/line evidence.

**Examples:**
```bash
/review                              # Review changed files
/review Focus on security issues     # Review changed with focus
/review @src/auth.ts @src/user.ts   # Review specific files
```

---

### `/branchreview [baseBranch]`
**Review changes between current branch and base branch (default: `dev`).**

Emits the same "Findings by Severity" report as `/review`, so `/fix` works on its output too.

**Examples:**
```bash
/branchreview           # Compare against dev
/branchreview main      # Compare against main
```

---

### `/stackreview [extra prompt] [@file1] [@file2] ...`
**Review uncommitted changes with stack context from the current branch vs default base.**

**Target:** Uncommitted changes (staged + unstaged) OR specific files with @ notation

**Context:** Branch diff vs `dev`/`master`/`main` (first that exists) for intent and stack fit; findings are based on the uncommitted diff only

**Severity:** `[BLOCKER]` | `[MAJOR]` | `[MINOR]` | `[NIT]`

**Output:** "Findings by Severity" report in conversation (no files created), consumable by `/fix`

**Examples:**
```bash
/stackreview                              # Review uncommitted with stack context
/stackreview Focus on security issues     # Review with focus
/stackreview @src/auth.ts @src/user.ts   # Review specific files
```

---

### `/fix [severity]`
**Automated fix agent applying fixes from review findings.**

**Parameters:** `all` | `blocker` | `major` | `minor` | `nit` | `high` (blocker+major) | `low` (minor+nit)

Requires a prior `/review`, `/branchreview`, or `/stackreview` in the same conversation; otherwise it refuses with `ABORTED: ... Run /review first.` Fixes are applied one finding at a time, each announced, verified, and tracked as applied/skipped/failed. It never commits, never invents findings, never batches unrelated changes, and reverts any edit that breaks syntax.

**Examples:**
```bash
/fix              # Fix everything
/fix high         # Fix blockers + major
/fix blocker      # Fix only blockers
```

---

### `/fixmr [MR_ID_OR_URL]`
**Fetch and fix unresolved review comments from GitHub PRs and GitLab MRs.**

**Features:** Auto-detects provider, lets you select which comments to fix, creates TODO list, applies fixes systematically with per-fix verification

**Setup Required:**
```bash
# Set environment variables (one-time setup):
# GitHub:
export GITHUB_TOKEN="ghp_your_token_here"
# GitLab:
export GITLAB_TOKEN="glpat_your_token_here"

# Get tokens from:
# GitHub: https://github.com/settings/tokens (scope: repo)
# GitLab: Settings -> Access Tokens (scope: api)
```

**Examples:**
```bash
/fixmr 123                                          # Use MR/PR ID
/fixmr https://github.com/user/repo/pull/456        # GitHub PR URL
/fixmr https://gitlab.com/group/proj/-/merge_requests/789  # GitLab MR URL
```

**Workflow:**
1. Fetches unresolved review comments via `helpers/fetch-mr-comments.js`
2. Shows numbered list with file, line, and comment
3. You select which to fix (e.g., `1,3,5`, `1-3,7`, or `all`)
4. AI creates TODO list and fixes systematically
5. Review changes with `git diff`

---

### `/a11y [extra prompt]`
**Strictly read-only accessibility audit ensuring WCAG 2.1 A/AA compliance on changed UI files.**

**Checks:** WCAG A/AA compliance, screen reader support, keyboard accessibility, color contrast, forms, focus management, dynamic content

**Severity:** `[CRITICAL]` (WCAG A) | `[HIGH]` (WCAG AA) | `[MEDIUM]` | `[LOW]`

**Output:** `.cursor-a11y/findings.optimized.jsonl` plus a full report with remediation code examples. Never modifies code; findings must trace to real lines.

**Examples:**
```bash
/a11y
/a11y Focus on form accessibility
```

---

### `/refactor [file]`
**Improve code quality while preserving exact functionality.**

**Refactors:** Duplication, naming, complexity, magic values, performance, structure

**Parameters:** Empty (all changed files) | `file` (open files only)

**Artifacts:** `.cursor-refactor/` (plan, opportunities, refactor log), kept for reference. Without a test suite it degrades safely: medium/high risk opportunities are reported, not applied.

**Examples:**
```bash
/refactor         # Refactor all changed files
/refactor file    # Refactor open files
```

---

### `/tests`
**Generate comprehensive unit tests for changed code.**

**Features:** Follows project conventions, Python fixture discovery, mocks external deps, >80% coverage goal. If a new test exposes a real bug, the failing test is kept and the defect reported; production code is never patched to make tests pass.

**Frameworks:** Jest, pytest, Mocha, Vitest, JUnit, RSpec

**Artifacts:** `.cursor-tests/` (plan, test file inventory, framework info)

**Example:**
```bash
/tests            # Generate tests for all changed files
```

---

### `/debug [explain issue]`
**Systematic debugging through a gated, evidence-first protocol.**

**Phases:** Preflight & Scope Lock -> Understanding -> Analysis -> Diagnosis -> Solution -> Prevention

If the issue cannot be reproduced and evidence is inconclusive, it presents ranked hypotheses and stops rather than guessing.

**Examples:**
```bash
/debug TypeError: Cannot read property 'name' of undefined
/debug Function returns wrong value for negative numbers
/debug Memory leak in component
```

---

### `/doc [extra prompt] [@file1] [@file2] ...`
**Add inline documentation directly to source files.**

**Target:** Changed files (default) OR specific files with @ notation

**Generates:** JSDoc/TSDoc, Python docstrings, GoDoc (written into files; never creates separate documentation files)

**Examples:**
```bash
/doc                                 # Document changed files
/doc Focus on public API             # Document changed with focus
/doc @src/utils.ts @src/api.ts      # Document specific files
```

---

### `/simplify [@file1] [@file2] ...`
**Run usage analysis in files, duplicate search, refactor candidates, general evaluation and report.**

**Artifacts:** Working data in `.cursor-review/` (deleted after the run); final `{filename}-simplify-checklist.json` in the project root

**Examples:**
```bash
/simplify util.tsx helpers.ts
```

---

### `/humanize [level] [--notypo] [@file1 @file2 ...]`
**Rewrite AI-generated code and text to feel human-written, with a hard guarantee that functionality is untouched.**

**Parameters:**
- `level` (optional): `low` (minimal, 0-1 typos), `medium` (default, 0-2 typos), `high` (heavy rewriting, 0-3 typos)
- `--notypo`: Disable all typos and grammar mistakes; tone rewriting still occurs
- `@files`: Humanize entire files instead of the git diff

**Modes:** Diff mode (default: only changed lines from `git diff`) or file mode (full content of attached files)

**Safety contract:** Never changes logic, signatures, imports/exports, test assertions, API endpoints, queries, or config values. Every line is classified before rewriting; typos are only placed in typo-safe content within a strict budget; every change is verified and the linter is run afterward. When in doubt, it skips.

**Examples:**
```bash
/humanize                        # Humanize the current diff at medium level
/humanize high                   # Heavy rewriting of the diff
/humanize low --notypo           # Light touch, no typos at all
/humanize @README.md @docs.md    # Humanize whole files
```

---

### `/knowledge [keyword] [scan-root]`
**Generate a deep-dive knowledge document about any topic in the codebase via 10 parallel read-only exploration agents.**

**Parameters:**
- `keyword` (required): Topic to research (entity, feature, module, concept, API surface)
- `scan-root` (optional): Directory to scope the search (default: workspace root)

**How it works:** Launches exactly 10 parallel read-only explore agents across different lanes (data models, APIs, business logic, tests, config, etc.), deduplicates and cross-checks their reports, spot-checks high-impact claims against source files, then writes one verified markdown document with a table of contents and cheat sheet. Unverified claims are marked "inferred"; nothing is invented.

**Output:** `.tmp/{Keyword}.md` by default, or `docs/knowledge/{slug}.md` if a `docs/` folder exists

**Examples:**
```bash
/knowledge TrailerReuse                # Research a feature across the repo
/knowledge "payment flow" backend      # Scope the scan to backend/
```

---

### `/description [PR title]`
**Generate PR description from git diff (staged + unstaged).**

**Extracts:** Jira ticket IDs (JIRA-***)

**Template:** Ticket IDs, Short summary, What changed, How to test, Why

**Examples:**
```bash
/description
/description JIRA-1234 Add user authentication
```

---

### `/codesplit [num_splits|analyze]`
**Logical PR Splitter: create safe, deterministic, dependency-aware PR splits from staged + unstaged changes.**

**Parameters:** Empty/`auto` (AI chooses 2-6) | `2`-`6` (force count) | `analyze` (plan only, no stashing)

**Output:** Backup stash + individual split stashes (no files written; branches/commits only with your explicit confirmation)

**What gets included:**
- Modified tracked files (staged or unstaged)
- New files staged with `git add`
- Deleted/renamed files

**What gets excluded (correct behavior):**
- Gitignored files (build artifacts, `__pycache__/`, `node_modules/`, `.env`)
- Untracked files not staged

**Examples:**
```bash
/codesplit              # Auto-detect optimal splits
/codesplit 3            # Force exactly 3 splits
/codesplit analyze      # Show plan without stashing
```

**How it works:**
1. **Collect changes**: Analyzes all staged + unstaged tracked changes
2. **Plan splits**: Determines optimal strategy based on:
   - **Layer-based**: DB -> Backend -> Frontend
   - **Schema + Autogenerated**: Keeps schema WITH generated files (openapi.json + sdk.gen.ts, prisma schema + migrations, protobuf + generated code, graphql schema + types)
   - **Feature-based**: Core -> Extensions -> Polish
   - **Implementation + Tests**: Grouped when tightly coupled
   - **Independent**: Parallel-mergeable changes
   - **Hybrid**: Mix strategies for complex changes
3. **Create backup**: Safety stash with ALL tracked changes (`split:YYYYMMDD:backup:XXXX`)
4. **Re-apply backup**: Restores working directory (dirty again)
5. **Create split stashes**: One stash per logical split (2-6 splits)
6. **Provide instructions**: Exact commands with correct stash indices

**Split count guidelines:**
- 2-4 files -> 1-2 splits
- 5-10 files -> 2-3 splits
- 10-20 files -> 3-4 splits
- 20+ files -> 4-6 splits

**Key features:**
- Autogenerated files grouped with sources (schema/migrations stay together)
- Dependencies respected and ordered
- All tracked changes preserved in backup stash
- Gitignored files excluded (no `__pycache__` conflicts)
- Deterministic, conflict-minimizing splits
- No files/branches/commits created

**Recovery:** If something goes wrong, restore everything from backup:
```bash
git reset --hard HEAD
git stash apply stash@{N}  # N = backup stash index from output
```

---

### `/history [question] [@file1] [@file2] ...`
**AI-powered git history analyzer: ask anything about code evolution.**

**Context modes:**
- **File context:** `@filename` - analyzes specific file only
- **Function context:** mention function name - tracks that code block
- **Feature context:** mention keyword - finds related commits
- **Current file:** no context - analyzes open file
- **Global context:** "project"/"codebase" - repository-wide

**Question types:**
- "Why is X missing?" - Finds when/why code was removed
- "Who changed this?" - Shows authors and contributions
- "When was this refactored?" - Identifies major structural changes
- "What broke X?" - Finds commits that caused issues
- "How did this evolve?" - Shows complete timeline
- "What changed after..." - Shows commits after specific time/person

**Examples:**
```bash
/history Why is the submit button missing?
/history Who changed this file after me?
/history @UserService.js when was this last refactored?
/history When was authentication added?
/history What broke the login flow?
```

**Output includes:**
- Direct answer to your question
- Timeline of relevant changes
- Key commits with details

---

### `/generatecommand [description]`
**Generate a new Cursor command following the Fable contract format.**

**Workflow:** Understand request -> Design command structure -> Generate `.md` file -> Save to `~/.cursor/commands/`

**Features:** Embeds the full Fable skeleton (Operating Contract, gated phases, Output Contract, Failure Modes, Compliance Checklist) as the mandatory template for every generated command; checks for duplicates against the full command set; verifies the written file before delivering.

**Examples:**
```bash
/generatecommand Create a command that runs security scans on changed files
/generatecommand A command to generate changelog entries from git commits
/generatecommand Command that checks for unused dependencies in the project
```

---

## Workflows

### Workflow 1: Feature Development

```bash
# 1. Implement feature
/task Add user authentication with JWT

# 2. Generate tests
/tests

# 3. Review changes
/review

# 4. Fix issues
/fix high

# 5. Check accessibility
/a11y

# 6. Add inline documentation
/doc

# 7. Create PR description
/description JIRA-123 Add authentication

# 8. Commit
git add .
git commit -m "feat: add JWT authentication"
```

### Workflow 2: Bug Fix

```bash
# 1. Debug issue
/debug Form submits twice on Enter key

# 2. Fix bug
/task Fix the bug where form submits twice on Enter

# 3. Add regression test
/tests

# 4. Review
/review

# 5. Fix any issues
/fix

# 6. Commit
git commit -m "fix: prevent double form submission"
```

### Workflow 3: Code Quality Improvement

```bash
# 1. Refactor code
/refactor

# 2. Review changes
/review

# 3. Update tests
/tests

# 4. Fix issues
/fix

# 5. Document changes
/doc

# 6. Commit
git commit -m "refactor: improve code quality"
```

### Workflow 4: Pre-Merge Checklist

```bash
# 1. Branch review
/branchreview main

# 2. Fix critical issues
/fix blocker

# 3. Accessibility check
/a11y

# 4. Generate PR description
/description JIRA-123 Feature description
```

### Workflow 5: Addressing MR/PR Review Comments

```bash
# 1. Fetch unresolved review comments
/fixmr 123

# 2. Select which comments to fix (AI will prompt)
# Example response: 1,3,5 or all

# 3. AI creates TODO list and fixes systematically
# (automatic after selection)

# 4. Review changes
git diff

# 5. Test affected functionality
npm test

# 6. Commit fixes
git add .
git commit -m "fix: address review comments"

# 7. Push and reply to review threads
git push
```

### Workflow 6: Splitting Large Changes into Multiple PRs

```bash
# 1. Make all your changes (don't commit yet)
# Stage new files so they're included:
git add new-file1.ts new-file2.ts
# Leave other changes staged or unstaged - both work

# 2. Preview the split plan
/codesplit analyze

# 3. Create split stashes (AI determines optimal strategy)
/codesplit  # auto-detect, or /codesplit 3 to force 3 splits
# Creates: backup stash + split stashes
# Output shows exact stash indices and commands

# 4. Apply first split and create PR
git checkout -b feat/schema-and-migrations
git stash apply stash@{3}  # Use exact ref from command output
git status && git diff      # Review changes
git add . && git commit -m "feat: add database schema and migrations"
git push origin feat/schema-and-migrations
# Create PR #1, wait for review & merge

# 5. After PR #1 merges, apply second split
git checkout main && git pull
git checkout -b feat/backend-api
git stash apply stash@{2}
git status && git diff
git add . && git commit -m "feat: add backend API endpoints"
git push origin feat/backend-api
# Create PR #2

# 6. Continue for remaining splits...

# 7. Clean up stashes after all PRs merged
git stash list | grep "split:20251119"
git stash drop stash@{3}  # Drop each split stash
git stash drop stash@{2}
git stash drop stash@{1}
git stash drop stash@{0}  # Finally drop backup
```

### Workflow 7: Onboarding to an Unfamiliar Area

```bash
# 1. Generate a knowledge document for the topic
/knowledge "billing pipeline" backend

# 2. Read the generated doc (path is reported by the command)
# .tmp/Billing-Pipeline.md or docs/knowledge/billing-pipeline.md

# 3. Dig into specific questions with history
/history When was the billing retry logic added?
```

---

## Tips & Best Practices

**General:**
- Always `/review` before committing
- Create `.cursorrules` or `AGENT.md` for project-specific patterns
- Break large tasks into smaller ones
- Commands abort loudly (`ABORTED: <reason>`) instead of guessing; when you see an abort, provide what the "Required to proceed" line asks for and re-run

**Review & Fix:**
- Fix high-severity first: `/fix high` then `/fix low`
- Review multiple times: before staging, after staging, before push
- Use `/branchreview` before creating PR
- `/fix` only works on findings from a review run earlier in the same conversation; keep review and fix in one chat
- Use `/fixmr` to systematically address reviewer comments (saves time)
- Set up GitHub/GitLab tokens once for seamless MR/PR comment fetching

**Testing:**
- Run `/tests` after implementing features
- Python projects: Command finds existing fixtures automatically
- Aim for >80% coverage on changed code

**Debugging:**
- Provide full error messages to `/debug`
- Include steps to reproduce
- Let it complete all phases for best results

**Documentation:**
- Run `/doc` before committing
- Follows project conventions automatically
- Use `/knowledge` when you need a repository-wide picture rather than inline docs

**Humanizing:**
- Default `medium` level is a good balance; use `--notypo` for anything customer-facing
- Attach files to humanize whole documents; run without files to humanize just your diff
- Functionality is contractually protected, but still review with `git diff` afterward

**Refactoring:**
- Run `/tests` before `/refactor` to ensure tests exist
- Review changes carefully after refactoring
- `/refactor` preserves exact functionality

**Code Splitting:**
- Use `/codesplit analyze` first to preview the plan
- Stage new files with `git add` before running (otherwise they're excluded)
- Backup stash preserves ALL tracked changes as safety net
- Autogenerated files (openapi.json, sdk.gen.ts, migrations, etc.) automatically grouped with their sources
- AI chooses best strategy: layer-based, schema+generated, feature-based, or hybrid
- Follow dependency order for dependent splits; work in parallel for independent ones
- Gitignored files (build artifacts, `__pycache__/`) correctly excluded
- Clean up stashes after all PRs merged: `git stash drop stash@{N}`

---

## HAPPY VIBE CODING
