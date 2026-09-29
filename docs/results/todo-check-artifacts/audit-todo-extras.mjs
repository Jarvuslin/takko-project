import fs from 'node:fs';
import path from 'node:path';
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const scripts = fs.readdirSync('scripts').filter(f => fs.statSync(path.join('scripts',f)).isFile());
const consumers = [...['src','tests','scripts','desktop'].flatMap(walk).filter(f => /\.(?:[cm]?[jt]sx?|ps1)$/.test(f)), 'package.json', 'playwright.config.ts', 'vite.config.ts'];
const texts = consumers.map(file => [file, fs.readFileSync(file,'utf8')]);
const unreferencedScripts = scripts.filter(file => !texts.some(([source,text]) => path.normalize(source) !== path.normalize('scripts/' + file) && text.includes(file)));
const app = fs.readFileSync('src/web/App.tsx','utf8');
const report = {
  note: 'Current literal-name reference scan. Not proof that one-off scripts are unused. No scripts were removed.',
  scriptCount: scripts.length, unreferencedScripts,
  currentAppLines: app.split('\n').length,
  currentAppUseStateOccurrences: app.slice(app.indexOf('export function App()')).match(/\buseState\b/g)?.length,
  staleClassReferences: ['plugin-card','plugin-card-action','ideas','explore-prompts','explore-icon','model-chip','sidebar-toggle','sidebar-expanded'].map(name => ({name, references: texts.filter(([f,t]) => f.startsWith('src' + path.sep + 'web') && t.includes(name)).map(([f])=>f)})),
};
fs.writeFileSync('docs/results/todo-audit-extras.json', JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
