# 🛠 Contributing

> **TL;DR** — This is a personal portfolio, so feature PRs that change *my* story won't land. Bug reports, accessibility and performance fixes, and forks for your own site are all very welcome. `pnpm install && pnpm dev` gets you running.

---

## What's welcome

| Contribution | Welcome? |
|---|---|
| Bug reports (broken interaction, layout, console error) | ✅ yes, please |
| Accessibility fixes (focus, contrast, reduced motion, screen readers) | ✅ especially |
| Performance improvements (bundle size, paint, animation cost) | ✅ yes |
| Browser-compat fixes (Safari/Firefox quirks) | ✅ yes |
| Typos in code comments or docs | ✅ sure |
| Changes to my biography, résumé, or interests content | ❌ that's mine to edit |
| New chapters / redesigns of the flight | ❌ open an issue to discuss first |

Forking this to build your own portfolio is encouraged — see the note in
[LICENSE](LICENSE) about code vs. content.

---

## Getting set up

Requires **Node 22.12 or newer** (Astro 7's floor) and pnpm.

```bash
pnpm install     # pnpm, not npm — the lockfile is pnpm's
pnpm dev         # dev server at localhost:4321
pnpm check       # astro check — must be 0 errors
pnpm build       # production build; must succeed before you open a PR
```

No secrets are needed to run or build the site. The committed
`src/data/*.json` is all the data it renders — tokens are only for the sync
workers, and they're optional.

---

## The one architectural rule

**`src/data/*.json` is the only data layer. Workers write it, the app renders it.**

No component, page, or script may call an external API — not at runtime, not at
build time. `astro build` must work with the network unplugged. If you need new
external data, add it to a worker in `scripts/`:

| Worker | Command | Writes |
|---|---|---|
| `sync-data.mjs` | `pnpm sync:data` | `blog.json`, `github.json`, `leetcode.json` |
| `sync-notion.mjs` | `pnpm sync:notion` | `movies.json` |
| `build-sketches.mjs` | `pnpm sketches` | `sketches.json` + `public/sketches/*` |

Every worker must be **stale-safe**: if its source fails or returns nothing,
keep the committed JSON and warn — never write an empty file, never fail the
build.

---

## House style

- **No frameworks.** Vanilla TS + Astro components, hand-written CSS in
  `src/styles/global.css`. Don't add React, Tailwind, or a UI library.
- **Zero client dependencies.** The whole flight runtime is a few small modules;
  keep it that way.
- **Comments explain *why*, not *what*.** Especially for the physics and the
  pointer-events rules — those exist because of real bugs.
- **Match the surrounding code.** Same naming, same density, same idiom.

---

## Before you open a PR

1. `pnpm check` → 0 errors
2. `pnpm build` → succeeds
3. Click through the flight: does your change survive scrolling past and back?
4. Test both directions — several past bugs only appeared when approaching a
   scene from below.
5. Check `prefers-reduced-motion` still lands in flat mode.

Describe *what you observed* in the PR, not just what you changed — a
screenshot or short clip of the interaction helps enormously.

---

## Reporting a bug

Include:

- What you expected vs. what happened
- Browser + OS, and whether you used a mouse, trackpad, or touch
- Which act/scene you were on (the era colors are a good hint)
- Console output if there is any

Security issues go through [SECURITY.md](SECURITY.md) instead — please don't
open a public issue for those.
