import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { OnboardingScreen } from './OnboardingScreen'
import { Prototype } from '../features/prototype/Prototype'
import { onboardingCopy, onboardingDescriptions } from '../content/onboarding'

describe('onboarding presentation', () => {
  it.each(['max', 'vk-video'] as const)('preserves approved %s copy without a microphone', (product) => {
    const html = renderToStaticMarkup(<OnboardingScreen product={product} onStart={() => {}} onBack={() => {}} />)
    expect(html).toContain(onboardingCopy.headline)
    expect(html).toContain(onboardingCopy.voice)
    expect(html).toContain(onboardingDescriptions[product])
    expect(html).not.toContain('<svg')
  })

  it('opens a new session on the question and two logos, not onboarding', () => {
    const html = renderToStaticMarkup(<Prototype />)
    expect(html).toContain(onboardingCopy.homeQuestion)
    expect(html).toContain('aria-label="VK Видео"')
    expect(html).toContain('aria-label="MAX"')
    expect(html).not.toContain(onboardingCopy.headline)
    expect(html).not.toContain(onboardingCopy.start)
  })
})
