/* Build-time GitHub story: account milestones for the Journey Log scene.
   Runs during `astro build` only. If GITHUB_TOKEN is set in .env it is used
   server-side to read org memberships (private to the public API) and to
   raise the rate limit — the token never reaches the browser. */

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

async function gh(path: string, token?: string): Promise<any> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`GitHub ${path} → ${res.status}`);
  return res.json();
}

export async function fetchGhStory(username: string): Promise<GhStory | null> {
  const token = import.meta.env.GITHUB_TOKEN;
  try {
    const [user, repos, orgs] = await Promise.all([
      gh(`/users/${username}`, token),
      gh(`/users/${username}/repos?per_page=100&sort=created&direction=asc`, token),
      // With a token, /user/orgs also lists concealed/private memberships.
      token ? gh('/user/orgs', token) : gh(`/users/${username}/orgs`),
    ]);
    const own = repos.filter((r: any) => !r.fork);
    const first = own[0] ?? repos[0];
    return {
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
    return null;
  }
}
