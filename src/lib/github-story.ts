/* Build-time GitHub story: account milestones for the Journey Log scene.
   Runs during `astro build` only. If GITHUB_TOKEN is set in .env it is used
   server-side to read org memberships (private to the public API) and to
   raise the rate limit — the token never reaches the browser.

   Resilience rules: a bad or under-scoped token must never make the journey
   WORSE than no token — every authenticated call retries unauthenticated on
   401/403, and a failing orgs lookup degrades to "no org stations" instead
   of nuking the whole story. */

export interface GhOrg {
  login: string;
  avatar_url: string;
}

export interface GhStory {
  joinedYear: number;
  firstRepo: { name: string; year: number };
  orgs: GhOrg[];
  totalStars: number;
  followers: number;
  publicRepos: number;
}

const API = 'https://api.github.com';

function cleanToken(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  // tolerate pasted quotes, "Bearer " prefixes and stray whitespace
  const t = raw.trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '').trim();
  return t || undefined;
}

async function gh(path: string, token?: string): Promise<any> {
  const attempt = async (tok?: string) => {
    const res = await fetch(`${API}${path}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw Object.assign(new Error(`GitHub ${path} → ${res.status}`), { status: res.status });
    return res.json();
  };
  try {
    return await attempt(token);
  } catch (err: any) {
    if (token && (err.status === 401 || err.status === 403)) {
      console.warn(`[github-story] token rejected on ${path} (${err.status}) — retrying unauthenticated`);
      return attempt(undefined);
    }
    throw err;
  }
}

let cache: GhStory | null | undefined; // dev server re-renders per request; fetch once

export async function fetchGhStory(username: string): Promise<GhStory | null> {
  if (cache !== undefined) return cache;
  const token = cleanToken(import.meta.env.GITHUB_TOKEN);
  if (import.meta.env.GITHUB_TOKEN && !token) console.warn('[github-story] GITHUB_TOKEN is set but empty after cleanup');

  try {
    const [user, repos] = await Promise.all([
      gh(`/users/${username}`, token),
      gh(`/users/${username}/repos?per_page=100&sort=created&direction=asc`, token),
    ]);

    // Orgs are best-effort: with a token, /user/orgs also lists concealed
    // memberships (needs read:org); without one we get public orgs only.
    let orgs: any[] = [];
    try {
      orgs = token ? await gh('/user/orgs', token) : await gh(`/users/${username}/orgs`);
    } catch (err) {
      console.warn('[github-story] orgs lookup failed, continuing without org stations:', err);
    }

    const own = repos.filter((r: any) => !r.fork);
    const first = own[0] ?? repos[0];
    cache = {
      joinedYear: new Date(user.created_at).getFullYear(),
      firstRepo: first
        ? { name: first.name, year: new Date(first.created_at).getFullYear() }
        : { name: 'first-repo', year: new Date(user.created_at).getFullYear() },
      orgs: orgs.slice(0, 3).map((o: any) => ({ login: o.login, avatar_url: o.avatar_url })),
      totalStars: repos.reduce((n: number, r: any) => n + (r.stargazers_count ?? 0), 0),
      followers: user.followers,
      publicRepos: user.public_repos,
    };
  } catch (err) {
    console.warn('[github-story] falling back to static journey:', err);
    cache = null;
  }
  return cache;
}
