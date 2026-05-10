---
title: "CLI Basics"
chapter: 2
track: "101"
difficulty: "beginner"
features_used: ["cli", "interactive-mode", "one-shot-mode", "print-mode"]
cross_links: ["glossary/cli-flags", "cookbooks/scripting-with-claude"]
description: "How to run Claude Code in interactive mode, one-shot commands, and print mode for scripting."
---

# CLI Basics

After his first session exploring the monorepo, Arjun realizes he'll be using Claude Code in different ways depending on the situation. Sometimes he wants a long back-and-forth conversation to work through a complex refactor. Other times he just needs a quick answer — what's this function doing? — and wants to get back to his editor.

Claude Code gives you three modes of operation, and knowing when to reach for each one will save you time and tokens. Interactive mode is your workbench for multi-turn tasks. One-shot mode is for quick questions. Print mode is for scripting and pipelines where you need output without side effects.

## Example 1: Interactive Mode vs One-Shot

Arjun is debugging a failing build. He wants to have a conversation about it, so he opens interactive mode:

```bash
claude
```

This drops him into a persistent session where he can ask follow-up questions, and Claude remembers everything from earlier in the conversation. Perfect for debugging, planning, and multi-step work.

But later, he just wants to know what a specific utility function does. He doesn't need a full session for that:

```bash
claude "What does the retryWithBackoff function in packages/shared/utils.js do?"
```

This runs a single query and exits. Claude reads the file, answers the question, and Arjun is back at his shell prompt. No session overhead, no context to manage.

For situations where Arjun wants an answer but doesn't want Claude to make any file changes — say, piping output into another tool — he uses print mode:

```bash
claude -p "List all the API endpoints defined in packages/api/src/routes/"
```

Print mode (`-p`) guarantees Claude won't modify anything. It outputs the response and exits. This is what you use in scripts, CI pipelines, or when you just want information without any risk of changes.

## Example 2: Useful Flags

As Arjun gets more comfortable, he discovers flags that make his workflow faster:

```bash
# Use a specific model
claude --model claude-sonnet-4-20250514 "Quick question about this package.json"

# Restrict which tools Claude can use (read-only exploration)
claude --allowedTools "Read,Bash(grep:*),Bash(find:*)" "Find all TODO comments in the codebase"

# Get structured output for scripting
claude -p --output-format json "What's the Node.js version in package.json?"
```

The `--allowedTools` flag is particularly useful when Arjun wants Claude to explore without any possibility of making changes. By limiting it to Read and specific Bash commands, he gets answers without worrying about side effects.

The `--output-format json` flag pairs well with print mode for automation — Arjun can pipe Claude's structured output into `jq` or other tools in his build scripts.

## Watch Out

One-shot mode (`claude "query"`) still has permission to read and write files. If you ask Claude to "fix the linting errors in auth.js" in one-shot mode, it will try to edit the file. If you want guaranteed read-only behavior, use print mode (`claude -p`) or restrict tools with `--allowedTools`. Don't confuse "quick question" with "safe question" — the mode determines session length, not permissions.

## Try It

Try all three modes on your own project:

```bash
# Interactive: open a session
claude

# One-shot: ask a quick question (then exits)
claude "How many dependencies does this project have?"

# Print mode: safe for scripting, no file modifications
claude -p "Summarize the folder structure of this project"
```

Notice how interactive mode keeps you in a conversation, while one-shot and print mode return you to your shell immediately. Choose based on whether you need follow-up questions or just a quick answer.
