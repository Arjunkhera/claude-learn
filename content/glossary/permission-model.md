---
title: "Permission Model Deep Dive"
category: "concepts"
pairs_well_with: ["permissions", "security-hardening", "settings"]
learn_links: ["storybooks/201/permissions-deep-dive"]
use_links: ["cookbooks/enterprise-permissions"]
---

# Permission Model Deep Dive

## What it is

Claude Code's permission model implements layered trust boundaries that control what actions Claude can take. At its core, it separates read operations (generally safe) from write operations (potentially impactful) and requires explicit approval for anything that modifies state. The model supports progressive trust — from fully prompted, to session-allowed, to persistently allowed — letting you tune the balance between safety and speed.

## Why you'd use it

The permission model is the security foundation of Claude Code. Understanding it deeply helps you configure appropriate boundaries for your use case: locked-down for production CI pipelines, permissive for trusted local development, and somewhere in between for team shared configurations. It also helps you debug why Claude "won't do something" — usually a permission issue.

## Configuration reference

### Trust levels (from most restrictive to most permissive)

```
Level 0: Prompted (default)
  └── Every action requires approval

Level 1: Session-allowed
  └── Approved once with "Always" → allowed for this session

Level 2: Settings-allowed
  └── Listed in allowedTools → allowed permanently

Level 3: Headless pre-approved
  └── Passed via --allowedTools flag → no prompts possible
```

### Tool categories and default trust

```
Always allowed (no prompt):
  - Think (internal reasoning)

Read operations (prompted once, then session-allowed):
  - Read
  - Grep
  - Glob

Write operations (always prompted unless pre-approved):
  - Write
  - Edit
  - Bash (any command)

Special tools:
  - Task (subagent spawning)
  - WebFetch (network access)
  - MCP tools (per-server)
```

### Permission resolution order

```
1. Managed settings (enterprise) — cannot be overridden
2. Deny rules — always win over allows
3. CLI --allowedTools flag
4. Local settings (.claude/settings.local.json)
5. Project settings (.claude/settings.json)
6. Global settings (~/.claude/settings.json)
7. Session-level allows (from pressing "A")
8. Default: prompt the user
```

### Deny rules for hard boundaries

```json
{
  "permissions": {
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Write(*.env)",
      "Bash(curl * | bash)"
    ]
  }
}
```

### Glob patterns in permissions

```json
{
  "allowedTools": [
    "Bash(npm *)",           // Any npm command
    "Bash(git diff *)",      // git diff with any args
    "Write(src/**)",         // Write only within src/
    "mcp__db__query"         // Specific MCP tool
  ]
}
```

### Auditing permission decisions

Claude shows which permission level authorized each action in verbose mode:

```bash
claude --verbose "run the tests"
# Shows: [permission] Bash(npm test) allowed by: settings.allowedTools
```

## Edge cases & gotchas

- Deny rules use the same glob patterns as allow rules but always take precedence. A tool matching both an allow and deny rule is denied.
- `Bash(*)` allows ALL shell commands. This is equivalent to giving Claude root access. Be extremely specific with Bash patterns.
- Permission patterns match the tool invocation string, not the actual command semantics. `Bash(rm -rf *)` blocks that exact pattern, but `Bash(find . -delete)` would not be blocked by it.
- MCP tools require the full qualified name: `mcp__<server>__<tool>`. A wildcard like `mcp__db__*` allows all tools from that server.
- Session-level allows (pressing "A") are lost when the session ends. They are not persisted anywhere.
- In headless mode, unlisted tools are silently skipped. Claude may appear to "ignore" parts of your request because it lacks permission to act.
- Enterprise managed settings cannot be overridden by any user-level configuration. This is by design for compliance.

## Pairs well with

- **[Permissions Model](/glossary/permissions)** — The practical reference for setting up permissions.
- **[Security Hardening](/glossary/security-hardening)** — Using the permission model for production security.
- **[Settings](/glossary/settings)** — Where permission configuration lives.
