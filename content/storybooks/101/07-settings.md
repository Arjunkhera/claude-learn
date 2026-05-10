---
title: "Settings"
chapter: 7
track: "101"
difficulty: "beginner"
features_used: ["settings-json", "global-settings", "project-settings"]
cross_links: ["glossary/settings", "cookbooks/team-configuration"]
description: "Where settings live, how they layer, and common configurations for personal and team use."
---

# Settings

After a week with Claude Code, Arjun has opinions. He prefers Sonnet for quick questions and Opus for complex refactors. He wants his permission allowlists shared with the team but his personal preferences kept private. And the new developer joining next week should get a sane default setup just by cloning the repo.

Claude Code's settings system handles all of this through layered configuration files. Each layer has a purpose: global settings for your personal preferences, project settings for team conventions, and local settings for machine-specific overrides. They merge together, with more specific layers winning over general ones.

## Example 1: The Three Settings Locations

Arjun's settings are split across three files:

**Global settings** — `~/.claude/settings.json`
Your personal preferences that apply to every project on this machine:

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Bash(grep:*)",
      "Bash(find:*)"
    ]
  }
}
```

These are Arjun's baseline permissions — he always wants Claude to read files and search without asking, regardless of which project he's in.

**Project settings** — `.claude/settings.json` (in the repo root)
Team-shared configuration committed to git:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test:*)",
      "Bash(npm run lint:*)",
      "Bash(turbo run build:*)"
    ]
  }
}
```

Every developer on the team gets these permissions when they clone the repo. The build, test, and lint commands are always safe to run, so the whole team benefits from not being prompted for them.

**Local settings** — `.claude/settings.local.json` (gitignored)
Machine-specific config that shouldn't be shared:

```json
{
  "permissions": {
    "allow": [
      "Bash(docker compose:*)"
    ]
  }
}
```

Arjun runs services in Docker locally, but not everyone on the team does. This stays on his machine.

## Example 2: How Settings Merge

When Arjun starts a session in the monorepo, Claude Code merges all three layers. The effective permissions become the union of all `allow` arrays:

- `Read` (from global)
- `Bash(grep:*)` (from global)
- `Bash(find:*)` (from global)
- `Bash(npm test:*)` (from project)
- `Bash(npm run lint:*)` (from project)
- `Bash(turbo run build:*)` (from project)
- `Bash(docker compose:*)` (from local)

If there's a conflict — say, global settings allow something that project settings deny — the more specific layer wins. Project overrides global, and local overrides project.

To check or edit your settings quickly during a session, remember the slash command from Chapter 3:

```
> /config
```

This opens the relevant settings file for quick edits without leaving the terminal.

## Watch Out

Don't put sensitive information in `.claude/settings.json` (the project file) since it gets committed to git. API keys, personal paths, or machine-specific tool configurations belong in `.claude/settings.local.json`. Make sure your `.gitignore` includes `.claude/settings.local.json` — Claude Code typically handles this, but it's worth verifying, especially in existing repos where the `.gitignore` might not have been updated.

## Try It

Set up your settings layers. Start with global preferences:

```bash
mkdir -p ~/.claude
cat > ~/.claude/settings.json << 'EOF'
{
  "permissions": {
    "allow": [
      "Read",
      "Bash(grep:*)",
      "Bash(find:*)"
    ]
  }
}
EOF
```

Then add project-level settings for your team:

```bash
mkdir -p .claude
cat > .claude/settings.json << 'EOF'
{
  "permissions": {
    "allow": [
      "Bash(npm test:*)",
      "Bash(npm run lint:*)"
    ]
  }
}
EOF
```

Start a new session and notice how Claude reads files and runs searches without prompting, while still asking permission for anything outside your allowlists. That's the layered permission model working exactly as designed.

---

You've completed the 101 Foundations track. You know how to install Claude Code, navigate its CLI, use slash commands, write effective project instructions, manage permissions, work within the context window, and configure settings for yourself and your team. From here, you can explore the Cookbooks for specific recipes, or dive into the 201 Workflows track to learn about multi-file refactors, test generation, and git integration.
