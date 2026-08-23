/* =====================================================
   EDIT ME: all site content lives in this file —
   timeline items, field notes, era colors, crow lines.
   ===================================================== */

export interface EraDef {
  name: string;
  sub: string;
  top: string;
  bot: string;
  acc: string;
  deep: string;
}

export const ERAS: EraDef[] = [
  { name: 'ACT I · THE SPARK', sub: '2016 — 2018', top: '#241436', bot: '#4A2145', acc: '#F49FB6', deep: '#B03A66' },
  { name: 'ACT II · THE GRIND', sub: '2019 — 2020', top: '#0A0F22', bot: '#14224A', acc: '#7FB4FF', deep: '#2C5AB0' },
  { name: 'ACT III · THE BUILDER', sub: '2021 — 2024', top: '#071414', bot: '#0E2B26', acc: '#4FE0B0', deep: '#0E7A5C' },
  { name: 'ACT IV · WORLDMAKER', sub: '2025', top: '#0B0E1A', bot: '#221334', acc: '#F2A93B', deep: '#C4571F' },
  { name: 'ACT V · NOW', sub: '2026 →', top: '#1B2440', bot: '#7E4327', acc: '#FFC66E', deep: '#B4611B' },
];

export const NOTES: string[] = [
  'runs on chai, not coffee. this is non-negotiable.',
  'night owl — the best commits land after midnight.',
  'learned more from broken code than from working code.',
  'names every device after a character. the router outranks the laptop.',
  'will explain recursion at dinner. uninvited. again.',
  'keyboard: loud. regrets: none.',
  'watches conference talks the way other people watch netflix.',
  'the home server has better uptime than his sleep schedule.',
];

export type SetPiece = 'ascii' | 'draw' | 'term' | 'castle' | 'rack';

export type TimelineItem =
  | { type: 'intro' }
  | { type: 'gate'; era: number }
  | {
      type: 'ch';
      yr: string;
      t: string;
      skills: string[];
      body: string;
      set?: SetPiece;
      link?: [url: string, label: string];
    }
  | { type: 'fact'; n: number }
  | { type: 'block' }
  | { type: 'journeys' }
  | { type: 'blog' }
  | { type: 'repos' }
  | { type: 'end' };

export const SPACING: Record<TimelineItem['type'], number> = {
  intro: 950,
  gate: 780,
  ch: 950,
  fact: 560,
  block: 520,
  journeys: 1300,
  blog: 1250,
  repos: 1500,
  end: 0,
};

const RAW_TIMELINE: TimelineItem[] = [
  { type: 'intro' },
  { type: 'gate', era: 0 },
  {
    type: 'ch', yr: '2016', t: 'First line of code', skills: ['C++'],
    body: 'A hand-me-down PC, a blinking cursor, and no idea it would become everything.',
  },
  { type: 'fact', n: 0 },
  {
    type: 'ch', yr: '2018', t: 'First web pages', skills: ['HTML', 'CSS', 'JavaScript'],
    body: 'Discovered view-source and never recovered. The internet stopped being magic and became a workshop.',
  },
  { type: 'fact', n: 1 },
  { type: 'gate', era: 1 },
  {
    type: 'ch', yr: '2019', t: 'The DSA years', skills: ['Algorithms', 'Data structures'],
    body: 'Grinding data structures in C++ and documenting every one with ASCII diagrams — so future-me could understand past-me.',
    set: 'ascii',
  },
  { type: 'fact', n: 2 },
  {
    type: 'ch', yr: '2020', t: 'Hackathons & all-nighters', skills: ['Git', 'Problem solving'],
    body: 'Team projects, duct-tape demos, and the discovery that shipping beats perfect.',
  },
  { type: 'gate', era: 2 },
  {
    type: 'ch', yr: '2021', t: 'Android developer', skills: ['Kotlin', 'Android'],
    body: 'Shipping real apps to real users. Learning that "works on my device" is a threat, not a status.',
  },
  { type: 'fact', n: 3 },
  {
    type: 'ch', yr: '2022', t: 'Going full stack', skills: ['TypeScript', 'React', 'Node.js'],
    body: 'Followed the data past the screen — into APIs, databases, sockets, and everything between.',
  },
  {
    type: 'ch', yr: '2023', t: 'Boardy', skills: ['Next.js', 'Canvas API'],
    body: 'A feature-rich drawing and design app. My own canvas — try it, this one actually works.',
    set: 'draw',
    link: ['https://github.com/Thre4dripper/Boardy-WebApp', 'View Boardy on GitHub →'],
  },
  { type: 'fact', n: 4 },
  {
    type: 'ch', yr: '2024', t: 'Tooling & templates', skills: ['Express', 'Docker', 'Redis', 'gRPC'],
    body: 'A production-grade Node + TypeScript service template — and an npm package that scaffolds it in one command.',
    set: 'term',
    link: ['https://github.com/Thre4dripper/NodeTs-Express-Service-Based-Template', 'View the template →'],
  },
  { type: 'block' },
  { type: 'gate', era: 3 },
  {
    type: 'ch', yr: '2025', t: 'Infinity Castle', skills: ['Three.js', 'WebGL', 'Procedural generation'],
    body: 'An infinite, self-assembling Japanese castle in the browser. Fly through it as a crow. Zero art assets.',
    set: 'castle',
    link: ['https://github.com/Thre4dripper/Infinity-Castle-ThreeJs', 'Fly the castle →'],
  },
  { type: 'fact', n: 5 },
  {
    type: 'ch', yr: '2025', t: 'Home server lab', skills: ['Linux', 'Self-hosting', 'Raspberry Pi'],
    body: 'Enterprise-grade services, self-hosted on a Raspberry Pi humming in the corner. Uptime is a love language.',
    set: 'rack',
    link: ['https://github.com/Thre4dripper/Home-Server-Lab', 'See the lab →'],
  },
  { type: 'fact', n: 6 },
  { type: 'fact', n: 7 },
  { type: 'gate', era: 4 },
  { type: 'journeys' },
  { type: 'blog' },
  { type: 'repos' },
  { type: 'end' },
];

