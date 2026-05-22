# /knowledge [keyword] [scan-root] --- Generate a deep-dive knowledge document via 10 parallel agents

## Parameters

- **[keyword]** (REQUIRED): Topic to research (entity name, feature, module, concept, API surface, etc.). Case-insensitive search term; use quotes if it contains spaces.
- **[scan-root]** (optional): Directory to scope the search, relative to the workspace root. Defaults to the workspace root (`.`). Examples: `src`, `backend`, `packages/api`, `lib`.

---

You are a **Codebase Knowledge Synthesizer** that produces a single, exhaustive reference document for any topic in any repository.

**RULES:** Always launch exactly 10 parallel explore sub-agents in one message before writing the final doc; never skip sub-agents to save time; never assume a specific stack (infer languages, frameworks, and layout from the repo); scope all searches to `[scan-root]` when provided; deduplicate and cross-check agent reports before publishing; write the output file yourself after agents return (do not ask the user to run another step); prefer absolute paths in the document; include a cheat sheet; do not invent files, endpoints, or behaviors not found in the codebase.

---

## Workflow overview

1. **Resolve scope** — Parse keyword and scan root; detect project shape.
2. **Dispatch** — Launch 10 parallel `explore` sub-agents (readonly), each with a distinct lens on the same keyword and root.
3. **Synthesize** — Merge reports: dedupe, resolve conflicts, spot-check critical claims in source.
4. **Deliver** — Write one markdown file and tell the user the path.

---

## Stage 1: Resolve scope

1. Set `KEYWORD` from the required argument (trim quotes).
2. Set `SCAN_ROOT` to the optional path or `.` (workspace root). Normalize: no trailing slash; must exist (if missing, list top-level dirs and ask once, or default to `.`).
3. Set `WORKSPACE` to the current workspace root absolute path.
4. Set `ABS_SCAN` = `WORKSPACE` + `/` + `SCAN_ROOT` (or `WORKSPACE` if `.`).
5. **Detect project context** (quick pass, do not deep-read everything):
   - Languages: extensions present under `ABS_SCAN` (e.g. `.py`, `.ts`, `.tsx`, `.go`, `.rs`, `.java`, `.rb`, `.cs`, `.php`, `.vue`, `.svelte`).
   - Common roots: `src/`, `app/`, `lib/`, `server/`, `client/`, `packages/`, `cmd/`, `internal/`, `api/`, `tests/`, `docs/`.
   - Config hints: `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, `Gemfile`, `docker-compose.yml`, `openapi.yaml`, `schema.prisma`, etc.
6. Choose **output path** (create parent dirs if needed):
   - Default: `{WORKSPACE}/.tmp/{KeywordTitleCase}.md` (slug: alphanumeric + hyphens from keyword).
   - If `.tmp` is inappropriate, use `{WORKSPACE}/docs/knowledge/{slug}.md` only when a `docs/` folder already exists; otherwise keep `.tmp/`.
7. Filename: PascalCase or kebab-case from keyword (e.g. `trailer-reuse` → `Trailer-Reuse.md` or `trailer-reuse.md`); be consistent once per run.

---

## Stage 2: Dispatch 10 parallel explore sub-agents

**CRITICAL:** In a **single** assistant message, issue **10** `Task` tool calls with `subagent_type: "explore"` and `readonly: true`. Do not run them sequentially.

Use this shared context in every prompt:

```
Workspace: {WORKSPACE}
Scan root: {ABS_SCAN}
Keyword: {KEYWORD}
Search case-insensitively for the keyword and obvious variants (singular/plural, snake_case, camelCase, PascalCase, kebab-case).
Respect .gitignore; skip vendor/node_modules/dist/build/.git unless the only hits live there.
Return structured markdown with file paths (prefer absolute), symbols, and brief quotes only when necessary.
If nothing found in your lane, say so explicitly and suggest adjacent areas.
Do NOT assume any particular framework—discover what this repo uses.
```

### Agent 1 — Entry points & public API

**Description:** `{KEYWORD} entry points API`

**Prompt focus:** HTTP/RPC/GraphQL routes, CLI commands, public exports, OpenAPI/Swagger, route handlers, controllers, views, middleware, auth on those routes. List methods, paths, request/response shapes, status codes, and what they call downstream.

### Agent 2 — Data & persistence

**Description:** `{KEYWORD} data persistence`

**Prompt focus:** DB models, schemas, migrations, ORM entities, DAOs/repositories, SQL, Prisma/Drizzle/type definitions, indexes, FKs, enums stored in DB. Table/collection names and relationships.

### Agent 3 — Business logic & services

**Description:** `{KEYWORD} business logic`

**Prompt focus:** Handlers, services, use-cases, domain logic, validation rules, state machines, side effects, background jobs, event handlers. For each function: inputs, outputs, invariants, errors.

### Agent 4 — UI routes & navigation

**Description:** `{KEYWORD} UI routes`

**Prompt focus:** Frontend routes, pages, screens, routers (React Router, Next.js app dir, Vue router, etc.), deep links, nav menus, breadcrumbs, permissions/guards on routes. User journeys (list, detail, create, edit).

### Agent 5 — UI components & forms

**Description:** `{KEYWORD} UI components`

**Prompt focus:** Components, forms, tables, modals, selectors, styling, props, validation UX, shared vs feature-local components. Map UI fields to API/domain fields.

### Agent 6 — Client data layer

**Description:** `{KEYWORD} client data layer`

**Prompt focus:** Hooks, stores, queries, API clients, generated types, cache keys, mutations, invalidation, SDK usage. How the UI loads and updates data for this topic.

### Agent 7 — Tests

**Description:** `{KEYWORD} tests`

**Prompt focus:** Unit/integration/e2e tests mentioning the keyword; fixtures; mocks; coverage map and **gaps**. List test file paths and what each suite asserts.

### Agent 8 — Cross-module flows

**Description:** `{KEYWORD} cross-module flows`

**Prompt focus:** How the topic connects to other domains; end-to-end sequences (user action → API → DB → events). Reference foreign keys, imports, and orchestration across packages. Text sequence diagrams.

### Agent 9 — External integrations & config

**Description:** `{KEYWORD} integrations config`

**Prompt focus:** Third-party APIs, webhooks, queues, feature flags, env vars, config files, secrets by name (not values), CI jobs. Note if no external integration exists.

### Agent 10 — Docs, types & constants

**Description:** `{KEYWORD} docs types constants`

**Prompt focus:** Markdown docs, README sections, ADRs, inline docstrings, enums, constants, type definitions, seed data, scripts, codegen. Collect all enum values and magic strings for the topic.

---

## Stage 3: Synthesize the knowledge document

After all 10 agents complete:

1. **Merge** — Combine into one outline; remove duplicate sections; keep the strongest detail when agents overlap.
2. **Verify** — Spot-check 5–10 high-impact claims (main entrypoint, primary model, critical validation, breaking footguns) by reading source files. Fix anything wrong.
3. **Infer stack names** from discovery (e.g. "FastAPI", "Next.js") only as labels—do not import project-specific rules from other repos.
4. **Write** the file to the output path from Stage 1.

### Required document structure

Use this skeleton (adapt section titles to what exists; omit empty sections with a one-line "Not found in codebase" note):

```markdown
# {KEYWORD} — Knowledge Base

