/* Shapes of the worker-synced JSON in src/data/. The fetching lives in
   scripts/sync-data.mjs (daily GitHub Action) — the app only renders. */

export interface BlogPost {
  title: string;
  link: string;
  date: string; // "Dec 31, 2023" — formatted in UTC by the worker
  year: string;
  category?: string;
}

export interface LeetStats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface GhOrg {
  login: string;
  avatar_url: string;
}

export interface GhStory {
  joinedYear: number;
  firstRepo: { name: string; year: number };
  orgs: GhOrg[];
  totalStars: number;
  publicRepos: number;
}

export interface GhRepo {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  fork: boolean;
  pushed_at: string;
}

export interface GhData {
  syncedAt: string;
  user: { login: string; avatar_url: string; followers: number; public_repos: number };
  story: GhStory;
  repos: GhRepo[];
}
