---
title: "Security Hardening"
category: "guides"
pairs_well_with: ["permissions", "permission-model", "network-security"]
learn_links: ["storybooks/301/security"]
use_links: ["cookbooks/enterprise-lockdown"]
---

# Security Hardening

## What it is

A guide to configuring Claude Code for security-sensitive environments. This covers restricting what Claude can access, preventing accidental data exposure, sandboxing execution, and setting up enterprise-grade controls. Security hardening is about reducing Claude's blast radius while maintaining useful functionality.

## Why you'd use it

Default Claude Code settings are designed for developer convenience — they prompt before actions but allow broad capability. In production CI pipelines, enterprise environments, or when working with sensitive data, you need tighter controls. Security hardening ensures Claude cannot accidentally (or through prompt injection) access sensitive files, leak credentials, or execute destructive commands.

## Configuration reference

### Principle of least privilege

Start denied, add specific allows:

```json
{
  "permissions": {
    "deny": [
      "Bash(*)",
      "Write(*)"
    ],
    "allow": []
  },
  "allowedTools": [
    "Read",
    "Grep",
    "Glob",
    "Bash(npm test)",
    "Bash(npm run lint)",
    "Bash(npm run build)",
    "Write(src/**)",
    "Write(tests/**)"
  ]
}
```

### Blocking dangerous patterns

```json
{
  "permissions": {
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Bash(curl * | bash)",
      "Bash(wget *)",
      "Bash(chmod 777 *)",
      "Bash(sudo *)",
      "Write(*.env*)",
      "Write(.git/*)",
      "Write(*.pem)",
      "Write(*.key)",
      "Read(*.env*)",
      "Read(*credentials*)",
      "Read(*secret*)"
    ]
  }
}
```

### Filesystem sandboxing

Claude Code can be restricted to specific directories:

```bash
# Run with filesystem sandbox
claude --sandbox "read:/,write:./src,write:./tests"
```

### Network controls

Restrict which hosts Claude can access via MCP or WebFetch:

```json
{
  "network": {
    "allowedHosts": [
      "registry.npmjs.org",
      "api.github.com"
    ]
  }
}
```

### Enterprise managed settings

Deploy non-overridable settings across your organization:

```json
// /Library/Application Support/ClaudeCode/managed-settings.json (macOS)
// /etc/claude-code/managed-settings.json (Linux)
{
  "permissions": {
    "deny": [
      "Bash(curl * | *)",
      "Write(*.env*)",
      "Read(*.env*)"
    ]
  },
  "allowedTools": [],
  "mcpServers": {}
}
```

Managed settings are merged with user settings. Deny rules in managed settings cannot be overridden.

### CI/CD hardening

```bash
# Minimal permissions for automated review
claude -p \
  --allowedTools "Read,Grep,Glob" \
  --max-turns 10 \
  --output-format json \
  "review for security issues"

# Slightly broader for automated fixes
claude -p \
  --allowedTools "Read,Write(src/**),Bash(npm test),Bash(npm run lint)" \
  --max-turns 15 \
  "fix the linting errors in src/"
```

### Audit logging

Use hooks to log all tool usage:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "",
        "command": "echo \"$(date) $CLAUDE_TOOL_NAME\" >> ~/.claude/audit.log"
      }
    ]
  }
}
```

## Edge cases & gotchas

- Deny rules match patterns, not intent. `Bash(rm *)` blocks `rm -rf /` but not `find . -delete` or `python -c "import shutil; shutil.rmtree('/')"`. Defense in depth is essential.
- Overly restrictive settings can make Claude Code useless. If Claude cannot read, write, or run commands, it can only chat. Find the right balance.
- Managed settings files must be writable only by root/admin. World-writable managed settings are a security vulnerability.
- MCP servers run as child processes with full user permissions regardless of Claude Code's permission settings. A malicious MCP server can bypass all restrictions.
- Environment variables passed to MCP servers in settings.json may appear in process listings. Use secret management tools for sensitive values.
- Prompt injection through file contents is a theoretical risk. Claude's built-in safety prevents most exploitation, but defense in depth (deny rules on destructive commands) adds a layer.

## Pairs well with

- **[Permissions Model](/glossary/permissions)** — The mechanics of allow/deny configuration.
- **[Permission Model Deep Dive](/glossary/permission-model)** — Understanding trust levels.
- **[Network Security](/glossary/network-security)** — Network-layer restrictions.
