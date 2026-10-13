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
fs.writeFileSync(path.join(root,'assets','build-diagnostics.txt'),diagnostics.join('\n'));
console.log(diagnostics.join('\n'));
