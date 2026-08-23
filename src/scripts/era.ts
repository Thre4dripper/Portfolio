/* Era color engine: blends the five act palettes by camera position and
   feeds the result to CSS custom properties + the sky gradient. */
import { ERAS, GATE_CAM } from '../data/portfolio';

type Channel = 'top' | 'bot' | 'acc' | 'deep';

function hex2rgb(h: string): number[] {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}

const ERGB = ERAS.map((e) => ({
  top: hex2rgb(e.top),
  bot: hex2rgb(e.bot),
  acc: hex2rgb(e.acc),
  deep: hex2rgb(e.deep),
}));

/** Current blend weight of each era, updated by computeEra(). */
export const eraW: number[] = [1, 0, 0, 0, 0];

export function computeEra(cam: number): void {
  const f = [1];
  for (let i = 1; i < ERAS.length; i++) {
    f[i] = Math.max(0, Math.min(1, (cam - GATE_CAM[i] + 150) / 620));
  }
  f.push(0);
  for (let i = 0; i < ERAS.length; i++) eraW[i] = f[i] - f[i + 1];
}

export function blend(key: Channel): number[] {
  const c = [0, 0, 0];
  for (let i = 0; i < ERAS.length; i++) {
    if (eraW[i] <= 0) continue;
    c[0] += ERGB[i][key][0] * eraW[i];
    c[1] += ERGB[i][key][1] * eraW[i];
    c[2] += ERGB[i][key][2] * eraW[i];
  }
  return c.map(Math.round);
}

export const cssRGB = (c: number[]): string => `rgb(${c[0]},${c[1]},${c[2]})`;

const hexc = (c: number[]): string => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');

let lastAccHex = '';

export function applyTheme(): void {
  const acc = blend('acc');
  const deep = blend('deep');
  const h = hexc(acc);
  if (h !== lastAccHex) {
    lastAccHex = h;
    document.documentElement.style.setProperty('--accent', h);
    document.documentElement.style.setProperty('--accent-deep', hexc(deep));
  }
}
