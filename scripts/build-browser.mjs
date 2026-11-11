import { build } from 'esbuild';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const path = (p) => fileURLToPath(new URL(p, root));
const dist = path('dist/');

await mkdir(dist, { recursive: true });

await copyFile(path('src/consent-init.js'), path('dist/consent-init.js'));

await build({
  entryPoints: [path('src/banner-runtime.ts')],
  outfile: path('dist/consent-banner.js'),
  bundle: true,
  format: 'iife',
  target: 'es2019',
  minify: true,
});

const css = await Promise.all([
  readFile(path('node_modules/vanilla-cookieconsent/dist/cookieconsent.css'), 'utf8'),
  readFile(path('src/theme.css'), 'utf8'),
]);
await writeFile(path('dist/consent-banner.css'), css.join('\n'));
