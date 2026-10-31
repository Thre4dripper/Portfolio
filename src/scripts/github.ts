/* Skill panels, rendered entirely from the worker-synced src/data/github.json —
   the browser makes zero API calls. Freshness comes from the daily sync
   workflow, not from hammering the GitHub API per visitor. */
import github from '../data/github.json';
import type { GhRepo } from '../lib/types';

const repos = github.repos as GhRepo[];

/* ---------- skill → repos panel ----------
   Click any skill tag and see the actual repos where it lives — matched
   against the same synced repo list. */

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
  'AI platforms': ['llm', 'agent', 'ai'],
  'Agentic systems': ['agent', 'llm'],
  Kafka: ['kafka', 'notification'],
  MySQL: ['mysql', 'sql'],
  FCM: ['fcm', 'notification', 'firebase'],
  WebRTC: ['webrtc', 'stream'],
  Git: ['git'],
  Linux: ['linux', 'server'],
  Android: ['android', 'apk'],
  Kotlin: ['kotlin'],
};

function matchRepos(skill: string): GhRepo[] {
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

  document.addEventListener('click', (e) => {
    const tag = (e.target as HTMLElement).closest<HTMLElement>('[data-skill]');
    if (!tag) {
      if (!(e.target as HTMLElement).closest('#skillpanel')) close();
      return;
    }
    e.stopPropagation();
    const skill = tag.dataset.skill!;
    const searchUrl = `https://github.com/${username}?tab=repositories&q=${encodeURIComponent(skill)}`;
    const hits = matchRepos(skill);
    panel.hidden = false;
    panel.innerHTML =
      `<div class="sp-head"><b>${skill}</b> in the wild <button class="sp-x" aria-label="close">×</button></div>` +
      `<div class="sp-list">` +
      (hits.length
        ? hits
            .map(
              (r) =>
                `<a href="${r.html_url}" target="_blank" rel="noopener">${r.name}` +
                `<span>★ ${r.stargazers_count}${r.language ? ' · ' + r.language : ''}</span></a>`,
            )
            .join('')
        : `<span class="sp-empty">nothing public tagged yet — try the search ↓</span>`) +
      `<a class="sp-all" href="${searchUrl}" target="_blank" rel="noopener">search "${skill}" in all repos →</a></div>`;
    panel.querySelector('.sp-x')!.addEventListener('click', close);
  });
}
