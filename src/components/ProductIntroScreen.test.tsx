import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ProductIntroScreen, productIntroDuration } from './ProductIntroScreen'

describe('product intro', () => {
  it.each([
    { product: 'max' as const, label: 'MAX', variant: 'max', asset: 'max-flow/logo.webp' },
    { product: 'vk-video' as const, label: 'VK Видео', variant: 'vk', asset: 'vk-flow/logo.png' },
  ])('shows only the $label logo', ({ product, label, variant, asset }) => {
    const html = renderToStaticMarkup(<ProductIntroScreen product={product} />)
    expect(html).toContain(`product-intro--${variant}`)
    expect(html).toContain(`alt="${label}"`)
    expect(html).toContain(asset)
    expect(html.match(/<img /g)).toHaveLength(1)
    expect(html).not.toMatch(/<(h1|p|button)\b/)
  })

  it('uses the short prototype delay', () => {
    expect(productIntroDuration).toBe(1200)
  })
})
