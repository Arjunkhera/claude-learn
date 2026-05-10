---
title: "CI/CD"
category: "integrations"
pairs_well_with: ["headless-mode", "permissions", "hooks"]
learn_links: ["storybooks/301/ci-cd"]
use_links: ["cookbooks/github-actions-claude"]
---

# CI/CD

## What it is

Claude Code can run in CI/CD pipelines as a headless agent — no interactive terminal, no human approval prompts. In this mode, it reads code, generates outputs, makes changes, and reports results programmatically. This enables automated code review, test generation, migration scripts, documentation updates, and any other agentic task as part of your continuous integration workflow.

## Why you'd use it

CI/CD integration turns Claude Code into an automated team member that participates in your development workflow. Trigger it on pull requests to generate review comments, run it nightly to update generated code, or use it in deployment pipelines to validate changes. It brings AI-assisted development into the same automation layer as your tests, lints, and builds.

## Configuration reference

### Basic headless execution

```bash
# Print mode with JSON output — the foundation of CI use
claude -p --output-format json "analyze this PR for security issues"

# Stream JSON for real-time processing
claude -p --output-format stream-json "generate test cases for changed files"
```

### Tool permissions in CI

Without a TTY, Claude cannot prompt for permission. You must pre-approve tools:

```bash
# Allow specific tools
claude -p \
  --allowedTools "Read,Grep,Glob,Bash(npm test)" \
  "run the tests and report results"

# Allow all tools (use with caution)
claude -p \
  --allowedTools "Read,Write,Bash" \
  "fix the linting errors"
```

### GitHub Actions example

```yaml
name: Claude Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code
      - name: Run review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude -p \
            --output-format json \
            --allowedTools "Read,Grep,Glob" \
            "Review the changes in this PR for bugs and security issues. Output a summary." \
            > review.json
      - name: Post results
        run: |
          # Parse review.json and post as PR comment
          cat review.json | jq -r '.result' | gh pr comment ${{ github.event.number }} --body-file -
```

### Output format

```bash
# JSON output structure
claude -p --output-format json "task"
# Returns: {"result": "...", "tokens_used": 1234, "cost": 0.05}
```

### Max turns for bounded execution

```bash
# Limit iterations to control cost and runtime
claude -p --max-turns 5 --allowedTools "Read,Write" "fix the type errors"
```

## Edge cases & gotchas

- In headless mode, any tool not listed in `--allowedTools` is silently skipped, not prompted. Claude may produce incomplete results if a needed tool is missing.
- API costs in CI add up quickly. Each PR trigger, each nightly run, each pipeline stage consumes tokens. Set `--max-turns` and monitor costs.
- Claude Code in CI has no memory between runs. Each invocation starts fresh. Pass all necessary context via the prompt or ensure CLAUDE.md is present in the checkout.
- The `--output-format json` flag ensures machine-parseable output, but errors may still go to stderr in non-JSON format.
- Network access from CI runners may be restricted. If Claude needs to fetch dependencies or access external MCP servers, ensure your runner's network allows it.
- Long-running tasks can hit CI timeout limits. Use `--max-turns` to bound execution time.
- Secrets in CI (API keys) must be stored securely. Never hardcode `ANTHROPIC_API_KEY` in workflow files.

## Pairs well with

- **[Headless Mode](/glossary/headless-mode)** — The foundational mode for CI/CD usage.
- **[Permissions Model](/glossary/permissions)** — Pre-approving tools for unattended execution.
- **[Hooks](/glossary/hooks)** — Hooks can trigger CI-specific actions like posting results.