export type PositionedItem = TimelineItem & { zCam: number; idx: number };

/** Timeline with camera depth (zCam) precomputed — identical at build and run time. */
export const TIMELINE: PositionedItem[] = (() => {
  let z = 0;
  return RAW_TIMELINE.map((it, idx) => {
    const positioned = { ...it, zCam: z, idx } as PositionedItem;
    z += SPACING[it.type];
    return positioned;
  });
})();

export const MAXZ = TIMELINE[TIMELINE.length - 1].zCam;

/** Camera depth of each era gate, indexed by era. */
export const GATE_CAM: number[] = ERAS.map(
  (_, i) => TIMELINE.find((it) => it.type === 'gate' && it.era === i)?.zCam ?? 0,
);

/** Every skill in timeline order — powers the dock, constellation and flat mode. */
export const ALL_SKILLS: string[] = TIMELINE.flatMap((it) => (it.type === 'ch' ? it.skills : []));

/** Stops shown in the chapter rail — one wheel gesture moves between these. */
export const RAIL_ITEMS = TIMELINE.filter(
  (it) =>
    it.type === 'intro' || it.type === 'ch' || it.type === 'journeys' ||
    it.type === 'blog' || it.type === 'repos' || it.type === 'end',
);

export function railLabel(it: PositionedItem): string {
  switch (it.type) {
    case 'ch': return `${it.yr} · ${it.t}`;
    case 'journeys': return 'Journey log';
    case 'blog': return 'Field reports';
    case 'repos': return 'Mission control';
    case 'end': return 'Today';
    default: return 'Start';
  }
}

/** LinkedIn track of the Journey Log — the API is closed, so EDIT ME by hand. */
export const LINKEDIN_MILESTONES: { yr: string; label: string }[] = [
  { yr: '2021', label: 'Android developer' },
  { yr: '2022', label: 'Full stack engineer' },
  { yr: '2024', label: 'Building tools & infra' }, // TODO: your actual roles
];

export const BUDDY = {
  start: "beep — co-pilot online. scroll to fly, i'll match your thrust.",
  fast: 'whoa! easy on the thrusters.',
  eras: [
    'act one: a kid, a keyboard, a spark.',
    'the grind era. he filled whole notebooks with trees.',
    'builder mode — this is where shipping became a habit.',
    'worldmaker era. he builds places, not just pages.',
    'final act — live telemetry ahead. he replies fast, promise.',
  ],
};

export const FACTS_BLOCK: string[] = [
  'I built an infinite castle so I would never run out of rooms to explore.',
  'node-server-init can scaffold a server faster than Mario finishes 1-1.',
  'Good news: this block is the only jump in the whole portfolio.',
];

/* ---------- site-wide metadata (used by <head>, JSON-LD, flat mode) ---------- */

export const SITE = {
  name: 'Ijlal Ahmad',
  role: 'Full Stack Web & Android Developer',
  title: 'Ijlal Ahmad — Full Stack Web & Android Developer',
  description:
    'Full stack web & Android developer building tools, worlds, and the servers they run on. ' +
    'Kotlin, TypeScript, React, Node.js, Three.js — told as a flight through five acts.',
  github: 'https://github.com/Thre4dripper',
  githubUser: 'Thre4dripper',
  linkedin: 'https://www.linkedin.com/in/thre4dripper/',
  blog: 'https://blogs.ijlalahmad.dev',
  blogRss: 'https://blogs.ijlalahmad.dev/rss.xml',
  email: 'hello@example.com', // TODO: put your real email here
};
