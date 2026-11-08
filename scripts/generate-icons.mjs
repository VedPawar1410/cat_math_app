#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 * 
 * This script converts the SVG icons to PNG format at various sizes.
 * 
 * Prerequisites:
 *   npm install sharp
 * 
 * Or use online tools like:
 *   - https://realfavicongenerator.net/
 *   - https://www.pwabuilder.com/imageGenerator
 * 
 * Usage:
 *   node scripts/generate-icons.mjs
 */

import fs from "fs";
import path from "path";

// Check if sharp is available
let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                    PWA Icon Generator                              ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  To generate PNG icons from the SVG, you have two options:         ║
║                                                                    ║
║  OPTION 1: Install sharp and run this script                       ║
║  ──────────────────────────────────────────────────────────────    ║
║    npm install sharp                                               ║
║    node scripts/generate-icons.mjs                                  ║
║                                                                    ║
║  OPTION 2: Use online tools (recommended for quick setup)          ║
║  ──────────────────────────────────────────────────────────────    ║
║    1. Go to https://realfavicongenerator.net/                      ║
║    2. Upload public/icons/icon.svg                                 ║
║    3. Download and extract icons to public/icons/                  ║
║                                                                    ║
║  OPTION 3: Use PWA Builder                                         ║
║  ──────────────────────────────────────────────────────────────    ║
║    1. Go to https://www.pwabuilder.com/imageGenerator              ║
║    2. Upload public/icons/icon.svg                                 ║
║    3. Download and extract to public/icons/                        ║
║                                                                    ║
║  Required icon files:                                              ║
║    • icon-16x16.png                                                ║
║    • icon-32x32.png                                                ║
║    • icon-192x192.png                                              ║
║    • icon-512x512.png                                              ║
║    • icon-maskable-512x512.png (from icon-maskable.svg)            ║
║    • apple-touch-icon.png (180x180)                                ║
║                                                                    ║
╚═══════════════════════════════════════════════════════════════════╝
  `);
  process.exit(0);
}

const ICONS_DIR = path.join(import.meta.dirname, '..', 'public', 'icons');
const SVG_PATH = path.join(ICONS_DIR, 'icon.svg');
const MASKABLE_SVG_PATH = path.join(ICONS_DIR, 'icon-maskable.svg');

const sizes = [
  { name: 'icon-16x16.png', size: 16 },
  { name: 'icon-32x32.png', size: 32 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

const maskableSizes = [
  { name: 'icon-maskable-512x512.png', size: 512 },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Check if SVG exists
  if (!fs.existsSync(SVG_PATH)) {
    console.error('❌ SVG file not found:', SVG_PATH);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(SVG_PATH);

  // Generate regular icons
  for (const { name, size } of sizes) {
    const outputPath = path.join(ICONS_DIR, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  ✓ Generated ${name} (${size}x${size})`);
  }

  // Generate maskable icons
  if (fs.existsSync(MASKABLE_SVG_PATH)) {
    const maskableSvgBuffer = fs.readFileSync(MASKABLE_SVG_PATH);
    for (const { name, size } of maskableSizes) {
      const outputPath = path.join(ICONS_DIR, name);
      await sharp(maskableSvgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`  ✓ Generated ${name} (${size}x${size}) [maskable]`);
    }
  }

  console.log('\n✅ All icons generated successfully!');
  console.log(`   Icons saved to: ${ICONS_DIR}`);
}

generateIcons().catch(console.error);

