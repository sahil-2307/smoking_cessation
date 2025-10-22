#!/usr/bin/env node

/**
 * PWA Icon Generator
 *
 * This script creates placeholder SVG icons for your PWA.
 * Replace these with proper icons using a tool like:
 * - https://realfavicongenerator.net/
 * - https://www.pwabuilder.com/imageGenerator
 *
 * Or use ImageMagick to convert from a source image:
 * convert icon.png -resize 192x192 public/icons/icon-192x192.png
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG placeholder for each size
sizes.forEach(size => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16a34a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
  <g transform="translate(${size * 0.5}, ${size * 0.5})">
    <circle cx="0" cy="0" r="${size * 0.3}" fill="white" opacity="0.9"/>
    <path d="M ${-size * 0.15} ${-size * 0.05} L ${size * 0.15} ${-size * 0.05} L ${size * 0.15} ${size * 0.05} L ${-size * 0.15} ${size * 0.05} Z"
          fill="#ef4444"
          transform="rotate(45)"
          stroke="white"
          stroke-width="${size * 0.02}"/>
  </g>
  <text x="${size * 0.5}" y="${size * 0.85}"
        font-family="Arial, sans-serif"
        font-size="${size * 0.12}"
        font-weight="bold"
        fill="white"
        text-anchor="middle">QUIT</text>
</svg>`;

  const filePath = path.join(iconsDir, `icon-${size}x${size}.png`);

  // Write SVG temporarily
  const svgPath = path.join(iconsDir, `temp-${size}.svg`);
  fs.writeFileSync(svgPath, svg);

  console.log(`Created placeholder for ${size}x${size}`);

  // Note: In production, convert SVG to PNG using sharp or imagemagick
  // For now, we'll create a simple instruction file
});

// Create instruction file
const instructions = `# PWA Icons Setup

Placeholder SVG files have been created, but you need PNG files for the PWA.

## Option 1: Use an online tool (Easiest)
1. Visit https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload a 512x512 PNG of your app logo
3. Download the generated icons
4. Replace files in public/icons/

## Option 2: Use ImageMagick (Command line)
If you have a source icon (icon-source.png), run:

\`\`\`bash
cd public/icons
for size in 72 96 128 144 152 192 384 512; do
  convert icon-source.png -resize \${size}x\${size} icon-\${size}x\${size}.png
done
\`\`\`

## Option 3: Use Sharp (Node.js)
Install: npm install sharp
Then run the conversion script (see generate-icons-sharp.js)

## Current Status
- SVG placeholders created in: ${iconsDir}
- You MUST replace these with proper PNG icons before production deployment
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), instructions);

console.log('\n✅ Icon placeholders created!');
console.log('📝 See public/icons/README.md for instructions on creating proper icons');
console.log('\n⚠️  IMPORTANT: Replace placeholder icons with proper PNG icons before deploying!');
