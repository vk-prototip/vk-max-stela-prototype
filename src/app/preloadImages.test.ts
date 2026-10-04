import { afterEach, describe, expect, it, vi } from 'vitest'
import { preloadNextScreenImages } from './preloadImages'

afterEach(() => vi.unstubAllGlobals())

describe('next-screen images', () => {
  it('warms branch backgrounds, first VK cards and shared controls at low priority', () => {
    const images: FakeImage[] = []
    class FakeImage {
      src = ''
      fetchPriority = ''
      decode = vi.fn().mockResolvedValue(undefined)
      constructor() { images.push(this) }
    }
    vi.stubGlobal('Image', FakeImage)
    preloadNextScreenImages()
    expect(images).toHaveLength(24)
    expect(images.filter(({ src }) => src.endsWith('.webp'))).toHaveLength(17)
    expect(images.filter(({ src }) => src.endsWith('.png'))).toHaveLength(6)
    expect(images.some(({ src }) => src.includes('/controls/back.png'))).toBe(false)
    expect(images.some(({ src }) => src.includes('goal-background'))).toBe(false)
    expect(images.some(({ src }) => src.includes('thanks.webp'))).toBe(true)
    expect(images.filter(({ src }) => src.includes('/logo.'))).toHaveLength(2)
    expect(images.some(({ src }) => src.includes('scan-background-final.webp'))).toBe(true)
    expect(images.some(({ src }) => src.includes('scan-light-contour-scenario.webp'))).toBe(true)
    expect(images.some(({ src }) => src.includes('scan-white-particles-scenario.webp'))).toBe(true)
    expect(images.some(({ src }) => src.includes('discovery-activation-figma-clean.webp'))).toBe(true)
    expect(images.some(({ src }) => src.includes('discovery-activation-scenario.png'))).toBe(false)
    expect(images.some(({ src }) => src.includes('scan-background-polina'))).toBe(false)
    expect(images.some(({ src }) => src.includes('metadata-bubble-final'))).toBe(true)
    expect(images.some(({ src }) => src.includes('final-background-polina'))).toBe(true)
    for (const image of images) {
      expect(image.fetchPriority).toBe('low')
      expect(image.decode).toHaveBeenCalledOnce()
    }
  })

  it('ignores decode failures so interaction remains available', async () => {
    vi.stubGlobal('Image', class {
      decode() { return Promise.reject(new Error('Unavailable image')) }
    })
    expect(preloadNextScreenImages).not.toThrow()
    await Promise.resolve()
  })
})
