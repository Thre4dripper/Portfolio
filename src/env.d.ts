/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Optional GitHub personal access token, used server-side at build time
   *  to read org memberships and raise the API rate limit. Never shipped
   *  to the browser. Set it in a local `.env` file. */
  readonly GITHUB_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
