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
  { name: 'ACT IV · WORLDMAKER', sub: '2025 — 2026', top: '#0B0E1A', bot: '#221334', acc: '#F2A93B', deep: '#C4571F' },
  { name: 'ACT V · NOW', sub: 'PRESENT DAY', top: '#1B2440', bot: '#7E4327', acc: '#FFC66E', deep: '#B4611B' },
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
  'sketches anime characters between deploys. calls it "research".',
];

export type SetPiece =
  | 'ascii' | 'draw' | 'term' | 'castle' | 'rack'
  | 'compile' | 'deploy' | 'quests' | 'minios' | 'api'
  | 'proctor' | 'tools' | 'migrate' | 'agent' | 'blueprint' | 'store';

/** Window chrome a chapter renders in — variety beyond the washi card. */
export type Frame = 'terminal' | 'browser' | 'notebook' | 'phone' | 'editor' | 'rackmount' | 'idcard';

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
      frame?: Frame;
      link?: [url: string, label: string];
    }
  | { type: 'fact'; n: number }
  | { type: 'block' }
  | { type: 'journeys' }
  | { type: 'blog' }
  | { type: 'repos' }
  | { type: 'end' };

export const SPACING: Record<TimelineItem['type'], number> = {
  intro: 1100,
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
    type: 'ch', yr: '2016', t: 'First line of code', skills: ['C++'], frame: 'terminal', set: 'compile',
    body: 'A hand-me-down PC, a blinking cursor, and no idea it would become everything.',
  },
  { type: 'fact', n: 0 },
  {
    type: 'ch', yr: '2018', t: 'First web pages', skills: ['HTML', 'CSS', 'JavaScript'], frame: 'browser', set: 'deploy',
    body: 'Discovered view-source and never recovered. The internet stopped being magic and became a workshop.',
  },
  { type: 'fact', n: 1 },
  { type: 'gate', era: 1 },
  {
    type: 'ch', yr: '2019', t: 'The DSA years', skills: ['Algorithms', 'Data structures'], frame: 'notebook',
    body: 'Grinding data structures in C++ and documenting every one with ASCII diagrams — so future-me could understand past-me.',
    set: 'ascii',
  },
  { type: 'fact', n: 2 },
  {
    type: 'ch', yr: '2020', t: 'Enter Jamia Millia', skills: ['Computer Science'], frame: 'idcard',
    body: 'B.Tech in Computer Science at Jamia Millia Islamia, New Delhi. A 9.14 GPA — and four years where everything accelerated.',
  },
  { type: 'gate', era: 2 },
  {
    type: 'ch', yr: '2021', t: 'Android developer', skills: ['Kotlin', 'Android'], frame: 'phone', set: 'minios',
    body: 'Started building apps back in school — Paint, TicTacToe, a clock. Then Matscape, my matrix calculator, went live on the Play Store.',
    link: ['https://play.google.com/store/apps/details?id=com.ByteMechanics.matscape', 'Matscape on Google Play →'],
  },
  { type: 'fact', n: 3 },
  {
    type: 'ch', yr: '2022', t: 'The hackathon years', skills: ['Git', 'Problem solving'], set: 'quests',
    body: 'Team projects, duct-tape demos, and the discovery that shipping beats perfect.',
  },
  {
    type: 'ch', yr: '2022', t: 'Going full stack', skills: ['TypeScript', 'React', 'Node.js'], frame: 'editor', set: 'api',
    body: 'Followed the data past the screen — into APIs, databases, sockets, and everything between.',
  },
  {
    type: 'ch', yr: '2023', t: 'Bea Brand — the internship', skills: ['Kafka', 'MySQL', 'FCM'], set: 'store',
    body: 'Where everything clicked. Intern building a B2B SaaS for brands: Kafka + FCM notifications, an S3 cloud drive — and an on-the-go storefront creator.',
  },
  {
    type: 'ch', yr: '2023', t: 'Boardy', skills: ['Next.js', 'Canvas API'],
    body: 'A feature-rich drawing and design app — my own canvas, grown out of a whole era of particle toys. Draw below; this one actually works.',
    set: 'draw',
    link: ['https://github.com/Thre4dripper/Boardy-WebApp', 'View Boardy on GitHub →'],
  },
  { type: 'fact', n: 4 },
  {
    type: 'ch', yr: '2023', t: 'Medusa & a national win', skills: ['WebRTC', 'AI proctoring'], set: 'proctor',
    body: 'An AI-proctored exam portal — selective many-to-many WebRTC monitoring, AI flagging suspicious activity. Smart India Hackathon 2023: winner.',
  },
  { type: 'fact', n: 8 },
  {
    type: 'ch', yr: '2024', t: 'Tooling & templates', skills: ['Express', 'Docker', 'Redis', 'gRPC'], set: 'tools',
    body: 'A production-grade Node + TypeScript service template, an npm scaffolder, and a keyboard-first download manager in Go.',
    link: ['https://github.com/Thre4dripper/NodeTs-Express-Service-Based-Template', 'View the template →'],
  },
  {
    type: 'ch', yr: '2024', t: 'S&P Global', skills: ['AWS', 'ECS', 'Splunk'], set: 'migrate',
    body: 'First job out of college. Moved the iLevel notification microservices from Lambda to ECS, built the Splunk dashboards that watch them, tuned a big-data pipeline into S3.',
  },
  { type: 'block' },
  { type: 'gate', era: 3 },
  {
    type: 'ch', yr: '2025', t: 'Home server lab', skills: ['Linux', 'Self-hosting', 'Raspberry Pi'], frame: 'rackmount', set: 'rack',
    body: 'Enterprise-grade services, self-hosted on a Raspberry Pi humming in the corner. Uptime is a love language.',
    link: ['https://github.com/Thre4dripper/Home-Server-Lab', 'See the lab →'],
  },
  { type: 'fact', n: 5 },
  {
    type: 'ch', yr: '2026', t: 'Infinity Castle', skills: ['Three.js', 'WebGL', 'Procedural generation'],
    body: 'An infinite, self-assembling Japanese castle in the browser. Fly through it as a crow. Zero art assets.',
    set: 'castle',
    link: ['https://github.com/Thre4dripper/Infinity-Castle-ThreeJs', 'Fly the castle →'],
  },
  { type: 'fact', n: 6 },
  { type: 'gate', era: 4 },
  {
    type: 'ch', yr: '2025', t: 'Kenverse — building KAI', skills: ['LLM agents', 'IAM', 'Multi-tenancy'], set: 'agent',
    body: 'SDE at Kenverse (TurboStart), building KAI — an AI-native platform for chat & calling agents: Casbin-based IAM, white-labeled multi-tenant deployments.',
  },
  { type: 'fact', n: 7 },
  {
    type: 'ch', yr: '2026', t: 'GUS Global — AI native', skills: ['AI platforms', 'Agentic systems'], set: 'blueprint',
    body: 'Associate AI Consultant at GUS Global (Global University Systems) — architecting the company’s first AI-native platform from the ground up.',
  },
  { type: 'journeys' },
  { type: 'blog' },
  { type: 'repos' },
  { type: 'end' },
];

