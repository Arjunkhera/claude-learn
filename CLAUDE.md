# Claude Learn

An interactive learning website for Claude Code, built with Astro.

## Tech Stack

- **Framework:** Astro 5 (content collections, SSG)
- **Styling:** Scoped CSS (no framework — keep it simple)
- **Fonts:** Inter (prose) + JetBrains Mono (code)
- **Deploy:** Vercel (static adapter)

## Content Structure

Four pillars, each a content collection:

```
content/
  storybooks/{101,201,301,401}/  — progressive learning tracks
  cookbooks/                      — workflow recipes
  glossary/                       — feature reference
  changelog/                      — release history
```

## Content Authoring

All content is markdown with typed frontmatter. Schemas defined in `src/content.config.ts`.

### Storybook frontmatter
```yaml
title: "Chapter Title"
chapter: 1
track: "101"           # 101 | 201 | 301 | 401
difficulty: "beginner" # beginner | intermediate | advanced | expert
features_used: []      # feature slugs
cross_links: []        # paths to related content
```

### Cookbook frontmatter
```yaml
title: "Recipe Title"
description: "One-liner"
difficulty: "intermediate"
category: "automation"  # automation | code-quality | project-setup | ci-cd | team-workflows
features_used: []
prerequisites: []       # paths to prereq storybook chapters
```

### Glossary frontmatter
```yaml
title: "Feature Name"
category: "extensions"  # core | extensions | integrations | concepts | guides
pairs_well_with: []     # other glossary slugs
learn_links: []         # storybook paths
use_links: []           # cookbook paths
```

### Changelog frontmatter
```yaml
title: "What changed"
date: 2025-01-15
badge: "new"            # new | enhanced | deprecated
cross_links: []
```

## Code Conventions

- One Astro component per file
- Scoped `<style>` blocks — no global class pollution
- CSS custom properties from `src/styles/global.css`
- No JavaScript unless interactive behavior requires it (islands)
- Pages in `src/pages/`, layouts in `src/layouts/`, components in `src/components/`

## Design Tokens

- Difficulty colors: 101=green, 201=blue, 301=purple, 401=red
- Badge colors: new=green, enhanced=blue, deprecated=red
- Content max-width: 720px
- Page max-width: 1200px
- Warm background: #fffbf7
- Accent: #e8590c (warm orange)

## Commands

```bash
npm run dev      # dev server at localhost:4321
npm run build    # production build to dist/
npm run preview  # preview production build
```
