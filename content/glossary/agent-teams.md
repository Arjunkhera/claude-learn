---
title: "Agent Teams"
category: "extensions"
pairs_well_with: ["subagents", "hooks", "ci-cd"]
learn_links: ["storybooks/301/agent-teams"]
use_links: ["cookbooks/multi-agent-refactor"]
---

# Agent Teams

## What it is

Agent Teams enable multiple Claude Code agents to coordinate on complex tasks, each working in isolated git worktrees. Unlike basic subagents (which share a filesystem), agent teams get full repository copies where they can make independent changes without conflicts. A coordinating agent delegates work, and each team member operates autonomously before their changes are merged back.

## Why you'd use it

Large-scale changes that span multiple subsystems benefit from parallelism with isolation. Refactoring a monorepo, implementing a feature that touches frontend and backend simultaneously, or running parallel experiments on different approaches — agent teams let multiple Claude instances work without stepping on each other's changes. Each agent has its own branch and worktree.

## Configuration reference

### How agent teams work

```
Coordinator Agent
├── Agent A (worktree: feature-auth)
│   └── Works on authentication changes
├── Agent B (worktree: feature-api)
│   └── Works on API endpoint changes
└── Agent C (worktree: feature-tests)
    └── Works on test updates
```

### Git worktree isolation

Each team member operates in a separate git worktree:

```bash
# Worktrees created automatically by the coordination system
.git/worktrees/
├── feature-auth/
├── feature-api/
└── feature-tests/
```

### Coordination patterns

The coordinating agent:
1. Analyzes the task and decomposes it into independent subtasks
2. Creates worktrees for each subtask
3. Spawns agents with specific instructions per worktree
4. Monitors progress and handles dependencies
5. Merges results back to the main branch

### Enabling agent teams

Agent teams require the Task tool and git to be available:

```json
{
  "allowedTools": [
    "Task",
    "Read",
    "Write",
    "Bash(git *)"
  ]
}
```

## Edge cases & gotchas

- Git worktrees share the same `.git` directory. Operations like `git stash` in one worktree can affect others. Agents typically use branches to avoid this.
- Merge conflicts can arise when combining results from multiple agents. The coordinator handles these but may need additional turns (and tokens) to resolve them.
- Each agent in the team has its own context window and API costs. A team of 4 agents costs roughly 4x a single agent for the same amount of work (though wall-clock time is reduced).
- Agent teams work best for tasks that are naturally parallelizable. Highly sequential tasks (where step B depends on step A's output) do not benefit from teams.
- Worktree cleanup is important. Abandoned worktrees consume disk space. Use `git worktree prune` to clean up.
- Network-intensive operations (npm install, docker pull) in multiple worktrees simultaneously can strain bandwidth.

## Pairs well with

- **[Subagents](/glossary/subagents)** — Subagents for lightweight parallelism; agent teams for full isolation.
- **[CI/CD](/glossary/ci-cd)** — Agent teams can be orchestrated in CI for automated large-scale changes.
- **[Hooks](/glossary/hooks)** — PostToolUse hooks can trigger coordination logic.