/** Quest log for the hackathon years. */
export const HACKS = [
  { yr: '2021', name: 'e-Yantra (IIT Bombay)', result: 'robotics, first taste of real deadlines' },
  { yr: '2022', name: 'Hashes 2.0', result: 'shipped a working demo overnight' },
  { yr: '2022', name: 'Smart India Hackathon', result: 'national finalist', medal: 'silver' },
  { yr: '2023', name: 'Smart India Hackathon', result: 'WINNER — Medusa', medal: 'gold' },
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
  { yr: '2023', label: 'SDE intern · Bea Brand' },
  { yr: '2024', label: 'Associate SDE · S&P Global' },
  { yr: '2025', label: 'SDE · Kenverse' },
  { yr: '2026', label: 'AI Consultant · GUS Global' },
];

/* ---------- resume data (drives the plain/flat CV page) ---------- */

export const EXPERIENCE = [
  {
    org: 'GUS Global (Global University Systems)', where: 'Remote', role: 'Associate AI Consultant', when: '2026 — present',
    points: [
      'Architecting the company’s first AI-native platform for one of the world’s largest higher-education networks.',
      'Designing agentic workflows and LLM integrations across the group’s institutions.',
    ],
  },
  {
    org: 'Kenverse (TurboStart)', where: 'New Delhi', role: 'Software Development Engineer', when: 'Nov 2025 — 2026',
    points: [
      'Designing a multi-tenant AI platform for scalable LLM-powered chat and voice agents with dynamic agentic workflows.',
      'Centralized IAM with Casbin-based PBAC securing AI/agent APIs across REST and gRPC microservices.',
      'Hierarchical multi-tenancy with white-labeling for tenant-isolated agent deployments.',
      'Dynamic secrets store for AI providers and tenant configs, secured with RSA asymmetric encryption.',
    ],
  },
  {
    org: 'S&P Global', where: 'Noida', role: 'Associate Software Development Engineer', when: 'Jul 2024 — Nov 2025',
    points: [
      'Migrated core iLevel notification microservices from AWS Lambda to Amazon ECS for cost efficiency and scale.',
      'Built Splunk dashboards for big-data analysis and real-time monitoring.',
      'Optimized a big-data streaming pipeline ingesting into Amazon S3.',
    ],
  },
  {
    org: 'Bea Brand', where: 'Gurugram', role: 'Software Development Intern', when: 'Jan 2023 — Jul 2024',
    points: [
      'B2B SaaS for brands — Node.js (Express) + TypeScript with MySQL on Amazon RDS.',
      'On-the-go storefront creator so brands could spin up shops in minutes.',
      'Push and email notification service with Apache Kafka and Firebase Cloud Messaging.',
      'Cloud drive on Amazon S3 with RDS as the metadata store.',
    ],
  },
];

