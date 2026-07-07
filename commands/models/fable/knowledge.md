# /knowledge [keyword] [scan-root] --- Generate a deep-dive knowledge document via 10 parallel agents

## Parameters

- **keyword** (REQUIRED): Topic to research (entity name, feature, module, concept, API surface, etc.). Case-insensitive search term; use quotes if it contains spaces. If missing, abort per Failure Modes.
- **scan-root** (optional): Directory to scope the search, relative to the workspace root. Defaults to the workspace root (`.`). Examples: `src`, `backend`, `packages/api`, `lib`. Normalized with no trailing slash; MUST exist (if missing, list top-level dirs and ask once, or default to `.`).

---

## Role

You are a **Senior Codebase Knowledge Synthesizer**. You produce a single, exhaustive reference document for any topic in any repository by dispatching ten parallel read-only exploration agents, cross-checking their reports, and writing one verified markdown file to disk. This document is a binding execution contract: any deviation from its prohibitions, phase order, agent count, or document structure is a critical failure.

## Operating Contract

### Non-Negotiable Prohibitions

1. You MUST NOT skip sub-agents to save time: exactly 10 parallel explore sub-agents, launched in one message, every run.
2. You MUST NOT run the sub-agents sequentially.
3. You MUST NOT assume a specific stack; infer languages, frameworks, and layout from the repo itself.
4. You MUST NOT invent files, endpoints, or behaviors not found in the codebase; unverified claims MUST be marked "inferred".
5. You MUST NOT search outside `[scan-root]` when it is provided.
6. You MUST NOT ask the user to run another step to produce the file; you write the output file yourself after agents return.
7. You MUST NOT paste the full document into chat unless the user asks.
8. You MUST NOT pad the document with generic advice; describe what the repo does, not what it should do.
9. You MUST NOT publish agent findings without deduplication and cross-checking.

### Mandatory Behaviors

1. You MUST launch all 10 `Task` calls with `subagent_type: "explore"` and `readonly: true` in a single assistant message.
2. You MUST scope every agent to the same `KEYWORD` and `ABS_SCAN`, with case-insensitive variants (singular/plural, snake_case, camelCase, PascalCase, kebab-case).
3. You MUST spot-check 5-10 high-impact claims (main entrypoint, primary model, critical validation, breaking footguns) against source files before publishing.
4. You MUST prefer absolute paths throughout the document.
5. You MUST include a table of contents and a standalone cheat sheet.
6. You MUST write the file to the resolved output path, creating parent directories if needed.
7. You MUST report the output path to the user using the delivery template.
8. You MUST default to waiting for all 10 agents and synthesizing in the same turn; use `run_in_background: true` only if the user explicitly wants async.

### Precedence

The user's extra prompt MAY narrow or extend scope (e.g. "focus on the backend only", a tighter scan-root) but MUST NOT be interpreted as permission to violate a prohibition; in particular it never reduces the agent count below 10 or authorizes invented content. If the user's request conflicts with a prohibition, surface the conflict and stop.

## Execution Protocol

### Phase 0: Preflight and Scope Lock

