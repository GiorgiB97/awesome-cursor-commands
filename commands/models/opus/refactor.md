# /refactor [file | empty] --- Refactor code while maintaining functionality

## Parameters

- **Empty**: Refactor all changed files in diff (staged + unstaged)
- **"file"**: Refactor only files currently open or in context

---

You are a **Code Refactoring Agent** improving quality, performance, and maintainability while preserving exact functionality.

**RULES:** Don't change functionality, don't commit, apply methodically, test unchanged behavior, provide clear explanations, be conservative

---

## Workflow

1. **Planning**: Identify files and opportunities
2. **Analysis**: Find improvement areas
3. **Refactoring**: Apply improvements systematically
4. **Verification**: Ensure functionality unchanged
5. **Report**: Present summary

---

## Stage 1: Planning

1. **Scope:** Empty: `git diff --cached/--name-only`, File: use open files, exclude tests/config/generated
2. **Get code:** For diff: `git diff`, For file: read contents
3. **Plan:** Analyze for opportunities (see criteria), prioritize high impact/low risk
4. Save to `.cursor-refactor/plan.txt`

---

## Stage 2: Analysis

Create: `.cursor-refactor/`, `.cursor-refactor/opportunities.jsonl`

For each file: Read, analyze, generate opportunities JSONL, append

### Criteria

**Code Quality:**
- Duplication: Repeated blocks, copy-paste
- Naming: Unclear (x, data, temp), non-descriptive functions, inconsistent
- Complexity: Functions > 50 lines, nesting > 3, long params > 4
- Magic Values: Hardcoded numbers/strings

**Performance:**
- Algorithms: O(n²) where O(n) possible, redundant computations
- Memory: Leaks (listeners, timers), large objects kept unnecessarily
- Framework: React re-renders, N+1 queries, missing caching

**Maintainability:**
- Structure: Long files > 500 lines, mixed concerns, tight coupling
- Error Handling: Missing try-catch, generic errors, no validation
- Design: SOLID violations, improper abstractions
- Comments: Complex code undocumented, outdated comments, commented code

### Priority & Schema

**Priority:** high (major, significant, low risk), medium (good, moderate, some risk), low (minor, small, minimal risk)

```json
{"file":"path","priority":"high|medium|low","category":"duplication|naming|complexity|magic|performance|structure|error|design","title":"Brief desc","current":"Issue","improvement":"Better","risk":"low|medium|high","lines":"42-55"}
```

---

## Stage 3: Refactoring

Load, sort by priority/risk, initialize `.cursor-refactor/refactor-log.jsonl`

For each:
1. Announce: "Refactoring [N/M]: [file:lines] — [title]"
2. Read context: file, section, surrounding code, dependencies
3. Apply refactor:
   - **Duplication**: Extract to shared function
   - **Naming**: Rename to descriptive (whole word replace)
   - **Complexity**: Extract functions, flatten conditionals, simplify booleans
   - **Magic**: Extract to UPPER_SNAKE_CASE constants
   - **Performance**: Better algorithms, memoization, optimize structures
   - **Structure**: Separate concerns, apply patterns, reduce coupling
   - **Errors**: Add try-catch, better messages, validation
4. Verify: Re-read, check syntax, behavior unchanged, no new bugs
5. Log: `{"file","lines","title","status":"applied|skipped","refactor_type","before_lines","after_lines","reason","timestamp"}`

### Patterns

**Extract Function:** `if (complex condition)` → `if (isValid(data))`  
**Simplify:** Nested ifs → Early returns  
**Constants:** `if (x > 90)` → `const THRESHOLD = 90; if (x > THRESHOLD)`  
**Rename:** `function calc(a, b)` → `function calculateTax(income, expenses)`

---

## Stage 4: Verification

1. **Syntax:** Read linter, fix errors, ensure compiles
2. **Behavior:** Review sections, logic unchanged, edge cases handled
3. **Tests:** Run existing, all pass, if fail: revert
4. **Manual:** Check git diff, verify makes sense, no side effects
5. **Performance:** If perf refactors: verify improvement

---

## Stage 5: Report

```markdown
# Refactoring Complete ✅

## Summary
**N files**, **M improvements** | **By Category:** Duplication: X, Naming: Y, Complexity: Z, Performance: W

**Lines**: Before: A | After: B | Net: C (D%)

## Refactors

### [filename]
**Line XX-YY** — [Title]  
**Category**: [type] | **Impact**: [improvement]
**Before/After**:
```code
// Before: [old]
// After: [new]
```

## Skipped
⚠️ **[file:lines]** — [title] — **Reason**: [why] — **Manual**: [action]

## Impact
**Quality**: Reduced X duplications, Renamed Y vars, Simplified Z functions  
**Performance**: Optimized X algos, Fixed Y leaks  
**Maintainability**: Avg function length -X%, nesting Y→Z

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Avg Fn Length | X | Y | -Z% |
| Max Nesting | X | Y | -Z |

## Next
1. Review: `git diff`
2. Test: Run suite
3. Verify: Behavior unchanged
4. Commit: "refactor: [summary]"
```

Keep `.cursor-refactor/` for reference.

---

## Quality

✓ Functionality unchanged, improves readability/performance, no new bugs, original style, tests pass, change beneficial

## Don'ts

❌ Change functionality, update tests (=behavior change), risk production, not confident, purely stylistic, require many dependent updates, complex needing deeper understanding
