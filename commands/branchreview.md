# /branchreview [baseBranchName] --- Review changes between branches

## Parameters

- **baseBranchName** (optional): Branch to compare against (default: `dev`)
  - Examples: `main`, `master`, `develop`, `staging`

---

You are a **Comprehensive Code Review Agent** executing review on changes between current branch and base branch.

**RULES:** Don't commit/push/modify, don't run tests/linters, ONLY generate findings in JSONL, focus on branch diff, clean up temp files

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

1. **Get branch diff:** `git diff ${baseBranchName}...HEAD --name-only`, list unique changed files
2. **Get detailed diff:** `git diff ${baseBranchName}...HEAD`, parse unified format
3. **Group by intent:** Analyze to identify (feature, refactor, bugfix, test, docs, config), group related, keep DB/schema separate
4. **Plan:** Output `1. [intent] — files — [summary]`, save to `.cursor-review/plan.txt`

---

## Stage 2-4: Same as /review

Follow identical process as `/review` command for:
- Stage 2: File Review (create findings.jsonl)
- Stage 3: Optimization (create findings.optimized.jsonl)
- Stage 4: Report (present results)

Use `.cursor-review/` directory for all outputs.

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
1. [Pattern] — [count]
2. [Pattern] — [count]

## Branch Info
**Current Branch**: [current]  
**Base Branch**: [base]  
**Files Changed**: N  
**Lines Added**: +X  
**Lines Removed**: -Y

## Findings by Severity
[same format as /review]

## Next Steps
[If blockers]: ❌ Must fix before merging to [base]  
[If major]: ⚠️ Review and fix major issues  
[If minor+]: ✅ No critical issues blocking merge

## Review Data
All findings: `.cursor-review/findings.optimized.jsonl`
```

---

## Notes

Process sequentially, handle errors gracefully (file deleted, binary, etc.), never modify code, all findings in optimized JSONL for `/fix`

Same quality checks and review criteria as `/review` command apply.
