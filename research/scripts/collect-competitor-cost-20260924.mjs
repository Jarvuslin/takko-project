// Public unauthenticated GETs only. Does not launch competitor applications.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const directory = path.join(root, 'research/evidence/competitor-cost-20260924');
await fs.mkdir(directory, { recursive: true });
const sources = [
  ['superbullet-home', 'https://superbullet.ai/'],
  ['superbullet-pricing', 'https://superbullet.ai/pricing'],
  ['superbullet-faq', 'https://superbullet.ai/faq'],
  ['superbullet-packaging', 'https://marketplace-docs.superbulletstudios.com/how-to-add-asset'],
  ['superbullet-dependencies', 'https://marketplace-docs.superbulletstudios.com/relevant-systems-prompts'],
  ['superbullet-extensions', 'https://marketplace-docs.superbulletstudios.com/extensions'],
  ['superbullet-animation', 'https://marketplace-docs.superbulletstudios.com/to-upload-by-user/how-to-add-animations'],
  ['lemonade-models', 'https://openrouter.ai/apps/lemonade'],
  ['forgegui-home', 'https://forgegui.com/'],
  ['luna-pricing', 'https://openrouter.ai/openai/gpt-5.6-luna'],
  ['hy3-pricing', 'https://openrouter.ai/tencent/hy3'],
  ['prompt-caching', 'https://openrouter.ai/docs/guides/best-practices/prompt-caching'],
];
const results = await Promise.all(sources.map(async ([name, url]) => {
  const at = new Date().toISOString();
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const bytes = Buffer.from(await response.arrayBuffer());
    const file = `${name}.html`;
    await fs.writeFile(path.join(directory, file), bytes, { flag: 'wx' });
    return { url, finalUrl: response.url, at, status: response.status, file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
  } catch (error) {
    return { url, at, error: String(error.message) };
  }
}));
await fs.writeFile(path.join(directory, 'manifest.json'), JSON.stringify(results, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(results, null, 2));
