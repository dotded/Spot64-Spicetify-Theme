const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
let errors = 0;
if (manifest.name !== 'Spot64' || manifest.version !== 'V1.0' || manifest.extensions.length !== 8) {
  console.error('INVALID Spot64 V1.0 manifest'); errors++;
}
if (manifest.extensions.some(item => !/^spot64[A-Z][A-Za-z0-9]*\.js$/.test(item.name))) {
  console.error('NONSTANDARD Spot64 extension filename'); errors++;
}
for (const item of manifest.extensions) {
  const filename = path.join(root, 'Extensions', item.name);
  if (!fs.existsSync(filename)) { console.error('MISSING', item.name); errors++; continue; }
  const buffer = fs.readFileSync(filename);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  if (hash !== item.sha256) { console.error('HASH MISMATCH', item.name); errors++; }
  const syntax = cp.spawnSync(process.execPath, ['--check', filename], { encoding:'utf8', maxBuffer:1024*1024*2 });
  if (syntax.status !== 0) { console.error('JS ERROR', item.name, syntax.stderr); errors++; }
  console.log(item.name, (buffer.length/1024).toFixed(0)+' KB', syntax.status === 0 ? 'syntax OK' : 'syntax FAIL');
}
if(errors){console.error(`${errors} error(s)`);process.exit(1);}
console.log(`PASS: ${manifest.extensions.length} extensions match manifest and parse`);
