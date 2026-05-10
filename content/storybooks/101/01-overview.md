---
title: "Overview & Quickstart"
chapter: 1
track: "101"
difficulty: "beginner"
features_used: ["cli", "interactive-mode"]
cross_links: ["glossary/claude-code", "cookbooks/first-session"]
description: "What Claude Code is, how to install it, and your first real conversation with a codebase."
---

# Overview & Quickstart

Arjun stares at his terminal. He just inherited a Node.js monorepo from a developer who left the company two months ago. There are no tests, the README is three years out of date, and the folder structure looks like it was designed by someone who really loved nesting. He needs to understand what this thing does before he can start fixing it.

Claude Code is an agentic coding tool that lives in your terminal. Unlike a chatbot in a browser tab, it can see your files, run commands, and make changes directly in your project. You talk to it in plain English, and it reads your code, reasons about it, and takes action. Think of it as a senior developer sitting next to you who can actually open the files and look.

The key word is *agentic* — Claude Code doesn't just answer questions. It explores, plans, and executes. You can ask it to understand a codebase, refactor a module, write tests, or debug a failing build. It works where you work: in the terminal, alongside git and your editor.

## Example 1: Installing and Opening a Project

Arjun decides to give Claude Code a shot. Installation takes one command:

```bash
npm install -g @anthropic-ai/claude-code
```

He navigates to the monorepo root and launches Claude Code:

```bash
cd ~/projects/legacy-monorepo
claude
```

The terminal shifts into an interactive session. Claude Code is now aware of his working directory and ready to explore. Arjun types his first question:

```
> What does this project do? Give me the high-level architecture.
```

Claude reads the `package.json`, scans the top-level directories, checks key entry points, and comes back with a structured summary — the monorepo contains three services (an API gateway, a worker process, and a React dashboard), plus a shared utilities package. It identifies Express as the API framework, Bull for job queues, and notes that the dashboard hasn't been touched in eight months.

In about thirty seconds, Arjun has a mental map that would have taken him half a day of reading code.

## Example 2: Asking a Follow-Up

Still in the same session, Arjun wants to dig deeper into the part he'll be working on first:

```
> How does the API gateway handle authentication? Show me the relevant files.
```

Claude traces the request flow from the Express router, finds a middleware in `packages/api/src/middleware/auth.js`, and explains that it's using JWT tokens validated against a shared secret in environment variables. It also flags that the token expiry is set to 30 days — unusually long — and that there's no refresh token mechanism.

```
> Are there any tests for this auth middleware?
```

```
No test files exist for packages/api/src/middleware/auth.js.
The project has a test/ directory at the root, but it only contains
two integration test files for the worker service, both of which
appear to be stubs with no actual assertions.
```

Arjun now knows exactly where to start: the auth layer needs tests, and that 30-day token expiry needs a conversation with the team.

## Watch Out

Claude Code needs to be run from within a project directory to be useful. If you launch `claude` from your home directory or a random folder, it has no project context to work with. Always `cd` into your project root first. Claude uses your working directory as its starting point for reading files and understanding project structure.

## Try It

Install Claude Code and open any project you're working on:

```bash
npm install -g @anthropic-ai/claude-code
cd ~/your-project
claude
```

Then ask your first question:

```
What does this project do? Summarize the architecture and key dependencies.
```

You'll get a grounded answer based on your actual code — not generic documentation. Welcome to Claude Code.
