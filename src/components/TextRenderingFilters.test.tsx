import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Prototype } from '../features/prototype/Prototype'
import { TextRenderingFilters } from './TextRenderingFilters'

describe('shared text edge rendering', () => {
  it('defines an invisible alpha-only correction without replacing live text', () => {
    const html = renderToStaticMarkup(<TextRenderingFilters />)
    expect(html).toContain('width="0" height="0" aria-hidden="true" focusable="false"')
    expect(html).toContain('id="figma-text-edges" color-interpolation-filters="sRGB"')
    expect(html).toContain('<feFuncA type="gamma" amplitude="1" exponent="2.2" offset="0"')
    expect(html).not.toMatch(/<feFunc[RGB]/)
    expect(html).not.toContain('<path')
    expect(html).not.toContain('<text')
  })

  it('keeps one filter definition outside the changing screen subtree', () => {
    const html = renderToStaticMarkup(<Prototype />)
    expect(html.match(/id="figma-text-edges"/g)).toHaveLength(1)
    expect(html.indexOf('text-rendering-filters')).toBeLessThan(html.indexOf('prototype-canvas'))
  })
})
