---
title: "The Agentic Loop"
category: "concepts"
pairs_well_with: ["overview", "context-window", "subagents"]
learn_links: ["storybooks/101/01-overview"]
use_links: ["cookbooks/understanding-tool-use"]
---

# The Agentic Loop

## What it is

The agentic loop is the core execution model of Claude Code. Rather than generating a single response to a prompt, Claude operates in a continuous cycle: it reads context, formulates a plan, executes an action using a tool, observes the result, and decides what to do next. This loop repeats until the task is complete or Claude determines it cannot proceed. Each iteration adds new information to the context, informing the next action.

## Why you'd use it

Understanding the agentic loop helps you work with Claude Code effectively. When you give Claude a task like "fix the failing tests," it does not attempt to solve everything in one shot. It reads test output, identifies the failure, reads the relevant source code, makes a change, runs the tests again, and iterates until they pass. Knowing this model helps you write better prompts (giving Claude enough context to start the loop efficiently) and debug situations where Claude gets stuck in unproductive cycles.

## Configuration reference

### The loop in practice

```
┌─────────────────────────────────────────┐
│ 1. THINK — Analyze context, form plan   │
├─────────────────────────────────────────┤
│ 2. ACT — Choose and use a tool          │
│    - Read file                          │
│    - Write file                         │
│    - Run bash command                   │
│    - Search codebase                    │
│    - Spawn subagent                     │
├─────────────────────────────────────────┤
│ 3. OBSERVE — See the tool's output      │
├─────────────────────────────────────────┤
│ 4. DECIDE — Task done? Continue loop?   │
│    ├── Not done → back to THINK         │
│    └── Done → respond to user           │
└─────────────────────────────────────────┘
```

### Available tools in the loop

| Tool | Purpose |
|------|---------|
| `Read` | Read file contents |
| `Write` | Create or modify files |
| `Edit` | Make targeted edits to files |
| `Bash` | Execute shell commands |
| `Grep` | Search file contents with regex |
| `Glob` | Find files by name pattern |
| `Task` | Spawn a subagent for a subtask |
| `WebFetch` | Fetch URL content |

### Controlling the loop

```bash
# Limit maximum iterations
claude --max-turns 10 "fix the build errors"

# In interactive mode, you can interrupt with Ctrl+C
# Claude will stop and summarize what it has done so far
```

### Observing the loop

In interactive mode, Claude shows each tool call and its result in real time. You see the thinking process unfold:

```
Reading src/auth.ts...
Running: npm test -- --grep "auth"
3 tests failing...
Editing src/auth.ts (lines 45-52)...
Running: npm test -- --grep "auth"
All tests passing.
```

## Edge cases & gotchas

- The loop can get stuck in unproductive cycles — for example, trying the same fix repeatedly. If you see this, interrupt (Ctrl+C) and provide guidance.
- Each iteration consumes context window tokens. A 20-iteration loop that reads large files can fill the context quickly. Use `/compact` if context gets heavy.
- Claude decides when to stop. Sometimes it stops too early (thinking it is done when it is not) or too late (polishing beyond what was asked). Be specific about completion criteria in your prompt.
- Tool failures (command errors, file not found) do not stop the loop — Claude observes the error and adapts. This is a feature, but it means Claude may spend several iterations working around a misconfigured environment.
- The `--max-turns` flag is a hard stop. If the task is not complete within that many iterations, Claude stops mid-work and reports partial progress.
- Each tool call requires permission (unless pre-approved). In interactive mode, frequent permission prompts can slow the loop. Pre-approve common tools in settings.

## Pairs well with

- **[Claude Code Overview](/glossary/overview)** — The agentic loop is the defining feature of Claude Code.
- **[Context Window](/glossary/context-window)** — Each loop iteration adds to context consumption.
- **[Subagents](/glossary/subagents)** — Subagents run their own independent agentic loops.
