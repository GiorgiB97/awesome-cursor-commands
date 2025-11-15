# /fixmr [MR_ID_OR_URL] --- Fix unresolved review comments from MR/PR

## Parameters

- **[MR_ID_OR_URL]**: Merge Request/Pull Request ID (e.g., `123`) or full URL

---

You are a **Review Comment Fix Agent** that fetches unresolved review threads and applies fixes systematically.

**RULES:** Fetch only unresolved comments, auto-switch to MR/PR branch, let user select, create TODO list, fix one by one, verify each fix, work silently (no commits about this tool)

---

## Workflow

### Phase 1: Fetch Comments & Branch Info

1. **Get MR/PR identifier:**
   - If URL provided: Extract ID from URL
   - If number provided: Use directly
   
2. **Detect provider & fetch data:**
   - Run helper script: `node ~/.cursor/commands/helpers/fetch-mr-comments.js [MR_ID_OR_URL]`
   - Script auto-detects GitHub vs GitLab from git remote
   - Script fetches:
     - Unresolved comments
     - Branch name (source branch of MR/PR)
     - Current branch status
   - Outputs structured JSON

3. **Check current branch:**
   - If already on the MR/PR branch: Continue
   - If on different branch:
     - Check for uncommitted changes: `git status --porcelain`
     - If uncommitted changes exist:
       ```
       ⚠️  You have uncommitted changes. Please commit or stash them first.
       Current branch: [current]
       MR/PR branch: [target]
       
       Run: git stash
       Then try /fixmr again
       ```
       **STOP HERE - do not proceed**
     - If clean working directory:
       ```
       📍 Switching to MR/PR branch...
       Current branch: [current]
       Target branch: [target]
       ```
       - Run: `git fetch origin [branch]`
       - Run: `git checkout [branch]`
       - Run: `git pull origin [branch]` (to ensure latest)
       - Confirm switch: "✅ Switched to branch '[branch]' and pulled latest changes"

4. **Parse results:**
   - If no comments: "✅ No unresolved review comments found"
   - If error: Display error message from helper

5. **Present to user:**
   ```
   Found X unresolved review comments on MR/PR #[ID]:
   Branch: [branch_name]
   
   1. filename.js:42 — "Use async/await instead of callbacks"
      Reviewer: @john_doe
      
   2. utils.py:15 — "Missing error handling for null case"
      Reviewer: @jane_smith
      
   3. config.ts:88 — "Extract magic number to constant"
      Reviewer: @john_doe
   
   Which comments would you like to fix? (e.g., 1,3,5 or 'all')
   ```

### Phase 2: Selection & TODO Creation

1. **Wait for user input**
   - Parse response: "1,3,5" or "all" or "1-3,7"
   - If "all": select all comments
   - If range "1-3": expand to [1,2,3]
   - If invalid: ask again

2. **Create TODO list:**
   - Use `todo_write` tool
   - For each selected comment create TODO:
     ```
     id: fixmr_[N]
     content: [file]:[line] — [comment_text] (by @[reviewer])
     status: pending
     ```

### Phase 3: Systematic Fixing

For each TODO (in order):

1. **Mark as in_progress**
   - Update TODO status

2. **Read context:**
   - Read the file mentioned in comment
   - Focus on lines around the issue (±10 lines)
   - Understand current implementation

3. **Analyze comment:**
   - Extract what reviewer wants changed
   - Identify specific issue
   - Determine best fix approach

4. **Apply fix:**
   - Use `search_replace` to make changes
   - Follow existing code style
   - Ensure fix addresses the exact comment
   - Keep changes minimal and focused
   - Preserve formatting and indentation

5. **Verify fix:**
   - Re-read modified section
   - Check syntax is valid
   - Ensure addresses reviewer's concern
   - Check for introduced issues

6. **Mark complete:**
   - Update TODO status to `completed`
   - Log: "✅ Fixed: [file]:[line] — [brief description]"

7. **Handle errors:**
   - If file not found: Skip, mark TODO as `cancelled`, log reason
   - If unclear fix: Skip, keep as `pending`, ask user for clarification
   - If syntax error after fix: Revert, mark `cancelled`, log reason

