/// <reference types="astro/client" />

/* No env vars are read at build time — the site is a pure render of
   src/data/*.json. Secrets (NOTION_TOKEN, GITHUB_TOKEN, …) belong to the
   sync workers in scripts/, which read process.env. See .env.example. */
