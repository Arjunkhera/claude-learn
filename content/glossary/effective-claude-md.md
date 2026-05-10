---
title: "Writing Effective CLAUDE.md"
category: "guides"
pairs_well_with: ["memory", "settings", "overview"]
learn_links: ["storybooks/101/05-memory"]
use_links: ["cookbooks/team-conventions"]
---

# Writing Effective CLAUDE.md

## What it is

A guide to crafting CLAUDE.md files that actually improve Claude Code's performance on your project. A well-written CLAUDE.md is the single highest-leverage configuration you can make — it teaches Claude your project's conventions, architecture, and workflows in a format it can act on immediately. A poorly written one wastes context tokens on information Claude cannot use.

## Why you'd use it

The difference between a generic Claude Code session and one tailored to your project is dramatic. With a good CLAUDE.md, Claude generates code in your style, runs the right commands, avoids known pitfalls, and understands your architecture without being told each session. Without one, Claude guesses at conventions and you spend time correcting.

## Configuration reference

### Structure that works

Organize your CLAUDE.md with clear sections that map to how Claude uses information:

```markdown
# Project: MyApp

## Commands
- Test: `npm test`
- Lint: `npm run lint`  
- Build: `npm run build`
- Single test: `npm test -- --grep "pattern"`

## Architecture
- `src/api/` — Express route handlers
- `src/domain/` — Pure business logic (no I/O)
- `src/infra/` — Database, external APIs, filesystem

## Conventions
- TypeScript strict mode, no `any`
- Functional components only (no class components)
- Named exports (no default exports)
- Tests colocated: `foo.ts` → `foo.test.ts`
- Error handling: wrap in Result<T, E> type, never throw

## Patterns
- API routes: validate input with Zod → call domain function → format response
- Database: always use transactions for multi-step writes
- Auth: middleware checks JWT, attaches `req.user`

## Do NOT
- Do not modify package-lock.json manually
- Do not add dependencies without checking bundle size
- Do not use relative imports across module boundaries (use path aliases)
```

### Effective patterns

**Be imperative, not descriptive.** Tell Claude what to do, not what the project is about.

```markdown
# Bad — descriptive, not actionable
This project uses TypeScript and React. We care about code quality.

# Good — imperative, actionable
- Use TypeScript strict mode. Never use `any` — use `unknown` and narrow.
- All React components must be functional with typed props interfaces.
- Run `npm run typecheck` before considering any change complete.
```

**Include commands Claude will need:**

```markdown
## Common Tasks
- Run specific test: `npx vitest run src/path/to/file.test.ts`
- Generate migration: `npx prisma migrate dev --name <name>`
- Check types: `npx tsc --noEmit`
- Preview docs: `npm run docs:dev`
```

**Document non-obvious patterns:**

```markdown
## Gotchas
- The `user` table is in the `auth` schema, not `public`
- Environment variables are validated at startup — add new ones to `src/config.ts`
- The CI uses Node 18 but local dev uses Node 20 — avoid Node 20-only APIs
```

### Anti-patterns to avoid

```markdown
# Too vague — Claude cannot act on this
Write good code. Follow best practices. Be careful.

# Too verbose — wastes context tokens
[500 lines of project history and design philosophy]

# Too restrictive — hampers Claude's effectiveness
Never create new files. Never modify existing tests.
Always ask before making any change.
```

### Size guidelines

- **Aim for 100-300 lines.** Enough to be comprehensive, short enough to not waste context.
- **Use bullet points over prose.** Faster for Claude to parse, less token waste.
- **Prioritize commands and rules over explanations.** Claude needs actionable instructions.

### Team vs. personal

```markdown
# CLAUDE.md (checked into repo — team conventions)
Objective rules everyone follows.

# ~/.claude/CLAUDE.md (personal — individual preferences)
Your personal style preferences that do not affect the team.
```

## Edge cases & gotchas

- CLAUDE.md is loaded into context at session start. A 1000-line file consumes ~2-3K tokens of your 200K budget before you have even asked a question.
- Contradictory instructions confuse Claude. If your CLAUDE.md says "never use any" but your codebase is full of `any`, Claude will be uncertain about which to follow.
- Overly restrictive rules ("never create files") can prevent Claude from completing legitimate tasks. Be restrictive about what matters; be permissive about how Claude achieves goals.
- CLAUDE.md in subdirectories only applies when Claude is working in that directory. Global rules go in the root.
- Keep CLAUDE.md up to date. Stale instructions (referencing old tools, deprecated patterns) actively mislead Claude.

## Pairs well with

- **[Memory & CLAUDE.md](/glossary/memory)** — How CLAUDE.md files are loaded and combined.
- **[Settings](/glossary/settings)** — Settings handle tooling permissions; CLAUDE.md handles behavioral rules.
- **[Claude Code Overview](/glossary/overview)** — Understanding what Claude Code does helps you write better instructions for it.
