/* Interactive set pieces inside chapter scenes: compile-and-run, deploy-to-
   monitor, the mini Android OS, proctoring wall, tool switcher, Lambda→ECS
   migration, agent chat, Boardy canvas, castle and the ?-block. */
import { FACTS_BLOCK } from '../data/portfolio';

/* ---------- shared typewriter ---------- */
/* Each element tracks a generation counter so starting a new typing run
   cancels any run still ticking on the same element (tool switcher etc.). */
const typeGens = new WeakMap<HTMLElement, number>();

function typeInto(el: HTMLElement, lines: string[], done?: () => void): void {
  const gen = (typeGens.get(el) ?? 0) + 1;
  typeGens.set(el, gen);
  let li = 0, ci = 0, buf = '';
  (function tick() {
    if (typeGens.get(el) !== gen) return;
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

/* ---------- 2018: deploy through a tiny CI pipeline, monitor lights up ---------- */
export function initDeploy(): void {
  const btn = document.getElementById('deploy-btn');
  const log = document.getElementById('deploy-log');
  const monitor = document.getElementById('out-monitor');
  const steps = [...document.querySelectorAll<HTMLElement>('#ci .ci-step')];
  if (!btn || !log || !monitor) return;
  let deployed = false;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (deployed) return;
    deployed = true;
    steps.forEach((s, i) => {
      setTimeout(() => s.classList.add('run'), i * 900);
      setTimeout(() => {
        s.classList.remove('run');
        s.classList.add('done');
      }, i * 900 + 800);
    });
    typeInto(log as HTMLElement, [
      '$ git push origin main',
      '\n<span class="ok">▸</span> ci: build ✓ test ✓ deploy ✓',
      '\n<span class="ok">✔</span> live on the internet!!',
    ], () => {
      monitor.classList.add('live');
      (btn as HTMLButtonElement).textContent = 'deployed ✓';
      (btn as HTMLButtonElement).disabled = true;
    });
  });
}

/* ---------- 2019: the interactive stack — 07. Stack, straight from the repo ---------- */
export function initStackWidget(): void {
  const view = document.getElementById('dsw-view');
  const push = document.getElementById('dsw-push');
  const pop = document.getElementById('dsw-pop');
  if (!view || !push || !pop) return;
  let n = 0;
  const VALUES = [8, 3, 10, 6, 14, 1, 7, 13];
  push.addEventListener('click', (e) => {
    e.stopPropagation();
    if (view.children.length >= 5) return;
    const b = document.createElement('i');
    b.textContent = String(VALUES[n++ % VALUES.length]);
    view.prepend(b);
    requestAnimationFrame(() => b.classList.add('in'));
  });
  pop.addEventListener('click', (e) => {
    e.stopPropagation();
    const top = view.firstElementChild as HTMLElement | null;
    if (!top) return;
    top.classList.remove('in');
    top.classList.add('out');
    setTimeout(() => top.remove(), 350);
  });
  /* seed it */
  for (let i = 0; i < 3; i++) push.dispatchEvent(new Event('click'));
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

/* ---------- 2021: mini Android — shade, Snake, Calculator, TicTacToe vs CPU ---------- */
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

  /* notification shade — tap the status bar */
  const statusBar = document.getElementById('os-status');
  const shade = document.getElementById('os-shade');
  if (statusBar && shade) {
    statusBar.addEventListener('click', (e) => {
      e.stopPropagation();
      shade.classList.toggle('open');
    });
    shade.addEventListener('click', (e) => {
      e.stopPropagation();
      shade.classList.remove('open');
    });
  }

  initSnake();
  initCalc();
  initTicTacToe();
}

/* Snake — grid canvas + d-pad */
function initSnake(): void {
  const cv = document.getElementById('snake-cv') as HTMLCanvasElement | null;
  const scoreEl = document.getElementById('snake-score');
  if (!cv || !scoreEl) return;
  const ctx = cv.getContext('2d')!;
  const CW = 22, CH = 14, CELL = 10;
  let snake: number[][], dir: number[], food: number[], score: number, dead: boolean, pendingDir: number[] | null;

  const spawnFood = () => {
    do {
      food = [Math.floor(Math.random() * CW), Math.floor(Math.random() * CH)];
    } while (snake.some(([x, y]) => x === food[0] && y === food[1]));
  };
  const reset = () => {
    snake = [[8, 7], [7, 7], [6, 7]];
    dir = [1, 0];
    pendingDir = null;
    score = 0;
    dead = false;
    spawnFood();
    scoreEl.textContent = 'score 0';
  };
  reset();

  const draw = () => {
    ctx.fillStyle = '#10231C';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#D8492B';
    ctx.fillRect(food[0] * CELL + 1, food[1] * CELL + 1, CELL - 2, CELL - 2);
    snake.forEach(([x, y], i) => {
      ctx.fillStyle = i === 0 ? '#7FD98A' : '#2FA35B';
      ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
    });
    if (dead) {
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = '#F5EFE2';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`game over · ${score} pts · tap to retry`, cv.width / 2, cv.height / 2 + 4);
    }
  };
  setInterval(() => {
    if (dead || (document.getElementById('scr-snake') as HTMLElement)?.hidden) return;
    if (pendingDir) {
      dir = pendingDir;
      pendingDir = null;
    }
    const head = [(snake[0][0] + dir[0] + CW) % CW, (snake[0][1] + dir[1] + CH) % CH];
    if (snake.some(([x, y]) => x === head[0] && y === head[1])) {
      dead = true;
      draw();
      return;
    }
    snake.unshift(head);
    if (head[0] === food[0] && head[1] === food[1]) {
      score++;
      scoreEl.textContent = `score ${score}`;
      spawnFood();
    } else snake.pop();
    draw();
  }, 160);
  draw();

  cv.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dead) {
      reset();
      draw();
    }
  });
  document.querySelectorAll<HTMLButtonElement>('[data-dir]').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const [dx, dy] = b.dataset.dir!.split(',').map(Number);
      if (dx === -dir[0] && dy === -dir[1]) return; // no 180° turns
      pendingDir = [dx, dy];
    }),
  );
}

