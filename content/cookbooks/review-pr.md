---
title: "Review a PR end-to-end"
description: "Use Claude Code to review a pull request — understand changes, find issues, and suggest improvements."
difficulty: "beginner"
category: "code-quality"
features_used: ["slash commands", "git integration"]
prerequisites: ["storybooks/101/02-first-prompt"]
---

# Review a PR end-to-end

## Introduction

Code review is one of the most time-consuming parts of development. Claude Code can review a PR's diff, identify potential bugs, highlight style inconsistencies, and suggest improvements — all from your terminal. This cookbook walks you through reviewing a pull request from checkout to actionable feedback.

## Features Used

This cookbook uses the **/review** slash command (which analyzes the current git diff) combined with Claude Code's **git integration** (understanding branches, commits, and diffs). You can follow up conversationally to dig deeper into specific findings.

## Prerequisites

- A git repository with a PR branch available locally
- Basic familiarity with Claude Code prompts (see [Your First Prompt](/storybooks/101/02-first-prompt))

## Step-by-step instructions

### 1. Check out the PR branch

Fetch and switch to the PR branch you want to review:

```bash
git fetch origin
git checkout feature/add-user-auth
```

### 2. Set up the diff context

Make sure your branch is up to date with the base branch so the diff is accurate:

```bash
git merge-base main HEAD
# Confirm this shows the correct divergence point
```

### 3. Run the review command

Start Claude Code and invoke the review:

```
> /review
```

Claude analyzes the diff between your current branch and the base branch. It reads all changed files and produces a structured review.

### 4. Read the analysis

The review output follows a consistent structure:

```
## Summary
This PR adds JWT-based authentication to the user service, including
login/logout endpoints and middleware for protected routes.

## Issues Found

### 🔴 Critical
- **Token expiry not validated** in `src/middleware/auth.ts:24`
  The decoded token's `exp` field is never checked against the current time.

### 🟡 Suggestions
- **Magic number** in `src/auth/config.ts:8`
  `3600` should be a named constant like `TOKEN_EXPIRY_SECONDS`.
- **Missing error handling** in `src/routes/login.ts:31`
  The database call has no try/catch — a DB timeout will crash the process.

## Positive Notes
- Clean separation of auth logic from route handlers
- Good use of dependency injection for the token service
```

### 5. Ask follow-up questions

The review is a starting point. Ask Claude to go deeper on anything:

```
> Can you show me exactly how the token expiry should be validated?
```

```
> Are there any security issues with how the JWT secret is stored?
```

```
> Write a test that covers the missing error handling case.
```

### 6. Generate review comments

If you want to post the feedback to GitHub, ask Claude to format it:

```
> Format the critical issues as GitHub PR review comments with file paths and line numbers
```

You can then copy these directly into your PR review, or use the `gh` CLI:

```bash
gh pr review feature/add-user-auth --comment --body "See review notes..."
```

## Final Result

You now have a workflow for reviewing any PR:

1. `git checkout <branch>`
2. `claude` → `/review`
3. Read findings, ask follow-ups
4. Post feedback to the PR

The entire review takes 2-3 minutes instead of 20-30 minutes of manual reading.

## Variations

- **Review a specific file**: Instead of `/review`, say `Review only the changes in src/middleware/auth.ts` to scope the analysis.
- **Compare against a different base**: Use `git diff main...HEAD > /tmp/diff.patch` and then ask Claude to review the patch file directly.
- **Security-focused review**: Use `/security-review` for a review that specifically targets vulnerabilities, injection risks, and auth issues.
