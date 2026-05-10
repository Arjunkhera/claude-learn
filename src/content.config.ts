import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const storybooks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/storybooks' }),
  schema: z.object({
    title: z.string(),
    chapter: z.number(),
    track: z.enum(['101', '201', '301', '401']),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    features_used: z.array(z.string()).default([]),
    cross_links: z.array(z.string()).default([]),
    description: z.string().optional(),
  }),
});

const cookbooks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/cookbooks' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    category: z.enum(['automation', 'code-quality', 'project-setup', 'ci-cd', 'team-workflows']),
    features_used: z.array(z.string()).default([]),
    prerequisites: z.array(z.string()).default([]),
  }),
});

const glossary = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/glossary' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['core', 'extensions', 'integrations', 'concepts', 'guides']),
    pairs_well_with: z.array(z.string()).default([]),
    learn_links: z.array(z.string()).default([]),
    use_links: z.array(z.string()).default([]),
  }),
});

const changelog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/changelog' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    badge: z.enum(['new', 'enhanced', 'deprecated']),
    cross_links: z.array(z.string()).default([]),
  }),
});

export const collections = { storybooks, cookbooks, glossary, changelog };
