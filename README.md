# Awesome Cursor Commands

Comprehensive custom commands for Cursor IDE that transform it into a powerful development assistant with structured workflows for code review, testing, documentation, debugging, and more.

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Available Commands](#available-commands)
   - [/task](#task-task-context) - Complete coding tasks
   - [/review](#review-extra-prompt-file1-file2-) - Code review
   - [/branchreview](#branchreview-basebranch) - Branch comparison review
   - [/fix](#fix-severity) - Automated fix agent
   - [/fixmr](#fixmr-mr_id_or_url) - Fix MR/PR comments
   - [/a11y](#a11y-extra-prompt) - Accessibility audit
   - [/refactor](#refactor-file) - Code quality improvement
   - [/tests](#tests) - Test generation
   - [/debug](#debug-explain-issue) - Systematic debugging
   - [/doc](#doc-extra-prompt-file1-file2-) - Add documentation
   - [/description](#description-pr-title) - Generate PR descriptions
   - [/history](#history-question-file1-file2-) - Git history analyzer
   - [/clean](#clean) - Cleanup utility
4. [Workflows](#workflows)
5. [Tips & Best Practices](#tips--best-practices)

---

## 📖 Overview

These commands provide a complete development workflow:

**🔍 Code Quality:**
- `/review` - Comprehensive code review of staged/unstaged changes
- `/branchreview` - Review changes between branches
- `/fix` - Automated fix agent based on review findings
- `/fixmr` - Fix unresolved review comments from GitHub/GitLab MRs/PRs
- `/a11y` - Accessibility audit (WCAG compliance)

**🛠️ Development:**
- `/task` - Elite software engineer for any coding task
- `/refactor` - Improve code quality while maintaining functionality
- `/tests` - Generate comprehensive unit tests
- `/debug` - Systematic debugging and issue resolution

**📚 Documentation & Tools:**
- `/doc` - Add inline documentation directly to files
- `/description` - Generate PR descriptions from git diff
- `/history` - AI-powered git history analyzer 🔍
- `/clean` - Clean up temporary command files

---

## 📦 Installation

Place command files in: `~/.cursor/commands/`

```bash
# Clone this repo
git clone https://github.com/yourusername/awesome-cursor-commands.git

# Copy commands to Cursor
cp -r awesome-cursor-commands/commands/* ~/.cursor/commands/

# Cursor automatically loads commands on next use
```

---

## 🚀 Available Commands

### `/task [task context]`
**Elite software engineer executing any coding task through a 5-phase workflow.**

**Phases:** Understanding → Planning → Implementation → Verification → Documentation

**Examples:**
```bash
/task Create a user profile page with avatar upload
/task Add pagination to users table with 20 items per page
/task Fix bug where form submits twice on Enter key
```

---

### `/review [extra prompt] [@file1] [@file2] ...`
**Comprehensive code review with JSONL findings.**

**Target:** Changed files (default) OR specific files with @ notation

**Severity:** 🔴 blocker | 🟠 major | 🟡 minor | 🔵 nit

**Output:** `.cursor-review/findings.optimized.jsonl`

**Examples:**
```bash
/review                              # Review changed files
/review Focus on security issues     # Review changed with focus
/review @src/auth.ts @src/user.ts   # Review specific files
```

---

### `/branchreview [baseBranch]`
**Review changes between current branch and base branch (default: `dev`).**

**Examples:**
```bash
/branchreview           # Compare against dev
/branchreview main      # Compare against main
```

---

### `/fix [severity]`
**Automated fix agent applying fixes from review findings.**

**Parameters:** `all` | `blocker` | `major` | `minor` | `nit` | `high` (blocker+major) | `low` (minor+nit)

**Examples:**
```bash
/fix              # Fix everything
/fix high         # Fix blockers + major
/fix blocker      # Fix only blockers
```

---

### `/fixmr [MR_ID_OR_URL]`
**Fetch and fix unresolved review comments from GitHub PRs and GitLab MRs.**

**Features:** Auto-detects provider, lets you select which comments to fix, creates TODO list, applies fixes systematically

**Setup Required:**
```bash
# Set environment variables (one-time setup):
# GitHub:
export GITHUB_TOKEN="ghp_your_token_here"
# GitLab:
export GITLAB_TOKEN="glpat_your_token_here"

# Get tokens from:
# GitHub: https://github.com/settings/tokens (scope: repo)
# GitLab: Settings → Access Tokens (scope: api)
```

**Examples:**
```bash
/fixmr 123                                          # Use MR/PR ID
/fixmr https://github.com/user/repo/pull/456        # GitHub PR URL
/fixmr https://gitlab.com/group/proj/-/merge_requests/789  # GitLab MR URL
```

**Workflow:**
1. Fetches unresolved review comments
2. Shows numbered list with file, line, and comment
3. You select which to fix (e.g., `1,3,5` or `all`)
4. AI creates TODO list and fixes systematically
5. Review changes with `git diff`

---

### `/a11y [extra prompt]`
**Accessibility audit ensuring WCAG 2.1 compliance on changed UI files.**

**Checks:** WCAG A/AA compliance, screen reader support, keyboard accessibility, color contrast

**Output:** `.cursor-a11y/findings.optimized.jsonl`

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

**Examples:**
```bash
/refactor         # Refactor all changed files
/refactor file    # Refactor open files
```

---

### `/tests`
**Generate comprehensive unit tests for changed code.**

**Features:** Follows project conventions, Python fixture discovery, mocks external deps, >80% coverage goal

**Frameworks:** Jest, pytest, Mocha, Vitest, JUnit, RSpec

**Example:**
```bash
/tests            # Generate tests for all changed files
```

---

### `/debug [explain issue]`
**Systematic debugging through 5-stage process.**

**Stages:** Understanding → Analysis → Diagnosis → Solution → Prevention

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

**Generates:** JSDoc/TSDoc, Python docstrings, GoDoc (written into files)

**Examples:**
```bash
/doc                                 # Document changed files
/doc Focus on public API             # Document changed with focus
/doc @src/utils.ts @src/api.ts      # Document specific files
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

### `/history [question] [@file1] [@file2] ...`
**AI-powered git history analyzer - ask anything about code evolution. 🔍**

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
- Key commits with details (what/why/impact)
- Statistics (commits, contributors, dates)
- Code snippets (before/after)
- Actionable next steps

---

### `/clean`
**Clean up temporary directories created by commands.**

**Removes:** `.cursor-review/`, `.cursor-a11y/`, `.cursor-refactor/`, `.cursor-tests/`

**Example:**
```bash
/clean            # Remove all temporary directories
```

---

## 🔄 Workflows

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

# 8. Clean up and commit
/clean
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
/clean
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
/clean
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

# 5. Clean up
/clean
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

---

## 💡 Tips & Best Practices

**General:**
- Always `/review` before committing
- Use `/clean` when done to free up space
- Create `.cursorrules` or `AGENT.md` for project-specific patterns
- Break large tasks into smaller ones

**Review & Fix:**
- Fix high-severity first: `/fix high` then `/fix low`
- Review multiple times: before staging, after staging, before push
- Use `/branchreview` before creating PR
- Use `/fixmr` to systematically address reviewer comments (saves time)
- Set up GitHub/GitLab tokens once for seamless MR/PR comment fetching

**Testing:**
- Run `/tests` after implementing features
- Python projects: Command finds existing fixtures automatically
- Aim for >80% coverage on changed code

**Debugging:**
- Provide full error messages to `/debug`
- Include steps to reproduce
- Let it complete all 5 stages for best results

**Documentation:**
- Run `/doc` before committing
- Follows project conventions automatically
- Generates inline docs + README sections

**Refactoring:**
- Run `/tests` before `/refactor` to ensure tests exist
- Review changes carefully after refactoring
- `/refactor` preserves exact functionality

---

## 📂 Command Output Locations

| Command | Output Directory | Purpose |
|---------|-----------------|---------|
| `/review` | `.cursor-review/` | Review findings (JSONL) |
| `/branchreview` | `.cursor-review/` | Branch review findings |
| `/a11y` | `.cursor-a11y/` | Accessibility audit data |
| `/refactor` | `.cursor-refactor/` | Refactoring logs |
| `/tests` | `.cursor-tests/` | Test generation data |

**Note:** `/doc` writes directly into source files (no temp directory)

**Clean up all:** `/clean`

---

## HAPPY VIBE CODING
