import { getCollection } from 'astro:content';

interface LinkValidationResult {
  source: string;
  field: string;
  link: string;
  exists: boolean;
  reason?: string;
}

/**
 * Validate a single link string against the loaded collections.
 */
async function validateLink(
  link: string,
  storybooks: Awaited<ReturnType<typeof getCollection<'storybooks'>>>,
  cookbooks: Awaited<ReturnType<typeof getCollection<'cookbooks'>>>,
  glossary: Awaited<ReturnType<typeof getCollection<'glossary'>>>,
): Promise<{ exists: boolean; reason?: string }> {
  if (link.startsWith('storybooks/')) {
    const entryId = link.replace('storybooks/', '');
    const found = storybooks.some((e) => e.id === entryId);
    return found ? { exists: true } : { exists: false, reason: `No storybook entry with id "${entryId}"` };
  }
  if (link.startsWith('cookbooks/')) {
    const entryId = link.replace('cookbooks/', '');
    const found = cookbooks.some((e) => e.id === entryId);
    return found ? { exists: true } : { exists: false, reason: `No cookbook entry with id "${entryId}"` };
  }
  if (link.startsWith('glossary/')) {
    const entryId = link.replace('glossary/', '');
    const found = glossary.some((e) => e.id === entryId);
    return found ? { exists: true } : { exists: false, reason: `No glossary entry with id "${entryId}"` };
  }
  return { exists: false, reason: `Unrecognized link format: "${link}"` };
}

/**
 * Scan all content collections and validate every cross-link reference.
 * Logs warnings for broken links to the console.
 * Returns results for programmatic use.
 */
export async function validateAllLinks(): Promise<LinkValidationResult[]> {
  const [storybooks, cookbooks, glossary, changelog] = await Promise.all([
    getCollection('storybooks'),
    getCollection('cookbooks'),
    getCollection('glossary'),
    getCollection('changelog'),
  ]);

  const results: LinkValidationResult[] = [];

  // Validate storybook cross_links
  for (const entry of storybooks) {
    for (const link of entry.data.cross_links) {
      const { exists, reason } = await validateLink(link, storybooks, cookbooks, glossary);
      results.push({ source: `storybooks/${entry.id}`, field: 'cross_links', link, exists, reason });
    }
  }

  // Validate cookbook prerequisites and features_used
  for (const entry of cookbooks) {
    for (const link of entry.data.prerequisites) {
      const { exists, reason } = await validateLink(link, storybooks, cookbooks, glossary);
      results.push({ source: `cookbooks/${entry.id}`, field: 'prerequisites', link, exists, reason });
    }
    for (const link of entry.data.features_used) {
      // features_used are glossary slugs (e.g. "hooks"), not full paths
      const fullLink = `glossary/${link}`;
      const { exists, reason } = await validateLink(fullLink, storybooks, cookbooks, glossary);
      results.push({ source: `cookbooks/${entry.id}`, field: 'features_used', link: fullLink, exists, reason });
    }
  }

  // Validate glossary learn_links, use_links, pairs_well_with
  for (const entry of glossary) {
    for (const link of entry.data.learn_links) {
      const { exists, reason } = await validateLink(link, storybooks, cookbooks, glossary);
      results.push({ source: `glossary/${entry.id}`, field: 'learn_links', link, exists, reason });
    }
    for (const link of entry.data.use_links) {
      const { exists, reason } = await validateLink(link, storybooks, cookbooks, glossary);
      results.push({ source: `glossary/${entry.id}`, field: 'use_links', link, exists, reason });
    }
    for (const slug of entry.data.pairs_well_with) {
      const fullLink = `glossary/${slug}`;
      const { exists, reason } = await validateLink(fullLink, storybooks, cookbooks, glossary);
      results.push({ source: `glossary/${entry.id}`, field: 'pairs_well_with', link: fullLink, exists, reason });
    }
  }

  // Validate changelog cross_links
  for (const entry of changelog) {
    for (const link of entry.data.cross_links) {
      const { exists, reason } = await validateLink(link, storybooks, cookbooks, glossary);
      results.push({ source: `changelog/${entry.id}`, field: 'cross_links', link, exists, reason });
    }
  }

  // Log warnings for broken links
  const broken = results.filter((r) => !r.exists);
  if (broken.length > 0) {
    console.warn(`\n[cross-links] Found ${broken.length} broken link(s):`);
    for (const r of broken) {
      console.warn(`  ⚠ ${r.source} [${r.field}]: "${r.link}" — ${r.reason}`);
    }
  } else {
    console.log(`[cross-links] All ${results.length} links validated OK.`);
  }

  return results;
}
