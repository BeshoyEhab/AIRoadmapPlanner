import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
const iconsDir = path.join(publicDir, 'assets', 'icons');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icon function
function generateIcon(size, name) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(0, 0, size, size);
  
  // Draw "AI" text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.floor(size * 0.5)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI', size / 2, size / 2);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, `${name}.png`), buffer);
  
  return {
    src: `/assets/icons/${name}.png`,
    sizes: `${size}x${size}`,
    type: 'image/png',
    purpose: 'any maskable'
  };
}

// Generate icons
const icons = [
  generateIcon(192, 'icon-192'),
  generateIcon(512, 'icon-512'),
  generateIcon(1024, 'screenshot-desktop')
];

// Update manifest.json
const manifestPath = path.join(publicDir, 'manifest.json');
const manifest = {
  name: 'AI Roadmap Planner',
  short_name: 'RoadmapAI',
  description: 'Transform your learning journey with AI-generated study roadmaps',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#3b82f6',
  icons: [
    {
      src: '/assets/icons/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/assets/icons/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable'
    }
  ]
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('Icons and manifest generated successfully!');
