---
title: "Set up a new project with Claude Code"
description: "Configure Claude Code for a new TypeScript project with CLAUDE.md, settings, and permissions."
difficulty: "beginner"
category: "project-setup"
features_used: ["CLAUDE.md", "/init", "settings"]
prerequisites: ["storybooks/101/04-claude-md"]
---

# Set up a new project with Claude Code

## Introduction

When you start a new project, spending 5 minutes configuring Claude Code pays off massively. A good CLAUDE.md file means Claude understands your conventions from the first prompt. Proper settings mean fewer permission popups and consistent behavior. This cookbook walks you through the full setup for a new TypeScript project.

## Features Used

This combines **/init** (to bootstrap CLAUDE.md by analyzing your project), **CLAUDE.md** (to document conventions and rules), and **settings.json** (to configure permissions and tool access). Together, these give Claude full context about how to work in your codebase.

## Prerequisites

- A project directory with at least a `package.json` and `tsconfig.json`
- Familiarity with how CLAUDE.md works (see [Understanding CLAUDE.md](/storybooks/101/04-claude-md))

## Step-by-step instructions

### 1. Initialize CLAUDE.md

Navigate to your project root and run:

```bash
claude
```

Then use the init command:

```
> /init
```

Claude analyzes your project structure — package.json, tsconfig, directory layout, existing docs — and generates a starter CLAUDE.md. Review the output and accept it.

### 2. Edit CLAUDE.md with your conventions

Open the generated `CLAUDE.md` and add project-specific rules. Here's a solid template for a TypeScript project:

```markdown
# Project: my-app

## Tech Stack
- TypeScript 5.x with strict mode
- Node.js 20, Express for HTTP
- PostgreSQL with Drizzle ORM
- Vitest for testing

## Conventions
- Use named exports, never default exports
- Prefer `type` over `interface` unless extending
- Error handling: throw typed errors from `src/errors.ts`
- All async functions must have explicit return types
- File naming: kebab-case for files, PascalCase for components

## Project Structure
- `src/routes/` — HTTP route handlers
- `src/services/` — Business logic
- `src/db/` — Database schema and queries
- `src/utils/` — Shared utilities
- `tests/` — Test files mirror src/ structure

## Commands
- `npm run dev` — Start dev server
- `npm test` — Run all tests
- `npm run typecheck` — Check types without emitting
- `npm run lint` — ESLint + Prettier check

## Rules
- Never use `any` type. Use `unknown` and narrow.
- Never commit console.log statements.
- All new endpoints need a corresponding test file.
```

### 3. Create project settings

Create `.claude/settings.json` to configure permissions and tools:

```json
{
  "allowedTools": [
    "Bash(npm run *)",
    "Bash(npx vitest *)",
    "Bash(npx tsc --noEmit)",
    "Bash(npx eslint *)",
    "Bash(npx prettier *)",
    "Read",
    "Edit",
    "Write"
  ]
}
```

This allows Claude to run your project scripts without prompting for permission each time.

### 4. Add a local settings file for personal preferences

Create `.claude/settings.local.json` for machine-specific settings (add this to `.gitignore`):

```json
{
  "allowedTools": [
    "Bash(docker compose *)",
    "Bash(psql *)"
  ]
}
```

### 5. Verify the setup

Start a new Claude Code session and ask it to do something that exercises the config:

```
> Create a new endpoint at GET /api/health that returns { status: "ok" } with a test file
```

Verify that Claude:
- Follows your naming conventions (kebab-case file)
- Uses named exports
- Creates a test file in the right location
- Runs without permission prompts for your allowed tools

### 6. Commit the configuration

```bash
git add CLAUDE.md .claude/settings.json
git commit -m "Add Claude Code project configuration"
```

## Final Result

Your project now has:

```
my-app/
├── CLAUDE.md              # Project conventions and rules
├── .claude/
│   ├── settings.json      # Shared team permissions (committed)
│   └── settings.local.json # Personal settings (gitignored)
├── .gitignore             # Includes .claude/settings.local.json
└── ...
```

Every team member who clones the repo gets consistent Claude Code behavior automatically.

## Variations

- **Monorepo setup**: Place a root CLAUDE.md with shared conventions, then add package-specific CLAUDE.md files in each workspace directory. Claude reads all of them based on which files you're working with.
- **Add skills for common tasks**: Create `.claude/skills/new-endpoint.md` with step-by-step instructions for creating endpoints in your specific framework. Invoke with `/new-endpoint`.
- **Migrate from an existing project**: Run `/init` on a mature codebase — it picks up on existing patterns and documents them for you. Then edit to add any unwritten conventions.