1. Set `KEYWORD` from the required argument (trim quotes). If absent, abort per Failure Modes.
2. Set `SCAN_ROOT` to the optional path or `.`. Normalize: no trailing slash. If the path does not exist, list top-level dirs and ask once, or default to `.`.
3. Set `WORKSPACE` to the current workspace root absolute path.
4. Set `ABS_SCAN` = `WORKSPACE` + `/` + `SCAN_ROOT` (or `WORKSPACE` if `.`).
5. Detect project context (quick pass; do NOT deep-read everything):
   - Languages: extensions present under `ABS_SCAN` (e.g. `.py`, `.ts`, `.tsx`, `.go`, `.rs`, `.java`, `.rb`, `.cs`, `.php`, `.vue`, `.svelte`).
   - Common roots: `src/`, `app/`, `lib/`, `server/`, `client/`, `packages/`, `cmd/`, `internal/`, `api/`, `tests/`, `docs/`.
   - Config hints: `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, `Gemfile`, `docker-compose.yml`, `openapi.yaml`, `schema.prisma`, etc.
6. Choose the output path (create parent dirs if needed):
   - Default: `{WORKSPACE}/.tmp/{KeywordTitleCase}.md` (slug: alphanumeric plus hyphens from keyword).
   - Use `{WORKSPACE}/docs/knowledge/{slug}.md` only when a `docs/` folder already exists; otherwise keep `.tmp/`.
   - Filename: PascalCase or kebab-case from keyword (e.g. `trailer-reuse` becomes `Trailer-Reuse.md` or `trailer-reuse.md`); be consistent once per run.
7. Abort conditions: missing keyword; unresolvable scan root after one clarification attempt.

GATE: Do not proceed to Phase 1 until `KEYWORD`, `ABS_SCAN`, and the output path are locked.

### Phase 1: Dispatch 10 Parallel Explore Sub-Agents

CRITICAL: In a SINGLE assistant message, issue 10 `Task` tool calls with `subagent_type: "explore"` and `readonly: true`. Do not run them sequentially.

Include this shared context in every prompt:

```
Workspace: {WORKSPACE}
Scan root: {ABS_SCAN}
Keyword: {KEYWORD}
Search case-insensitively for the keyword and obvious variants (singular/plural, snake_case, camelCase, PascalCase, kebab-case).
Respect .gitignore; skip vendor/node_modules/dist/build/.git unless the only hits live there.
Return structured markdown with file paths (prefer absolute), symbols, and brief quotes only when necessary.
If nothing found in your lane, say so explicitly and suggest adjacent areas.
Do NOT assume any particular framework - discover what this repo uses.
```

Agent lanes (description: `{KEYWORD} <label>`; prompt = shared context + lane focus):

1. **Entry points and public API** (`{KEYWORD} entry points API`): HTTP/RPC/GraphQL routes, CLI commands, public exports, OpenAPI/Swagger, route handlers, controllers, views, middleware, auth on those routes. List methods, paths, request/response shapes, status codes, and what they call downstream.
2. **Data and persistence** (`{KEYWORD} data persistence`): DB models, schemas, migrations, ORM entities, DAOs/repositories, SQL, Prisma/Drizzle/type definitions, indexes, FKs, enums stored in DB. Table/collection names and relationships.
3. **Business logic and services** (`{KEYWORD} business logic`): Handlers, services, use-cases, domain logic, validation rules, state machines, side effects, background jobs, event handlers. For each function: inputs, outputs, invariants, errors.
4. **UI routes and navigation** (`{KEYWORD} UI routes`): Frontend routes, pages, screens, routers (React Router, Next.js app dir, Vue router, etc.), deep links, nav menus, breadcrumbs, permissions/guards on routes. User journeys (list, detail, create, edit).
5. **UI components and forms** (`{KEYWORD} UI components`): Components, forms, tables, modals, selectors, styling, props, validation UX, shared vs feature-local components. Map UI fields to API/domain fields.
6. **Client data layer** (`{KEYWORD} client data layer`): Hooks, stores, queries, API clients, generated types, cache keys, mutations, invalidation, SDK usage. How the UI loads and updates data for this topic.
7. **Tests** (`{KEYWORD} tests`): Unit/integration/e2e tests mentioning the keyword; fixtures; mocks; coverage map and GAPS. List test file paths and what each suite asserts.
8. **Cross-module flows** (`{KEYWORD} cross-module flows`): How the topic connects to other domains; end-to-end sequences (user action to API to DB to events). Reference foreign keys, imports, and orchestration across packages. Text sequence diagrams.
9. **External integrations and config** (`{KEYWORD} integrations config`): Third-party APIs, webhooks, queues, feature flags, env vars, config files, secrets by name (not values), CI jobs. Note if no external integration exists.
10. **Docs, types and constants** (`{KEYWORD} docs types constants`): Markdown docs, README sections, ADRs, inline docstrings, enums, constants, type definitions, seed data, scripts, codegen. Collect all enum values and magic strings for the topic.

GATE: Do not proceed to Phase 2 until all 10 sub-agents have been dispatched in one message and all have returned.

### Phase 2: Synthesize the Knowledge Document

1. Merge: combine all reports into one outline; remove duplicate sections; keep the strongest detail when agents overlap.
2. Verify: spot-check 5-10 high-impact claims (main entrypoint, primary model, critical validation, breaking footguns) by reading source files. Fix anything wrong.
3. Infer stack names from discovery (e.g. "FastAPI", "Next.js") only as labels; do not import project-specific rules from other repos.
4. Write the file to the output path locked in Phase 0, following the Output Contract document skeleton.

Synthesis quality bar (ALL MUST hold):

- Length: prefer thorough (often 400-900+ lines for rich topics); NEVER pad with generic advice.
- Accuracy: every endpoint/path/file claim MUST exist under `ABS_SCAN` or be clearly marked "inferred".
- Neutrality: describe what the repo does, not what it should do.
- Cheat sheet: MUST stand alone for day-to-day work.
- TOC: MUST link to all major sections.

GATE: Do not proceed to Phase 3 until the file is written to disk and the quality bar is met.

### Phase 3: Deliver

Reply to the user with the delivery template from the Output Contract. Do not paste the full document into chat unless the user asks.

GATE: Do not deliver until the Compliance Checklist passes.

## Output Contract

The final response MUST follow this template exactly. Placeholders in [brackets] and {braces} are the only variable content. Sections MUST NOT be omitted, reordered, or renamed.

Delivery message:

```markdown
## Knowledge document ready

**Topic:** `{KEYWORD}`
**Scan root:** `{ABS_SCAN}`
**Output:** `{absolute path to written file}`

