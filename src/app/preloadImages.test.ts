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
    expect(images).toHaveLength(10)
    expect(images.filter(({ src }) => src.endsWith('.webp'))).toHaveLength(1)
    expect(images.filter(({ src }) => src.endsWith('.png'))).toHaveLength(9)
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
