# Ijlal Ahmad — Portfolio

A portfolio you fly through. Built with [Astro](https://astro.build) + TypeScript —
all content is statically rendered HTML (SEO-friendly, works without JS), and the
flight experience is a small vanilla-TS runtime with **zero framework JavaScript**.

## Commands

| Command        | Action                                       |
| -------------- | -------------------------------------------- |
| `pnpm install` | Install dependencies                         |
| `pnpm dev`     | Dev server at `localhost:4321`               |
| `pnpm build`   | Production build to `./dist/`                |
| `pnpm preview` | Preview the production build locally         |
| `pnpm check`   | Typecheck `.astro` + `.ts` files             |

## Where things live

```
src/
  data/portfolio.ts      ← EDIT ME: all content (timeline, eras, notes, links, SEO text)
  lib/blog.ts            ← build-time RSS fetch from blogs.ijlalahmad.dev
  styles/global.css      ← all styling
  layouts/Base.astro     ← <head>: meta tags, Open Graph, JSON-LD, fonts
  pages/index.astro      ← the single page
  components/
    World.astro          ← the 3D flight path, server-rendered (incl. card satellites,
                            blog postcards, Mission Control shell)
    Overlays.astro       ← HUD, rail, dock, rocket co-pilot, robot, train, satellite
    FlatMode.astro       ← the "boring mode" plain version
  scripts/
    main.ts              ← camera + magnetic snap, input, animation loop
    era.ts               ← era color blending
    sky.ts               ← canvas sky + particles
    setpieces.ts         ← drawing canvas, terminal, castle, ?-block
    github.ts            ← live GitHub API → orbital repo system
```

## Live integrations

- **Mission Control** — repos are fetched client-side from the GitHub API
  (unauthenticated, cached in sessionStorage for 30 min) and rendered as an
  orbital system: planet size = stars, color = language. Fails soft to a
  plain GitHub link if the API is unreachable.
- **Field Reports** — the latest three posts are fetched from the blog's RSS
  feed at build time and server-rendered as airmail postcards (plus listed in
  flat mode). A dead feed never breaks the build.

## Before you deploy — TODOs

1. **Domain**: set `site` in `astro.config.mjs` and the Sitemap URL in
   `public/robots.txt` to your real domain (powers canonical/OG/sitemap URLs).
2. **Email**: replace `hello@example.com` in `src/data/portfolio.ts` (`SITE.email`).
3. **OG image**: add a 1200×630 `public/og.png` and uncomment the `og:image`
   tag in `src/layouts/Base.astro` for rich link previews.

## Performance & SEO notes

- Fonts are self-hosted variable fonts (`@fontsource-variable/*`) — no
  render-blocking Google Fonts round trips.
- CSS is inlined into the single HTML file (`inlineStylesheets: 'always'`).
- The timeline, skills and bio are real HTML at build time — crawlable, and
  shown via `<noscript>`/reduced-motion fallbacks as the plain version.
- Sitemap (`@astrojs/sitemap`), canonical URL, Open Graph, Twitter card and
  JSON-LD `Person` schema are generated in `src/layouts/Base.astro`.
