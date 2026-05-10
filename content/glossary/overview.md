---
title: "Claude Code Overview"
category: "core"
pairs_well_with: ["cli", "agentic-loop", "memory"]
learn_links: ["storybooks/101/01-overview"]
use_links: ["cookbooks/getting-started"]
---

# Claude Code Overview

## What it is

Claude Code is Anthropic's agentic command-line interface that brings Claude directly into your terminal. Rather than a simple chat interface, it operates as an autonomous coding agent that can read your codebase, make edits, run commands, and iteratively solve problems. It works through an agentic loop — reading context, planning actions, executing them with tools, observing results, and continuing until the task is complete.

## Why you'd use it

Claude Code eliminates the copy-paste workflow between AI chat windows and your editor. When you need to refactor a module, debug a failing test, implement a feature from a spec, or explore an unfamiliar codebase, Claude Code handles the full cycle autonomously. It reads the relevant files, makes changes, runs tests, and fixes issues — all within your existing terminal workflow. It integrates into how developers already work rather than requiring context switches to a separate application.

## Configuration reference

```bash
# Interactive mode — start a session
claude

# One-shot mode — run a single task and exit
claude "refactor the auth module to use JWT"

# Print mode — stdout only, no file changes
claude -p "explain how the router works"

# Pipe mode — accept stdin
cat error.log | claude "what's causing this failure?"

# Resume last conversation
claude --resume

# Start with a specific model
claude --model opus
```

Claude Code stores its configuration across three locations:

```
~/.claude/CLAUDE.md          # Global instructions (all projects)
~/.claude/settings.json      # Global settings
.claude/settings.json        # Project settings (checked into git)
.claude/settings.local.json  # Local settings (gitignored)
CLAUDE.md                    # Project instructions (repo root)
```

## Edge cases & gotchas

- Claude Code requires an active internet connection — it calls the Anthropic API for every interaction.
- The context window (~200K tokens) is shared between conversation history and file contents. Long sessions accumulate context and can degrade response quality. Use `/compact` to summarize and free space.
- Claude Code respects your `.gitignore` by default when searching files, but can still read ignored files if asked directly.
- First-time setup requires API key configuration or authentication via `claude auth`.

## Pairs well with

- **[CLI Reference](/glossary/cli)** — Full command reference for all modes and flags.
- **[The Agentic Loop](/glossary/agentic-loop)** — Understanding how Claude Code thinks and acts.
- **[Memory & CLAUDE.md](/glossary/memory)** — Teaching Claude about your project's conventions.