/* Calculator — small state machine, no eval */
function initCalc(): void {
  const disp = document.getElementById('calc-disp');
  const pad = document.getElementById('calc-pad');
  if (!disp || !pad) return;
  let acc: number | null = null;
  let op: string | null = null;
  let cur = '0';
  let fresh = true;
  const apply = () => {
    if (acc === null || !op) return;
    const b = parseFloat(cur);
    const r = op === '+' ? acc + b : op === '−' ? acc - b : op === '×' ? acc * b : b === 0 ? NaN : acc / b;
    cur = Number.isNaN(r) ? 'err' : String(Math.round(r * 1e8) / 1e8);
    acc = null;
    op = null;
  };
  pad.addEventListener('click', (e) => {
    e.stopPropagation();
    const key = (e.target as HTMLElement).closest('button')?.textContent;
    if (!key) return;
    if (/\d/.test(key)) {
      cur = fresh || cur === '0' ? key : cur + key;
      fresh = false;
    } else if (key === '.') {
      if (fresh) cur = '0.';
      else if (!cur.includes('.')) cur += '.';
      fresh = false;
    } else if (key === 'C') {
      acc = null;
      op = null;
      cur = '0';
      fresh = true;
    } else if (key === '=') {
      apply();
      fresh = true;
    } else {
      if (op && !fresh) apply();
      acc = parseFloat(cur);
      op = key;
      fresh = true;
    }
    disp.textContent = cur.length > 12 ? cur.slice(0, 12) + '…' : cur;
  });
}

