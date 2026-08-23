/* The canvas sky: star field parallax plus one particle system per era
   (fireflies, glyph rain, circuit sparks, petals & lanterns, golden dust). */
import { eraW, blend, cssRGB } from './era';

const FAR = 5200;
const F = 620;
const R = (n: number) => Math.random() * n;
const GLYPHSET = 'アイウエオカキクケコ01<>{}#*+';

export function initSky(sky: HTMLCanvasElement) {
  const sctx = sky.getContext('2d')!;
  let W = 0, H = 0, CX = 0, CY = 0;

  function resize() {
    W = sky.width = innerWidth;
    H = sky.height = innerHeight;
    CX = W / 2;
    CY = H * 0.46;
  }
  resize();
  addEventListener('resize', resize);

  const stars = Array.from({ length: 300 }, () => ({
    x: (Math.random() - 0.5) * 2600,
    y: (Math.random() - 0.5) * 1700,
    off: Math.random() * FAR,
    tw: Math.random() * 6.28,
  }));

  const fire = Array.from({ length: 36 }, () => ({ x: R(1), y: R(1), p: R(6.28), s: 0.2 + R(0.5) }));
  const cols = Array.from({ length: 16 }, (_, i) => ({
    x: i < 8 ? R(0.16) : 0.84 + R(0.16),
    y: R(1.4) - 0.4,
    spd: 0.0015 + R(0.003),
    ch: Array.from({ length: 10 }, () => GLYPHSET[Math.floor(R(GLYPHSET.length))]),
  }));
  const sparks = Array.from({ length: 30 }, () => ({ x: R(1), y: 0.6 + R(0.5), spd: 0.002 + R(0.004), len: 6 + R(10) }));
  const petals = Array.from({ length: 26 }, () => ({
    x: R(1), y: R(1), r: R(6.28), vr: 0.01 + R(0.03),
    vx: -0.0006 - R(0.001), vy: 0.0008 + R(0.0012), sz: 3 + R(4), k: Math.random() < 0.5,
  }));
  const lants = Array.from({ length: 6 }, (_, i) => ({
    x: i < 3 ? 0.04 + R(0.1) : 0.86 + R(0.1),
    y: R(1.3), spd: 0.0006 + R(0.0008), sz: 8 + R(8), p: R(6.28),
  }));
  const dust = Array.from({ length: 42 }, () => ({ x: R(1), y: R(1.2), spd: 0.001 + R(0.002), p: R(6.28) }));

  let meteor: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
  let nextMeteor = 3000;

  function draw(t: number, cam: number) {
    const top = blend('top'), bot = blend('bot');
    const g = sctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, cssRGB(top));
    g.addColorStop(1, cssRGB(bot));
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, W, H);

    /* act V sunrise glow */
    if (eraW[4] > 0.02) {
      const sg = sctx.createRadialGradient(CX, H * 1.08, 0, CX, H * 1.08, H * 0.85);
      sg.addColorStop(0, `rgba(255,178,96,${0.55 * eraW[4]})`);
      sg.addColorStop(1, 'rgba(255,178,96,0)');
      sctx.fillStyle = sg;
      sctx.fillRect(0, 0, W, H);
    }

    /* stars (always) */
    for (const s of stars) {
      const d = (((s.off - cam) % FAR) + FAR) % FAR + 60;
      const k = F / d, sx = CX + s.x * k, sy = CY + s.y * k;
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
      const a = Math.min(1, (FAR - d) / FAR + 0.1) * (0.5 + 0.45 * Math.sin(t / 700 + s.tw));
      sctx.beginPath();
      sctx.arc(sx, sy, Math.min(1.9, (90 * k) / 40), 0, 6.29);
      sctx.fillStyle = `rgba(214,224,238,${a * 0.9})`;
      sctx.fill();
    }

    /* era 0 — fireflies */
    if (eraW[0] > 0.02) {
      const w = eraW[0];
      for (const f of fire) {
        f.x = (f.x + Math.sin(t / 2100 + f.p) * 0.0006 + 0.0002 + 1) % 1;
        f.y = (f.y + Math.cos(t / 1700 + f.p) * 0.0005 + 1) % 1;
        const a = (0.25 + 0.55 * Math.abs(Math.sin(t / 600 + f.p))) * w;
        sctx.beginPath();
        sctx.arc(f.x * W, f.y * H, 2.1, 0, 6.29);
        sctx.fillStyle = `rgba(255,214,150,${a})`;
        sctx.fill();
      }
    }
    /* era 1 — glyph rain at the edges */
    if (eraW[1] > 0.02) {
      const w = eraW[1];
      sctx.font = '12px "JetBrains Mono Variable",monospace';
      sctx.textAlign = 'center';
      for (const c of cols) {
        c.y += c.spd;
        if (c.y > 1.35) c.y = -0.35;
        if (Math.random() < 0.02) c.ch[Math.floor(R(10))] = GLYPHSET[Math.floor(R(GLYPHSET.length))];
        for (let j = 0; j < 10; j++) {
          const a = (j === 9 ? 0.85 : 0.08 + j * 0.05) * w;
          sctx.fillStyle = `rgba(127,180,255,${a})`;
          sctx.fillText(c.ch[j], c.x * W, (c.y - (9 - j) * 0.028) * H);
        }
      }
    }
    /* era 2 — rising circuit sparks */
    if (eraW[2] > 0.02) {
      const w = eraW[2];
      sctx.lineWidth = 1.6;
      for (const s of sparks) {
        s.y -= s.spd;
        if (s.y < 0.3) {
          s.y = 1.05 + R(0.1);
          s.x = R(1);
        }
        const a = Math.min(1, (s.y - 0.3) / 0.4) * 0.7 * w;
        sctx.strokeStyle = `rgba(79,224,176,${a})`;
        sctx.beginPath();
        sctx.moveTo(s.x * W, s.y * H);
        sctx.lineTo(s.x * W, s.y * H + s.len);
        sctx.stroke();
      }
    }
    /* era 3 — petals + rising lanterns */
    if (eraW[3] > 0.02) {
      const w = eraW[3];
      for (const p of petals) {
        p.x = (p.x + p.vx + Math.sin(t / 1600 + p.r) * 0.0006 + 1) % 1;
        p.y = (p.y + p.vy + 1) % 1;
        p.r += p.vr * 0.3;
        sctx.save();
        sctx.translate(p.x * W, p.y * H);
        sctx.rotate(p.r);
        sctx.fillStyle = p.k ? `rgba(242,169,59,${0.55 * w})` : `rgba(232,136,154,${0.5 * w})`;
        sctx.beginPath();
        sctx.ellipse(0, 0, p.sz, p.sz * 0.45, 0, 0, 6.29);
        sctx.fill();
        sctx.restore();
      }
      for (const l of lants) {
        l.y -= l.spd;
        if (l.y < -0.15) l.y = 1.2;
        const lx = (l.x + Math.sin(t / 2400 + l.p) * 0.012) * W, ly = l.y * H;
        const lg = sctx.createRadialGradient(lx, ly, 0, lx, ly, l.sz * 3.4);
        lg.addColorStop(0, `rgba(242,169,59,${0.4 * w})`);
        lg.addColorStop(1, 'rgba(242,169,59,0)');
        sctx.fillStyle = lg;
        sctx.fillRect(lx - l.sz * 3.4, ly - l.sz * 3.4, l.sz * 6.8, l.sz * 6.8);
        sctx.fillStyle = `rgba(250,205,120,${0.85 * w})`;
        sctx.beginPath();
        sctx.roundRect(lx - l.sz / 2, ly - l.sz * 0.7, l.sz, l.sz * 1.4, 3);
        sctx.fill();
      }
    }
    /* era 4 — golden dust */
    if (eraW[4] > 0.02) {
      const w = eraW[4];
      for (const d of dust) {
        d.y -= d.spd;
        if (d.y < -0.05) {
          d.y = 1.1;
          d.x = R(1);
        }
        const a = (0.3 + 0.4 * Math.abs(Math.sin(t / 500 + d.p))) * w;
        sctx.beginPath();
        sctx.arc(d.x * W, d.y * H, 1.6, 0, 6.29);
        sctx.fillStyle = `rgba(255,198,110,${a})`;
        sctx.fill();
      }
    }
    /* shooting star */
    nextMeteor -= 16;
    if (!meteor && nextMeteor <= 0) {
      meteor = { x: R(W * 0.7), y: R(H * 0.3), vx: 9 + R(5), vy: 3 + R(2), life: 1 };
      nextMeteor = 6000 + R(6000);
    }
    if (meteor) {
      meteor.x += meteor.vx;
      meteor.y += meteor.vy;
      meteor.life -= 0.022;
      if (meteor.life <= 0 || meteor.x > W + 60) meteor = null;
      else {
        sctx.strokeStyle = `rgba(240,244,255,${meteor.life * 0.8})`;
        sctx.lineWidth = 1.4;
        sctx.beginPath();
        sctx.moveTo(meteor.x, meteor.y);
        sctx.lineTo(meteor.x - meteor.vx * 6, meteor.y - meteor.vy * 6);
        sctx.stroke();
      }
    }
  }

  return { draw, width: () => W };
}
