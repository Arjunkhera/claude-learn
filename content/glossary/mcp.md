---
title: "MCP Integration"
category: "extensions"
pairs_well_with: ["settings", "plugins", "permissions"]
learn_links: ["storybooks/201/mcp"]
use_links: ["cookbooks/custom-mcp-server"]
---

# MCP Integration

## What it is

MCP (Model Context Protocol) is an open standard that allows Claude Code to connect to external servers providing additional tools and context. MCP servers can expose database access, API integrations, file system operations, cloud services, or any custom functionality as tools that Claude can call. It is the primary extension mechanism for giving Claude Code new capabilities beyond its built-in tool set.

## Why you'd use it

MCP lets you bring your entire development environment into Claude's reach. Need Claude to query your staging database? Deploy to your cloud provider? Check your monitoring dashboard? Post to Slack? An MCP server bridges these systems. Instead of copying output between windows, Claude calls tools directly and acts on the results.

## Configuration reference

### Configuring MCP servers in settings.json

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://localhost:5432/mydb"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "custom": {
      "command": "node",
      "args": ["./tools/my-mcp-server.js"],
      "cwd": "/path/to/project"
    }
  }
}
```

### Environment variable interpolation

Use `${VAR_NAME}` syntax to reference environment variables without hardcoding secrets:

```json
{
  "mcpServers": {
    "api-server": {
      "command": "my-server",
      "env": {
        "API_KEY": "${MY_API_KEY}",
        "BASE_URL": "${API_BASE_URL}"
      }
    }
  }
}
```

### Permissioning MCP tools

MCP tools follow the same permission model as built-in tools:

```json
{
  "allowedTools": [
    "mcp__postgres__query",
    "mcp__github__create_issue",
    "mcp__custom__*"
  ]
}
```

### Server types

MCP supports two transport mechanisms:

```json
{
  "mcpServers": {
    "local-stdio": {
      "command": "my-server",
      "args": ["--stdio"]
    },
    "remote-sse": {
      "url": "https://my-server.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${TOKEN}"
      }
    }
  }
}
```

## Edge cases & gotchas

- MCP servers start as child processes when Claude Code launches. A slow-starting server may cause tools to be unavailable for the first few seconds.
- If an MCP server crashes, its tools become unavailable mid-session. Claude will report tool errors until the server is restarted (requires restarting Claude Code).
- Environment variables in `env` are resolved at startup time. Changing the variable after Claude Code starts has no effect.
- MCP tool names in permissions use the format `mcp__<server-name>__<tool-name>`. The double underscores are required.
- Large responses from MCP tools consume context window tokens. A database query returning thousands of rows will eat significant context.
- MCP servers run with your user's permissions. A misconfigured server can expose sensitive data or perform destructive actions.

## Pairs well with

- **[Settings](/glossary/settings)** — MCP servers are configured in settings.json.
- **[Permissions Model](/glossary/permissions)** — MCP tools are gated by the same permission system.
- **[Plugins](/glossary/plugins)** — Plugins can bundle MCP server configurations for easy distribution.
