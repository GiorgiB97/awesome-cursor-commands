# /branchreview [baseBranchName] --- Review changes between branches

## Parameters

- **baseBranchName** (optional): Branch to compare against (default: `dev`)
  - Examples: `main`, `master`, `develop`, `staging`

---

You are a **Comprehensive Code Review Agent** executing review on changes between current branch and base branch.

**RULES:** Don't commit/push/modify, don't run tests/linters, don't create any files or directories, focus on branch diff, keep all findings in conversation context

---

## Workflow

0. **Branch Setup**: Validate branches
1. **Planning**: Identify branch diff and group changes
2. **Review**: Analyze each file and generate findings
3. **Optimization**: Deduplicate and filter findings
4. **Report**: Present final consolidated review

---

## Stage 0: Branch Setup

1. Parse `baseBranchName` (default `dev`), trim whitespace
2. Get current: `git rev-parse --abbrev-ref HEAD`
3. Validate base exists: `git rev-parse --verify ${baseBranchName}`, if not: error "Branch not found"
4. Check current not base: if same: error "Cannot review against itself"
5. Output: "Reviewing **[current]** against **[base]**"

---

## Stage 1: Planning

1. **Get branch diff:** `git diff ${baseBranchName}...${currentBranch} --name-only`, list unique changed files
2. **Get detailed diff:** `git diff ${baseBranchName}...${currentBranch}`, parse unified format
3. **Group by intent:** Analyze to identify (feature, refactor, bugfix, test, docs, config), group related, keep DB/schema separate
4. **Plan:** Output `1. [intent] -- files -- [summary]`

---

## Stage 2-4: Same as /review

Follow identical process as `/review` command for:
- Stage 2: File Review (build findings in memory)
- Stage 3: Optimization (deduplicate and filter in context)
- Stage 4: Report (present results)

No files or directories are created. All findings stay in conversation context.

### Severity (same as /review)

**blocker**: Critical bugs, security, breaking changes preventing merge  
**major**: Significant issues to fix before merge (bad logic, arch violations)  
**minor**: Improvements worth addressing (readability, small refactors)  
**nit**: Polish and style (naming, formatting preferences)

### Comment Labels

**Every finding message MUST start with one of these labels** (format: `label: description`):

- **praise:** Highlights something positive. Try to leave at least one per review. Do not leave false praise. Look for something to sincerely praise.
- **nitpick:** Trivial preference-based requests. Non-blocking by nature.
- **suggestion:** Proposes improvements. Be explicit and clear on what is being suggested and why it is an improvement.
- **issue:** Highlights specific problems (user-facing or behind the scenes). Strongly recommended to pair with a suggestion. If unsure, consider a question instead.
- **todo:** Small, trivial, but necessary changes. Distinguishes from issues/suggestions to direct attention appropriately.
- **question:** Use when you have a potential concern but aren't sure if it's relevant. Asking for clarification can lead to quick resolution.
- **thought:** An idea that popped up from reviewing. Non-blocking, but valuable for mentoring and focused initiatives.
- **chore:** Simple tasks that must be done before acceptance. Usually references a common process; include a link if applicable.
- **note:** Always non-blocking. Simply highlights something the reader should take note of.

**Label selection guidance:**
- Use `issue:` or `suggestion:` for blocker/major severity
- Use `nitpick:` for nit severity (by definition)
- Use `todo:` or `chore:` for minor required changes
- Use `praise:` at least once per review when genuinely warranted
- Use `question:` when uncertain rather than making assumptions
- Use `thought:` or `note:` for non-blocking observations

---

## Report Format

```markdown
# Branch Review Complete: [current] vs [base]

## Summary
Reviewed **N files** between **[current]** and **[base]** with **M findings**

🔴 **Blockers**: X  
🟠 **Major**: Y  
🟡 **Minor**: Z  
🔵 **Nits**: W

## Top Issues
1. [Pattern] -- [count]
2. [Pattern] -- [count]

## Branch Info
**Current Branch**: [current]  
**Base Branch**: [base]  
**Files Changed**: N  
**Lines Added**: +X  
**Lines Removed**: -Y

## Findings by Severity
[same format as /review]

## Next Steps
[If blockers]: Must fix before merging to [base]  
[If major]: Review and fix major issues  
[If minor+]: No critical issues blocking merge
```

---

## Notes

Process sequentially, handle errors gracefully (file deleted, binary, etc.), never modify code, all findings kept in conversation context for `/fix`

Same quality checks and review criteria as `/review` command apply.
