const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const src = 'C:\\Users\\rajni\\.gemini\\antigravity\\brain\\0f68eff9-6a3e-41f8-a451-f98dfa5cf5b8\\rfc_favicon_1786650920875.jpg';
const appDir = path.join(__dirname, '..', 'app');
const publicDir = path.join(__dirname, '..', 'public');

async function main() {
  // 1. app/icon.png — 512x512 (Next.js app icon, used for PWA + og)
  await sharp(src)
    .resize(512, 512)
    .png()
    .toFile(path.join(appDir, 'icon.png'));
  console.log('✅ app/icon.png (512x512)');

  // 2. app/apple-icon.png — 180x180 (iOS home screen)
  await sharp(src)
    .resize(180, 180)
    .png()
    .toFile(path.join(appDir, 'apple-icon.png'));
  console.log('✅ app/apple-icon.png (180x180)');

  // 3. public/favicon-32.png — 32x32 for fallback
  await sharp(src)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32.png'));
  console.log('✅ public/favicon-32.png (32x32)');

  // 4. public/favicon-16.png — 16x16
  await sharp(src)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16.png'));
  console.log('✅ public/favicon-16.png (16x16)');

  // 5. public/favicon-192.png — 192x192 for Android PWA
  await sharp(src)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'favicon-192.png'));
  console.log('✅ public/favicon-192.png (192x192)');

  // 6. app/favicon.ico — Next.js will serve this as /favicon.ico
  // We create a 48x48 PNG named favicon.ico (browsers accept PNG in .ico wrapper)
  await sharp(src)
    .resize(48, 48)
    .png()
    .toFile(path.join(appDir, 'favicon.ico'));
  console.log('✅ app/favicon.ico (48x48 PNG)');

  console.log('\n🎉 All favicon files generated!');
}

main().catch(console.error);
