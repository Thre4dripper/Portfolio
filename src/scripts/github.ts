/* Mission Control: fetches the GitHub API client-side (real-time, unauthenticated)
   and renders repos as an orbital system — planet size by stars, color by language.
   Cached in sessionStorage for 30 minutes to respect the rate limit. */

interface Repo {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  fork: boolean;
  pushed_at: string;
}

interface User {
  avatar_url: string;
  followers: number;
  public_repos: number;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6', JavaScript: '#F1E05A', Kotlin: '#A97BFF', 'C++': '#F34B7D',
  HTML: '#E34C26', CSS: '#663399', Python: '#3572A5', Shell: '#89E051',
  Java: '#B07219', C: '#8A8A8A', Go: '#00ADD8', Rust: '#DEA584', Dart: '#00B4AB',
  Vue: '#41B883', Svelte: '#FF3E00', Dockerfile: '#384D54',
};

const CACHE_KEY = 'gh-orbit-v1';
const CACHE_TTL = 30 * 60 * 1000;

async function fetchData(user: string): Promise<{ repos: Repo[]; user: User }> {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? 'null');
    if (cached && Date.now() - cached.at < CACHE_TTL) return cached.data;
  } catch { /* ignore cache corruption */ }

  const [reposRes, userRes] = await Promise.all([
    fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`, { signal: AbortSignal.timeout(10_000) }),
    fetch(`https://api.github.com/users/${user}`, { signal: AbortSignal.timeout(10_000) }),
  ]);
  if (!reposRes.ok || !userRes.ok) throw new Error('GitHub API unavailable');
  const data = { repos: (await reposRes.json()) as Repo[], user: (await userRes.json()) as User };
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch { /* storage may be unavailable */ }
  return data;
}

let dataPromise: Promise<{ repos: Repo[]; user: User }> | null = null;
function getGithubData(username: string) {
  if (!dataPromise) dataPromise = fetchData(username);
  return dataPromise;
}

let started = false;

export function loadGithub(): void {
  if (started) return;
  started = true;
  const sys = document.getElementById('orbit-sys');
  if (!sys) return;
  const username = sys.dataset.user!;

  getGithubData(username)
    .then(({ repos, user }) => render(sys, repos, user, username))
    .catch(() => {
      const status = document.getElementById('orbit-status');
      if (status) status.textContent = 'telemetry offline — see the full archive below';
    });
}

/* ---------- skill → repos panel ----------
   Click any skill tag and see the actual repos where it lives, live from
   the same cached GitHub fetch that powers Mission Control. */

const SKILL_ALIASES: Record<string, string[]> = {
  'Node.js': ['node'],
  'Three.js': ['three'],
  'Next.js': ['next'],
  'Raspberry Pi': ['raspberry', 'home-server'],
  'Self-hosting': ['server', 'self-host', 'homelab', 'home-server'],
  'Data structures': ['dsa', 'data-structure', 'programs'],
  Algorithms: ['dsa', 'algorithm', 'leetcode', 'programs'],
  'Canvas API': ['canvas', 'draw', 'boardy'],
  'AI proctoring': ['proctor', 'medusa', 'exam'],
  'Procedural generation': ['procedural', 'castle'],
  'Problem solving': ['leetcode', 'dsa'],
  'Computer Science': ['dsa', 'programs'],
  Express: ['express', 'server'],
  Docker: ['docker'],
  Redis: ['redis'],
  gRPC: ['grpc'],
  AWS: ['aws', 'lambda', 's3'],
  ECS: ['ecs', 'aws'],
  Splunk: ['splunk'],
  'LLM agents': ['llm', 'agent', 'ai'],
  IAM: ['iam', 'auth', 'casbin'],
  'Multi-tenancy': ['tenant', 'multi-tenant'],
  WebRTC: ['webrtc', 'stream'],
  Git: ['git'],
  Linux: ['linux', 'server'],
  Android: ['android', 'apk'],
  Kotlin: ['kotlin'],
};

function matchRepos(repos: Repo[], skill: string): Repo[] {
  const needles = [skill.toLowerCase(), ...(SKILL_ALIASES[skill] ?? [])];
  return repos
    .filter((r) => !r.fork)
    .filter((r) => {
      if (r.language && r.language.toLowerCase() === skill.toLowerCase()) return true;
      const hay = `${r.name} ${r.description ?? ''}`.toLowerCase();
      return needles.some((n) => hay.includes(n));
    })
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);
}