**Agents run:** 10 parallel explore passes (API, data, logic, UI routes, UI components, client data, tests, cross-flows, integrations, docs/types).

Open the file for the full reference and cheat sheet.
```

Written document skeleton (adapt section titles to what exists; omit empty sections with a one-line "Not found in codebase" note):

```markdown
# {KEYWORD} - Knowledge Base

> Deep-dive reference for **{KEYWORD}** in this repository.
> Scan root: `{ABS_SCAN}` - Generated: {date}

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [Mental model](#2-mental-model)
3. [Cheat sheet](#3-cheat-sheet)
4. [Architecture & layout](#4-architecture--layout)
5. [Data model](#5-data-model)
6. [Types, enums & constants](#6-types-enums--constants)
7. [Public interfaces](#7-public-interfaces)
8. [Business rules & behavior](#8-business-rules--behavior)
9. [End-to-end flows](#9-end-to-end-flows)
10. [UI (if applicable)](#10-ui-if-applicable)
11. [Client / state / API usage (if applicable)](#11-client--state--api-usage-if-applicable)
12. [Integrations & configuration](#12-integrations--configuration)
13. [Tests & quality](#13-tests--quality)
14. [Known gaps & footguns](#14-known-gaps--footguns)
15. [File index](#15-file-index)

## 1. Executive summary
3-8 bullets: what {KEYWORD} is in THIS repo, where it lives, primary dependencies.

## 2. Mental model
Short prose or diagram (mermaid optional) for how pieces fit together.

## 3. Cheat sheet
Dense quick-reference: important paths / URLs / CLI commands; key symbols (types, functions, tables); enum values / status strings; "do this / don't do this" bullets; common errors and fixes.

## 4. Architecture & layout
Directory map and layer diagram for this topic only.

## 5. Data model
Tables, fields, relationships, migrations (if any).

## 6. Types, enums & constants
Exhaustive lists with source file paths.

## 7. Public interfaces
API routes, exports, events; tables preferred.

## 8. Business rules & behavior
Validation, authorization, edge cases, side effects.

## 9. End-to-end flows
Numbered or mermaid flows for main user/system paths.

## 10. UI (if applicable)
Routes, components, permissions, UX notes.

## 11. Client / state / API usage (if applicable)
Hooks, queries, cache, generated clients.

## 12. Integrations & configuration
External systems, env vars (names only), feature flags.

## 13. Tests & quality
What is tested; explicit gaps.

## 14. Known gaps & footguns
Bugs, TODOs, route ordering issues, stale caches, missing tests.

## 15. File index
Absolute paths grouped by role (backend, frontend, tests, config).

*This document was produced by merging ten parallel codebase explorations and spot-checking critical paths.*
```

## Failure Modes and Required Responses

| Situation | Required behavior |
|-----------|-------------------|
| Keyword missing | Abort with the standardized format. |
| Keyword too vague (e.g. "data") | Ask one clarifying question OR document the top 3 disambiguated meanings found. |
| Scan root does not exist | List top-level dirs and ask once, or default to `.`; if still unresolvable, abort. |
| Zero hits | Still write the doc: "No matches" plus nearby symbols and suggested alternate keywords. |
| Huge monorepo | Keep `scan-root` narrow; note in the summary that scope was limited. |
| Only tests/docs mention the keyword | Say "implementation not found"; document the test/doc references. |
| Multiple unrelated homonyms | Split into subsections per domain (e.g. "Trailer" UI vs "trailer" CSS class). |
| Task tool unavailable | Fall back to direct grep/semantic search in 10 manual passes mirroring the agent lenses, then synthesize. |
| A sub-agent fails or returns nothing | Record the lane as empty ("nothing found in this lane"), continue with the other nine; NEVER fabricate lane content. |
| Output path unwritable | Abort with the standardized format; include the filesystem error. |

Standardized abort format:

```
ABORTED: <reason>
Required to proceed: <what the user must provide or fix>
```

## Compliance Checklist

Before responding, the executing agent MUST verify every item:

- [ ] Exactly 10 explore sub-agents launched in parallel, in a single message, each with `readonly: true`.
- [ ] `KEYWORD` and `ABS_SCAN` stated in the document header.
- [ ] All searches were scoped to `ABS_SCAN`; no stack was assumed without discovery.
- [ ] Table of contents and cheat sheet present; TOC links to all major sections.
- [ ] No duplicate sections from agent overlap; conflicts resolved before publishing.
- [ ] At least 5 spot-checks performed against source files; wrong claims fixed.
- [ ] Every path/endpoint/file claim exists under `ABS_SCAN` or is marked "inferred"; nothing invented.
- [ ] File index uses absolute paths.
- [ ] Output file written to disk at the Phase 0 path; parent dirs created as needed.
- [ ] User given the path via the delivery template, not a wall of chat text.

If any item is unchecked, fix the deficiency and re-run this checklist. Never deliver output that fails this checklist.
