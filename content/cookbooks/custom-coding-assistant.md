---
title: "Build a custom coding assistant for your team"
description: "Create a team-standard Claude Code setup with shared conventions, custom skills, and integrated tools."
difficulty: "intermediate"
category: "team-workflows"
features_used: ["CLAUDE.md", "skills", "hooks", "MCP"]
prerequisites: ["storybooks/101/04-claude-md", "storybooks/201/hooks"]
---

# Build a custom coding assistant for your team

## Introduction

Out of the box, Claude Code is a general-purpose coding assistant. But when you layer on your team's conventions, custom skills for repeated tasks, and MCP servers for your internal tools, it becomes a bespoke assistant that knows your codebase deeply. This cookbook shows you how to package that setup so every team member gets the same powerful experience.

## Features Used

This combines **CLAUDE.md** (conventions and rules), **skills** (reusable task templates in `.claude/skills/`), **hooks** (automated quality gates), and **MCP** (connecting Claude to external tools like databases or internal APIs). Together, these make Claude behave like a senior team member who knows all your patterns.

## Prerequisites

- A team repository where you can commit shared configuration
- Understanding of CLAUDE.md and hooks (see relevant storybook chapters)

## Step-by-step instructions

### 1. Write a comprehensive CLAUDE.md

Start with a CLAUDE.md that encodes your team's engineering standards:

```markdown
# Project: acme-platform

## Architecture
- Microservices in `services/`, shared libs in `packages/`
- Each service has its own Dockerfile and deployment config
- Communication between services via gRPC (protos in `proto/`)

## Code Standards
- TypeScript strict mode, no `any`
- Use Result<T, E> pattern for error handling (from `packages/result`)
- All public functions require JSDoc with @param and @returns
- Database queries go through repository classes, never raw SQL in services
- Feature flags via LaunchDarkly — check `packages/feature-flags`

## Testing
- Unit tests: Vitest, co-located as `*.test.ts`
- Integration tests: in `tests/integration/`, use testcontainers
- Coverage threshold: 80% for new code
- Always test error paths, not just happy paths

## Git Conventions
- Branch format: `<type>/<ticket>-<description>` (e.g., `feat/ACME-123-user-auth`)
- Commit format: `<type>(scope): message` (conventional commits)
- Always squash-merge to main

## Deployment
- Staging: merges to `main` auto-deploy
- Production: tag with `v*` pattern triggers release
- Rollback: `npm run rollback -- --service <name>`
```

### 2. Create custom skills for repeated tasks

Create `.claude/skills/` directory and add skills for common team workflows:

**`.claude/skills/new-service.md`** — Scaffold a new microservice:

```markdown
# New Service

Create a new microservice with our standard structure.

## Steps
1. Create directory at `services/<name>/`
2. Add these files following existing services as templates:
   - `src/index.ts` — entry point with graceful shutdown
   - `src/server.ts` — gRPC server setup
   - `src/config.ts` — env var config with validation
   - `src/health.ts` — health check endpoint
   - `Dockerfile` — multi-stage build
   - `package.json` — with standard scripts
   - `tsconfig.json` — extending root config
   - `vitest.config.ts`
3. Register the service in `turbo.json`
4. Add deployment config in `infra/k8s/<name>/`
```

**`.claude/skills/new-endpoint.md`** — Add a gRPC endpoint:

```markdown
# New Endpoint

Add a new gRPC endpoint to an existing service.

## Steps
1. Define the message and RPC in the proto file at `proto/<service>.proto`
2. Run `npm run proto:generate` to generate TypeScript types
3. Implement the handler in `services/<service>/src/handlers/`
4. Add validation using zod schema
5. Write unit test for the handler
6. Write integration test with test client
7. Update the service's README with the new endpoint
```

### 3. Set up hooks for quality gates

Add hooks to `.claude/settings.json` that enforce your standards:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "npx eslint --fix $CLAUDE_FILE_PATH 2>/dev/null; npx prettier --write $CLAUDE_FILE_PATH"
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "command": "npx tsc --noEmit --pretty 2>&1 | head -20"
      }
    ]
  },
  "allowedTools": [
    "Bash(npm run *)",
    "Bash(npx vitest *)",
    "Bash(npx tsc *)",
    "Bash(npx eslint *)",
    "Bash(npx prettier *)",
    "Bash(npx turbo *)",
    "Bash(git *)",
    "Read",
    "Edit",
    "Write"
  ]
}
```

The `Stop` hook runs a typecheck whenever Claude finishes a task, catching any type errors before you review.

### 4. Configure MCP for team tools

If your team uses internal tools, add MCP server configuration to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "internal-api": {
      "command": "npx",
      "args": ["@acme/mcp-internal-api"],
      "env": {
        "API_BASE_URL": "https://internal.acme.dev"
      }
    },
    "database": {
      "command": "npx",
      "args": ["@acme/mcp-database", "--readonly"],
      "env": {
        "DATABASE_URL": "postgresql://readonly@db.acme.dev/main"
      }
    }
  }
}
```

This gives Claude access to your internal API docs and read-only database queries without any additional setup per developer.

### 5. Package and commit everything

Verify your `.claude/` directory structure:

```
.claude/
├── settings.json         # Hooks, permissions, MCP (committed, shared)
└── skills/
    ├── new-service.md    # Scaffold a microservice
    └── new-endpoint.md   # Add a gRPC endpoint
CLAUDE.md                 # Conventions and rules
```

Commit it all:

```bash
git add CLAUDE.md .claude/
git commit -m "feat: add Claude Code team configuration"
```

### 6. Onboard team members

Share a brief onboarding note with your team:

```
Claude Code is configured for this repo. After cloning:
1. Install Claude Code: npm i -g @anthropic-ai/claude-code
2. Run `claude` in the repo root
3. Try `/new-service` to scaffold a service
4. Try `/new-endpoint` to add an endpoint
5. Claude knows our conventions — just describe what you want
```

## Final Result

Your team now has a customized Claude Code that:

- Knows your architecture and conventions (CLAUDE.md)
- Has reusable workflows for common tasks (skills)
- Auto-formats and typechecks after every change (hooks)
- Can query internal tools and databases (MCP)

Every developer gets a consistent, powerful assistant from the moment they clone the repo.

## Variations

- **Role-based skills**: Create separate skills for frontend (`/new-component`) and backend (`/new-migration`) work.
- **Onboarding skill**: Create a `/onboard` skill that walks new hires through the codebase, explaining architecture decisions and key files.
- **Review checklist skill**: Create a `/pre-pr` skill that runs your team's full PR checklist (types pass, tests pass, no TODOs, docs updated) before submitting.
