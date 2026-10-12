import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await build({ absWorkingDir: root, entryPoints: ['js/main.js'], bundle: true, minify: true, format: 'esm', target: ['es2020'], outfile: 'assets/app.js', legalComments: 'linked' });
execFileSync(process.execPath, [path.join(root, 'node_modules/@tailwindcss/cli/dist/index.mjs'), '-i', 'scripts/tailwind.css', '-o', 'assets/tailwind.css', '--minify'], {cwd: root, stdio: 'inherit'});
console.log('Built local application JavaScript and Tailwind CSS.');
