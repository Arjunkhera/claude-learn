---
title: "Context Window"
chapter: 6
track: "101"
difficulty: "beginner"
features_used: ["context-window", "compact", "cost"]
cross_links: ["glossary/context-window", "glossary/tokens", "cookbooks/long-sessions"]
description: "How the context window works, what happens when it fills up, and strategies for staying within limits."
---

# Context Window

Arjun is three hours into a session. He started by exploring the worker service, then pivoted to debugging a race condition in the job queue, then asked Claude to help write a migration. Somewhere along the way, Claude starts giving answers that don't match what they discussed earlier. It suggests a fix that contradicts a decision they made an hour ago. Something feels off.

The context window is the reason. It's the total amount of information Claude can hold in a single conversation — roughly 200,000 tokens, which sounds like a lot but fills up faster than you'd expect. Every message you send, every file Claude reads, every code block in the response — it all counts. When the window fills up, older parts of the conversation get pushed out. Claude doesn't forget gradually; it simply can't see the earlier messages anymore.

Understanding this constraint is the difference between productive all-day sessions and frustrating ones where Claude seems to "forget" what you told it.

## Example 1: Watching Context Fill Up

Arjun gets in the habit of checking his context usage during longer sessions. After reading through several large files in the worker package:

```
> /cost
```

```
Session tokens: 156,402 input / 23,891 output
Estimated cost: $1.12
Context window usage: 78%
```

At 78%, he's getting close. If he asks Claude to read a few more files, he'll hit the limit. Time to compact:

```
> /compact
```

Claude condenses the entire conversation into a focused summary — keeping the key decisions, file locations, and current task, while discarding the verbose back-and-forth. After compaction:

```
> /cost
```

```
Session tokens: 12,847 input / 891 output
Estimated cost: $0.08
Context window usage: 7%
```

The session drops from 78% to 7%. Arjun has his context back, and the important conclusions from the earlier conversation are preserved in the summary. He can keep working without starting over.

## Example 2: Staying Focused to Preserve Context

After a few sessions where he hit context limits, Arjun develops a feel for what eats context quickly:

**Context-expensive operations:**
- Asking Claude to read entire large files (a 500-line file might be 2,000+ tokens)
- Pasting long error logs or stack traces
- Asking broad questions that require reading many files
- Long multi-turn conversations with lots of code in the responses

**Context-efficient operations:**
- Pointing Claude to specific line ranges or functions
- Breaking work into focused sessions (one task per session)
- Using `/compact` before switching topics
- Asking targeted questions instead of open-ended exploration

For example, instead of:

```
> Read the entire auth middleware and tell me everything about it
```

Arjun learns to be specific:

```
> In packages/api/src/middleware/auth.js, how does the token validation work? Focus on the verifyToken function.
```

The second question gets the same useful answer while consuming a fraction of the context.

## Watch Out

Compaction is lossy. When you run `/compact`, Claude summarizes the conversation — and summaries inevitably lose detail. If you discussed a specific line number, an exact error message, or a nuanced design tradeoff, it might not survive compaction perfectly. For critical details you know you'll need later, consider noting them in your CLAUDE.md (as described in Chapter 4) rather than relying on the session context to preserve them.

## Try It

Start a session and intentionally push the context. Read a few large files, ask broad questions, and watch the numbers climb:

```
> /cost
```

When you're above 50%, compact and compare:

```
> /compact
> /cost
```

Then try asking a question about something you discussed before compaction. You'll see that Claude retains the key points but might not recall every specific detail. This is the tradeoff — and knowing it exists helps you plan your sessions better.
