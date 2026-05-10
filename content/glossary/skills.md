---
title: "Skills System"
category: "extensions"
pairs_well_with: ["hooks", "plugins", "memory"]
learn_links: ["storybooks/201/skills"]
use_links: ["cookbooks/custom-skill-creation"]
---

# Skills System

## What it is

Skills are reusable, self-contained prompts and workflows defined as markdown files that extend Claude Code's capabilities. They act like specialized personas or runbooks that Claude can invoke on demand. When you type a slash command like `/review` or `/deploy`, you are invoking a skill. Skills can also trigger automatically based on context patterns.

## Why you'd use it

Skills encode expert knowledge into repeatable workflows. Instead of typing out detailed instructions every time you want a code review, a migration, or a test plan, you define the workflow once as a skill and invoke it with a single command. Teams can share skills to standardize processes — everyone gets the same thorough review checklist, the same deployment procedure, the same documentation format.

## Configuration reference

### Skill file location

```
~/.claude/skills/           # Global skills (all projects)
.claude/skills/             # Project skills (checked into repo)
```

### Skill file structure

A skill is a markdown file with optional frontmatter:

```markdown
---
name: "review"
description: "Thorough code review with security and performance checks"
trigger: "when the user asks for a review"
---

# Code Review

Review the current changes with attention to:

1. **Correctness** — Does the logic do what it claims?
2. **Security** — Any injection, auth, or data exposure issues?
3. **Performance** — N+1 queries, unnecessary allocations, blocking calls?
4. **Style** — Follows project conventions from CLAUDE.md?

For each issue found, provide:
- File and line reference
- Severity (critical/warning/note)
- Suggested fix with code
```

### Invoking skills

```
/review              # Invoke by slash command
/deploy staging      # Pass arguments to a skill
```

Skills can also be invoked automatically when Claude detects a matching context (based on the `trigger` field in frontmatter).

### Skill with tool restrictions

```markdown
---
name: "analyze"
description: "Read-only analysis"
allowedTools: ["Read", "Grep", "Glob"]
---

Analyze the codebase without making any changes...
```

## Edge cases & gotchas

- Skill names must be unique within their scope. A project skill with the same name as a global skill will override it.
- Skills consume context window tokens when loaded. Very long skill prompts eat into your available context. Keep them focused.
- The `trigger` field is a hint, not a guarantee. Claude may not always auto-invoke a skill even when the trigger matches.
- Skills do not persist state between invocations. Each invocation starts fresh. Use CLAUDE.md or memory for persistent state.
- Skill arguments (text after the slash command) are passed as free-text context, not structured parameters.

## Pairs well with

- **[Hooks](/glossary/hooks)** — Hooks automate actions on events; skills automate workflows on demand. Use both for full automation.
- **[Plugins](/glossary/plugins)** — Plugins bundle skills with hooks and MCP configs for distribution.
- **[Memory & CLAUDE.md](/glossary/memory)** — Skills reference CLAUDE.md for project-specific conventions.
