#!/usr/bin/env node

/**
 * Convert SVG placeholders to PNG using Sharp
 * Run: npm install sharp --save-dev (if not already installed)
 * Then: node scripts/convert-icons.js
 */

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../public/icons');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Try to load sharp
let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.log('⚠️  Sharp not installed. Installing...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install sharp --save-dev', { stdio: 'inherit' });
    sharp = require('sharp');
  } catch (installErr) {
    console.error('❌ Failed to install sharp. Please install manually: npm install sharp --save-dev');
    process.exit(1);
  }
}

async function convertIcons() {
  console.log('Converting SVG placeholders to PNG...\n');

  for (const size of sizes) {
    const svgPath = path.join(iconsDir, `temp-${size}.svg`);
    const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    if (fs.existsSync(svgPath)) {
      try {
        await sharp(svgPath)
          .resize(size, size)
          .png()
          .toFile(pngPath);

        console.log(`✅ Created ${size}x${size} PNG`);

        // Clean up SVG
        fs.unlinkSync(svgPath);
      } catch (err) {
        console.error(`❌ Failed to convert ${size}x${size}:`, err.message);
      }
    }
  }

  console.log('\n🎉 All icons converted successfully!');
  console.log('📍 Icons location: public/icons/');
  console.log('\n💡 Tip: Replace these with your actual app logo for production');
}

convertIcons().catch(console.error);
