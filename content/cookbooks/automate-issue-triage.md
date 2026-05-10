---
title: "Automate issue triage in CI"
description: "Set up a GitHub Action that uses Claude Code in headless mode to triage, label, and comment on new issues."
difficulty: "advanced"
category: "ci-cd"
features_used: ["headless mode", "CI/CD", "permissions"]
prerequisites: ["storybooks/101/04-claude-md", "storybooks/201/headless-mode"]
---

# Automate issue triage in CI

## Introduction

New issues pile up fast in active repositories. Manually reading each one, deciding on a label, and assigning the right team member takes real time. With Claude Code's headless mode, you can run Claude in CI to automatically read new issues, categorize them, apply labels, and leave a helpful initial comment — all within seconds of issue creation.

## Features Used

This cookbook uses **headless mode** (`claude -p` with structured output), **CI/CD integration** (GitHub Actions triggering Claude), and **permissions** (`--allowedTools` to tightly scope what Claude can do). The combination lets Claude act as an intelligent triage bot with minimal privileges.

## Prerequisites

- A GitHub repository where you have admin access
- An Anthropic API key (for running Claude in CI)
- Familiarity with GitHub Actions
- Understanding of headless mode (see headless mode storybook)

## Step-by-step instructions

### 1. Create labels in your repository

Make sure your repository has the labels Claude will apply:

```bash
gh label create "bug" --color "d73a4a" --description "Something isn't working"
gh label create "feature-request" --color "a2eeef" --description "New feature or enhancement"
gh label create "question" --color "d876e3" --description "Further information requested"
gh label create "good-first-issue" --color "7057ff" --description "Good for newcomers"
gh label create "needs-reproduction" --color "fbca04" --description "Needs steps to reproduce"
```

### 2. Create the GitHub Actions workflow

Create `.github/workflows/issue-triage.yml`:

```yaml
name: Issue Triage

on:
  issues:
    types: [opened]

permissions:
  issues: write

jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Triage issue
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          ISSUE_TITLE="${{ github.event.issue.title }}"
          ISSUE_BODY="${{ github.event.issue.body }}"
          ISSUE_NUMBER="${{ github.event.issue.number }}"

          RESULT=$(claude -p "You are an issue triage bot for this repository. \
            Analyze this GitHub issue and respond with JSON containing: \
            1. 'labels' - array of labels to apply (from: bug, feature-request, question, good-first-issue, needs-reproduction) \
            2. 'comment' - a helpful comment acknowledging the issue and asking for any missing info \
            3. 'priority' - low, medium, or high \
            \
            Issue title: ${ISSUE_TITLE} \
            Issue body: ${ISSUE_BODY}" \
            --output-format json \
            --allowedTools "Read" \
            --model claude-sonnet-4-6)

          # Parse the response and apply labels
          LABELS=$(echo "$RESULT" | jq -r '.result' | jq -r '.labels | join(",")')
          COMMENT=$(echo "$RESULT" | jq -r '.result' | jq -r '.comment')

          # Apply labels
          gh issue edit "$ISSUE_NUMBER" --add-label "$LABELS"

          # Post comment
          gh issue comment "$ISSUE_NUMBER" --body "$COMMENT"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 3. Add the Anthropic API key

Add your API key as a repository secret:

```bash
gh secret set ANTHROPIC_API_KEY
# Paste your key when prompted
```

### 4. Add context via CLAUDE.md

Create or update your `CLAUDE.md` to give Claude context about your project's issue patterns:

```markdown
## Issue Triage Context

When triaging issues:
- Label as "bug" if the user reports unexpected behavior with steps
- Label as "feature-request" if the user wants new functionality
- Label as "question" if the user is asking how to do something
- Add "needs-reproduction" to bug reports missing steps to reproduce
- Add "good-first-issue" if the fix is likely isolated to one file
- Priority high: security issues, data loss, crashes
- Priority medium: functionality broken for subset of users
- Priority low: cosmetic, documentation, nice-to-have
```

### 5. Test with a sample issue

Create a test issue to verify the workflow triggers:

```bash
gh issue create --title "App crashes when clicking submit with empty form" \
  --body "When I click the submit button without filling in any fields, the app shows a white screen. Browser: Chrome 120. No error in console."
```

After about 30 seconds, you should see the workflow run. Check the issue for applied labels (`bug`, `needs-reproduction`) and a comment asking for reproduction steps.

### 6. Monitor and tune

Check the Actions tab for workflow runs. Tune the prompt in the workflow file based on the quality of triage decisions. Common adjustments:

- Add more label categories
- Include file-path hints for routing to the right team
- Add assignment logic based on issue area

## Final Result

Your complete setup:

```
.github/
└── workflows/
    └── issue-triage.yml    # Triggers on new issues
CLAUDE.md                   # Contains triage context and rules
```

Every new issue gets automatically labeled and receives an initial response within 30 seconds. Your team sees pre-categorized issues in their next triage meeting.

## Variations

- **Add auto-assignment**: Extend the prompt to output an `assignee` field based on which area of code is likely involved, then use `gh issue edit --add-assignee`.
- **Triage PRs too**: Duplicate the workflow for `pull_request` events to auto-label PRs by size, area, or risk level.
- **Batch triage**: Instead of per-issue, run a scheduled workflow nightly that triages all unlabeled issues at once using `gh issue list --label "" --json number,title,body`.
