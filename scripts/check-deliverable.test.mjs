import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { auditDeliverable, collectCssReferences, collectHtmlPreloads, collectModuleReferences, isForbiddenRootEntry } from './check-deliverable.mjs'

describe('deliverable static references', () => {
  it('uses the TypeScript AST for imports, exports and literal URL/import expressions', () => {
    const source = `
      import image from './image.png?url'
      export { value } from './module'
      const lazy = import('./lazy')
      const asset = new URL('./font.woff2', import.meta.url)
      // import ignored from './comment.png'
      const text = "import ignored from './string.png'"
    `
    expect(collectModuleReferences(source, 'src/example.ts')).toEqual(['./image.png?url', './module', './lazy', './font.woff2'])
  })

  it('reads declaration URLs and stylesheet imports through PostCSS', () => {
    const source = `
      /* ignored: url('./comment.png') */
      @import './shared.css';
      .card { background: url("./one.png"), url('./two.webp'); filter: url(#edges); }
      @font-face { src: url(./font.woff2) format('woff2'); }
    `
    expect(collectCssReferences(source, 'src/example.css')).toEqual(['./one.png', './two.webp', '#edges', './font.woff2', './shared.css'])
  })

  it('includes static HTML preloads without counting unrelated links', () => {
    expect(collectHtmlPreloads(`<link href='/src/assets/a.png' rel="preload" as="image"><link rel="stylesheet" href="/unused.css">`))
      .toEqual(['/src/assets/a.png'])
  })

  it('rejects local exports, root audio/images and named QA artifacts', () => {
    expect(isForbiddenRootEntry('экспорты', true)).toBe(true)
    expect(isForbiddenRootEntry('qa-artifacts', true)).toBe(true)
    expect(isForbiddenRootEntry('brief.m4a', false)).toBe(true)
    expect(isForbiddenRootEntry('screenshot.png', false)).toBe(true)
    expect(isForbiddenRootEntry('delivery.zip', false)).toBe(true)
    expect(isForbiddenRootEntry('qa-output.json', false)).toBe(true)
    expect(isForbiddenRootEntry('src', true)).toBe(false)
    expect(isForbiddenRootEntry('docs', true)).toBe(false)
    expect(isForbiddenRootEntry('package-lock.json', false)).toBe(false)
  })

  it('finds untracked unused/missing/oversized files and does not scan generated directories', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vk-stela-deliverable-'))
    const write = (relative, content) => {
      const file = path.join(root, relative)
      fs.mkdirSync(path.dirname(file), { recursive: true })
      fs.writeFileSync(file, content)
    }
    try {
      write('src/main.ts', "import image from './assets/used.png'; import missing from './assets/missing.png'")
      write('src/assets/used.png', 'asset')
      write('src/assets/unused.png', 'asset')
      write('src/assets/README.md', 'Asset documentation')
      write('index.html', '<link rel="preload" href="/src/assets/used.png">')
      write('brief.m4a', 'audio')
      write('qa-artifacts/proof.json', '{}')
      write('docs/oversized.bin', '')
      fs.truncateSync(path.join(root, 'docs/oversized.bin'), 10 * 1024 * 1024 + 1)
      for (const directory of ['node_modules', 'dist', '.git']) write(`${directory}/ignored.ts`, "import missing from './missing.png'")
      const result = auditDeliverable(root)
      expect(result).toEqual(auditDeliverable(root))
      expect(result.assets).toBe(2)
      expect(result.errors).toEqual([
        'Asset has no static runtime reference: src/assets/unused.png',
        'Local source or QA artifact in repository root: brief.m4a',
        'Local source or QA artifact in repository root: qa-artifacts',
        'Missing local reference: src/main.ts -> ./assets/missing.png',
        'Source file exceeds 10 MiB: docs/oversized.bin',
      ])
    } finally {
      const absolute = path.resolve(root)
      if (!absolute.startsWith(path.resolve(os.tmpdir()) + path.sep) || !path.basename(absolute).startsWith('vk-stela-deliverable-')) {
        throw new Error('Fixture cleanup path outside intended temporary directory')
      }
      fs.rmSync(absolute, { recursive: true, force: true })
    }
  })
})
