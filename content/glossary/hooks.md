---
title: "Hooks"
category: "extensions"
pairs_well_with: ["skills", "permissions", "settings"]
learn_links: ["storybooks/201/hooks"]
use_links: ["cookbooks/auto-lint-on-edit"]
---

# Hooks

## What it is

Hooks are shell commands that execute automatically in response to specific Claude Code events. When Claude writes a file, runs a command, or sends a notification, hooks can fire to perform additional actions — like running a linter after every file write, logging tool usage, or blocking certain operations. They are the event-driven automation layer of Claude Code.

## Why you'd use it

Hooks eliminate manual post-action steps. Instead of remembering to run `prettier` after every file edit, or `eslint --fix` after every write, a hook handles it automatically. They are also useful for enforcement (blocking writes to protected files), observability (logging every command Claude runs), and integration (triggering external systems when certain events occur).

## Configuration reference

### Hook configuration in settings.json

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "command": "echo 'About to write: $CLAUDE_FILE_PATH'"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "command": "npx prettier --write $CLAUDE_FILE_PATH"
      },
      {
        "matcher": "Bash",
        "command": "echo \"Ran command: $CLAUDE_BASH_COMMAND\" >> ~/.claude/audit.log"
      }
    ],
    "Notification": [
      {
        "matcher": "",
        "command": "terminal-notifier -message '$CLAUDE_NOTIFICATION'"
      }
    ]
  }
}
```

### Available hook events

| Event | Fires when | Common use |
|-------|-----------|------------|
| `PreToolUse` | Before a tool executes | Validation, blocking |
| `PostToolUse` | After a tool completes | Formatting, logging |
| `Notification` | Claude sends a notification | Alerts, integrations |
| `Stop` | Session ends or Claude stops | Cleanup, reporting |

### Environment variables available to hooks

```bash
$CLAUDE_FILE_PATH        # Path of file being written (Write tool)
$CLAUDE_BASH_COMMAND     # Command being run (Bash tool)
$CLAUDE_NOTIFICATION     # Notification message text
$CLAUDE_TOOL_NAME        # Name of the tool being used
```

### Blocking with PreToolUse

A `PreToolUse` hook can block the tool by exiting with a non-zero status:

```json
{
  "PreToolUse": [
    {
      "matcher": "Write",
      "command": "if echo $CLAUDE_FILE_PATH | grep -q 'package-lock.json'; then exit 1; fi"
    }
  ]
}
```

## Edge cases & gotchas

- Hooks run with your user's shell permissions. A misconfigured hook can modify files, delete data, or hang the session.
- Hook commands that hang (never exit) will block Claude Code. Always ensure hooks terminate. Consider adding timeouts.
- The `matcher` field matches against the tool name. Use `"Write"` not `"write"` — it is case-sensitive.
- An empty `matcher` (`""`) matches all tools for that event type.
- Hook stderr output is visible to Claude and may influence its behavior. Use `2>/dev/null` if you want silent hooks.
- Hooks fire for every matching tool use. A session with 50 file writes triggers the PostToolUse Write hook 50 times.
- Environment variables are only set for relevant tools. `$CLAUDE_FILE_PATH` is empty when the tool is not `Write`.

## Pairs well with

- **[Skills System](/glossary/skills)** — Skills define what Claude does; hooks add automatic side effects to those actions.
- **[Settings](/glossary/settings)** — Hooks are configured in settings.json.
- **[Permissions Model](/glossary/permissions)** — PreToolUse hooks can enforce additional permission logic beyond the built-in model.