/* TicTacToe — you are X, the CPU plays O (win > block > center > random) */
function initTicTacToe(): void {
  const board = document.getElementById('ttt');
  const status = document.getElementById('ttt-status');
  if (!board || !status) return;
  const cells = [...board.querySelectorAll<HTMLButtonElement>('button')];
  const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  let over = false;
  let waiting = false;
  const marks = () => cells.map((c) => c.textContent);
  const winner = (m: (string | null)[], p: string) => LINES.some((l) => l.every((i) => m[i] === p));
  const findMove = (m: (string | null)[], p: string) => {
    for (const l of LINES) {
      const vals = l.map((i) => m[i]);
      if (vals.filter((v) => v === p).length === 2 && vals.includes(''))
        return l[vals.indexOf('')];
    }
    return -1;
  };
  const reset = () => {
    cells.forEach((c) => (c.textContent = ''));
    over = false;
    waiting = false;
    status.textContent = 'you are X — tap a cell';
  };
  reset();
  const finish = (msg: string) => {
    status.textContent = `${msg} · tap to replay`;
    over = true;
  };
  board.addEventListener('click', (e) => {
    e.stopPropagation();
    if (over) {
      reset();
      return;
    }
    if (waiting) return;
    const cell = (e.target as HTMLElement).closest('button');
    if (!cell || cell.textContent) return;
    cell.textContent = 'X';
    let m = marks();
    if (winner(m, 'X')) return finish('you win! 🎉');
    if (m.every(Boolean)) return finish('draw');
    waiting = true;
    status.textContent = 'cpu thinking…';
    setTimeout(() => {
      let i = findMove(m, 'O');
      if (i < 0) i = findMove(m, 'X');
      if (i < 0 && m[4] === '') i = 4;
      if (i < 0) {
        const open = m.map((v, j) => (v === '' ? j : -1)).filter((j) => j >= 0);
        i = open[Math.floor(Math.random() * open.length)];
      }
      cells[i].textContent = 'O';
      m = marks();
      waiting = false;
      if (winner(m, 'O')) return finish('cpu wins 🤖');
      if (m.every(Boolean)) return finish('draw');
      status.textContent = 'your move';
    }, 420);
  });
}

/* ---------- 2023 Medusa: the proctoring wall + patrolling AI bot ---------- */
export function createProctorStarter(): () => void {
  let started = false;
  return () => {
    if (started) return;
    started = true;
    const wall = document.getElementById('proctor');
    const count = document.getElementById('flag-count');
    const bot = document.getElementById('pbot');
    if (!wall || !count) return;
    const tiles = [...wall.querySelectorAll<HTMLElement>('.pt')];
    let flags = 0;
    const flag = (tile: HTMLElement) => {
      if (tile.classList.contains('flag')) return;
      tile.classList.add('flag');
      count.textContent = `${++flags} flagged`;
      setTimeout(() => tile.classList.remove('flag'), 1600);
    };

    /* the bot walks tile to tile; whatever it inspects, it sometimes flags */
    let at = 0;
    const patrol = () => {
      if (!bot) return;
      const next = (at + 1 + Math.floor(Math.random() * (tiles.length - 1))) % tiles.length;
      at = next;
      const t = tiles[at];
      bot.style.left = `${t.offsetLeft + t.offsetWidth / 2 - 11}px`;
      bot.style.top = `${t.offsetTop + t.offsetHeight - 16}px`;
      bot.classList.add('walking');
      setTimeout(() => {
        bot.classList.remove('walking');
        if (Math.random() < 0.45) flag(t);
      }, 900);
    };
    patrol();
    setInterval(patrol, 3000);

    bot?.addEventListener('click', (e) => {
      e.stopPropagation();
      bot.classList.add('wave');
      count.textContent = 'all clear (mostly)';
      setTimeout(() => bot.classList.remove('wave'), 900);
    });
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

/* ---------- home server rack: power switch + per-service ping ---------- */
export function initRackPower(): void {
  const btn = document.getElementById('rack-power');
  const rack = document.querySelector<HTMLElement>('.rack');
  if (!btn || !rack) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const off = rack.classList.toggle('off');
    btn.classList.toggle('down', off);
    btn.setAttribute('aria-pressed', String(off));
  });
  /* click a service row → ping it */
  rack.addEventListener('click', (e) => {
    e.stopPropagation();
    if (rack.classList.contains('off')) return;
    const row = (e.target as HTMLElement).closest('div');
    const meta = row?.querySelector('b');
    if (!row || !meta || row.dataset.pinging) return;
    row.dataset.pinging = '1';
    const original = meta.textContent!;
    meta.textContent = 'ping…';
    setTimeout(() => {
      meta.textContent = `pong · ${(Math.random() * 3 + 0.4).toFixed(1)}ms ✓`;
      setTimeout(() => {
        meta.textContent = original;
        delete row.dataset.pinging;
      }, 1400);
    }, 350);
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
