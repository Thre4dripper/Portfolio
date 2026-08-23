/* Build-time blog integration: fetches the RSS feed during `astro build`
   and hands parsed posts to the components. No client JS, no CORS.
   (Hashnode's GraphQL API went paid-only in May 2026; the RSS feed carries
   the full post list with exact publish dates, so it remains the source.) */

export interface BlogPost {
  title: string;
  link: string;
  date: string; // "Dec 31, 2023" — formatted in UTC to match the feed
  year: string; // "2023"
  category?: string;
}

const cdata = (block: string, tag: string): string | undefined => {
  const m = block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tag}>`, 's'));
  return m?.[1]?.trim() || undefined;
};

let cache: BlogPost[] | null = null; // dev server re-renders per request; fetch once

export async function fetchPosts(rssUrl: string): Promise<BlogPost[]> {
  if (cache) return cache;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(rssUrl, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
      const xml = await res.text();
      const items = xml.match(/<item>.*?<\/item>/gs) ?? [];
      cache = items.flatMap((block) => {
        const title = cdata(block, 'title');
        const link = cdata(block, 'link');
        if (!title || !link) return [];
        const pub = cdata(block, 'pubDate');
        // Format in UTC — a GMT-evening publish must not roll into the next
        // local day (Dec 31 18:30 GMT rendered as Jan 1 in IST once already).
        const d = pub ? new Date(pub) : null;
        const date = d
          ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
          : '';
        const year = d ? String(d.getUTCFullYear()) : '';
        return [{ title, link, date, year, category: cdata(block, 'category') }];
      });
      return cache;
    } catch (err) {
      console.warn(`[blog] attempt ${attempt}/3 failed for ${rssUrl}:`, err);
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  // A dead feed must never break the build — the site falls back to plain links.
  return [];
}
