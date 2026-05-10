---
title: "Cost Optimisation"
category: "guides"
pairs_well_with: ["context-window", "context-management", "cli"]
learn_links: ["storybooks/201/cost-management"]
use_links: ["cookbooks/token-efficient-workflows"]
---

# Cost Optimisation

## What it is

A guide to minimizing token usage and API costs while maintaining Claude Code's effectiveness. Costs scale with context size — every message sends the full conversation context to the API. Understanding this billing model and structuring your workflow accordingly can reduce costs by 50-80% without sacrificing output quality.

## Why you'd use it

Claude Code is billed per token processed. A long session with large file reads can easily cost more than a targeted one-shot query. Teams using Claude Code across multiple developers, CI pipelines, and automated workflows need cost discipline. The techniques here let you get the same results for significantly less spend.

## Configuration reference

### Understanding costs

```
Cost per message ≈ (input tokens × input price) + (output tokens × output price)

Input tokens = system prompt + CLAUDE.md + conversation history + tool results
Output tokens = Claude's response + tool calls
```

Key insight: input tokens grow with every turn. Message 1 sends ~5K tokens. Message 20 might send 100K tokens (entire history). Later messages in a session are the most expensive.

### Monitor costs in real-time

```
/cost    # Shows: tokens used, cost, cache hit rate, context utilization
```

### Strategies ranked by impact

**1. Use print mode for one-off queries (highest impact)**

```bash
# Each invocation starts fresh — no accumulated context
claude -p "what does the User type look like in this project?"
claude -p "explain the auth flow"
```

**2. Compact early and often**

```
/compact    # Summarize context, reduce token load for subsequent messages
```

Compact when you finish a subtask and are moving to something unrelated.

**3. Be specific in prompts (reduce unnecessary tool calls)**

```bash
# Expensive — Claude explores broadly
claude "fix the bugs"

# Cheap — Claude goes directly to the target
claude "fix the null pointer in src/api/users.ts line 45"
```

**4. Leverage caching**

Claude Code automatically caches unchanged context. Cache hits are significantly cheaper than full processing. To maximize cache hits:
- Avoid editing messages (keep history stable)
- Use `/compact` only when needed (it invalidates cache)
- Keep CLAUDE.md stable between sessions

**5. Scope subagent tasks tightly**

```bash
# Expensive — vague delegation
"check all files for issues"

# Cheap — precise scope
"check src/api/users.ts for unhandled error cases"
```

**6. Use --max-turns in automation**

```bash
# Prevent runaway loops in CI
claude -p --max-turns 5 --allowedTools "Read,Grep" "find security issues"
```

### Cost comparison by mode

```
Interactive (20-turn session):    $$$$ — full history sent each turn
One-shot (single task):           $$  — one round trip
Print mode (query):               $   — minimal context, no history
Pipe mode (targeted):             $   — only piped content as context
```

### Team cost controls

Set up monitoring and limits:

```bash
# Track costs per session
claude -p --output-format json "task" | jq '.cost'

# Set spending alerts via API dashboard
# (configured in Anthropic Console, not in Claude Code itself)
```

## Edge cases & gotchas

- Cache invalidation is invisible. If you are not seeing expected cache hit rates, your context may be changing more than you think.
- `/compact` saves future costs but the compaction itself costs tokens (Claude must read and summarize the full context). Do not compact after every message.
- Subagents have their own cost. 5 subagents each reading 10 files can cost more than one agent reading 50 files sequentially.
- CLAUDE.md files are included in every message's input tokens. A 500-line CLAUDE.md adds ~1.5K tokens to every single API call in the session.
- Very large tool outputs (e.g., full test suite results, large file contents) are the biggest cost drivers. Guide Claude to read targeted sections.
- Print mode (`-p`) cannot write files or run commands unless tools are allowed. It is cheapest but most limited.

## Pairs well with

- **[Context Window](/glossary/context-window)** — Understanding the constraint that drives costs.
- **[Context Management](/glossary/context-management)** — Techniques that reduce context also reduce cost.
- **[CLI Reference](/glossary/cli)** — Choosing the right mode for cost efficiency.
