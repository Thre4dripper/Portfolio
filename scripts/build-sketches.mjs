/* Sketch image pipeline. Drop originals into content/ (gitignored), run
   `pnpm sketches`, commit the outputs:
   - public/sketches/thumb/*.webp  (~420px — fast grid previews)
   - public/sketches/full/*.webp   (~1400px — lightbox versions)
   - src/data/sketches.json        (dimensions + inline blurred LQIP placeholders)
   Sharp comes with Astro, so no extra dependency. */
import sharp from 'sharp';
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SRC = new URL('../content/', import.meta.url).pathname;
const OUT_THUMB = new URL('../public/sketches/thumb/', import.meta.url).pathname;
const OUT_FULL = new URL('../public/sketches/full/', import.meta.url).pathname;
const MANIFEST = new URL('../src/data/sketches.json', import.meta.url).pathname;

mkdirSync(OUT_THUMB, { recursive: true });
mkdirSync(OUT_FULL, { recursive: true });

const files = readdirSync(SRC)
  .filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f))
  .sort();

const manifest = [];
let i = 0;
for (const file of files) {
  const id = `sketch-${String(++i).padStart(2, '0')}`;
  const img = sharp(join(SRC, file)).rotate(); // .rotate() honors EXIF orientation

  const full = await img.clone().resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  writeFileSync(join(OUT_FULL, `${id}.webp`), full);
  const meta = await sharp(full).metadata();

  const thumb = await img.clone().resize({ width: 420, withoutEnlargement: true }).webp({ quality: 68 }).toBuffer();
  writeFileSync(join(OUT_THUMB, `${id}.webp`), thumb);

  const lqip = await img.clone().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();

  manifest.push({
    id,
    w: meta.width,
    h: meta.height,
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
  });
  console.log(`${file} → ${id} (full ${(full.length / 1024).toFixed(0)}KB, thumb ${(thumb.length / 1024).toFixed(0)}KB, lqip ${lqip.length}B)`);
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`\n${manifest.length} sketches → ${MANIFEST}`);
