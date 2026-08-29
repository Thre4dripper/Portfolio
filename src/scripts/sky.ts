/* The canvas sky: star field parallax plus one particle system per era
   (fireflies, glyph rain, circuit sparks, petals & lanterns, golden dust). */
import { eraW, blend, cssRGB } from './era';

const FAR = 5200;
const F = 620;
const R = (n: number) => Math.random() * n;
const GLYPHSET = 'アイウエオカキクケコ01<>{}#*+';

/* Phones and low-core machines get a lighter sky: fewer particles and a
   slightly lower-resolution canvas (upscaled by CSS). The sky redraws every
   frame no matter what else is on screen, so it dominates the frame budget
   on weak GPUs. */
const LOW =
  typeof matchMedia !== 'undefined' &&
  (matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 4);
/** particle count: full on desktop, reduced on low-end */
const N = (hi: number, lo: number) => (LOW ? lo : hi);
const RES = LOW ? 0.72 : 1;

export function initSky(sky: HTMLCanvasElement) {
  const sctx = sky.getContext('2d')!;
  let W = 0, H = 0, CX = 0, CY = 0;

  function resize() {
    W = sky.width = Math.round(innerWidth * RES);
    H = sky.height = Math.round(innerHeight * RES);
    CX = W / 2;
    CY = H * 0.46;
  }
  resize();
  addEventListener('resize', resize);

  /* the sky reacts to the pointer — differently in every era */
  let mx = -9999, my = -9999;
  const bits: { x: number; y: number; vx: number; vy: number; ch: string; life: number }[] = [];
  addEventListener('pointermove', (e) => {
    /* canvas space, not CSS space — RES may shrink the backing store */
    mx = e.clientX * RES;
    my = e.clientY * RES;
  });
  addEventListener('pointerleave', () => { mx = -9999; my = -9999; });

  /* a personal swarm of fireflies that gathers at the cursor in Act I */
  const cfire = Array.from({ length: N(20, 12) }, () => ({
    x: R(1) * 800, y: R(1) * 600, ang: R(6.28), rad: 16 + R(52), spd: 0.015 + R(0.03),
  }));

  /* lattice visibility eases out while the camera is moving, back in at rest */
  let prevCamS = 0, latticeA = 0;

  const stars = Array.from({ length: N(300, 130) }, () => ({
    x: (Math.random() - 0.5) * 2600,
    y: (Math.random() - 0.5) * 1700,
    off: Math.random() * FAR,
    tw: Math.random() * 6.28,
  }));

  const fire = Array.from({ length: N(36, 18) }, () => ({ x: R(1), y: R(1), p: R(6.28), s: 0.2 + R(0.5) }));
  const cols = Array.from({ length: N(16, 8) }, (_, i) => ({
    x: i < 8 ? R(0.16) : 0.84 + R(0.16),
    y: R(1.4) - 0.4,
    spd: 0.0015 + R(0.003),
    ch: Array.from({ length: 10 }, () => GLYPHSET[Math.floor(R(GLYPHSET.length))]),
  }));
  const sparks = Array.from({ length: N(30, 15) }, () => ({ x: R(1), y: 0.6 + R(0.5), spd: 0.002 + R(0.004), len: 6 + R(10) }));
  const petals = Array.from({ length: N(26, 13) }, () => ({
    x: R(1), y: R(1), r: R(6.28), vr: 0.01 + R(0.03),
    vx: -0.0006 - R(0.001), vy: 0.0008 + R(0.0012), sz: 3 + R(4), k: Math.random() < 0.5,
  }));
  const lants = Array.from({ length: N(6, 3) }, (_, i) => ({
    x: i < 3 ? 0.04 + R(0.1) : 0.86 + R(0.1),
    y: R(1.3), spd: 0.0006 + R(0.0008), sz: 8 + R(8), p: R(6.28),
  }));
  const dust = Array.from({ length: N(42, 20) }, () => ({
    x: R(1), y: R(1.2), spd: 0.001 + R(0.002), p: R(6.28),
    off: R(60), hold: 0, rel: 0,
  }));

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

    /* era 0 — fireflies (curious ambients + a whole swarm living at the cursor) */
    if (eraW[0] > 0.02) {
      const w = eraW[0];
      for (const f of fire) {
        const dx = mx / W - f.x, dy = my / H - f.y;
        const d2 = dx * dx * W * W + dy * dy * H * H;
        if (d2 < 320 * 320 && d2 > 40 * 40) {
          f.x += dx * 0.012 * w;
          f.y += dy * 0.012 * w;
        }
        f.x = (f.x + Math.sin(t / 2100 + f.p) * 0.0006 + 0.0002 + 1) % 1;
        f.y = (f.y + Math.cos(t / 1700 + f.p) * 0.0005 + 1) % 1;
        const near = d2 < 320 * 320 ? 1.4 : 1;
        const a = (0.25 + 0.55 * Math.abs(Math.sin(t / 600 + f.p))) * w * near;
        sctx.beginPath();
        sctx.arc(f.x * W, f.y * H, d2 < 320 * 320 ? 2.6 : 2.1, 0, 6.29);
        sctx.fillStyle = `rgba(255,214,150,${Math.min(1, a)})`;
        sctx.fill();
      }
      /* the cursor swarm — orbits jittering ellipses around the pointer */
      if (mx > -100) {
        for (const c of cfire) {
          c.ang += c.spd;
          const tx = mx + Math.cos(c.ang) * c.rad * (1 + 0.25 * Math.sin(t / 900 + c.rad));
          const ty = my + Math.sin(c.ang * 1.3) * c.rad * 0.7;
          c.x += (tx - c.x) * 0.08;
          c.y += (ty - c.y) * 0.08;
          const a = (0.5 + 0.5 * Math.abs(Math.sin(t / 260 + c.rad))) * w;
          sctx.beginPath();
          sctx.arc(c.x, c.y, 2.4, 0, 6.29);
          sctx.fillStyle = `rgba(255,224,160,${a})`;
          sctx.fill();
        }
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
    /* era 1 — the cursor gently spits binary in all directions */
    if (eraW[1] > 0.05 && mx > -100 && bits.length < N(52, 26) && Math.random() < 0.55) {
      const ang = R(6.28);
      const spd = 0.35 + R(0.9);
      bits.push({
        x: mx, y: my,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        ch: Math.random() < 0.5 ? '0' : '1', life: 1,
      });
    }
    if (bits.length) {
      sctx.font = '11px "JetBrains Mono Variable",monospace';
      sctx.textAlign = 'center';
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i];
        b.life -= 0.011;
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.992;
        b.vy *= 0.992;
        if (b.life <= 0) {
          bits.splice(i, 1);
          continue;
        }
        sctx.fillStyle = `rgba(127,180,255,${b.life * 0.9 * Math.max(eraW[1], 0.05)})`;
        sctx.fillText(b.ch, b.x, b.y);
      }
    }

    /* era 2 — rising circuit sparks + the dots-and-vectors field around the cursor */
    if (eraW[2] > 0.02) {
      const w = eraW[2];
      sctx.lineWidth = 1.6;
      for (const s of sparks) {
        s.y -= s.spd;
        /* sparks steer clear of the cursor */
        const sx = s.x * W, sy = s.y * H;
        const dx = sx - mx, dy = sy - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < 150 * 150 && d2 > 1) s.x += (dx / Math.sqrt(d2)) * 0.0022 * w;
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
      /* dots + vectors: the lattice shows itself near the pointer, arrows fleeing it.
         It eases out while the camera is flying and eases back in at rest, so it
         never smears weirdly across a moving world. */
      const camSpeed = Math.abs(cam - prevCamS);
      latticeA += ((camSpeed < 22 ? 1 : 0) - latticeA) * 0.07;
      if (mx > -100 && latticeA > 0.02) {
        const GAP = 36, RAD = 150;
        const x0 = Math.max(0, Math.floor((mx - RAD) / GAP) * GAP);
        const y0 = Math.max(0, Math.floor((my - RAD) / GAP) * GAP);
        sctx.lineWidth = 1.2;
        for (let gy = y0; gy < Math.min(H, my + RAD); gy += GAP) {
          for (let gx = x0; gx < Math.min(W, mx + RAD); gx += GAP) {
            const dx = gx - mx, dy = gy - my;
            const dist = Math.hypot(dx, dy);
            if (dist > RAD || dist < 1) continue;
            const k = (1 - dist / RAD) * w * latticeA;
            const vlen = 5 + k * 11;
            sctx.strokeStyle = `rgba(79,224,176,${k * 0.55})`;
            sctx.beginPath();
            sctx.moveTo(gx, gy);
            sctx.lineTo(gx + (dx / dist) * vlen, gy + (dy / dist) * vlen);
            sctx.stroke();
            sctx.beginPath();
            sctx.arc(gx, gy, 1.4 + k, 0, 6.29);
            sctx.fillStyle = `rgba(79,224,176,${k * 0.75})`;
            sctx.fill();
          }
        }
      }
    }
    /* era 3 — petals + rising lanterns (petals swirl around the cursor) */
    if (eraW[3] > 0.02) {
      const w = eraW[3];
      for (const p of petals) {
        const pdx = p.x * W - mx, pdy = p.y * H - my;
        const pd = Math.hypot(pdx, pdy);
        if (pd < 260 && pd > 8) {
          /* the wind picks up near the cursor: strong swirl + pull toward a
             ring around it, so petals visibly gather and whirl */
          const k = ((260 - pd) / 260) * 0.008 * w;
          p.x += (-pdy / pd) * k;
          p.y += (pdx / pd) * k;
          const ringPull = ((pd - 80) / 260) * 0.004 * w;
          p.x -= (pdx / pd) * ringPull;
          p.y -= (pdy / pd) * ringPull;
          p.r += k * 14;
        }
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
    /* era 4 — golden dust: gathers into a loose blossom around the cursor,
       lingers, then streams off downwind like seeds letting go */
    if (eraW[4] > 0.02) {
      const w = eraW[4];
      for (const d of dust) {
        if (d.rel > 0) {
          /* released — riding the wind out */
          d.rel--;
          d.x += (0.0016 + d.off / 9000) * 1.4; // wind: rightward…
          d.y -= 0.0022; // …and gently up
          if (d.rel === 0 || d.x > 1.05 || d.y < -0.05) {
            d.rel = 0; d.hold = 0; d.x = R(1); d.y = 1.05 + R(0.1);
          }
        } else {
          const bx = mx + Math.cos(d.p * 7 + t / 1400) * (22 + d.off);
          const by = my + Math.sin(d.p * 9 + t / 1100) * (16 + d.off * 0.7);
          const ddx = bx - d.x * W, ddy = by - d.y * H;
          const dd = Math.hypot(ddx, ddy);
          if (mx > -100 && dd < 340) {
            /* each mote has its own spot in the blossom — a cloud, not a point */
            d.x += (ddx / W) * 0.085 * w;
            d.y += (ddy / H) * 0.085 * w;
            if (++d.hold > 110 + d.off * 2) d.rel = 70 + Math.floor(R(50)); // let go
          } else if (d.hold > 0) d.hold--;
          d.y -= d.spd;
          if (d.y < -0.05) {
            d.y = 1.1;
            d.x = R(1);
          }
        }
        const active = d.rel > 0 || d.hold > 4;
        const a = (0.3 + 0.4 * Math.abs(Math.sin(t / 500 + d.p))) * w * (active ? 1.7 : 1);
        sctx.beginPath();
        sctx.arc(d.x * W, d.y * H, active ? 2.3 : 1.6, 0, 6.29);
        sctx.fillStyle = `rgba(255,198,110,${Math.min(1, a)})`;
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
    prevCamS = cam;
  }

  return { draw, width: () => W };
}
