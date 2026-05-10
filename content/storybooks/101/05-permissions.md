---
title: "Permissions"
chapter: 5
track: "101"
difficulty: "beginner"
features_used: ["permissions", "allowed-tools", "settings-json"]
cross_links: ["glossary/permissions", "cookbooks/permission-allowlists"]
description: "Why Claude asks before acting, how the permission model works, and setting up allowlists."
---

# Permissions

Arjun asks Claude to fix a linting error in the auth middleware. Claude identifies the issue — a missing semicolon and an unused import — and then pauses:

```
Claude wants to edit packages/api/src/middleware/auth.js

Allow this action?
  (y) Yes, allow once
  (n) No, deny
  (a) Always allow editing files
```

The first time this happens, it feels like friction. But Arjun quickly appreciates why it's there: Claude is an agent that can read files, write code, and execute shell commands. Without guardrails, a misunderstood instruction could overwrite critical files or run destructive commands. The permission system is what makes it safe to give Claude real access to your codebase.

Every potentially impactful action — editing a file, running a shell command, accessing the network — requires your approval. You stay in control of what actually changes.

## Example 1: Understanding Permission Prompts

As Arjun works through the monorepo, he encounters different permission types:

```
Claude wants to run: npm test

Allow this action?
  (y) Yes, allow once
  (n) No, deny
  (a) Always allow this tool
```

```
Claude wants to edit packages/api/src/routes/users.js

Allow this action?
  (y) Yes, allow once
  (n) No, deny
  (a) Always allow editing files
```

The pattern is consistent: Claude tells you exactly what it wants to do, and you decide. Choosing `(y)` allows it once. Choosing `(a)` adds it to your session's allowlist so you won't be asked again for that type of action.

But clicking `(a)` repeatedly during a session gets tedious. For commands you know you'll always want — running tests, linting, building — you can set up permanent allowlists.

## Example 2: Setting Up Allowlists in Settings

Arjun edits his project's `.claude/settings.json` to pre-approve common operations:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test:*)",
      "Bash(npm run lint:*)",
      "Bash(turbo run build:*)",
      "Bash(grep:*)",
      "Bash(find:*)",
      "Bash(cat:*)",
      "Read"
    ]
  }
}
```

Now Claude can run tests, lint, build, and read files without asking every time. But it still needs permission for things like `npm install`, editing files, or running arbitrary scripts. The allowlist is additive — you're granting specific permissions, not removing the safety net.

The pattern for tool permissions is `ToolName(command:arguments)`. The wildcard `*` matches anything after the colon. So `Bash(npm test:*)` allows any variation of `npm test` — with flags, with file patterns, whatever. But it won't allow `npm install` or `rm -rf`.

This settings file lives at `.claude/settings.json` in your project root. Since it's not gitignored by default, your whole team can share the same baseline permissions. For personal preferences that shouldn't be committed, use `.claude/settings.local.json` instead.

## Watch Out

Be careful with overly broad Bash permissions. A permission like `Bash(npm:*)` allows every npm command — including `npm publish`, which could push a broken package to the registry. Keep your allowlists specific to the commands you actually want automated. The goal is to eliminate repetitive prompts for safe, read-only or well-understood commands, not to bypass the permission system entirely.

## Try It

Create a `.claude/settings.json` in your project and add permissions for your most common read-only commands:

```json
{
  "permissions": {
    "allow": [
      "Bash(grep:*)",
      "Bash(find:*)",
      "Read"
    ]
  }
}
```

Start a new session and ask Claude to find something in your codebase. Notice that it reads files and runs grep without prompting. Then ask it to edit a file — it'll still ask for permission, exactly as it should.
