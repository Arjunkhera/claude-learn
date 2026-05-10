---
title: "Slash Commands"
chapter: 3
track: "101"
difficulty: "beginner"
features_used: ["slash-commands", "init", "compact", "cost", "clear", "doctor"]
cross_links: ["glossary/slash-commands", "cookbooks/session-management"]
description: "Built-in slash commands that help you manage sessions, track costs, and configure your project."
---

# Slash Commands

Arjun has been using Claude Code for a few days now. His sessions are getting longer, he's curious how much he's spending, and he wants to set up project-level instructions so Claude stops suggesting patterns that don't match the codebase conventions. Slash commands are the control panel for all of this.

Slash commands are built-in commands you type during an interactive session. They start with `/` and handle meta-tasks — things about the session itself rather than about your code. They manage context, track costs, configure projects, and diagnose problems. You don't need to memorize all of them on day one, but three or four will become part of your daily workflow almost immediately.

## Example 1: Setting Up the Project with /init

Arjun decides it's time to create a `CLAUDE.md` file so Claude understands the monorepo's conventions. Instead of writing it from scratch, he uses the built-in command:

```
> /init
```

Claude scans the project structure — package.json, tsconfig files, the folder layout, existing scripts — and generates a starter `CLAUDE.md` with project-specific instructions. For Arjun's monorepo, it picks up that there are three packages, identifies the build tool (Turborepo), and notes the test runner (Jest, even though the tests are mostly empty).

The generated file appears in the project root, ready for Arjun to edit and refine. He adds a note about the team's preferred error handling pattern and removes a section that doesn't apply. We'll cover CLAUDE.md in depth in Chapter 4 — for now, just know that `/init` gives you a strong starting point.

## Example 2: Managing Cost and Context

An hour into a long debugging session, Arjun wonders how much he's spent. He types:

```
> /cost
```

```
Session tokens: 84,231 input / 12,847 output
Estimated cost: $0.42
Context window usage: 47%
```

Good to know. But his context window is almost half full, and he's about to pivot from debugging the auth middleware to looking at the worker service — a totally different part of the codebase. He doesn't need all that auth context anymore:

```
> /compact
```

Claude summarizes the current conversation into a condensed form, freeing up context space while preserving the key decisions and findings. Arjun's context usage drops back down, and he can continue without Claude losing track of important earlier conclusions.

If he wanted a completely fresh start instead — no memory of the current session at all — he'd use:

```
> /clear
```

The difference matters: `/compact` preserves a summary, `/clear` wipes everything. Use `/compact` when you're shifting focus but might reference earlier work. Use `/clear` when you're starting something entirely unrelated.

## Other Commands Worth Knowing

Here's the full set for reference:

| Command | What it does |
|---------|-------------|
| `/help` | Shows available commands and basic usage |
| `/init` | Generates a CLAUDE.md for your project |
| `/clear` | Resets the conversation completely |
| `/compact` | Summarizes context to free up space |
| `/cost` | Shows token usage and estimated cost |
| `/config` | Opens your settings file |
| `/doctor` | Diagnoses common setup problems |
| `/review` | Reviews your current git diff |
| `/bug` | Reports a bug to Anthropic |

## Watch Out

`/clear` is irreversible within a session. If you accidentally clear when you meant to compact, there's no undo — you've lost the conversation history. Get in the habit of using `/compact` as your default when you just want to free up space. Save `/clear` for when you genuinely want a blank slate.

## Try It

Open an interactive session in any project and try this sequence:

```
/init
```

Review the generated CLAUDE.md. Then, after asking a few questions:

```
/cost
/compact
/cost
```

Compare the token counts before and after compaction. You'll see the input tokens drop as the conversation summary replaces the full history. This is how you keep long sessions manageable.
