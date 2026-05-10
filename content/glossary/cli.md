---
title: "CLI Reference"
category: "core"
pairs_well_with: ["overview", "headless-mode", "permissions"]
learn_links: ["storybooks/101/02-cli-basics"]
use_links: ["cookbooks/one-shot-scripts"]
---

# CLI Reference

## What it is

The Claude Code CLI (`claude`) is the primary interface for interacting with Claude as an agentic coding assistant. It supports four distinct modes of operation — interactive, one-shot, print, and pipe — each suited to different workflows. The CLI manages sessions, handles permissions, and orchestrates the agentic loop.

## Why you'd use it

Different tasks call for different interaction patterns. Interactive mode for exploratory work and multi-step tasks. One-shot for quick targeted changes. Print mode for read-only queries where you want clean stdout output. Pipe mode for integrating Claude into shell pipelines. Knowing which mode to reach for makes you faster.

## Configuration reference

### Modes

```bash
# Interactive mode — persistent session with back-and-forth
claude

# One-shot mode — single task, then exit
claude "add error handling to the parse function"

# Print mode — read-only, output to stdout, no file modifications
claude -p "summarize this module's architecture"

# Pipe mode — accept content from stdin
git diff | claude -p "review these changes"
cat schema.sql | claude "generate TypeScript types for this schema"
```

### Key flags

```bash
# Output format (for scripting/CI)
claude -p --output-format json "list all TODO comments"
claude -p --output-format stream-json "analyze this file"

# Tool permissions for non-interactive use
claude -p --allowedTools "Read,Grep,Glob" "find all auth references"

# Resume previous conversation
claude --resume
claude --resume <session-id>

# Model selection
claude --model opus
claude --model sonnet

# Max turns for agentic loop
claude --max-turns 10 "fix the failing tests"

# Verbose output
claude --verbose
```

### Session management

```bash
# List recent sessions
claude sessions list

# Resume most recent session
claude --resume

# Start fresh (no memory of previous session)
claude  # just start a new one
```

### In-session commands

```
/compact         # Summarize context to free space
/cost            # Show token usage and cost
/clear           # Clear conversation history
/help            # Show available commands
/permissions     # View current permission state
/model           # Switch model mid-session
```

## Edge cases & gotchas

- One-shot mode (`claude "query"`) still allows file writes and command execution — it just exits after completion. Use `-p` (print mode) if you want read-only behavior.
- `--output-format json` only works with `-p` (print mode). Interactive mode does not support structured output.
- Piping content into `claude` without `-p` still opens interactive mode with the piped content as initial context.
- `--max-turns` prevents runaway loops but may cause incomplete work if set too low. The default is generous enough for most tasks.
- Session resume loads conversation history but tool results may reference stale file contents if files changed between sessions.

## Pairs well with

- **[Headless Mode](/glossary/headless-mode)** — Running Claude Code in CI/CD pipelines without a TTY.
- **[Permissions Model](/glossary/permissions)** — Understanding what Claude can and cannot do by default.
- **[Cost Optimisation](/glossary/cost-optimisation)** — Managing token spend across modes.
