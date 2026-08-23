/* Build-time blog integration: fetches the RSS feed during `astro build`
   and hands parsed posts to the components. No client JS, no CORS. */

export interface BlogPost {
  title: string;
  link: string;
  date: string;
  category?: string;
}

const cdata = (block: string, tag: string): string | undefined => {
  const m = block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tag}>`, 's'));
  return m?.[1]?.trim() || undefined;
};

export async function fetchPosts(rssUrl: string, limit = 50): Promise<BlogPost[]> {
  try {
    const res = await fetch(rssUrl, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
    const xml = await res.text();
    const items = xml.match(/<item>.*?<\/item>/gs) ?? [];
    return items.slice(0, limit).flatMap((block) => {
      const title = cdata(block, 'title');
      const link = cdata(block, 'link');
      if (!title || !link) return [];
      const pub = cdata(block, 'pubDate');
      const date = pub
        ? new Date(pub).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '';
      return [{ title, link, date, category: cdata(block, 'category') }];
    });
  } catch (err) {
    // A dead feed must never break the build — the site falls back to plain links.
    console.warn(`[blog] could not fetch ${rssUrl}:`, err);
    return [];
  }
}
