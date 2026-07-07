# /description [PR title] --- Generate PR description from git diff

## Parameters

- **Empty**: Generate without Ticket ID header
- **"PR title"**: Extract Jira IDs (JIRA-***) and include in header

---

You are a **Senior Developer** preparing a Pull Request. Generate an informative PR description from current git diff (staged + unstaged).

**RULES:** Don't create files, don't commit/push, analyze all changes, generate clear description, follow exact template

---

## Workflow

1. **Analysis**: Gather and analyze changes
2. **Understanding**: Comprehend what was done and why
3. **Generation**: Create PR description

---

## Stage 1: Analysis

1. **Get files:** `git diff --cached --name-only`, `git diff --name-only`, combine unique
2. **Get diffs:** `git diff --cached`, `git diff`, parse unified diff format
3. **Extract IDs:** If PR title: search for `[A-Z]+-\d+` patterns (JIRA-123, PROJ-456, etc.)
4. **Categorize:** New features, bug fixes, refactoring, config, docs, tests, dependencies, breaking changes

---

## Stage 2: Understanding

1. **Analyze:** Purpose of changes, major vs minor, dependencies, breaking changes
2. **Identify major:** New features/components, significant refactors, architecture changes, API mods, DB schema, security, performance
3. **Context:** Why needed? What problem solved? What value added? Trade-offs?
4. **Testing:** What needs testing? How to verify? Key scenarios? Specific setup?

---

## Stage 3: Generation

### Template (reply in plain markdown in code block for easy copy-paste)

```markdown
{if ticket IDs found:}
## Ticket ID(s): {JIRA-123, JIRA-456}

## Short summary
{1-2 sentence overview of major change/fix/feature}

## What changed
- {Major change 1}
- {Major change 2}
- {More as needed}

## How to test?
1. {Step to test}
2. {Step to test}
3. {More as needed}

## Why make this change?
{1-2 sentence benefit explanation}
```

### Guidelines

**Short Summary:** Concise (1-2 sentences), main purpose, active voice  
**What Changed:** Major only, bullet (-), action verbs (Added, Fixed, Updated, Removed, Refactored), specific but brief, group related, order by importance  
**How to Test:** Numbered, clear steps, assume reviewer has repo/branch locally, skip pull/setup/install, focus on what to run/check/expect, include commands  
**Why:** Benefit/value, connect to goals, brief (1-2 sentences)

### Example (reply in plain markdown in code block for easy copy-paste)

```markdown
## Ticket ID(s): JIRA-1234, JIRA-567

## Short summary
Added comprehensive user authentication system with JWT tokens and role-based access control to secure API endpoints.

## What changed
- Added JWT authentication middleware to validate tokens on protected routes
- Implemented login/logout endpoints with secure password hashing
- Created role-based authorization system (admin, user, guest)
- Updated user model to include password hash and role fields
- Added authentication error handling with descriptive messages
- Implemented token refresh mechanism for extended sessions
- Added unit tests for authentication middleware and helpers

## How to test?
1. Verify JWT token in localStorage and included in API requests
2. Access `/dashboard` (protected route) - should load successfully
3. Log out and try accessing `/dashboard` - should redirect to login
4. Test roles: create users with different roles, verify permissions

## Why make this change?
Enhances security by implementing industry-standard JWT authentication and prevents unauthorized access to sensitive data and admin features.
```

---

## Important

- **Accuracy**: Reflect actual diff changes
- **Clarity**: Clear, non-technical where possible
- **Completeness**: Cover all major changes
- **Actionable**: Easy-to-follow test steps
- **No file creation**: Output directly
- **Ready to use**: Copy-paste immediately

---

## Edge Cases

**No changes:** "No changes detected. Make changes before generating."  
**Only minor:** Still generate, honest summary: "Minor updates to improve quality"  
**Large files:** Group similar: "Updated 15 test files to use new utilities"  
**Breaking:** Prefix "⚠️ BREAKING:", include migration in testing

---

Generate PR description and output directly to user in simple markdown in code-block format.
