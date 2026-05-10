---
title: "CLAUDE.md"
chapter: 4
track: "101"
difficulty: "beginner"
features_used: ["claude-md", "project-instructions"]
cross_links: ["glossary/claude-md", "cookbooks/writing-effective-instructions"]
description: "How CLAUDE.md files give Claude project-specific context that improves every interaction."
---

# CLAUDE.md

After running `/init` in Chapter 3, Arjun has a starter `CLAUDE.md` in his monorepo root. But he's noticed something frustrating: every time he asks Claude to write code, it uses CommonJS `require()` syntax — even though the project uses ES modules everywhere. Claude is smart, but it doesn't automatically know the team's preferences unless you tell it.

CLAUDE.md is how you tell it. These are plain markdown files that Claude reads automatically at the start of every session. They contain project-specific instructions: coding conventions, build commands, architecture decisions, things Claude should always or never do. Think of them as onboarding docs for your AI pair programmer.

The difference between a generic Claude Code session and one with a good CLAUDE.md is dramatic. Without it, Claude guesses. With it, Claude follows your team's actual patterns.

## Example 1: Writing Effective Project Instructions

Arjun edits his `CLAUDE.md` to include the conventions that matter most:

```markdown
# Legacy Monorepo

## Build & Test
- Build all packages: `turbo run build`
- Run tests: `turbo run test`
- Lint: `npm run lint` (ESLint + Prettier)

## Code Conventions
- Use ES module syntax (import/export), never CommonJS
- Error handling: always use the AppError class from packages/shared/errors.js
- API routes return { data, error, meta } shape
- Use async/await, never raw Promises with .then()

## Architecture
- Monorepo with three packages: api, worker, dashboard
- Shared utilities in packages/shared/
- API uses Express with middleware pattern
- Worker uses Bull queues with Redis

## Important Notes
- Do NOT modify packages/dashboard/ — it's being rewritten separately
- The .env.example file has the correct variable names
- Tests use Jest with the --runInBand flag (shared test database)
```

Now when Arjun asks Claude to add a new endpoint, it uses ES modules, wraps errors in AppError, returns the correct response shape, and stays out of the dashboard package. No reminders needed.

## Example 2: Multiple CLAUDE.md Locations

As Arjun works deeper in the API package, he realizes some instructions only apply there — not to the whole monorepo. He creates a package-level file:

```
packages/api/CLAUDE.md
```

```markdown
# API Package

## Route Conventions
- All routes go in src/routes/ with one file per resource
- Middleware chain: auth → validate → handler
- Validation uses Joi schemas in src/schemas/

## Database
- Knex.js for queries, migrations in db/migrations/
- Always use transactions for multi-table writes
- Connection pool is limited to 10 — never run parallel queries in loops
```

Claude reads CLAUDE.md files hierarchically. When Arjun is working in `packages/api/`, Claude sees both the root-level instructions AND the package-level ones. The specificity cascades — general project rules plus local package rules.

The full lookup order is:
1. `~/.claude/CLAUDE.md` — your personal global instructions (applies to all projects)
2. `CLAUDE.md` at the repo root — project-wide conventions
3. `CLAUDE.md` in subdirectories — package or module-specific rules

## Watch Out

Keep your CLAUDE.md concise and actionable. Claude reads these instructions every session, and they consume context window space. A 2,000-word essay about your architecture philosophy is less useful than a 200-word list of concrete rules. Focus on what Claude should *do differently* — the commands to run, the patterns to follow, the mistakes to avoid. If Claude would figure it out by reading the code anyway, you don't need to write it down.

## Try It

Create or edit a `CLAUDE.md` in your project root with at least these sections:

```markdown
# [Your Project Name]

## Build & Test
- Build: `[your build command]`
- Test: `[your test command]`
- Lint: `[your lint command]`

## Code Conventions
- [One rule Claude should always follow]
- [One thing Claude should never do]
```

Then start a new Claude Code session and ask it to write some code. Notice how it follows your conventions without being asked. That's the power of good project instructions — you set them once, and every session benefits.
