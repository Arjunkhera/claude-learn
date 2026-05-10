---
title: "Settings"
category: "core"
pairs_well_with: ["permissions", "memory", "hooks"]
learn_links: ["storybooks/101/06-settings"]
use_links: ["cookbooks/team-settings"]
---

# Settings

## What it is

Settings control Claude Code's behavior through JSON configuration files. They define which tools are allowed, how permissions work, MCP server connections, hook definitions, and other operational parameters. Settings exist at three levels — global, project (shared), and local (personal) — allowing both team-wide standards and individual preferences.

## Why you'd use it

Settings let you customize Claude Code's behavior without repeating instructions. Pre-approve safe tools so you stop getting prompted for `git status`. Configure MCP servers that provide project-specific tools. Set up hooks that run linters automatically. The layered system means your team can check in shared settings while you keep personal preferences local.

## Configuration reference

### File locations

```
~/.claude/settings.json              # Global — all projects, all machines
<repo>/.claude/settings.json         # Project — checked into git, shared
<repo>/.claude/settings.local.json   # Local — gitignored, personal overrides
```

Settings merge with increasing specificity. Local overrides project, project overrides global.

### Key configuration options

```json
{
  "permissions": {
    "allow": ["Read", "Grep", "Glob"],
    "deny": ["Bash(rm *)"]
  },
  "allowedTools": [
    "Read",
    "Write",
    "Bash(npm test)",
    "Bash(npm run lint)",
    "Bash(git *)"
  ],
  "model": "opus",
  "theme": "dark",
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@my-org/mcp-server"],
      "env": {
        "API_KEY": "..."
      }
    }
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "command": "npm run lint --fix $CLAUDE_FILE_PATH"
      }
    ]
  }
}
```

### Managed settings (enterprise)

Organizations can enforce settings via managed configuration:

```
/Library/Application Support/ClaudeCode/managed-settings.json   # macOS
/etc/claude-code/managed-settings.json                          # Linux
```

Managed settings cannot be overridden by user or project settings.

### Quick configuration

```
/config          # Interactive settings editor in-session
```

## Edge cases & gotchas

- `settings.json` (project) is meant to be checked into version control. Never put secrets or API keys there. Use `settings.local.json` or environment variables for sensitive values.
- The `allowedTools` array uses exact matching with glob support. `Bash(npm *)` matches `npm test` and `npm run build` but does not match a command that starts with something else then includes npm.
- MCP server configuration in settings requires the server command to be available on the system. If the binary is missing, Claude Code will show an error at startup.
- Hooks defined in settings run as shell commands with the user's permissions — they can do anything your shell can do. Treat hook commands with the same care as shell scripts.
- Settings changes take effect on the next session start, not mid-session (except for permissions granted interactively).
- If both `permissions.allow` and `allowedTools` exist, they are combined. The relationship between these two fields can be confusing — prefer using `allowedTools` for consistency.

## Pairs well with

- **[Permissions Model](/glossary/permissions)** — Permission rules live in settings files.
- **[Hooks](/glossary/hooks)** — Hook definitions are configured in settings.
- **[MCP Integration](/glossary/mcp)** — MCP server connections are defined in settings.
