/* Interactive set pieces inside chapter scenes: compile-and-run, deploy-to-
   monitor, the mini Android OS, proctoring wall, tool switcher, Lambda→ECS
   migration, agent chat, Boardy canvas, castle and the ?-block. */
import { FACTS_BLOCK } from '../data/portfolio';

/* ---------- shared typewriter ---------- */
function typeInto(el: HTMLElement, lines: string[], done?: () => void): void {
  let li = 0, ci = 0, buf = '';
  (function tick() {
    if (li >= lines.length) {
      done?.();
      return;
    }
    if (lines[li].startsWith('\n')) {
      buf += lines[li];
      li++;
      ci = 0;
      el.innerHTML = buf;
      setTimeout(tick, 380);
      return;
    }
    buf += lines[li][ci++];
    el.innerHTML = buf;
    if (ci >= lines[li].length) {
      li++;
      ci = 0;
      setTimeout(tick, 420);
    } else setTimeout(tick, 38);
  })();
}

/* ---------- 2016: compile hello.cpp, then the big bang ---------- */
export function initCompile(): void {
  const btn = document.getElementById('compile-btn');
  const out = document.getElementById('compile-out');
  const card = btn?.closest('.card');
  if (!btn || !out || !card) return;
  const BURST = ['a creator was born', 'curiosity++', 'possibilities', 'what else can it do?', '✦', '✧', '{ }', 'more!'];
  let busy = false;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (busy) return;
    busy = true;
    out.textContent = '';
    typeInto(out as HTMLElement, ['$ g++ hello.cpp -o hello && ./hello', '\n<span class="ok">hello, world</span>'], () => {
      busy = false;
      BURST.forEach((word, i) => {
        const b = document.createElement('span');
        b.className = 'burst';
        b.textContent = word;
        const ang = (i / BURST.length) * Math.PI * 2 - Math.PI / 2;
        b.style.setProperty('--bx', `${Math.cos(ang) * (150 + (i % 3) * 60)}px`);
        b.style.setProperty('--by', `${Math.sin(ang) * (120 + (i % 2) * 70)}px`);
        b.style.animationDelay = `${i * 0.07}s`;
        card.appendChild(b);
        setTimeout(() => b.remove(), 2100);
      });
    });
  });
}

/* ---------- 2018: deploy the code, watch the monitor light up ---------- */
export function initDeploy(): void {
  const btn = document.getElementById('deploy-btn');
  const log = document.getElementById('deploy-log');
  const monitor = document.getElementById('mini-monitor');
  if (!btn || !log || !monitor) return;
  let deployed = false;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (deployed) return;
    deployed = true;
    typeInto(log as HTMLElement, [
      '$ ftp ./first-page.html',
      '\n<span class="ok">▸</span> uploading… 4KB',
      '\n<span class="ok">✔</span> live on the internet!!',
    ], () => {
      monitor.classList.add('live');
      (btn as HTMLButtonElement).textContent = 'deployed ✓';
      (btn as HTMLButtonElement).disabled = true;
    });
  });
}

/* ---------- 2022 quest log: reveal handled by CSS .lit; nothing to wire ---------- */
export function createQuestsReveal(): () => void {
  let done = false;
  return () => {
    if (done) return;
    done = true;
    document.getElementById('quests')?.classList.add('lit');
  };
}

