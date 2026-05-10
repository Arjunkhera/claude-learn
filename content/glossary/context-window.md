---
title: "Context Window"
category: "core"
pairs_well_with: ["context-management", "cost-optimisation"]
learn_links: ["storybooks/101/03-context-window"]
use_links: ["cookbooks/long-session-management"]
---

# Context Window

## What it is

The context window is the total amount of text Claude can "see" at once during a conversation — approximately 200K tokens. This includes everything: your messages, Claude's responses, file contents that have been read, tool call results, and system instructions. Once this window fills up, Claude can no longer take in new information without summarizing or discarding older context.

## Why you'd use it

Understanding the context window is essential for effective Claude Code usage. Every file Claude reads, every command output it observes, every back-and-forth exchange consumes tokens. Long debugging sessions, large codebases, and verbose tool outputs can fill the window faster than you expect. When context gets full, Claude's ability to recall earlier parts of the conversation degrades, and eventually the session cannot continue without compaction.

## Configuration reference

### Monitoring usage

```
/cost     # Shows tokens used, cost so far, and cache hit rate
/compact  # Summarizes conversation to free context space
```

### Automatic compaction

Claude Code automatically compacts when the context window approaches capacity. You can also trigger it manually with `/compact` at any time, optionally providing focus instructions:

```
/compact focus on the authentication changes only
```

### Token-efficient practices

```bash
# Read specific line ranges instead of whole files
# Claude does this automatically, but you can guide it:
"read lines 50-100 of src/auth.ts"

# Use print mode for quick queries (no session state accumulated)
claude -p "what does the User type look like?"

# Pipe only relevant content
git diff --staged | claude "review these changes"
```

## Edge cases & gotchas

- The ~200K token limit is shared across everything. A single large file (e.g., a minified bundle or data dump) can consume a significant portion of the window in one read.
- After `/compact`, Claude loses granular details from earlier in the conversation. It retains a summary, not the full original text. If you need specific earlier details, you may need to re-read files.
- Automatic compaction happens without warning. If you notice Claude "forgetting" something you discussed earlier, context was likely compacted.
- Cost scales with context size. Longer conversations are more expensive per message because the full context is sent with each API call. Using `/compact` resets this.
- Cache hits reduce cost significantly. Messages that haven't changed since the last turn are often served from cache, but after compaction, the cache is invalidated.
- Tool results (file contents, command output) often consume more tokens than the conversation text itself. Verbose build outputs or large file reads are the biggest consumers.

## Pairs well with

- **[Context Management](/glossary/context-management)** — Strategies for staying within limits effectively.
- **[Cost Optimisation](/glossary/cost-optimisation)** — Reducing spend by managing context wisely.
- **[CLI Reference](/glossary/cli)** — Print mode and one-shot mode avoid accumulating session context.
