import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { XMLValidator } from 'fast-xml-parser'
const dir = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const sharp = require('C:/Users/7474g/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')
const pages = JSON.parse(await fs.readFile(path.join(dir, 'screens.json'), 'utf8'))
for (const p of pages) test(`${p.id}: valid self-contained vector and matching raster`, async () => {
  const svg = await fs.readFile(path.join(dir, p.id + '.svg'), 'utf8')
  assert.equal(XMLValidator.validate(svg), true)
  assert.doesNotMatch(svg, /<script|<image|href=|url\(/i)
  const raster = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  assert.equal(raster.info.width, 1280)
  assert.equal(raster.info.height, 800)
  const png = await sharp(path.join(dir, p.id + '.png')).ensureAlpha().raw().toBuffer()
  assert.deepEqual(png, raster.data)
})
test('all 22 states are reachable and every hotspot stays inside its screen', () => {
  const ids = new Set(pages.map(p => p.id))
  assert.equal(ids.size, 22)
  const visited = new Set()
  function visit(id) {
    if (visited.has(id)) return
    visited.add(id)
    const p = pages.find(p => p.id === id)
    assert.ok(p, `Missing destination ${id}`)
    if (p.back) assert.ok(ids.has(p.back))
    for (const h of p.hits) {
      assert.ok(h.label && h.w > 0 && h.h > 0)
      assert.ok(h.x >= 0 && h.y >= 0 && h.x + h.w <= 1280 && h.y + h.h <= 800, `${id}: ${h.label}`)
      assert.ok(ids.has(h.to), `${id} -> ${h.to}`)
      visit(h.to)
    }
  }
  visit('home')
  assert.deepEqual([...visited].sort(), [...ids].sort())
})
test('two Figma boards include each screen exactly once with space for its bounds', async () => {
  const found = []
  for (const name of ['takko-settings-flow', 'takko-settings-dialogs']) {
    const svg = await fs.readFile(path.join(dir, name + '.svg'), 'utf8')
    assert.equal(XMLValidator.validate(svg), true)
    const [, width, height] = svg.match(/width="(\d+)" height="(\d+)"/)
    for (const m of svg.matchAll(/<g id="screen-([^"]+)" transform="translate\((\d+) (\d+)\)">/g)) {
      found.push(m[1])
      assert.ok(+m[2] + 1280 <= +width && +m[3] + 800 <= +height)
    }
    const metadata = await sharp(path.join(dir, name + '.png')).metadata()
    assert.equal(metadata.width, +width / 2)
    assert.equal(metadata.height, +height / 2)
  }
  assert.deepEqual(found.sort(), pages.map(p => p.id).sort())
})
