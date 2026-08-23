/* Build-time LeetCode stats for the DSA-years scene. Server-side GraphQL
   (no CORS at build). Falls back to the resume's numbers if unreachable. */

export interface LeetStats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

const FALLBACK: LeetStats = { total: 501, easy: 346, medium: 142, hard: 13 };

let cache: LeetStats | null = null;

export async function fetchLeetStats(username: string): Promise<LeetStats> {
  if (cache) return cache;
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' },
      body: JSON.stringify({
        query: `query { matchedUser(username: "${username}") { submitStatsGlobal { acSubmissionNum { difficulty count } } } }`,
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) throw new Error(`leetcode ${res.status}`);
    const json = await res.json();
    const nums: { difficulty: string; count: number }[] =
      json?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum ?? [];
    const get = (d: string) => nums.find((n) => n.difficulty === d)?.count ?? 0;
    if (!get('All')) throw new Error('empty stats');
    cache = { total: get('All'), easy: get('Easy'), medium: get('Medium'), hard: get('Hard') };
    return cache;
  } catch (err) {
    console.warn('[leetcode] using fallback stats:', err);
    return FALLBACK;
  }
}
