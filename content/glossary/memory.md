---
title: "Memory & CLAUDE.md"
category: "core"
pairs_well_with: ["settings", "effective-claude-md"]
learn_links: ["storybooks/101/05-memory"]
use_links: ["cookbooks/team-conventions"]
---

# Memory & CLAUDE.md

## What it is

CLAUDE.md files are markdown documents that provide persistent instructions to Claude Code. They serve as project memory — coding conventions, architecture decisions, tool preferences, and workflow rules that Claude reads automatically at the start of every session. Think of them as a README specifically for your AI pair programmer.

## Why you'd use it

Without CLAUDE.md, you'd repeat the same instructions every session: "use tabs not spaces," "run pytest not unittest," "the API lives in src/api/." CLAUDE.md files make these instructions permanent. They also enable team-wide conventions — check a CLAUDE.md into your repo and every team member's Claude sessions follow the same rules.

## Configuration reference

### File locations (in priority order)

```
~/.claude/CLAUDE.md              # Global — applies to all projects
<repo-root>/CLAUDE.md            # Project — checked into git, shared with team
<repo-root>/.claude/CLAUDE.md    # Project (alternative location)
<subdirectory>/CLAUDE.md         # Scoped — applies when working in that directory
```

All CLAUDE.md files found in the path hierarchy are loaded and combined. More specific files can override or extend more general ones.

### Auto-memory

Claude Code can automatically remember things you tell it during a session. When you say something like "always use single quotes in this project," Claude may save it to a memory file:

```
~/.claude/projects/<project-path>/memory/MEMORY.md
```

This file persists across sessions and is loaded automatically. You can also edit it directly.

### Example CLAUDE.md

```markdown
# Project Conventions

## Tech Stack
- TypeScript with strict mode
- React 18 with functional components only
- Tailwind CSS for styling
- Vitest for testing

## Commands
- Run tests: `npm test`
- Lint: `npm run lint`
- Build: `npm run build`

## Rules
- Never use `any` type — use `unknown` and narrow
- All API responses must be validated with Zod
- Prefer named exports over default exports
- Test files live next to source: `foo.ts` -> `foo.test.ts`

## Architecture
- `src/api/` — API route handlers
- `src/domain/` — Business logic, no framework imports
- `src/infra/` — Database, external services
```

### In-session memory commands

```
/memory          # View current memory state
```

## Edge cases & gotchas

- CLAUDE.md files are read at session start. If you edit one mid-session, Claude will not see the changes until the next session (or until it re-reads the file).
- Very large CLAUDE.md files consume context window tokens. Keep them concise — 200-500 lines is a good target. Use bullet points, not prose.
- Auto-memory is append-only within a session. If Claude saves something incorrect, edit the MEMORY.md file directly to fix it.
- Subdirectory CLAUDE.md files only apply when Claude is working on files in that directory. They do not override the root CLAUDE.md — they augment it.
- The global `~/.claude/CLAUDE.md` applies to every project. Be careful not to put project-specific rules there.

## Pairs well with

- **[Writing Effective CLAUDE.md](/glossary/effective-claude-md)** — Best practices and patterns.
- **[Settings](/glossary/settings)** — Settings.json handles tool permissions; CLAUDE.md handles behavioral instructions.
- **[Skills System](/glossary/skills)** — Skills can reference CLAUDE.md conventions for consistency.
