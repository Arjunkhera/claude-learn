---
title: "Auto-lint on every edit"
description: "Set up Claude Code to automatically format and lint your code after every change."
difficulty: "intermediate"
category: "automation"
features_used: ["hooks", "settings"]
prerequisites: ["storybooks/101/04-claude-md"]
---

# Auto-lint on every edit

## Introduction

Every time Claude edits a file, it might introduce formatting inconsistencies or minor lint violations. Instead of catching these at commit time or in CI, you can wire up a PostToolUse hook so that ESLint and Prettier run automatically after every file write. The result: every change Claude makes is immediately clean.

## Features Used

This cookbook combines **hooks** (to trigger commands after tool invocations) with **settings.json** (to persist the configuration at the project level). The hook fires on `Write` and `Edit` tool calls, passing the affected file path to your linters.

## Prerequisites

- A project with ESLint and Prettier already configured (working `npx eslint` and `npx prettier`)
- Familiarity with Claude Code settings (see [Understanding CLAUDE.md](/storybooks/101/04-claude-md))

## Step-by-step instructions

### 1. Confirm your linters work locally

Before wiring up the hook, verify that ESLint and Prettier work on a sample file.

```bash
npx eslint --fix src/index.ts
npx prettier --write src/index.ts
```

You should see either "no problems" or auto-fixed output. If these commands fail, fix your lint setup first.

### 2. Create the hook configuration

Open or create `.claude/settings.json` in your project root. Add a `hooks` section with a `PostToolUse` entry:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "npx eslint --fix $CLAUDE_FILE_PATH && npx prettier --write $CLAUDE_FILE_PATH"
      }
    ]
  }
}
```

The `matcher` field is a regex matched against the tool name. `Write|Edit` catches both file-writing tools. The `$CLAUDE_FILE_PATH` environment variable is set by Claude Code to the path of the file that was just modified.

### 3. Test the hook

Start Claude Code in your project directory and ask it to make a change:

```
> Add a new exported helper function called `formatDate` to src/utils.ts
```

After Claude writes the file, you should see the hook execute in the output:

```
✓ Edit src/utils.ts
  ↳ Hook: npx eslint --fix src/utils.ts && npx prettier --write src/utils.ts
```

### 4. Verify the output is clean

Open the edited file and confirm it matches your project's formatting rules. Run your linter manually to double-check:

```bash
npx eslint src/utils.ts
npx prettier --check src/utils.ts
```

Both should report zero issues.

### 5. Handle hook failures gracefully

If the hook command fails (e.g., a lint error that can't be auto-fixed), Claude Code will surface the error. You can make the hook more resilient by ignoring non-fixable errors:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "npx eslint --fix $CLAUDE_FILE_PATH 2>/dev/null; npx prettier --write $CLAUDE_FILE_PATH"
      }
    ]
  }
}
```

Using `;` instead of `&&` means Prettier still runs even if ESLint exits non-zero.

## Final Result

Your `.claude/settings.json` looks like this:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "npx eslint --fix $CLAUDE_FILE_PATH && npx prettier --write $CLAUDE_FILE_PATH"
      }
    ]
  },
  "allowedTools": [
    "Bash(npx eslint *)",
    "Bash(npx prettier *)"
  ]
}
```

Every file Claude touches is now auto-formatted. Commit this settings file so your whole team gets the same behavior.

## Variations

- **TypeScript only**: Change the matcher command to check the file extension: `"command": "[[ $CLAUDE_FILE_PATH == *.ts ]] && npx eslint --fix $CLAUDE_FILE_PATH && npx prettier --write $CLAUDE_FILE_PATH || true"`
- **Use Biome instead**: Replace the command with `npx biome check --fix $CLAUDE_FILE_PATH` for a faster all-in-one formatter and linter.
- **Add a PreToolUse hook**: Run `npx tsc --noEmit` before writes to catch type errors early, preventing Claude from writing code that won't compile.
