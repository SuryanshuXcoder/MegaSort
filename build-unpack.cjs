const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const payloadDir = path.join(process.cwd(), '.payload');
const parts = fs.readdirSync(payloadDir).filter(n => n.startsWith('part_')).sort();
if (!parts.length) throw new Error('MegaSort source payload is missing.');
const base64 = parts.map(n => fs.readFileSync(path.join(payloadDir, n), 'utf8')).join('');
const zipPath = path.join(process.cwd(), '.megasort-source.zip');
fs.writeFileSync(zipPath, Buffer.from(base64, 'base64'));
execFileSync('unzip', ['-oq', zipPath, '-d', process.cwd()], { stdio: 'inherit' });
fs.rmSync(zipPath, { force: true });
const viteBin = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite');
execFileSync(viteBin, ['build'], { stdio: 'inherit' });
