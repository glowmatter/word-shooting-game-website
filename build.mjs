import {readFile, writeFile, mkdir, cp, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, join, sep} from 'node:path';
const root = fileURLToPath(new URL('.', import.meta.url));
const {home} = JSON.parse(await readFile(join(root, 'site.json'), 'utf8'));
const image = home.image || '/assets/game-hero.jpg';
const absolute = resolve(root, '.' + decodeURIComponent(image));
if (!image.startsWith('/assets/') || !absolute.startsWith(join(root, 'assets') + sep) || !(await stat(absolute)).isFile()) {
  throw Error('Select a valid uploaded background image.');
}
const defaults = {ko: {company: '글로우매터', spot: '스팟 더 워드'}, en: {company: 'Glow Matter', spot: 'Spot the Word'}};
const copy = {ko: {...defaults.ko, ...home.ko}, en: {...defaults.en, ...home.en}};
for (const key of Object.keys(copy.ko)) copy.en[key] ||= copy.ko[key];
const html = (await readFile(join(root, 'index.template.html'), 'utf8'))
  .replace('%%HERO%%', image.slice(1).split('/').map(encodeURIComponent).join('/'))
  .replace('%%COPY%%', JSON.stringify(copy).replace(/</g, '\\u003c'));
await mkdir(join(root, 'dist'), {recursive: true});
await Promise.all([writeFile(join(root, 'dist/index.html'), html), cp(join(root, 'assets'), join(root, 'dist/assets'), {recursive: true})]);
