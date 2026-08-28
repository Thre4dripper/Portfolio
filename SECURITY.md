# 🔐 Security Policy

> **TL;DR** — This site is fully static: no backend, no database, no runtime API calls. The only secrets that exist are the sync tokens (`NOTION_TOKEN`, `GH_PAT`) which live in `.env` locally and GitHub Actions secrets in CI. Never commit `.env`. If a token leaks, **rotate first, rewrite history second**.

---

## Reporting a Vulnerability

If you find a security issue, **please do not open a public GitHub issue**. Instead:

- Open a [private security advisory](https://github.com/Thre4dripper/Portfolio/security/advisories/new), **or**
- Email the maintainer (see GitHub profile)

Expect an acknowledgement within 7 days.

---

## 🧱 Threat Model

The attack surface here is deliberately tiny:

| Property | Status | Why it matters |
|---|---|---|
| Backend / server code | **None** | Static files only — nothing to exploit at runtime |
| Database | **None** | `src/data/*.json` is the data layer; git is the store |
| Runtime API calls | **None** | Even GitHub data is baked in at build time |
| User input / forms | **None** | No submissions, no cookies, no sessions |
| Third-party scripts | **None** | Zero analytics, zero trackers, self-hosted fonts |
| Browser storage | **None** | Nothing is written to localStorage or IndexedDB |

That leaves exactly two things worth protecting: **the sync tokens** and **the build/deploy pipeline**.

---

## 🔑 Secrets

| Secret | Used by | Lives in | Scope needed |
|---|---|---|---|
| `NOTION_TOKEN` | `scripts/sync-notion.mjs` | `.env` (local) · Actions secret (CI) | read-only integration, shared with one database |
| `NOTION_MOVIES_DB` | `scripts/sync-notion.mjs` | same | database id (not a secret, but kept together) |
| `GH_PAT` | `scripts/sync-data.mjs` | `.env` (local) · `GH_STORY_TOKEN` Actions secret | `read:org` only — no repo write |

Rules:

- **`.env` is gitignored and must stay that way.** Use `.env.example` for documentation; it holds names, never values.
- **Least privilege.** The GitHub token needs `read:org` and nothing else; the Notion integration is shared with one database, not the workspace.
- **Tokens are build-time only.** No secret is ever read by `astro build` or shipped in the client bundle — the workers write JSON, the site renders JSON.
- **Rotate on exposure.** If a token appears in a diff, a log, or a screenshot: revoke it at the provider *first* (it's live the moment it leaks), then clean history.

### If a secret is committed

```bash
# 1. REVOKE at the provider immediately — history rewriting is not containment
#    Notion:  https://www.notion.so/my-integrations
#    GitHub:  https://github.com/settings/tokens

# 2. Then scrub it from history
git filter-branch --index-filter 'git rm -rq --cached --ignore-unmatch .env' --prune-empty -- --all
rm -rf .git/refs/original && git reflog expire --expire=now --all && git gc --prune=now

# 3. Issue a fresh token and update .env + the Actions secret
```

---

## 🤖 Automated Hygiene

| Tool | What it watches | Cadence |
|---|---|---|
| **Dependabot** (`.github/dependabot.yml`) | GitHub Actions + npm/pnpm packages | weekly, grouped |
| **`refresh data` workflow** | Runs the sync workers with least-privilege tokens | daily 07:00 IST |

The daily workflow commits only `src/data/` and never echoes secret values. Its `permissions:` block is scoped to `contents: write` — no packages, no deployments, no id-token.

---

## 🛡️ Supply Chain

- `pnpm-lock.yaml` is committed and CI installs with `--frozen-lockfile`, so builds are reproducible and a compromised transitive release can't slip in silently.
- Build scripts are allow-listed explicitly in `pnpm-workspace.yaml` (`allowBuilds`) — only `esbuild` and `sharp` may run postinstall code.
- The site declares no external origins at runtime: fonts are self-hosted, images are local. The only outbound request from a visitor's browser is the GitHub avatar in Mission Control.

---

## 📋 Supported Versions

This is a single deployed site, not a released library — only the current `main` branch is supported. Fixes land on `main` and deploy from there.
