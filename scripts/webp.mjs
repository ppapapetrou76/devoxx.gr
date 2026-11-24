// Writes a resized WebP copy next to each image given, e.g. photo.jpg -> photo.webp.
// The page then references the .webp; keep the original next to it.
//
// Usage:
//   npm run webp -- public/images/atmosphere/new-photo.jpg            (max 1200 px wide)
//   npm run webp -- --width 1920 public/images/hero-4.jpg             (hero photos)
//   npm run webp -- --square 240 public/images/committee/jane-doe.jpg (committee photos)
//   --quality Q sets the WebP quality, 1-100 (default 80).
//
// --width never enlarges an image; --square always produces N x N (centre crop), enlarging small
// sources so every committee photo has the same size. Existing .webp files are overwritten.
// Exits non-zero if any image could not be converted.
import sharp from 'sharp';

const usage = 'usage: npm run webp -- [--width N | --square N] [--quality Q] <image.jpg|png>...';
const fail = (msg) => { console.error(`${msg}\n${usage}`); process.exit(1); };

const opts = { width: 1200, square: 0, quality: 80 };
const files = [];
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const flag = args[i];
  if (!flag.startsWith('--')) { files.push(flag); continue; }
  const name = flag.slice(2);
  if (!(name in opts)) fail(`unknown option ${flag}`);
  const value = Number(args[++i]);
  if (!Number.isInteger(value) || value < 1 || (name === 'quality' && value > 100)) {
    fail(`${flag} needs a whole number${name === 'quality' ? ' from 1 to 100' : ' above 0'}`);
  }
  if (name === 'square' && args.includes('--width')) fail('use --width or --square, not both');
  opts[name] = value;
}
if (!files.length) fail('no images given');

const outputs = new Map();
let failed = 0;
for (const file of files) {
  if (!/\.(jpe?g|png)$/i.test(file)) { console.error(`skipped ${file}: not a .jpg or .png`); failed++; continue; }
  const out = file.replace(/\.(jpe?g|png)$/i, '.webp');
  if (outputs.has(out)) { console.error(`skipped ${file}: ${outputs.get(out)} already writes ${out}`); failed++; continue; }
  outputs.set(out, file);
  const resize = opts.square
    ? { width: opts.square, height: opts.square, fit: 'cover' }
    : { width: opts.width, withoutEnlargement: true };
  try {
    const info = await sharp(file).rotate().resize(resize).webp({ quality: opts.quality }).toFile(out);
    console.log(`${out}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
  } catch (err) {
    console.error(`could not convert ${file}: ${err.message}`);
    failed++;
  }
}
if (failed) process.exit(1);
