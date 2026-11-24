// Writes a resized WebP copy next to each image given, e.g. photo.jpg -> photo.webp.
// The page then references the .webp; keep the original next to it.
//
// Usage:
//   npm run webp -- public/images/atmosphere/new-photo.jpg            (max 1200 px wide)
//   npm run webp -- --width 1920 public/images/hero-4.jpg             (hero photos)
//   npm run webp -- --square 240 public/images/committee/jane-doe.jpg (committee photos)
//
// --width never enlarges an image; --square always produces N x N (centre crop), enlarging small
// sources so every committee photo has the same size. Existing .webp files are overwritten.
import sharp from 'sharp';

const args = process.argv.slice(2);
let width = 1200, square = 0, quality = 80;
const files = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--width') width = Number(args[++i]);
  else if (args[i] === '--square') square = Number(args[++i]);
  else if (args[i] === '--quality') quality = Number(args[++i]);
  else files.push(args[i]);
}
if (!files.length) {
  console.error('usage: npm run webp -- [--width N | --square N] [--quality Q] <image>...');
  process.exit(1);
}

for (const file of files) {
  if (!/\.(jpe?g|png)$/i.test(file)) { console.warn(`skipped ${file}: not a .jpg or .png`); continue; }
  const out = file.replace(/\.(jpe?g|png)$/i, '.webp');
  const resize = square
    ? { width: square, height: square, fit: 'cover' }
    : { width, withoutEnlargement: true };
  const info = await sharp(file).rotate().resize(resize).webp({ quality }).toFile(out);
  console.log(`${out}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
}
