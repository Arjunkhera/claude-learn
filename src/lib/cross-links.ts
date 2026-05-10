import { getCollection } from 'astro:content';

export type Pillar = '101' | '201' | '301' | '401' | 'cookbook' | 'glossary';

export interface ResolvedLink {
  href: string;
  title: string;
  pillar: Pillar;
  preview: string;
  exists: boolean;
  raw: string;
}

/**
 * Determine the pillar from a link string.
 * Link formats:
 *   "glossary/hooks"                  → glossary
 *   "storybooks/101/01-overview"       → '101'
 *   "cookbooks/auto-lint-on-edit"      → cookbook
 */
function getPillar(link: string): Pillar {
  if (link.startsWith('storybooks/101')) return '101';
  if (link.startsWith('storybooks/201')) return '201';
  if (link.startsWith('storybooks/301')) return '301';
  if (link.startsWith('storybooks/401')) return '401';
  if (link.startsWith('cookbooks/')) return 'cookbook';
  return 'glossary';
}

/**
 * Get human-readable href from a link string.
 * e.g. "glossary/hooks" → "/glossary/hooks"
 *      "storybooks/101/01-overview" → "/storybooks/101/01-overview"
 *      "cookbooks/auto-lint-on-edit" → "/cookbooks/auto-lint-on-edit"
 */
function getHref(link: string): string {
  return `/${link}`;
}

// Cache for collections to avoid repeated fetches within a build
let storybooksCache: Awaited<ReturnType<typeof getCollection<'storybooks'>>> | null = null;
let cookbooksCache: Awaited<ReturnType<typeof getCollection<'cookbooks'>>> | null = null;
let glossaryCache: Awaited<ReturnType<typeof getCollection<'glossary'>>> | null = null;

async function getStorybooksCollection() {
  if (!storybooksCache) storybooksCache = await getCollection('storybooks');
  return storybooksCache;
}

async function getCookbooksCollection() {
  if (!cookbooksCache) cookbooksCache = await getCollection('cookbooks');
  return cookbooksCache;
}

async function getGlossaryCollection() {
  if (!glossaryCache) glossaryCache = await getCollection('glossary');
  return glossaryCache;
}

/**
 * Resolve a single cross-link string to display data.
 * Input: "glossary/hooks" or "storybooks/101/01-overview" or "cookbooks/auto-lint-on-edit"
 * Output: { href, title, pillar, preview, exists }
 */
export async function resolveLink(link: string): Promise<ResolvedLink> {
  const href = getHref(link);
  const pillar = getPillar(link);

  // Parse collection + entry id from the link string
  if (link.startsWith('storybooks/')) {
    // e.g. "storybooks/101/01-overview" → collection: storybooks, id: "101/01-overview"
    const entryId = link.replace('storybooks/', '');
    const entries = await getStorybooksCollection();
    const entry = entries.find((e) => e.id === entryId);
    if (entry) {
      return {
        href,
        title: entry.data.title,
        pillar,
        preview: entry.data.description ?? `Chapter ${entry.data.chapter}`,
        exists: true,
        raw: link,
      };
    }
    return {
      href,
      title: entryId.split('/').pop()?.replace(/-/g, ' ') ?? link,
      pillar,
      preview: 'Chapter not found',
      exists: false,
      raw: link,
    };
  }

  if (link.startsWith('cookbooks/')) {
    // e.g. "cookbooks/auto-lint-on-edit" → id: "auto-lint-on-edit"
    const entryId = link.replace('cookbooks/', '');
    const entries = await getCookbooksCollection();
    const entry = entries.find((e) => e.id === entryId);
    if (entry) {
      return {
        href,
        title: entry.data.title,
        pillar,
        preview: entry.data.description,
        exists: true,
        raw: link,
      };
    }
    return {
      href,
      title: entryId.replace(/-/g, ' '),
      pillar,
      preview: 'Recipe not found',
      exists: false,
      raw: link,
    };
  }

  if (link.startsWith('glossary/')) {
    // e.g. "glossary/hooks" → id: "hooks"
    const entryId = link.replace('glossary/', '');
    const entries = await getGlossaryCollection();
    const entry = entries.find((e) => e.id === entryId);
    if (entry) {
      return {
        href,
        title: entry.data.title,
        pillar,
        preview: `Glossary — ${entry.data.category}`,
        exists: true,
        raw: link,
      };
    }
    return {
      href,
      title: entryId.replace(/-/g, ' '),
      pillar,
      preview: 'Entry not found',
      exists: false,
      raw: link,
    };
  }

  // Fallback for unknown link formats
  const label = link.split('/').pop()?.replace(/-/g, ' ') ?? link;
  return {
    href,
    title: label,
    pillar: 'glossary',
    preview: 'Unknown link format',
    exists: false,
    raw: link,
  };
}

/**
 * Resolve multiple cross-link strings in parallel.
 */
export async function resolveLinks(links: string[]): Promise<ResolvedLink[]> {
  return Promise.all(links.map(resolveLink));
}

/**
 * Find all glossary entries whose learn_links include the given storybook chapter link.
 * Input: "storybooks/101/01-overview"
 * Returns glossary entries that reference this chapter.
 */
export async function getGlossaryBacklinksForChapter(chapterLink: string) {
  const entries = await getGlossaryCollection();
  return entries.filter((e) => e.data.learn_links.includes(chapterLink));
}

/**
 * Find all glossary entries whose use_links include the given cookbook link.
 * Input: "cookbooks/auto-lint-on-edit"
 * Returns glossary entries that reference this cookbook.
 */
export async function getGlossaryBacklinksForCookbook(cookbookLink: string) {
  const entries = await getGlossaryCollection();
  return entries.filter((e) => e.data.use_links.includes(cookbookLink));
}
