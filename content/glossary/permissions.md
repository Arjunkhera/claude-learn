---
title: "Permissions Model"
category: "core"
pairs_well_with: ["settings", "security-hardening", "permission-model"]
learn_links: ["storybooks/101/04-permissions"]
use_links: ["cookbooks/auto-approve-safe-tools"]
---

# Permissions Model

## What it is

Claude Code operates with a security-first permission system. Before performing potentially impactful actions — writing files, running shell commands, or accessing the network — Claude asks for your approval. You can grant one-time permission, allow for the session, or persistently allow specific tools via settings. This creates a trust boundary between Claude's planning (always allowed) and its execution (gated by permission).

## Why you'd use it

The permissions model prevents unintended side effects. When Claude proposes running `rm -rf` or writing to a config file, you get a chance to review before execution. For trusted, repetitive operations (like running tests or linting), you can pre-approve them to avoid constant prompting while still blocking anything unexpected.

## Configuration reference

### Interactive permission prompts

When Claude wants to use a tool, you see a prompt:

```
Claude wants to run: npm test
[Y]es / [N]o / [A]lways allow this tool
```

### Persistent allows in settings.json

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Grep",
      "Glob",
      "Task",
      "WebFetch"
    ],
    "deny": [
      "Bash(rm -rf *)"
    ]
  }
}
```

### Tool-specific patterns with allowedTools

```json
{
  "allowedTools": [
    "Read",
    "Write",
    "Bash(npm test)",
    "Bash(npm run lint)",
    "Bash(git status)",
    "Bash(git diff *)"
  ]
}
```

### CLI flag for headless/CI use

```bash
# Allow specific tools without prompting
claude -p --allowedTools "Read,Write,Bash(npm test)" "fix and verify the tests"
```

### Checking current permissions

```
/permissions    # Show what's currently allowed/denied
```

## Edge cases & gotchas

- Pattern matching in `allowedTools` uses glob-style matching. `Bash(npm *)` allows any npm command including `npm publish`. Be specific.
- Deny rules take precedence over allow rules. If something is in both lists, it will be denied.
- Session-level allows (pressing "A" at a prompt) persist only for the current session and are not saved to settings.
- The `Write` permission covers all file writes. You cannot selectively allow writes to certain paths through the basic permission system.
- MCP tool permissions follow the format `mcp__servername__toolname` in the allowedTools array.
- In headless mode (`-p`), any tool not explicitly in `--allowedTools` will cause the operation to be skipped, not prompted.

## Pairs well with

- **[Settings](/glossary/settings)** — Where permission configuration lives.
- **[Security Hardening](/glossary/security-hardening)** — Locking down Claude Code for production use.
- **[Permission Model Deep Dive](/glossary/permission-model)** — Full breakdown of trust levels and boundaries.
