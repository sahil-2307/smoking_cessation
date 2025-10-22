# PWA Icons Setup

Placeholder SVG files have been created, but you need PNG files for the PWA.

## Option 1: Use an online tool (Easiest)
1. Visit https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload a 512x512 PNG of your app logo
3. Download the generated icons
4. Replace files in public/icons/

## Option 2: Use ImageMagick (Command line)
If you have a source icon (icon-source.png), run:

```bash
cd public/icons
for size in 72 96 128 144 152 192 384 512; do
  convert icon-source.png -resize ${size}x${size} icon-${size}x${size}.png
done
```

## Option 3: Use Sharp (Node.js)
Install: npm install sharp
Then run the conversion script (see generate-icons-sharp.js)

## Current Status
- SVG placeholders created in: /Users/sahilb/Code/Sahil/smoking_cessation/public/icons
- You MUST replace these with proper PNG icons before production deployment
