---
title: "Subagents"
category: "extensions"
pairs_well_with: ["agent-teams", "context-management", "permissions"]
learn_links: ["storybooks/201/subagents"]
use_links: ["cookbooks/parallel-tasks"]
---

# Subagents

## What it is

Subagents are child Claude instances spawned by the main Claude Code session to handle subtasks independently. When Claude uses the "Task" tool (also called the Agent tool), it creates a new agent with its own context window that works on a scoped problem, then returns results to the parent. Each subagent runs in isolation — it cannot see the parent's conversation history, and it has its own token budget.

## Why you'd use it

Subagents solve two problems: context management and parallelism. A complex task like "refactor all API endpoints to use the new error format" can be broken into per-file subtasks, each handled by a subagent with a fresh context window. This prevents the parent's context from overflowing with file contents. Subagents can also run in parallel, significantly speeding up multi-file operations.

## Configuration reference

### How Claude uses subagents

Claude automatically decides when to spawn subagents based on task complexity. You can also guide it:

```
"Refactor each file in src/api/ to use the new error handler.
 Handle each file as a separate subtask."
```

### Subagent permissions

Subagents inherit the permission settings of the parent session. If `Write` is allowed in the parent, subagents can write too:

```json
{
  "allowedTools": [
    "Read",
    "Write",
    "Bash(npm test)",
    "Task"
  ]
}
```

The `Task` tool itself must be permitted for Claude to spawn subagents.

### Subagent behavior

```
Parent context:                    Subagent context:
┌─────────────────────┐           ┌─────────────────────┐
│ Full conversation   │──spawn──▶ │ Task description    │
│ history             │           │ only                │
│                     │◀─result── │                     │
│ Gets summary back   │           │ Fresh 200K budget   │
└─────────────────────┘           └─────────────────────┘
```

### Controlling subagent depth

Claude can spawn subagents that themselves spawn subagents, though this is rare. Maximum depth is typically limited to prevent runaway recursion.

## Edge cases & gotchas

- Subagents cannot see the parent's conversation. If the parent discussed important context ("use the legacy API endpoint for this service"), you need to include that context in the task description passed to the subagent.
- Subagent results are summarized when returned to the parent. The parent does not see every file read or command run — just the outcome. This means the parent may not notice if a subagent made an incorrect assumption.
- Each subagent incurs its own API costs. Spawning 10 subagents for a simple task can be more expensive than doing it sequentially in one context.
- Subagents share the filesystem. Two parallel subagents writing to the same file can create conflicts. Claude typically coordinates to avoid this, but edge cases exist.
- If a subagent fails or gets stuck, the parent receives an error and may retry or try a different approach. This costs additional tokens.
- The `Task` tool must be in `allowedTools` for subagents to work in headless mode.

## Pairs well with

- **[Agent Teams](/glossary/agent-teams)** — Full multi-agent coordination with git worktree isolation.
- **[Context Management](/glossary/context-management)** — Subagents are a key strategy for managing context limits.
- **[Permissions Model](/glossary/permissions)** — Understanding what subagents can and cannot do.
