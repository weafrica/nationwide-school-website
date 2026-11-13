// Makes the home-screen / app icons from the school logo.
//
//   npm install --no-save sharp
//   node scripts/generate-pwa-icons.mjs                  (uses public/logo.png)
//   node scripts/generate-pwa-icons.mjs some/other.png   (use a different logo)
//
// Writes:
//   public/icons/icon-192.png          Android / Chrome install icon
//   public/icons/icon-512.png          Android / Chrome install icon (large)
//   public/icons/icon-512-maskable.png Android icon that gets cropped to a circle
//                                       or squircle, so the logo is kept small
//                                       enough to survive the crop
//   public/apple-touch-icon.png        iPhone / iPad home screen
//
// Run it again whenever the logo changes. (Changing the logo from the website's
// content editor does not change the installed app's icon - that is baked in.)
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const logoPath = path.resolve(args.find((a) => !a.startsWith('--')) || path.join(root, 'public', 'logo.png'));
const bgArg = args.find((a) => a.startsWith('--bg='));
const BACKGROUND = bgArg ? bgArg.slice(5) : '#2E1359'; // the school's brand purple

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error('This script needs the "sharp" package. Run:  npm install --no-save sharp');
  process.exit(1);
}

if (!existsSync(logoPath)) {
  console.error(`Could not find the logo at ${logoPath}`);
  process.exit(1);
}

// "fill" is how much of the icon the logo may take up. Maskable icons get a
// smaller share because phones crop them to a circle.
const targets = [
  { file: 'public/icons/icon-192.png', size: 192, fill: 0.74 },
  { file: 'public/icons/icon-512.png', size: 512, fill: 0.74 },
  { file: 'public/icons/icon-512-maskable.png', size: 512, fill: 0.56 },
  { file: 'public/apple-touch-icon.png', size: 180, fill: 0.74 },
];

await mkdir(path.join(root, 'public', 'icons'), { recursive: true });

for (const { file, size, fill } of targets) {
  const box = Math.round(size * fill);
  const logo = await sharp(logoPath)
    .resize(box, box, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({ create: { width: size, height: size, channels: 4, background: BACKGROUND } })
    .composite([{ input: logo, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(root, file));

  console.log(`wrote ${file}  (${size}x${size})`);
}
console.log('Done. Commit the new files in public/.');
