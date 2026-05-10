---
title: "IDE Extensions"
category: "integrations"
pairs_well_with: ["overview", "permissions", "settings"]
learn_links: ["storybooks/101/07-ide-integration"]
use_links: ["cookbooks/vscode-workflow"]
---

# IDE Extensions

## What it is

Claude Code integrates directly into popular IDEs through official extensions for VS Code and JetBrains (IntelliJ, WebStorm, PyCharm, etc.). These extensions embed the full Claude Code experience inside your editor — you get the same agentic capabilities (file editing, command execution, codebase exploration) without switching to a separate terminal window. The extensions communicate with the same Claude Code backend and respect the same settings and permissions.

## Why you'd use it

IDE integration reduces context switching. You can highlight code and ask Claude about it, trigger refactors from the editor, and see Claude's changes appear in real-time in your open files. The extensions also provide visual diff previews, inline suggestions, and tight integration with your editor's file tree and terminal. For developers who live in their IDE, this is the most natural way to use Claude Code.

## Configuration reference

### VS Code Extension

```bash
# Install from VS Code marketplace
# Search: "Claude Code" by Anthropic

# Or install via CLI
code --install-extension anthropic.claude-code
```

VS Code extension features:
- Side panel for chat interface
- Right-click context menu: "Ask Claude about this"
- Inline diff view for proposed changes
- Terminal integration for command execution
- Respects workspace `.claude/settings.json`

### JetBrains Extension

```bash
# Install from JetBrains Marketplace
# Search: "Claude Code" in Settings > Plugins
```

JetBrains extension features:
- Tool window for chat
- Editor context actions
- Integrated diff viewer
- Run configuration integration

### Shared configuration

Both extensions use the same settings files as the CLI:

```
~/.claude/settings.json         # Global settings apply
.claude/settings.json           # Project settings apply
.claude/settings.local.json     # Local settings apply
CLAUDE.md                       # Project instructions apply
```

No separate configuration is needed — if your CLI is configured, the extensions work immediately.

### Extension-specific settings

```json
// VS Code settings.json
{
  "claude-code.autoOpen": true,
  "claude-code.theme": "editor"
}
```

## Edge cases & gotchas

- The IDE extension and a terminal Claude Code session share the same settings but are independent sessions. They do not share conversation history or context.
- Changes made by Claude through the extension appear as unsaved modifications in the editor. You can review diffs before saving.
- The extensions require the Claude Code CLI to be installed separately. The extension is a frontend — it calls the CLI under the hood.
- Large file operations may feel slower in the IDE because the extension renders diffs interactively. The CLI can be faster for bulk operations.
- Extension updates and CLI updates are independent. Version mismatches can occasionally cause issues — keep both updated.
- Some JetBrains IDEs restrict plugin subprocess permissions. You may need to approve additional access on first use.

## Pairs well with

- **[Claude Code Overview](/glossary/overview)** — The IDE extension is an alternative interface to the same core.
- **[Settings](/glossary/settings)** — Shared configuration between CLI and IDE.
- **[Permissions Model](/glossary/permissions)** — Same permission model applies in the IDE.
