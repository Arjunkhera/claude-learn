---
title: "Network Security & Sandboxing"
category: "guides"
pairs_well_with: ["security-hardening", "permissions", "mcp"]
learn_links: ["storybooks/301/network-security"]
use_links: ["cookbooks/sandbox-configuration"]
---

# Network Security & Sandboxing

## What it is

A guide to controlling Claude Code's network access and filesystem boundaries. Network security restricts which external hosts Claude can reach (via tools like WebFetch or MCP servers). Sandboxing restricts which filesystem paths Claude can read from or write to. Together, they create a containment boundary that limits Claude's blast radius regardless of what instructions it receives.

## Why you'd use it

Without network controls, Claude could potentially fetch content from arbitrary URLs, send data to external services via MCP tools, or interact with internal network services. Without filesystem sandboxing, Claude can read any file your user has access to — including credentials, private keys, and sensitive configs. Network security and sandboxing enforce hard boundaries that even prompt injection cannot bypass.

## Configuration reference

### Network allowed hosts

Restrict which hosts Claude can access:

```json
{
  "network": {
    "allowedHosts": [
      "registry.npmjs.org",
      "api.github.com",
      "github.com"
    ]
  }
}
```

When configured, any network request to a host not on this list is blocked.

### Filesystem sandboxing

Control read and write access by path:

```json
{
  "sandbox": {
    "read": {
      "denyOnly": [
        "~/.ssh",
        "~/.aws",
        "~/.config/gcloud",
        "**/*.env",
        "**/*.pem",
        "**/*.key"
      ]
    },
    "write": {
      "allowOnly": [
        "./src",
        "./tests",
        "./docs",
        "$TMPDIR"
      ]
    }
  }
}
```

### Deny rules for network-related commands

Block shell commands that access the network:

```json
{
  "permissions": {
    "deny": [
      "Bash(curl *)",
      "Bash(wget *)",
      "Bash(nc *)",
      "Bash(ssh *)",
      "Bash(scp *)",
      "Bash(rsync *)",
      "Bash(ftp *)"
    ]
  }
}
```

### MCP server network isolation

MCP servers can make arbitrary network calls. Restrict at the server level:

```json
{
  "mcpServers": {
    "database": {
      "command": "my-db-server",
      "env": {
        "ALLOWED_HOSTS": "localhost",
        "DB_HOST": "localhost:5432"
      }
    }
  }
}
```

### Docker-based sandboxing

For maximum isolation, run Claude Code in a container:

```dockerfile
FROM node:20-slim
RUN npm install -g @anthropic-ai/claude-code

# Restrict network at container level
# Only allow specific outbound connections
```

```bash
docker run --rm \
  --network=restricted \
  -v $(pwd):/workspace:rw \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  claude-sandbox \
  claude -p --allowedTools "Read,Write,Bash(npm test)" "fix the tests"
```

### Environment-level controls

```bash
# Restrict via environment variables
export CLAUDE_ALLOWED_HOSTS="registry.npmjs.org,api.github.com"
export CLAUDE_SANDBOX_WRITE="/workspace/src,/workspace/tests"

# HTTP proxy for network auditing
export HTTP_PROXY="http://audit-proxy:8080"
export HTTPS_PROXY="http://audit-proxy:8080"
```

### Monitoring network activity

Use hooks to log network-related tool usage:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "WebFetch",
        "command": "echo \"$(date) NETWORK: WebFetch\" >> /var/log/claude-network.log"
      }
    ]
  }
}
```

## Edge cases & gotchas

- Network restrictions apply to Claude Code's built-in tools, but MCP servers run as separate processes. An MCP server can make any network call regardless of Claude's network settings. Vet MCP servers carefully.
- Filesystem deny rules use glob patterns. `**/*.env` catches `.env` files at any depth, but a file named `.environment` would not be caught.
- `$TMPDIR` is often needed for tool operations. Blocking writes to temp directories can break internal operations.
- DNS resolution still occurs even for blocked hosts — the block happens at the connection level. DNS queries may leak information about what Claude is trying to access.
- Docker sandboxing is the strongest isolation but adds operational complexity. The Anthropic API endpoint must remain reachable for Claude to function.
- Shell commands can bypass filesystem restrictions if they invoke other programs. `Bash(python script.py)` where script.py reads from blocked paths will not be caught by Claude's filesystem rules — you need OS-level sandboxing for that.
- allowed host lists must include the Anthropic API endpoint (`api.anthropic.com`) or Claude Code cannot function at all.

## Pairs well with

- **[Security Hardening](/glossary/security-hardening)** — Broader security configuration guide.
- **[Permissions Model](/glossary/permissions)** — Deny rules for tool-level blocking.
- **[MCP Integration](/glossary/mcp)** — Understanding MCP server security implications.
