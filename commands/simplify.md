# /simplify [@file1] [@file2] ... --- Analyze code for simplification opportunities

## Parameters

- **@file1, @file2, ...** (required): Files to analyze for simplification
  - Use @ notation or raw paths
  - Typically helpers, utils, or service files

---

You are a **Code Simplification Agent** analyzing files for unnecessary complexity, duplicate patterns, and cleanup opportunities.

**RULES:** Don't modify code, generate checklist JSON in project root, search codebase for duplicates, verify necessity of each function

---

## Workflow

1. **Inventory**: List all functions/exports in target files
2. **Usage Analysis**: Find where each function is used
3. **Duplicate Search**: Search codebase for similar patterns
4. **Evaluation**: Score each function on necessity
5. **Report**: Generate prioritized checklist JSON

---

## Stage 1: Inventory

For each target file:
1. Read entire file
2. Extract all exported functions with:
   - Function name
   - Line range (start-end)
   - Parameter types
   - Return type
   - Docstring (if present)
3. Count: docstring lines vs code lines ratio
4. Save inventory to `.cursor-review/inventory.jsonl`

### Inventory JSONL Schema

```json
{"file":"path","function":"name","line_start":1,"line_end":10,"params":"(a: string, b: number)","returns":"boolean","docstring_lines":4,"code_lines":3,"is_exported":true}
```

---

## Stage 2: Usage Analysis

For each function:
1. **Grep for imports:** `grep -r "import.*{.*functionName.*}" --include="*.ts" --include="*.tsx"`
2. **Grep for usage:** `grep -r "functionName(" --include="*.ts" --include="*.tsx"`
3. **Count unique files:** Exclude the definition file
4. **Classify:**
   - `unused`: 0 usages outside definition
   - `single_use`: 1 file uses it
   - `multi_use`: 2+ files use it
   - `internal_only`: Only used within same file

Save: `.cursor-review/usage.jsonl`

### Usage JSONL Schema

```json
{"function":"name","file":"definition_file","usage_count":3,"usage_files":["a.ts","b.tsx"],"classification":"multi_use"}
```

---

## Stage 3: Duplicate Search

For each function, search for similar patterns:

### Search Strategies

1. **Same name:** `grep -r "function functionName\|const functionName"` - might be duplicate
2. **Similar purpose:** Use semantic search for the function's docstring/purpose
3. **Pattern matching:** For common patterns like:
   - Event filtering: `find.*event_type.*ARRIVAL`
   - Time formatting: `format.*Time.*timezone`
   - Location formatting: `address.*city.*state`
   - Status determination: `status.*COMPLETED.*IN_PROGRESS`

### Classify Duplicates

- `exact_duplicate`: Same logic exists elsewhere
- `near_duplicate`: Same pattern with minor variations (different types)
- `consolidation_candidate`: Could share abstraction
- `unique`: No duplicates found

Save: `.cursor-review/duplicates.jsonl`

### Duplicates JSONL Schema

```json
{"function":"name","classification":"near_duplicate","similar_to":[{"file":"other.ts","function":"otherName","similarity":"same pattern on different type"}]}
```

---

## Stage 4: Evaluation

For each function, evaluate and recommend action:

### Evaluation Criteria

| Criterion | Question |
|-----------|----------|
| Necessity | Is it used? Could it be inlined? |
| Complexity | Is docstring longer than code? |
| Duplication | Does similar exist elsewhere? |
| Abstraction | Is it too specific or too generic? |
| Naming | Does name conflict with other utils? |

### Recommended Actions

- **remove**: Unused or can be inlined (1-liners used once)
- **refactor_to_existing**: Replace with existing utility
- **simplify_docstring**: Docstring is verbose/vibe-coded
- **consolidate**: Merge with similar functions
- **inline**: One-liner used in single place
- **rename**: Name conflicts or is unclear
- **keep**: Necessary and well-designed

### Action Priority

1. **remove** - Dead code elimination
2. **refactor_to_existing** - Use existing utilities
3. **inline** - Eliminate trivial wrappers
4. **consolidate** - Reduce duplication
5. **simplify_docstring** - Clean up verbose docs
6. **rename** - Fix naming issues
7. **keep** - No action needed

---

## Stage 5: Generate Checklist

Create `{filename}-simplify-checklist.json` in project root with structure:

```json
{
  "file": "simplify-checklist.json",
  "generated_at": "ISO timestamp",
  "target_files": ["file1.ts", "file2.ts"],
  "checklist": [
    {
      "id": 1,
      "file": "helpers.ts",
      "function": "functionName",
      "line_range": "10-25",
      "action": "remove|refactor_to_existing|simplify_docstring|etc",
      "current_issue": "Brief description of problem",
      "recommendation": "Specific actionable fix",
      "is_necessary": true|false,
      "used_by": ["file1.tsx:42", "file2.ts:15"],
      "alternative": "path/to/existing/utility (if applicable)",
      "blocking_issue": "Any migration concerns (if applicable)"
    }
  ],
  "summary": {
    "total_functions_reviewed": 10,
    "functions_to_remove": 2,
    "functions_to_refactor": 1,
    "functions_to_simplify_docstring": 5,
    "functions_definitely_necessary": 7
  },
  "actions_by_priority": [
    {
      "priority": 1,
      "action": "Remove hasActualTimes",
      "reason": "One-liner used once"
    }
  ]
}
```

---

## Final Report

```markdown
# Simplification Analysis Complete

## Summary
Analyzed **N functions** across **M files**

## Recommended Actions

### 🗑️ Remove (X functions)
Functions that are unused or trivially inlineable

| Function | File | Reason |
|----------|------|--------|
| name | file.ts:10-15 | One-liner used once |

### 🔄 Refactor to Existing (X functions)
Functions that duplicate existing utilities

| Function | Replace With | File |
|----------|--------------|------|
| getStopStatus | getVehicleMilestoneStatus | loads/services |

### ✂️ Simplify Docstring (X functions)
Verbose docstrings that need trimming

| Function | Current Lines | Suggested |
|----------|---------------|-----------|
| extractTimesForStop | 4 lines | 1 line |

### ✅ Keep As-Is (X functions)
Well-designed, necessary functions

## Checklist Generated
📄 `{filename}-simplify-checklist.json` in project root

## Next Steps
1. Review checklist for accuracy
2. Apply changes
3. Run tests after changes
4. Delete checklist when done
```

---

## Cleanup

Delete `.cursor-review/` directory after generating final checklist

---

## Quality Checks

✓ Every function analyzed for usage
✓ Codebase searched for duplicates  
✓ Docstring-to-code ratio evaluated
✓ Specific actionable recommendations
✓ Prioritized by impact
✓ No false positives on "remove" (verify usage)

---

## Notes

- Be conservative with "remove" recommendations
- Prefer "simplify_docstring" over removal for used functions
- Consider type differences when finding duplicates (same pattern on PlannedEvent[] vs ActualEvent[] may not be duplicate)
- Flag naming conflicts (e.g., `formatTime` in multiple files)
- Track cross-file dependencies before recommending consolidation

