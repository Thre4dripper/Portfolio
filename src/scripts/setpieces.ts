/* Interactive set pieces inside chapter cards: the Boardy drawing canvas,
   the typing terminal, the self-assembling castle and the ?-block. */
import { FACTS_BLOCK } from '../data/portfolio';

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

/** Generic one-shot typewriter into an element. */
function makeTyper(id: string, lines: string[]): () => void {
  let played = false;
  return () => {
    if (played) return;
    played = true;
    const out = document.getElementById(id);
    if (!out) return;
    let li = 0, ci = 0, buf = '';
    (function tick() {
      if (li >= lines.length) return;
      if (lines[li].startsWith('\n')) {
        buf += lines[li];
        li++;
        ci = 0;
        out.innerHTML = buf;
        setTimeout(tick, 420);
        return;
      }
      buf += lines[li][ci++];
      out.innerHTML = buf;
      if (ci >= lines[li].length) {
        li++;
        ci = 0;
        setTimeout(tick, 480);
      } else setTimeout(tick, 45);
    })();
  };
}

/** 2016 terminal: the very first compile, typed on arrival. */
export function createBootPlayer(): () => void {
  return makeTyper('boot-out', [
    'g++ hello.cpp -o hello && ./hello',
    '\n<span class="ok">hello, world</span>',
    '\n<span class="ok">✔</span> a person was permanently changed',
  ]);
}

/** 2018 browser: the view-source toggle that started everything. */
export function initViewSource(): void {
  const btn = document.getElementById('viewsrc-btn');
  const render = document.getElementById('mw-render');
  const src = document.getElementById('mw-src');
  if (!btn || !render || !src) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasShowingSrc = render.hidden;
    render.hidden = !wasShowingSrc;
    src.hidden = wasShowingSrc;
    btn.textContent = wasShowingSrc ? 'view source' : 'view rendered';
  });
}

/** 2020 hackathons: the SHIP IT button. */
export function initShipIt(): void {
  const btn = document.getElementById('shipit');
  const status = document.getElementById('ship-status');
  if (!btn || !status) return;
  let ships = 0;
  const lines = [
    'deployed with 00:07 left on the clock ✓',
    'demo gods appeased. it worked ON STAGE ✓',
    'okay now it’s duct tape all the way down ✓',
  ];
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    status.textContent = lines[ships % lines.length];
    ships++;
    const coin = document.createElement('span');
    coin.className = 'coin';
    btn.parentElement!.appendChild(coin);
    setTimeout(() => coin.remove(), 900);
  });
}

/** 2021 phone: the 2am crash report, shown on arrival, fixed by you. */
export function createCrashShower(): () => void {
  let shown = false;
  return () => {
    if (shown) return;
    shown = true;
    setTimeout(() => document.getElementById('crash')?.removeAttribute('hidden'), 900);
  };
}

export function initCrashButtons(): void {
  const crash = document.getElementById('crash');
  const toast = document.getElementById('app-toast');
  if (!crash || !toast) return;
  const say = (msg: string) => {
    toast.textContent = msg;
    toast.hidden = false;
    setTimeout(() => (toast.hidden = true), 3200);
  };
  document.getElementById('crash-restart')?.addEventListener('click', (e) => {
    e.stopPropagation();
    crash.hidden = true;
    say('0 crashes (today)');
  });
  document.getElementById('crash-report')?.addEventListener('click', (e) => {
    e.stopPropagation();
    say('log: 4,000 lines. cause: one missing null check.');
  });
}

/** 2022 editor: a one-endpoint API playground. */
export function initApiDemo(): void {
  const btn = document.getElementById('api-btn');
  const out = document.getElementById('api-out');
  if (!btn || !out) return;
  const body = `{
  "status": 200,
  "chai": "brewing",
  "stack": ["typescript", "react", "node"],
  "uptime": "since 2022"
}`;
  let typing = false;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (typing) return;
    typing = true;
    out.hidden = false;
    out.textContent = '';
    let i = 0;
    (function tick() {
      out.textContent = body.slice(0, ++i);
      if (i < body.length) setTimeout(tick, 8);
      else typing = false;
    })();
  });
}

/** Returns a play() that types the npx demo into the terminal card once. */
export function createTermPlayer(): () => void {
  let played = false;
  return () => {
    if (played) return;
    played = true;
    const out = document.getElementById('term-out');
    if (!out) return;
    const lines = [
      'npx node-server-init my-api',
      '\n<span class="ok">✔</span> express + typescript scaffolded',
      '\n<span class="ok">✔</span> docker, redis, swagger wired',
      '\n<span class="ok">✔</span> ready in 4.2s — go build something',
    ];
    let li = 0, ci = 0, buf = '';
    (function tick() {
      if (li >= lines.length) return;
      if (lines[li].startsWith('\n')) {
        buf += lines[li];
        li++;
        ci = 0;
        out.innerHTML = buf;
        setTimeout(tick, 420);
        return;
      }
      buf += lines[li][ci++];
      out.innerHTML = buf;
      if (ci >= lines[li].length) {
        li++;
        ci = 0;
        setTimeout(tick, 500);
      } else setTimeout(tick, 45);
    })();
  };
}

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
