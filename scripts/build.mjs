import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let diagnostics=[];
try {
  await build({ absWorkingDir: root, entryPoints: ['js/main.js'], bundle: true, minify: true, format: 'esm', target: ['es2020'], outfile: 'assets/app.js', legalComments: 'linked' });
  diagnostics.push('ESBUILD_OK');
} catch (e) {
  diagnostics.push('ESBUILD_ERROR');
  diagnostics.push(String(e?.message || e));
  if (Array.isArray(e?.errors)) diagnostics.push(JSON.stringify(e.errors,null,2));
}
try {
  execFileSync(process.execPath, [path.join(root, 'node_modules/@tailwindcss/cli/dist/index.mjs'), '-i', 'scripts/tailwind.css', '-o', 'assets/tailwind.css', '--minify'], {cwd: root, stdio: 'pipe'});
  diagnostics.push('TAILWIND_OK');
} catch (e) {
  diagnostics.push('TAILWIND_ERROR');
  diagnostics.push(String(e?.stderr || e?.message || e));
}
const text=diagnostics.join('\n');
fs.writeFileSync(path.join(root,'assets','build-diagnostics.txt'),text);
if (diagnostics.includes('ESBUILD_ERROR') || diagnostics.includes('TAILWIND_ERROR')) {
  const indexPath=path.join(root,'index.html');
  let html=fs.readFileSync(indexPath,'utf8');
  const escaped=text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  html=html.replace('</body>',`<pre id="build-diagnostics" style="position:fixed;inset:10px;z-index:999999;background:#111;color:#fff;padding:20px;overflow:auto;white-space:pre-wrap">${escaped}</pre></body>`);
  fs.writeFileSync(indexPath,html);
}
console.log(text);