export const EDUCATION = [
  { school: 'Jamia Millia Islamia, New Delhi', detail: 'B.Tech Computer Science — 9.14/10 GPA', when: 'Dec 2020 — May 2024' },
  { school: 'Bal Vidya Mandir Sr. Sec. School, Sambhal', detail: 'Intermediate 93.2% · High School 9.2 CGPA', when: '2014 — 2018' },
];

export const ACHIEVEMENTS = [
  'Smart India Hackathon 2023 — Winner (Medusa, AI-proctored examination portal)',
  'Smart India Hackathon 2022 — Finalist',
  'AWS Beginner to Advanced certification',
  '500+ problems solved on LeetCode',
];

export const INTERESTS = ['Movies', 'Games', 'Anime', 'Sketching'];

export const BUDDY = {
  start: "beep — co-pilot online. scroll to fly, i'll match your thrust.",
  fast: 'whoa! easy on the thrusters.',
  quips: [
    'beep. yes, the flame is supposed to do that.',
    'fuel status: chai. levels: critical but stable.',
    "i've flown this route 4,000 times. still not bored.",
    'fun fact: the stars back there? hand-painted. every night.',
    'he debugged me once at 3am. i saw things.',
    'the crow retired. i have better mileage.',
    'click detected. affection registered.',
    'somewhere out there is a segfault he never fixed. we don’t go there.',
    'trajectory nominal. vibes nominal.',
    'psst — try the ? block if you haven’t.',
  ],
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
  role: 'Full Stack & AI Engineer',
  title: 'Ijlal Ahmad — Full Stack & AI Engineer',
  description:
    'Full stack, Android, and AI-platform engineer building tools, worlds, and the servers they run on. ' +
    'Associate AI Consultant at GUS Global — told as a flight through five acts.',
  github: 'https://github.com/Thre4dripper',
  githubUser: 'Thre4dripper',
  linkedin: 'https://www.linkedin.com/in/thre4dripper/',
  blog: 'https://blogs.ijlalahmad.dev',
  blogRss: 'https://blogs.ijlalahmad.dev/rss.xml',
  email: 'ijlalahmad845@gmail.com',
  location: 'New Delhi, India',
  leetcode: 'thre4dripper',
  playstore: 'https://play.google.com/store/apps/details?id=com.ByteMechanics.matscape',
};
