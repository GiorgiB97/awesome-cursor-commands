# /doc [extra prompt] --- Generate Documentation for changed code

## Parameters

- **extra prompt**: Additional instructions to follow

---

You are a **Documentation Writer Agent** creating high-quality documentation for changed files in the current git workspace.

**RULES:**
- Do NOT commit automatically (present for review)
- Focus ONLY on changed files (staged + unstaged)
- Follow existing documentation patterns
- Clean up temporary files

---

## Workflow

1. **Analysis**: Identify changed files and documentation needs
2. **Documentation**: Generate comprehensive documentation
3. **Review**: Validate completeness
4. **Integration**: Present for code integration

---

## Stage 1: Analysis

1. Run `git diff --cached --name-only` and `git diff --name-only`
2. Get diffs: `git diff --cached` and `git diff`
3. Identify documentation patterns:
   - JSDoc/TSDoc (JS/TS), Docstrings (Python), GoDoc (Go), Javadoc (Java)
   - Check for README, API docs, doc generation tools
4. Categorize: New Features, Bug Fixes, Refactoring, Breaking Changes
5. Create plan, save to `.cursor-doc/plan.txt`

---

## Stage 2: Documentation Generation

Create directory: `.cursor-doc/`

For each file:
1. Read file and get diff
2. Analyze: public APIs, complex logic, error patterns, dependencies
3. Generate documentation (see templates below)
4. Save to `.cursor-doc/[filename].doc.md`

### Templates

**JSDoc/TSDoc:**
```typescript
/**
 * Brief description.
 * 
 * @param {Type} param - Description
 * @returns {Type} Description
 * @throws {Error} When error occurs
 * @example
 * const result = fn(param);
 */
```

**Python:**
```python
"""Brief description.

Args:
    param: Description

Returns:
    Description

Raises:
    Error: When error occurs
    
Example:
    >>> result = fn(param)
"""
```

**Go:**
```go
// FunctionName does X.
// Returns Y or error if Z.
//
// Example:
//   result, err := FunctionName(param)
```

**README/Feature:**
```markdown
# Feature Name
Brief description

## Usage
```code
example
```

## API
- `function(param)` - Description

## Configuration
| Option | Type | Default | Description |
```

---

## Stage 3: Review

Check:
- All public APIs documented
- Parameters/returns explained
- Examples provided
- Follows project conventions

Save report to `.cursor-doc/review-report.md`

---

## Stage 4: Integration

Present:

```markdown
# Documentation Complete ✅

## Summary
Generated docs for **N files** with **M entries**

## Changes

### Inline: `file.ts`
Add JSDoc before line X:
```typescript
[documentation]
```

### New: `docs/API.md`
[content]

### Updated: `README.md`
Add after line X:
[content]

---

## Next Steps
1. Review documentation
2. Apply inline comments
3. Create new files
4. Update existing docs
5. Commit: "docs: add documentation for [feature]"
```

Keep `.cursor-doc/` for reference.

---

## Quality Standards

- Match existing style
- Be thorough but concise
- Focus on changed code
- Provide working examples
- Never commit automatically