/* ---------- 2021: mini Android OS — launcher, Paint, TicTacToe ---------- */
export function initMiniOS(): void {
  const os = document.getElementById('minios');
  if (!os) return;
  const screens = [...os.querySelectorAll<HTMLElement>('[data-screen]')];
  const show = (name: string) => screens.forEach((s) => (s.hidden = s.dataset.screen !== name));
  os.addEventListener('click', (e) => {
    e.stopPropagation();
    const nav = (e.target as HTMLElement).closest<HTMLElement>('[data-open]');
    if (nav) show(nav.dataset.open!);
  });

  /* Paint app */
  const pc = document.getElementById('mini-paint') as HTMLCanvasElement | null;
  if (pc) {
    const ctx = pc.getContext('2d')!;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2FA35B';
    let draw = false;
    const pos = (e: PointerEvent): [number, number] => {
      const r = pc.getBoundingClientRect();
      return [((e.clientX - r.left) * pc.width) / r.width, ((e.clientY - r.top) * pc.height) / r.height];
    };
    pc.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      draw = true;
      const [x, y] = pos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      pc.setPointerCapture(e.pointerId);
    });
    pc.addEventListener('pointermove', (e) => {
      if (!draw) return;
      e.stopPropagation();
      const [x, y] = pos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    });
    addEventListener('pointerup', () => (draw = false));
  }

  /* TicTacToe app */
  const board = document.getElementById('ttt');
  const status = document.getElementById('ttt-status');
  if (board && status) {
    const cells = [...board.querySelectorAll<HTMLButtonElement>('button')];
    let turn = 'X';
    let over = false;
    const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    const reset = () => {
      cells.forEach((c) => (c.textContent = ''));
      turn = 'X';
      over = false;
      status.textContent = 'X to move';
    };
    reset();
    board.addEventListener('click', (e) => {
      e.stopPropagation();
      const cell = (e.target as HTMLElement).closest('button');
      if (!cell) return;
      if (over) {
        reset();
        return;
      }
      if (cell.textContent) return;
      cell.textContent = turn;
      const marks = cells.map((c) => c.textContent);
      if (LINES.some((l) => l.every((i) => marks[i] === turn))) {
        status.textContent = `${turn} wins! tap to replay`;
        over = true;
        return;
      }
      if (marks.every(Boolean)) {
        status.textContent = 'draw. tap to replay';
        over = true;
        return;
      }
      turn = turn === 'X' ? 'O' : 'X';
      status.textContent = `${turn} to move`;
    });
  }
}

/* ---------- 2023 Medusa: the proctoring wall ---------- */
export function createProctorStarter(): () => void {
  let started = false;
  return () => {
    if (started) return;
    started = true;
    const wall = document.getElementById('proctor');
    const count = document.getElementById('flag-count');
    if (!wall || !count) return;
    const tiles = [...wall.querySelectorAll<HTMLElement>('.pt')];
    let flags = 0;
    const flag = (tile: HTMLElement) => {
      if (tile.classList.contains('flag')) return;
      tile.classList.add('flag');
      count.textContent = `${++flags} flagged`;
      setTimeout(() => tile.classList.remove('flag'), 1600);
    };
    setInterval(() => flag(tiles[Math.floor(Math.random() * tiles.length)]), 2600);
    wall.addEventListener('click', (e) => {
      e.stopPropagation();
      const tile = (e.target as HTMLElement).closest<HTMLElement>('.pt');
      if (tile) flag(tile);
    });
  };
}

/* ---------- 2024: tool switcher terminal ---------- */
const TOOL_DEMOS: Record<string, string[]> = {
  nsi: [
    'npx node-server-init my-api',
    '\n<span class="ok">✔</span> express + typescript scaffolded',
    '\n<span class="ok">✔</span> docker, redis, swagger wired',
    '\n<span class="ok">✔</span> ready in 4.2s — go build something',
  ],
  tidefetch: [
    'tidefetch',
    '\n<span class="ok">⣾</span> ubuntu-24.04.iso ▓▓▓▓▓▓░░ 82% · 42MB/s',
    '\n<span class="ok">✔</span> keyboard-first TUI for aria2, in Go',
    '\n<span class="ok">✔</span> web dashboard live on :8080',
  ],
};

/** Wires the tool switcher; returns a play() that auto-runs the first demo. */
export function initTools(): () => void {
  const out = document.getElementById('tools-out');
  const btns = [...document.querySelectorAll<HTMLButtonElement>('[data-tool]')];
  if (!out || !btns.length) return () => {};
  let current = '';
  const run = (tool: string) => {
    if (tool === current) return;
    current = tool;
    btns.forEach((b) => b.classList.toggle('on', b.dataset.tool === tool));
    out.textContent = '';
    typeInto(out as HTMLElement, TOOL_DEMOS[tool]);
  };
  btns.forEach((b) =>
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      run(b.dataset.tool!);
    }),
  );
  return () => run('nsi');
}

