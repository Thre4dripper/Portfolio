/* External-source sync worker: Hashnode blog (RSS), LeetCode stats, GitHub
   story + repos → src/data/*.json. The site never calls these APIs — not at
   runtime, not even at build. This script (run by the daily GitHub Action,
   or locally via `pnpm sync:data`) is the only thing that talks to them.

   Stale-while-revalidate: a failed or empty source keeps the committed JSON.
   Env: GITHUB_TOKEN (optional — unlocks org memberships + higher rate limit). */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA_DIR = fileURLToPath(new URL('../src/data/', import.meta.url));

const BLOG_RSS = 'https://blogs.ijlalahmad.dev/rss.xml';
const LEETCODE_USER = 'thre4dripper';
const GITHUB_USER = 'Thre4dripper';

function keepOrWrite(file, data, label, isEmpty) {
  const path = join(DATA_DIR, file);
  if (data === null || isEmpty(data)) {
    if (existsSync(path)) {
      console.warn(`[sync] ${label}: source failed/empty — keeping committed ${file}`);
      return;
    }
    throw new Error(`${label}: no data and no committed ${file} to fall back to`);
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log(`[sync] ${label}: wrote ${file}`);
}

/* ---------- blog (Hashnode RSS — the full feed, exact UTC dates) ---------- */
async function fetchBlog() {
  try {
    /* Cloudflare 403s node's default UA — send a browser-ish one */
    const res = await fetch(BLOG_RSS, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) portfolio-sync/1.0' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`RSS ${res.status}`);
    const xml = await res.text();
    const cdata = (block, tag) =>
      block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tag}>`, 's'))?.[1]?.trim() || undefined;
    return (xml.match(/<item>.*?<\/item>/gs) ?? []).flatMap((block) => {
      const title = cdata(block, 'title');
      const link = cdata(block, 'link');
      if (!title || !link) return [];
      const d = cdata(block, 'pubDate') ? new Date(cdata(block, 'pubDate')) : null;
      return [{
        title,
        link,
        /* format in UTC — a GMT-evening publish must not roll into the next local day */
        date: d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '',
        year: d ? String(d.getUTCFullYear()) : '',
        category: cdata(block, 'category'),
      }];
    });
  } catch (err) {
    console.warn('[sync] blog:', err.message);
    return null;
  }
}

/* ---------- leetcode (GraphQL, server-side so no CORS) ---------- */
async function fetchLeet() {
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' },
      body: JSON.stringify({
        query: `query { matchedUser(username: "${LEETCODE_USER}") { submitStatsGlobal { acSubmissionNum { difficulty count } } } }`,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`leetcode ${res.status}`);
    const nums = (await res.json())?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum ?? [];
    const get = (d) => nums.find((n) => n.difficulty === d)?.count ?? 0;
    if (!get('All')) throw new Error('empty stats');
    return { total: get('All'), easy: get('Easy'), medium: get('Medium'), hard: get('Hard') };
  } catch (err) {
    console.warn('[sync] leetcode:', err.message);
    return null;
  }
}

/* ---------- github (profile + story + trimmed repo list) ---------- */
function cleanToken(raw) {
  const t = (raw ?? '').trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
  return t || undefined;
}

async function gh(path, token) {
  const attempt = async (tok) => {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: { Accept: 'application/vnd.github+json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw Object.assign(new Error(`GitHub ${path} → ${res.status}`), { status: res.status });
    return res.json();
  };
  try {
    return await attempt(token);
  } catch (err) {
    if (token && (err.status === 401 || err.status === 403)) {
      console.warn(`[sync] github: token rejected on ${path} — retrying unauthenticated`);
      return attempt(undefined);
    }
    throw err;
  }
}

async function fetchGithub() {
  const token = cleanToken(process.env.GITHUB_TOKEN);
  try {
    const [user, repos] = await Promise.all([
      gh(`/users/${GITHUB_USER}`, token),
      gh(`/users/${GITHUB_USER}/repos?per_page=100&sort=created&direction=asc`, token),
    ]);
    /* orgs are best-effort: /user/orgs (with token) also lists concealed memberships */
    let orgs = [];
    try {
      orgs = token ? await gh('/user/orgs', token) : await gh(`/users/${GITHUB_USER}/orgs`);
    } catch (err) {
      console.warn('[sync] github orgs failed, continuing without:', err.message);
    }
    const own = repos.filter((r) => !r.fork);
    const first = own[0] ?? repos[0];
    return {
      syncedAt: new Date().toISOString(),
      user: {
        login: user.login,
        avatar_url: user.avatar_url,
        followers: user.followers,
        public_repos: user.public_repos,
      },
      story: {
        joinedYear: new Date(user.created_at).getFullYear(),
        firstRepo: first
          ? { name: first.name, year: new Date(first.created_at).getFullYear() }
          : { name: 'first-repo', year: new Date(user.created_at).getFullYear() },
        orgs: orgs.slice(0, 3).map((o) => ({ login: o.login, avatar_url: o.avatar_url })),
        totalStars: repos.reduce((n, r) => n + (r.stargazers_count ?? 0), 0),
        publicRepos: user.public_repos,
      },
      repos: repos.map((r) => ({
        name: r.name,
        html_url: r.html_url,
        description: r.description,
        stargazers_count: r.stargazers_count,
        forks_count: r.forks_count,
        language: r.language,
        fork: r.fork,
        pushed_at: r.pushed_at,
      })),
    };
  } catch (err) {
    console.warn('[sync] github:', err.message);
    return null;
  }
}

const [blog, leet, github] = await Promise.all([fetchBlog(), fetchLeet(), fetchGithub()]);
keepOrWrite('blog.json', blog, 'blog', (d) => d.length === 0);
keepOrWrite('leetcode.json', leet, 'leetcode', (d) => !d.total);
keepOrWrite('github.json', github, 'github', (d) => d.repos.length === 0);