export function initSkillPanel(username: string): void {
  const panel = document.createElement('div');
  panel.id = 'skillpanel';
  panel.hidden = true;
  document.body.appendChild(panel);

  const close = () => (panel.hidden = true);
  addEventListener('keydown', (e) => e.key === 'Escape' && close());

  document.addEventListener('click', async (e) => {
    const tag = (e.target as HTMLElement).closest<HTMLElement>('[data-skill]');
    if (!tag) {
      if (!(e.target as HTMLElement).closest('#skillpanel')) close();
      return;
    }
    e.stopPropagation();
    const skill = tag.dataset.skill!;
    const searchUrl = `https://github.com/${username}?tab=repositories&q=${encodeURIComponent(skill)}`;
    panel.hidden = false;
    panel.innerHTML =
      `<div class="sp-head"><b>${skill}</b> in the wild <button class="sp-x" aria-label="close">×</button></div>` +
      `<div class="sp-list"><span class="sp-empty">querying github…</span></div>`;
    panel.querySelector('.sp-x')!.addEventListener('click', close);
    try {
      const { repos } = await getGithubData(username);
      const hits = matchRepos(repos, skill);
      const list = panel.querySelector('.sp-list')!;
      list.innerHTML = hits.length
        ? hits
            .map(
              (r) =>
                `<a href="${r.html_url}" target="_blank" rel="noopener">${r.name}` +
                `<span>★ ${r.stargazers_count}${r.language ? ' · ' + r.language : ''}</span></a>`,
            )
            .join('')
        : `<span class="sp-empty">nothing public tagged yet — try the search ↓</span>`;
      list.insertAdjacentHTML(
        'beforeend',
        `<a class="sp-all" href="${searchUrl}" target="_blank" rel="noopener">search "${skill}" in all repos →</a>`,
      );
    } catch {
      panel.querySelector('.sp-list')!.innerHTML =
        `<a class="sp-all" href="${searchUrl}" target="_blank" rel="noopener">search "${skill}" on GitHub →</a>`;
    }
  });
}

function render(sys: HTMLElement, repos: Repo[], user: User, username: string): void {
  const top = repos
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count || +new Date(b.pushed_at) - +new Date(a.pushed_at))
    .slice(0, 8);
  if (!top.length) return;

  document.getElementById('orbit-status')?.remove();
  const half = sys.clientWidth / 2;
  const totalStars = repos.reduce((n, r) => n + r.stargazers_count, 0);

  /* center core */
  const core = document.createElement('div');
  core.className = 'core';
  core.innerHTML = `<img src="${user.avatar_url}&s=120" width="54" height="54" alt="${username}'s GitHub avatar" loading="lazy"><span>@${username}</span>`;
  sys.appendChild(core);

  /* tooltip (shared) */
  const tip = document.createElement('div');
  tip.id = 'orbit-tip';
  document.body.appendChild(tip);

  top.forEach((repo, i) => {
    const r = half * (0.34 + (i * 0.62) / Math.max(1, top.length - 1));
    const dur = 30 + i * 9;
    const del = -((i * 137) % dur);
    const size = 13 + Math.min(22, Math.sqrt(repo.stargazers_count) * 2.6);
    const color = (repo.language && LANG_COLORS[repo.language]) || 'var(--accent)';

    const ring = document.createElement('div');
    ring.className = 'ring';
    ring.style.setProperty('--r', `${r.toFixed(0)}px`);
    ring.innerHTML =
      `<div class="orb" style="--dur:${dur}s;--del:${del}s">` +
      `<div class="planet"><a class="pbody" style="--dur:${dur}s;--del:${del}s;--sz:${size.toFixed(0)}px;--pc:${color}" ` +
      `href="${repo.html_url}" target="_blank" rel="noopener" aria-label="${repo.name} on GitHub">` +
      `<i></i><span>${repo.name.length > 18 ? repo.name.slice(0, 17) + '…' : repo.name}</span></a></div></div>`;
    sys.appendChild(ring);

    const body = ring.querySelector<HTMLElement>('.pbody')!;
    body.addEventListener('pointerenter', () => {
      tip.innerHTML =
        `<b>${repo.name}</b>` +
        (repo.description ? `<div class="d">${repo.description}</div>` : '') +
        `<div class="m">★ ${repo.stargazers_count} · ⑂ ${repo.forks_count}${repo.language ? ' · ' + repo.language : ''}</div>`;
      tip.style.opacity = '1';
    });
    body.addEventListener('pointermove', (e) => {
      tip.style.left = Math.min(innerWidth - 270, e.clientX + 16) + 'px';
      tip.style.top = Math.max(10, e.clientY - 20) + 'px';
    });
    body.addEventListener('pointerleave', () => (tip.style.opacity = '0'));
  });

  const stats = document.getElementById('gh-stats');
  if (stats)
    stats.innerHTML =
      `<span>★ ${totalStars} stars</span>` +
      `<span>${user.followers} followers</span>` +
      `<span>${user.public_repos} public repos</span>`;
}