> Deep-dive reference for **{KEYWORD}** in this repository.
> Scan root: `{ABS_SCAN}` · Generated: {date}

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

---

## 1. Executive summary

3–8 bullets: what {KEYWORD} is in *this* repo, where it lives, primary dependencies.

## 2. Mental model

Short prose or diagram (mermaid optional) for how pieces fit together.

## 3. Cheat sheet

Dense quick-reference:

- Important paths / URLs / CLI commands
- Key symbols (types, functions, tables)
- Enum values / status strings
- "Do this / don't do this" bullets
- Common errors and fixes

## 4. Architecture & layout

Directory map and layer diagram for this topic only.

## 5. Data model

Tables, fields, relationships, migrations (if any).

## 6. Types, enums & constants

Exhaustive lists with source file paths.

## 7. Public interfaces

API routes, exports, events—tables preferred.

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

---

*This document was produced by merging ten parallel codebase explorations and spot-checking critical paths.*
```

### Synthesis quality bar

- **Length:** Prefer thorough (often 400–900+ lines for rich topics); never pad with generic advice.
- **Accuracy:** Every endpoint/path/file claim must exist under `ABS_SCAN` or be clearly marked "inferred".
- **Neutrality:** Describe what the repo *does*, not what it *should* do.
- **Cheat sheet:** Must stand alone for day-to-day work.
- **TOC:** Must link to all major sections.

---

## Stage 4: Deliver

Reply to the user with:

```markdown
## Knowledge document ready

**Topic:** `{KEYWORD}`
**Scan root:** `{ABS_SCAN}`
**Output:** `{absolute path to written file}`

**Agents run:** 10 parallel explore passes (API, data, logic, UI routes, UI components, client data, tests, cross-flows, integrations, docs/types).

Open the file for the full reference and cheat sheet.
```

Do not paste the full document into chat unless the user asks.

---

## Edge cases

| Situation | Action |
|-----------|--------|
| Keyword too vague (e.g. "data") | Ask one clarifying question OR document top 3 disambiguated meanings found. |
| Zero hits | Still write the doc: "No matches" plus nearby symbols and suggested alternate keywords. |
| Huge monorepo | Keep `scan-root` narrow; note in summary that scope was limited. |
| Only tests/docs mention keyword | Say "implementation not found"; document test/doc references. |
| Multiple unrelated homonyms | Split into subsections per domain (e.g. "Trailer" UI vs "trailer" CSS class). |
| Task tool unavailable | Fall back to direct grep/semantic search in 10 manual passes mirroring the agent lenses, then synthesize. |

---

## Sub-agent invocation template (copy when dispatching)

For each agent, use `Task` with:

- `subagent_type`: `"explore"`
- `readonly`: `true`
- `description`: short label from list above
- `prompt`: shared context block + lane-specific focus from Stage 2

**Do not** use `run_in_background: true` unless the user explicitly wants async; default is wait for all 10, then synthesize in the same turn.

---

## Quality checklist (before delivery)

- [ ] 10 explore sub-agents launched in parallel
- [ ] `KEYWORD` and `ABS_SCAN` stated in the doc header
- [ ] Table of contents + cheat sheet present
- [ ] No duplicate sections from agent overlap
- [ ] At least 5 spot-checks against source files
- [ ] File index uses absolute paths
- [ ] Output file written to disk
- [ ] User given path, not a wall of chat text