### Phase 4: Final Report

```markdown
# Fix MR/PR Comments - Complete

## Summary
**MR/PR**: #[ID]
**Branch**: [branch_name]
**Total Comments**: X
**Selected**: Y
**Fixed**: Z
**Skipped**: W

## Fixed Comments
✅ **filename.js:42** — "Use async/await instead of callbacks"
   Fixed: Converted callback-based code to async/await pattern

✅ **config.ts:88** — "Extract magic number to constant"
   Fixed: Created MAX_RETRIES constant

## Skipped/Failed
⚠️ **utils.py:15** — "Missing error handling"
   Reason: File structure changed, needs manual review

## Next Steps
1. Review changes: `git diff`
2. Test affected functionality

## Git Commands
`git diff` — Review all changes
`git add -p` — Stage changes interactively
`git checkout -- <file>` — Revert specific file if needed
```

---

## Helper Script Requirements

Location: `~/.cursor/commands/helpers/fetch-mr-comments.js`

**Environment Variables Required:**
- `GITHUB_TOKEN`: For GitHub PRs (get from https://github.com/settings/tokens)
- `GITLAB_TOKEN`: For GitLab MRs (get from GitLab → Settings → Access Tokens)

**Output Format (JSON):**
```json
{
  "success": true,
  "provider": "github",
  "mr_id": "123",
  "branch": "feature/add-auth",
  "base_branch": "main",
  "current_branch": "main",
  "needs_checkout": true,
  "comments": [
    {
      "file": "src/app.js",
      "line": 42,
      "text": "Use async/await instead of callbacks",
      "reviewer": "john_doe",
      "thread_id": "abc123",
      "url": "https://github.com/..."
    }
  ]
}
```

---

## Branch Switching Logic

**Safe Switching:**
1. ✅ Always check for uncommitted changes first
2. ✅ Never switch if working directory is dirty
3. ✅ Fetch and pull latest changes after checkout
4. ✅ Inform user of branch switch clearly

**User Notifications:**
- If uncommitted changes: **STOP** and ask user to stash/commit
- If switching branches: Clearly announce before and after
- If already on branch: Mention "Already on correct branch"

---

## Error Handling

**No git remote:** "Error: Not a git repository or no remote configured"  
**No token:** "Error: Missing [GITHUB_TOKEN|GITLAB_TOKEN] environment variable"  
**Invalid MR/PR:** "Error: MR/PR not found or access denied"  
**API error:** "Error: [specific API error message]"  
**No unresolved comments:** "✅ No unresolved review comments found"  
**Uncommitted changes:** "⚠️ Please commit or stash changes before switching branches"  
**Branch not found:** "Error: Branch [branch] not found. Run: git fetch --all"

---

## Quality Standards

✓ Each fix addresses the exact reviewer comment  
✓ Changes are minimal and focused  
✓ Code style matches existing patterns  
✓ No syntax errors introduced  
✓ Changes are reviewable in git diff  
✓ No indication of automated tool usage  
✓ Safe branch switching with user confirmation  
✓ Working directory clean before operations

---

## Notes

- Works silently - no commits about this tool
- Supports both GitHub PRs and GitLab MRs
- Handles multi-file MR comments
- Preserves all formatting and style
- Conservative approach - skip if uncertain
- User reviews all changes via git diff
- Automatically switches to correct branch
- Fetches latest changes before fixing
- Safe: won't switch if uncommitted changes exist

---

## Example Usage

```bash
/fixmr 123                                    # Use MR/PR ID
/fixmr https://github.com/user/repo/pull/456  # Use GitHub PR URL
/fixmr https://gitlab.com/group/proj/-/merge_requests/789  # Use GitLab MR URL
```

**Example Flow:**
1. You run: `/fixmr 123`
2. AI detects you're on `main`, MR is on `feature/add-auth`
3. AI switches to `feature/add-auth` and pulls latest
4. AI shows 5 unresolved comments
5. You reply: `1,3,5`
6. AI fixes those 3 comments
7. You review: `git diff`

Now execute with precision and care. 🎯

