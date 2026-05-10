---
title: "Headless Mode"
category: "guides"
pairs_well_with: ["ci-cd", "cli", "permissions"]
learn_links: ["storybooks/301/headless"]
use_links: ["cookbooks/github-actions-claude"]
---

# Headless Mode

## What it is

Headless mode runs Claude Code without an interactive terminal — no prompts, no user input, no TTY required. Invoked with `claude -p` (print mode), it executes a task and outputs results to stdout. Combined with `--output-format json`, it produces machine-readable output suitable for scripting, CI/CD pipelines, and automated workflows. This is how you integrate Claude Code into systems that run unattended.

## Why you'd use it

Any time Claude Code needs to run without a human at the keyboard: CI/CD pipelines, cron jobs, git hooks, automated review bots, scheduled maintenance scripts, or IDE extensions that shell out to Claude. Headless mode makes Claude Code a building block for larger automation systems.

## Configuration reference

### Basic headless invocation

```bash
# Simple print mode
claude -p "summarize the changes in the last commit"

# JSON output for parsing
claude -p --output-format json "list all TODO comments with file paths"

# Streaming JSON (for real-time progress)
claude -p --output-format stream-json "analyze the codebase structure"
```

### Tool permissions (required for headless)

Without a TTY, Claude cannot ask for permission. You must pre-approve any tools it needs:

```bash
# Read-only analysis
claude -p --allowedTools "Read,Grep,Glob" "find potential memory leaks"

# Read and write
claude -p --allowedTools "Read,Write,Bash(npm test)" "fix the failing test"

# Broad permissions (use with caution)
claude -p --allowedTools "Read,Write,Edit,Bash" "implement the feature spec"
```

### Parsing JSON output

```bash
# Get just the result text
result=$(claude -p --output-format json "task" | jq -r '.result')

# Get cost information
cost=$(claude -p --output-format json "task" | jq '.cost')

# Check if task succeeded
claude -p --output-format json "task" | jq '.is_error'
```

### Piping input

```bash
# Analyze piped content
git diff | claude -p "review this diff for issues"
cat error.log | claude -p "diagnose the root cause"
find . -name "*.ts" -exec grep -l "TODO" {} \; | claude -p "summarize the TODOs"

# Chain with other tools
claude -p --output-format json "list all API endpoints" | jq '.result' | sort
```

### Bounded execution

```bash
# Limit turns to control time and cost
claude -p --max-turns 5 "fix type errors in src/"

# Combine with timeout for hard time limits
timeout 120 claude -p --max-turns 10 "run and fix failing tests"
```

### Environment variables

```bash
# API key (required)
export ANTHROPIC_API_KEY="sk-..."

# Model selection via env
export CLAUDE_MODEL="sonnet"

# Or via flag
claude -p --model sonnet "quick analysis"
```

### Script integration example

```bash
#!/bin/bash
# Auto-fix linting errors on pre-commit

CHANGED_FILES=$(git diff --cached --name-only --diff-filter=d | grep '\.ts$')

if [ -n "$CHANGED_FILES" ]; then
  echo "$CHANGED_FILES" | claude -p \
    --allowedTools "Read,Write" \
    --max-turns 10 \
    "Fix any TypeScript lint errors in these files: $(echo $CHANGED_FILES | tr '\n' ' ')"
  
  # Re-stage fixed files
  echo "$CHANGED_FILES" | xargs git add
fi
```

## Edge cases & gotchas

- Tools not in `--allowedTools` are silently skipped — Claude will not error, it will just work without them. This can produce incomplete results if you forget a needed tool.
- `--output-format json` wraps the entire result in JSON. If Claude's response itself contains JSON, you need to parse the outer wrapper first.
- Headless mode still reads CLAUDE.md and settings.json. Project instructions apply even in CI.
- stdin and the prompt are separate. `echo "data" | claude -p "analyze this"` sends "data" as stdin context and "analyze this" as the prompt.
- Exit codes: 0 for success, non-zero for errors. Use this in scripts for conditional logic.
- Large outputs can be truncated by shell buffer limits. Pipe to a file for large results: `claude -p "task" > output.json`.
- The `--resume` flag does not work with `-p`. Each print-mode invocation is a fresh session.

## Pairs well with

- **[CI/CD](/glossary/ci-cd)** — Headless mode is the foundation for CI integration.
- **[CLI Reference](/glossary/cli)** — Full flag reference and mode comparison.
- **[Permissions Model](/glossary/permissions)** — Pre-approving tools for unattended use.
