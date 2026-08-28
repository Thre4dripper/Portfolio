/* Sketch image pipeline. Drop originals into content/ (gitignored), run
   `pnpm sketches`, commit the outputs:
   - public/sketches/thumb/*.webp  (~420px — fast grid previews)
   - public/sketches/full/*.webp   (~1400px — lightbox versions)
   - src/data/sketches.json        (dimensions + inline blurred LQIP placeholders)
   Sharp comes with Astro, so no extra dependency. */
import sharp from 'sharp';
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/* fileURLToPath, not .pathname — .pathname keeps percent-encoding (a path with
   a space arrives as %20) and prefixes a slash on Windows drive letters. */
const here = (rel) => fileURLToPath(new URL(rel, import.meta.url));
const SRC = here('../content/');
const OUT_THUMB = here('../public/sketches/thumb/');
const OUT_FULL = here('../public/sketches/full/');
const MANIFEST = here('../src/data/sketches.json');

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