/* ---------- 2024 S&P: Lambda → ECS migration ---------- */
export function initMigrate(): void {
  const btn = document.getElementById('migrate-btn');
  const diagram = document.getElementById('mig');
  const status = document.getElementById('mig-status');
  if (!btn || !diagram || !status) return;
  let done = false;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (done) return;
    done = true;
    diagram.classList.add('go');
    status.textContent = 'draining lambdas…';
    setTimeout(() => (status.textContent = '3 services re-homed to ECS ✓'), 1300);
    setTimeout(() => {
      status.textContent = 'cost: ↓ · scale: ↑ · dashboards: watching';
      (btn as HTMLButtonElement).textContent = 'migrated ✓';
    }, 2600);
  });
}

/* ---------- 2025 Kenverse: agent chat ---------- */
export function createAgentChat(): () => void {
  let played = false;
  return () => {
    if (played) return;
    played = true;
    const log = document.getElementById('agent-log');
    if (!log) return;
    const msgs = [...log.querySelectorAll<HTMLElement>('.msg')];
    msgs.forEach((m, i) => setTimeout(() => m.classList.add('in'), 600 + i * 1100));
  };
}

/* ---------- Boardy drawing canvas (2023) ---------- */
export function initBoardy(): void {
  const bc = document.getElementById('boardy') as HTMLCanvasElement | null;
  if (!bc) return;
  const bctx = bc.getContext('2d')!;
  bctx.lineWidth = 5;
  bctx.lineCap = 'round';
  bctx.strokeStyle = '#D8492B';
  let draw = false;
  const pos = (e: PointerEvent): [number, number] => {
    const r = bc.getBoundingClientRect();
    return [((e.clientX - r.left) * bc.width) / r.width, ((e.clientY - r.top) * bc.height) / r.height];
  };
  bc.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    draw = true;
    const [x, y] = pos(e);
    bctx.beginPath();
    bctx.moveTo(x, y);
    bc.setPointerCapture(e.pointerId);
  });
  bc.addEventListener('pointermove', (e) => {
    if (!draw) return;
    e.stopPropagation();
    const [x, y] = pos(e);
    bctx.lineTo(x, y);
    bctx.stroke();
    bctx.strokeStyle = ['#D8492B', '#F2A93B', '#1B1B22'][Math.floor(Date.now() / 900) % 3];
  });
  addEventListener('pointerup', () => (draw = false));
}

/* ---------- 2022 editor tabs: api / sql / compose ---------- */
export function initEditorTabs(): void {
  const tabs = [...document.querySelectorAll<HTMLElement>('.fr-tabs [data-tab]')];
  const panes = [...document.querySelectorAll<HTMLElement>('[data-pane]')];
  if (!tabs.length) return;
  tabs.forEach((t) =>
    t.addEventListener('click', (e) => {
      e.stopPropagation();
      tabs.forEach((x) => x.classList.toggle('on', x === t));
      panes.forEach((p) => (p.hidden = p.dataset.pane !== t.dataset.tab));
    }),
  );

  const apiBtn = document.getElementById('api-btn');
  const apiOut = document.getElementById('api-out');
  if (apiBtn && apiOut) {
    apiBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      apiOut.hidden = false;
      apiOut.textContent = '';
      typeChars(apiOut, `{
  "status": 200,
  "chai": "brewing",
  "stack": ["typescript", "react", "node"],
  "uptime": "since 2022"
}`);
    });
  }

  const sqlBtn = document.getElementById('sql-btn');
  const sqlOut = document.getElementById('sql-out');
  if (sqlBtn && sqlOut) {
    sqlBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sqlOut.hidden = false;
      sqlOut.textContent = '';
      typeChars(sqlOut, `> SELECT name, uptime FROM services;
┌──────────┬─────────┐
│ api      │ 214d    │
│ worker   │ 214d    │
│ cache    │ 198d    │
└──────────┴─────────┘
3 rows in 0.8ms`);
    });
  }

  const ymlBtn = document.getElementById('yml-btn');
  const ymlOut = document.getElementById('yml-out');
  if (ymlBtn && ymlOut) {
    ymlBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      ymlOut.hidden = false;
      ymlOut.textContent = '';
      typeInto(ymlOut, [
        '$ docker compose up -d',
        '\n<span class="ok">✔</span> network app_default created',
        '\n<span class="ok">✔</span> api, db, cache — 3/3 running',
      ]);
    });
  }
}

