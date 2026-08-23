/* Flight runtime: camera + input, node animation, HUD wiring, rocket co-pilot.
   The DOM is fully server-rendered — this script only brings it to life. */
import { TIMELINE, MAXZ, GATE_CAM, ERAS, BUDDY, RAIL_ITEMS, SITE } from '../data/portfolio';
import { computeEra, applyTheme, eraW } from './era';
import { initSky } from './sky';
import {
  initBoardy, initCastle, initQBlock, initCompile, initDeploy, createQuestsReveal,
  initMiniOS, createProctorStarter, initTools, initMigrate, createAgentChat,
  initEditorTabs, initRackPower,
} from './setpieces';
import { loadGithub, initSkillPanel } from './github';

/* ================= elements ================= */
const stage = document.getElementById('stage')!;
const flat = document.getElementById('flat')!;
const nodes = [...document.querySelectorAll<HTMLElement>('#world > .node')];
const sky = initSky(document.getElementById('sky') as HTMLCanvasElement);

/* ================= camera / input: smooth flight ================= */
let cam = 0;
let target = 0;
let scrolled = false;
const clampT = (v: number) => Math.max(-120, Math.min(MAXZ + 120, v));

addEventListener(
  'wheel',
  (e) => {
    if (flat.classList.contains('open')) return;
    target = clampT(target + e.deltaY * (e.deltaMode === 1 ? 24 : 1.4));
    scrolled = true;
  },
  { passive: true },
);

let dragging = false;
let lastY = 0;
stage.addEventListener('pointerdown', (e) => {
  if ((e.target as HTMLElement).closest('#boardy,#qblock,a,button,canvas')) return;
  dragging = true;
  lastY = e.clientY;
});
addEventListener('pointermove', (e) => {
  if (!dragging) return;
  target = clampT(target + (lastY - e.clientY) * 4.2);
  lastY = e.clientY;
  scrolled = true;
});
addEventListener('pointerup', () => (dragging = false));

addEventListener('keydown', (e) => {
  if (flat.classList.contains('open')) return;
  const step = { ArrowDown: 420, PageDown: 950, ' ': 950, ArrowUp: -420, PageUp: -950 }[e.key];
  if (step) {
    target = clampT(target + step);
    scrolled = true;
    e.preventDefault();
  }
  if (e.key === 'Home') target = 0;
  if (e.key === 'End') target = MAXZ;
});

/* ================= dock / skills ================= */
const dockTags = document.querySelector('#dock .tags')!;
const dockLbl = document.querySelector<HTMLElement>('#dock .dl')!;
const collected = new Set<string>();
function collect(list: string[]) {
  for (const s of list) {
    if (collected.has(s)) continue;
    collected.add(s);
    dockLbl.hidden = false;
    const tag = document.createElement('button');
    tag.textContent = s;
    tag.dataset.skill = s;
    tag.title = `repos using ${s} →`;
    dockTags.appendChild(tag);
  }
}

/* ================= rail ================= */
const railBtns = [...document.querySelectorAll<HTMLButtonElement>('#rail button')];
railBtns.forEach((b) => {
  b.onclick = () => {
    target = Number(b.dataset.z);
    scrolled = true;
  };
});

/* ================= set pieces ================= */
initBoardy();
initQBlock();
initCompile();
initDeploy();
initMiniOS();
initMigrate();
initEditorTabs();
initRackPower();
initSkillPanel(SITE.githubUser);
const playTools = initTools();
const revealQuests = createQuestsReveal();
const startProctor = createProctorStarter();
const playAgentChat = createAgentChat();
const castle = initCastle();

/* ================= rocket co-pilot ================= */
const buddy = document.getElementById('buddy')!;
const bubble = document.getElementById('bubble')!;
let bubbleTimer: ReturnType<typeof setTimeout>;
let lastFastSay = -1e9;
function say(txt: string, ms = 3600) {
  bubble.textContent = txt;
  bubble.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.remove('show'), ms);
}
setTimeout(() => {
  if (!flat.classList.contains('open')) say(BUDDY.start, 4200);
}, 1400);
const eraSaid = ERAS.map(() => false);

/* ================= era critters ================= */
const bot = document.getElementById('bot')!;
const train = document.getElementById('train')!;
const satDrift = document.getElementById('sat-drift')!;

/* ================= edge scenery ================= */
const edgeGroups = [...document.querySelectorAll<HTMLElement>('#edges .edge-era')];
const pokers = edgeGroups.map((g) => [...g.querySelectorAll<HTMLElement>('.poke')]);
const journeysEl = document.querySelector('.journeys');

