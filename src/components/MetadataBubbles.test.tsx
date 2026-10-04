import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MetadataBubbles } from './MetadataBubbles'
import { maxAudienceOptions } from '../content/max'

describe('metadata bubbles', () => {
  it('preserves the existing VK markup and positioning classes', () => {
    const html = renderToStaticMarkup(<MetadataBubbles metadata={['один', 'два', 'три', 'четыре']} origin="position-2" />)
    expect(html).toContain('vk-metadata--position-2')
    expect(html.match(/class="vk-metadata-tag /g)).toHaveLength(4)
    expect(html).not.toContain('max-metadata')
    expect(html).not.toContain('style=')
  })

  it('gives all eight MAX tags separate targets and finishes within the reveal', () => {
    const metadata = maxAudienceOptions[0].metadata
    const html = renderToStaticMarkup(<MetadataBubbles metadata={metadata} origin="business" variant="max" />)
    expect(metadata).toHaveLength(8)
    expect(html.match(/--target-x:/g)).toHaveLength(8)
    expect(html.match(/--target-y:/g)).toHaveLength(8)
    expect(html).toContain('max-metadata--business')
    expect(.1 + (metadata.length - 1) * .08 + 1.6).toBeLessThan(2.3)
  })
})
