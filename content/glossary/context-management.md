---
title: "Context Management"
category: "concepts"
pairs_well_with: ["context-window", "subagents", "cost-optimisation"]
learn_links: ["storybooks/201/context-management"]
use_links: ["cookbooks/long-session-management"]
---

# Context Management

## What it is

Context management is the set of strategies for keeping Claude Code effective as conversations grow. Since the context window is finite (~200K tokens) and every file read, command output, and exchange accumulates, you need techniques to stay within limits without losing important information. This includes compaction, scoped reads, subagent delegation, and session structure.

## Why you'd use it

Without active context management, long sessions degrade. Claude starts forgetting earlier details, responses slow down as context grows, and costs increase with every message (since the full context is sent with each API call). Good context management keeps sessions sharp, fast, and affordable — even for complex multi-hour tasks.

## Configuration reference

### Manual compaction

```
/compact                          # Summarize everything, free context
/compact focus on the API changes # Summarize with specific focus
```

### Automatic compaction

Claude Code automatically compacts when approaching context limits. This happens transparently — you may notice Claude's awareness of early conversation details becoming more abstract.

### Scoped file reading

Instead of reading entire files, be specific:

```
"Read the handleAuth function in src/auth.ts"
"Show me lines 100-150 of the config file"
```

Claude also does this naturally — it reads relevant sections rather than entire files when possible.

### Subagent delegation

Offload context-heavy subtasks to subagents:

```
"For each file in src/api/, check if it handles errors correctly.
 Do each file as a separate subtask."
```

Each subagent gets a fresh 200K context window. The parent only receives a summary of results.

### Session boundaries

For distinct tasks, start new sessions rather than continuing:

```bash
# New session for a new task
claude "implement the login page"

# Later, new session for a different task
claude "fix the database migration"
```

### Targeted context loading

Structure your prompts to give Claude exactly what it needs:

```bash
# Pipe relevant context directly
git diff main...HEAD | claude "review these changes"
cat error.log | claude "diagnose this failure"

# Instead of: "look at my recent changes and review them"
```

### Monitoring context usage

```
/cost     # Shows token count and approximate context utilization
```

## Edge cases & gotchas

- After `/compact`, Claude retains summaries, not exact content. If you need Claude to act on specific code it read earlier, you may need to point it at the file again.
- Automatic compaction can happen at inconvenient times. If Claude suddenly seems to forget context, this is likely why.
- Subagents help with context but increase cost. Each subagent is a separate API session with its own token usage.
- Very large tool outputs (e.g., `find . -name "*.ts"` in a huge repo) consume disproportionate context. Be specific in searches.
- Starting new sessions loses all conversational context. If tasks are related, staying in one session (with compaction) may be better than switching.
- Print mode (`-p`) is inherently context-efficient — no session history accumulates between invocations.

## Pairs well with

- **[Context Window](/glossary/context-window)** — Understanding the constraint that context management addresses.
- **[Subagents](/glossary/subagents)** — Key tool for distributing context load.
- **[Cost Optimisation](/glossary/cost-optimisation)** — Context management directly impacts cost.
