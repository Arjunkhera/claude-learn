---
title: "Plugins"
category: "extensions"
pairs_well_with: ["skills", "hooks", "mcp"]
learn_links: ["storybooks/201/plugins"]
use_links: ["cookbooks/create-plugin"]
---

# Plugins

## What it is

Plugins are distributable packages that bundle related Claude Code extensions — skills, hooks, MCP server configurations, and agent definitions — into a single installable unit. They are the distribution mechanism for sharing Claude Code customizations across teams, organizations, or the community. Install a plugin and you get a coherent set of capabilities without manual configuration.

## Why you'd use it

Setting up Claude Code for a specific workflow often requires multiple pieces: a skill for the workflow, hooks for automation, MCP servers for tool access, and permissions for safety. Plugins package all of these together. A "Rails Development" plugin might include skills for generating migrations, hooks for running rubocop after writes, and MCP server config for database access — all installed with one command.

## Configuration reference

### Installing plugins

```bash
# Search for available plugins
claude plugins search "rails"

# Install a plugin
claude plugins install @org/claude-rails-plugin

# List installed plugins
claude plugins list

# Remove a plugin
claude plugins remove @org/claude-rails-plugin
```

### Plugin structure

A plugin is a directory or package containing:

```
my-plugin/
├── plugin.json          # Plugin manifest
├── skills/
│   ├── review.md        # Skill definitions
│   └── deploy.md
├── hooks/
│   └── post-write.sh    # Hook scripts
└── mcp/
    └── server.js        # MCP server implementation
```

### Plugin manifest (plugin.json)

```json
{
  "name": "@myorg/claude-rails-plugin",
  "version": "1.0.0",
  "description": "Rails development toolkit for Claude Code",
  "skills": ["skills/*.md"],
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "command": "./hooks/post-write.sh"
      }
    ]
  },
  "mcpServers": {
    "rails-db": {
      "command": "node",
      "args": ["./mcp/server.js"]
    }
  },
  "permissions": {
    "required": ["Read", "Write", "Bash(bundle exec *)"]
  }
}
```

### Plugin scoping

Plugins can be installed globally or per-project:

```bash
# Global installation
claude plugins install --global @org/plugin

# Project-local installation (recorded in .claude/plugins.json)
claude plugins install @org/plugin
```

## Edge cases & gotchas

- Plugins can request permissions but cannot grant them silently. You still need to approve any new tool access the plugin requires.
- Plugin hooks run with your user permissions. Review hook scripts before installing third-party plugins — they can execute arbitrary shell commands.
- Plugin MCP servers start as additional child processes. Many plugins with MCP servers can increase memory usage and startup time.
- Version conflicts between plugins are possible if two plugins define skills with the same name. The last-installed wins.
- Plugin updates may change hook behavior or MCP server APIs. Pin versions in production environments.
- Plugins installed at the project level should have their configuration committed to version control so the whole team benefits.

## Pairs well with

- **[Skills System](/glossary/skills)** — Plugins distribute skills.
- **[Hooks](/glossary/hooks)** — Plugins distribute hook configurations.
- **[MCP Integration](/glossary/mcp)** — Plugins distribute MCP server setups.
