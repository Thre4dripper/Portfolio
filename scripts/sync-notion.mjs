/* Notion → src/data sync worker.
   The site NEVER calls Notion at runtime — this script runs in the daily
   GitHub Action (or locally via `pnpm sync:notion`), pulls the databases,
   and rewrites the JSON files the pages render from.

   Stale-while-revalidate rules:
   - no NOTION_TOKEN            → skip quietly, keep committed JSON (exit 0)
   - API error / empty response → warn, keep committed JSON (exit 0)
   Only a successful, non-empty pull overwrites a data file.

   Env (see .env.example):
     NOTION_TOKEN      — internal integration secret (Settings → Connections)
     NOTION_MOVIES_DB  — database id of the "Movies Watched" DB
     NOTION_GAMES_DB   — optional, same pattern, for later */
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url).pathname;
const TOKEN = (process.env.NOTION_TOKEN ?? '').trim();
const NOTION_VERSION = '2022-06-28';

async function queryAll(dbId) {
  const results = [];
  let cursor;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`Notion ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const json = await res.json();
    results.push(...json.results);
    cursor = json.has_more ? json.next_cursor : undefined;
  } while (cursor);
  return results;
}

/* Property readers that tolerate whatever type the column actually is. */
const plain = (prop) => {
  if (!prop) return '';
  const rt = prop.title ?? prop.rich_text;
  if (rt) return rt.map((t) => t.plain_text).join('').trim();
  if (prop.number != null) return String(prop.number);
  if (prop.select) return prop.select.name ?? '';
  return '';
};
const titleOf = (page) => {
  const key = Object.keys(page.properties).find((k) => page.properties[k].type === 'title');
  return key ? plain(page.properties[key]) : '';
};

function writeIfBetter(file, data, label) {
  const path = `${ROOT}src/data/${file}`;
  const prev = JSON.parse(readFileSync(path, 'utf8'));
  const prevCount = Array.isArray(prev) ? prev.length : 0;
  if (data.length === 0) {
    console.warn(`[sync] ${label}: Notion returned 0 rows — keeping existing ${prevCount}`);
    return;
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log(`[sync] ${label}: ${prevCount} → ${data.length} entries`);
}

async function syncMovies(dbId) {
  const pages = await queryAll(dbId);
  const movies = pages
    .map((p) => {
      const yearRaw = plain(p.properties.Year ?? p.properties.year);
      return {
        name: titleOf(p),
        year: /^\d{4}$/.test(yearRaw) ? Number(yearRaw) : null,
      };
    })
    .filter((m) => m.name)
    .sort((a, b) => a.name.localeCompare(b.name));
  writeIfBetter('movies.json', movies, 'movies');
}

if (!TOKEN) {
  console.log('[sync] NOTION_TOKEN not set — skipping, committed JSON stays authoritative');
  process.exit(0);
}

try {
  if (process.env.NOTION_MOVIES_DB) await syncMovies(process.env.NOTION_MOVIES_DB.trim());
  else console.log('[sync] NOTION_MOVIES_DB not set — movies skipped');
  /* future: NOTION_GAMES_DB / NOTION_ANIME_DB follow the same pattern */
} catch (err) {
  console.warn('[sync] Notion unreachable — keeping committed JSON:', err.message);
}