/* ================= boring mode ================= */
const skipBtn = document.getElementById('skip')!;
function setFlat(open: boolean) {
  flat.classList.toggle('open', open);
  skipBtn.textContent = open ? '← Back to the flight' : 'Skip to the point →';
}
skipBtn.onclick = () => setFlat(!flat.classList.contains('open'));
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setFlat(true);
  document.getElementById('rm-note')!.hidden = false;
}

/* ================= main loop ================= */
const hint2 = document.getElementById('hint2')!;
const finale = document.querySelector('.finale')!;
let litDone = false;

function frame(t: number) {
  const vel = target - cam;
  cam += vel * 0.105;
  computeEra(cam);
  applyTheme();
  sky.draw(t, cam);

  /* rail current */
  let cur = 0;
  RAIL_ITEMS.forEach((it, i) => {
    if (cam > it.zCam - 480) cur = i;
  });
  railBtns.forEach((b, i) => b.classList.toggle('cur', i === cur));

  /* nodes */
  nodes.forEach((n) => {
    const rel = parseFloat(n.dataset.z!) + cam;
    /* big headline nodes fade in late so they don't shine through each other */
    const [nearEdge, farEdge] = n.dataset.near ? [-650, -1100] : [-1100, -1800];
    let op;
    if (rel > 240) op = 0;
    else if (rel > 90) op = (240 - rel) / 150;
    else if (rel > nearEdge) op = 1;
    else if (rel > farEdge) op = (rel - farEdge) / (nearEdge - farEdge);
    else op = 0;
    n.style.opacity = op.toFixed(3);
    n.classList.toggle('on', op > 0.06);
    if (op > 0)
      n.style.transform = `translate(-50%,-50%) translate3d(var(--dx,0px),var(--dy,0px),${rel.toFixed(1)}px)`;
  });

  /* triggers — fire while the scene is flying in, so everything is already
     alive by the time it fills the screen */
  TIMELINE.forEach((it) => {
    const rel = cam - it.zCam;
    if (it.type === 'repos' && rel > -2800) loadGithub();
    if (it.type === 'journeys' && rel > -1200) journeysEl?.classList.add('lit');
    if (it.type !== 'ch') return;
    if (rel > -320) collect(it.skills);
    if (rel <= -1300) return;
    if (it.set === 'tools') playTools();
    if (it.set === 'quests') revealQuests();
    if (it.set === 'proctor') startProctor();
    if (it.set === 'agent') playAgentChat();
    if (it.set === 'castle' && castle) castle.classList.add('built');
  });
  for (let i = 0; i < ERAS.length; i++) {
    if (!eraSaid[i] && cam > GATE_CAM[i] + 120) {
      eraSaid[i] = true;
      say(BUDDY.eras[i]);
    }
  }
  if (!litDone && cam > MAXZ - 600) {
    litDone = true;
    finale.classList.add('lit');
  }

  /* rocket motion */
  const speed = Math.abs(vel);
  buddy.classList.toggle('fast', speed > 60);
  const tilt = Math.max(-16, Math.min(16, vel * 0.045));
  buddy.style.transform = `rotate(${tilt}deg) translateY(${Math.min(20, speed * 0.06)}px)`;
  if (speed > 900 && t - lastFastSay > 7000) {
    lastFastSay = t;
    say(BUDDY.fast, 2200);
  }

  /* era critters — robot (builder), train (grind), satellite (now) */
  const bw = eraW[2];
  bot.style.opacity = (bw * 0.95).toFixed(2);
  if (bw > 0.02) {
    const bx = innerWidth * 0.68 + Math.sin(t / 1500) * Math.min(90, innerWidth * 0.08);
    bot.style.left = bx + 'px';
    bot.style.transform = `scaleX(${Math.cos(t / 1500) > 0 ? 1 : -1})`;
  }
  train.style.opacity = (eraW[1] * 0.9).toFixed(2);
  satDrift.style.opacity = (eraW[4] * 0.9).toFixed(2);

  /* edge scenery — cross-fade by era, parallax by progress through the era */
  edgeGroups.forEach((g, i) => {
    const w = eraW[i];
    g.style.opacity = (w * 0.9).toFixed(2);
    if (w <= 0.02) return;
    const prog = cam - GATE_CAM[i];
    for (const p of pokers[i]) {
      const off = Math.max(-340, Math.min(340, prog * parseFloat(p.dataset.p!)));
      p.style.translate = p.dataset.ax === 'x' ? `${off.toFixed(1)}px 0` : `0 ${off.toFixed(1)}px`;
    }
  });

  hint2.style.opacity = scrolled ? '0' : '1';
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
