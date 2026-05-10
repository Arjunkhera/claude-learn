---
title: "Parallel monorepo refactoring"
description: "Use subagents to rename a shared utility across multiple packages simultaneously."
difficulty: "advanced"
category: "team-workflows"
features_used: ["subagents", "agent teams", "worktrees"]
prerequisites: ["storybooks/101/04-claude-md", "storybooks/201/subagents"]
---

# Parallel monorepo refactoring

## Introduction

Renaming a shared utility across a monorepo is tedious — you need to update imports, type references, and tests in every package that uses it. With Claude Code's subagent system, you can dispatch parallel agents to handle each package independently, then verify everything compiles together. A 45-minute manual refactor becomes a 3-minute coordinated operation.

## Features Used

This cookbook uses **subagents** (the Agent tool to launch independent Claude instances per package), **worktrees** (so agents don't conflict on the filesystem), and **CLAUDE.md** (so each agent understands the monorepo conventions). The orchestrating agent coordinates the work and runs the final validation.

## Prerequisites

- A monorepo with multiple packages (e.g., Turborepo, Nx, or pnpm workspaces)
- Understanding of Claude Code basics and CLAUDE.md
- Familiarity with the Agent tool concept (see subagents storybook)

## Step-by-step instructions

### 1. Identify the scope of the rename

First, determine which packages reference the utility you want to rename. Start Claude Code and ask:

```
> Find all imports of `formatCurrency` across the monorepo. List each package that uses it.
```

Expected output:

```
Found `formatCurrency` in 5 packages:
- packages/shared-utils (definition)
- packages/web-app (12 imports)
- packages/mobile-app (8 imports)
- packages/admin-dashboard (5 imports)
- packages/billing-service (3 imports)
```

### 2. Create the refactoring plan

Ask Claude to build a plan before dispatching agents:

```
> Plan a rename of `formatCurrency` to `formatMoneyAmount` across all packages.
> The function signature stays the same — only the name changes.
> Create a step-by-step plan for each package.
```

Claude produces a plan that covers: update the export in shared-utils, then update every import and usage in each consuming package.

### 3. Execute with parallel subagents

Now ask Claude to dispatch subagents — one per package:

```
> Execute this refactoring using parallel subagents. One agent per package.
> Update shared-utils first, then dispatch the others in parallel.
```

Claude uses the Agent tool to launch independent workers:

```
Dispatching Agent: "Update shared-utils"
  → Rename export from formatCurrency to formatMoneyAmount
  → Update internal references
  → Update JSDoc and comments

Dispatching Agent: "Update web-app" (parallel)
  → Update 12 import statements
  → Update all call sites

Dispatching Agent: "Update mobile-app" (parallel)
  → Update 8 import statements
  → Update all call sites

Dispatching Agent: "Update admin-dashboard" (parallel)
  → Update 5 import statements
  → Update all call sites

Dispatching Agent: "Update billing-service" (parallel)
  → Update 3 import statements
  → Update all call sites
```

Each subagent works in its own context, focusing only on its package.

### 4. Verify consistency

After all agents complete, the orchestrator runs a full build:

```
> Run typecheck and tests across the entire monorepo to verify the refactoring.
```

```bash
npx turbo run typecheck test
```

Expected output:

```
 packages/shared-utils:typecheck: ✓
 packages/web-app:typecheck: ✓
 packages/mobile-app:typecheck: ✓
 packages/admin-dashboard:typecheck: ✓
 packages/billing-service:typecheck: ✓
 packages/shared-utils:test: 42 passed
 packages/web-app:test: 128 passed
 ...
```

### 5. Review the complete diff

Ask Claude to summarize what was changed:

```
> Show me a summary of all changes made across packages.
```

```
Total changes:
- 5 packages modified
- 28 files updated
- 0 type errors
- 0 test failures
- Function renamed: formatCurrency → formatMoneyAmount
```

### 6. Commit the changes

Once verified, commit as a single atomic change:

```bash
git add -A
git commit -m "refactor: rename formatCurrency to formatMoneyAmount across all packages"
```

## Final Result

The parallel refactoring workflow looks like this:

1. **Discover** — Find all references across the monorepo
2. **Plan** — Build a package-by-package execution plan
3. **Dispatch** — Launch subagents for each package in parallel
4. **Verify** — Run full typecheck and test suite
5. **Commit** — One atomic commit with all changes

Subagents handle isolated, well-scoped work. The orchestrator handles sequencing and verification.

## Variations

- **API migration**: Rename a REST endpoint path. Dispatch agents for the backend route, OpenAPI spec, frontend API client, and integration tests simultaneously.
- **Dependency upgrade**: Dispatch agents to update a dependency in each package — each handles its own breaking changes and test fixes.
- **Sequential with checkpoints**: For riskier refactors, run agents one package at a time, verifying typecheck passes after each before proceeding to the next.