function typeChars(el: HTMLElement, body: string): void {
  let i = 0;
  (function tick() {
    el.textContent = body.slice(0, ++i);
    if (i < body.length) setTimeout(tick, 7);
  })();
}

/* ---------- castle (2026): builds on approach, rebuilds on click ---------- */
export function initCastle(): HTMLElement | null {
  const castle = document.getElementById('castle');
  if (!castle) return null;
  const tiers: [number, number][] = [[110, 96], [88, 72], [66, 48], [44, 24]];
  let bi = 0;
  const brick = (cls?: string) => {
    const b = document.createElement('i');
    if (cls) b.className = cls;
    return b;
  };
  for (const [w, y] of tiers) {
    const body = brick();
    body.style.width = w + 'px';
    body.style.height = '16px';
    body.style.setProperty('--fy', y + 'px');
    const roof = brick('roof');
    roof.style.width = w + 22 + 'px';
    roof.style.height = '7px';
    roof.style.setProperty('--fy', y - 9 + 'px');
    for (const b of [body, roof]) {
      b.style.setProperty('--sx', (Math.random() - 0.5) * 260 + 'px');
      b.style.setProperty('--sy', -120 - Math.random() * 120 + 'px');
      b.style.setProperty('--sr', (Math.random() - 0.5) * 90 + 'deg');
      b.style.setProperty('--sd', bi++ * 0.12 + 's');
      castle.appendChild(b);
    }
  }
  const spire = brick();
  spire.style.width = '4px';
  spire.style.height = '18px';
  spire.style.setProperty('--fy', '-2px');
  spire.style.setProperty('--sx', '0px');
  spire.style.setProperty('--sy', '-200px');
  spire.style.setProperty('--sr', '0deg');
  spire.style.setProperty('--sd', bi * 0.12 + 's');
  castle.appendChild(spire);
  /* click to watch it assemble again */
  castle.style.cursor = 'pointer';
  castle.addEventListener('click', (e) => {
    e.stopPropagation();
    castle.classList.remove('built');
    setTimeout(() => castle.classList.add('built'), 80);
  });
  return castle;
}

/* ---------- home server rack: the power switch ---------- */
export function initRackPower(): void {
  const btn = document.getElementById('rack-power');
  const rack = document.querySelector('.rack');
  if (!btn || !rack) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const off = rack.classList.toggle('off');
    btn.classList.toggle('down', off);
    btn.setAttribute('aria-pressed', String(off));
  });
}

/* ---------- mario block ---------- */
export function initQBlock(): void {
  const toast = document.getElementById('toast')!;
  let fi = 0;
  let toastTimer: ReturnType<typeof setTimeout>;
  document.addEventListener('click', (e) => {
    const q = (e.target as HTMLElement).closest('#qblock');
    if (!q) return;
    const coin = document.createElement('span');
    coin.className = 'coin';
    q.parentElement!.appendChild(coin);
    setTimeout(() => coin.remove(), 900);
    toast.textContent = FACTS_BLOCK[fi % FACTS_BLOCK.length];
    fi++;
    if (fi >= FACTS_BLOCK.length) q.classList.add('done');
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4200);
  });
}
