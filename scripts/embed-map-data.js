/**
 * One-time script: reads K277_map.png, embeds as base64 in js/k277-map-data.js
 * so the portal calculator canvas is never tainted (works with file:// and any server).
 * Run from project root: node scripts/embed-map-data.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const mapPath = path.join(root, 'K277_map.png');
const outPath = path.join(root, 'js', 'k277-map-data.js');

if (!fs.existsSync(mapPath)) {
  console.error('K277_map.png not found in project root.');
  process.exit(1);
}

const buf = fs.readFileSync(mapPath);
const base64 = buf.toString('base64');
const content = "window.K277_MAP_DATA_URL = 'data:image/png;base64," + base64 + "';\n";

fs.writeFileSync(outPath, content, 'utf8');
console.log('Wrote js/k277-map-data.js (map embedded as data URL).');
