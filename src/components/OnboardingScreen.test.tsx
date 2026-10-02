import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { OnboardingScreen } from './OnboardingScreen'
import { Prototype } from '../features/prototype/Prototype'
import { onboardingCopy, onboardingIntroductions } from '../content/onboarding'

describe('onboarding presentation', () => {
  it.each(['max', 'vk-video'] as const)('preserves approved %s copy without a microphone', (product) => {
    const html = renderToStaticMarkup(<OnboardingScreen product={product} onStart={() => {}} onBack={() => {}} />)
    expect(html).toContain(onboardingIntroductions[product].title)
    expect(html).toContain(onboardingCopy.voice)
    for (const step of onboardingIntroductions[product].steps) expect(html).toContain(step)
    expect(html).not.toContain(onboardingCopy.spokenGreeting)
    expect(html).not.toContain('<svg')
  })

  it('opens a new session on the question and two logos, not onboarding', () => {
    const html = renderToStaticMarkup(<Prototype />)
    expect(html).toContain(onboardingCopy.homeQuestion)
    expect(html).toContain('aria-label="VK Видео"')
    expect(html).toContain('aria-label="MAX"')
    expect(html).not.toContain('onboarding-steps')
    expect(html).not.toContain(onboardingCopy.start)
    expect(html).not.toContain('speech-toggle')
    expect(html).not.toContain('speech-error')
    expect(html).not.toContain('Включить озвучку')
  })

  it('keeps the VK Video onboarding start action without a back control', () => {
    const html = renderToStaticMarkup(<OnboardingScreen product="vk-video" onStart={() => {}} onBack={() => {}} />)
    expect(html).toContain('aria-label="Начать"')
    expect(html).toContain('vk-onboarding-logo')
    expect(html).not.toContain('aria-label="Назад"')
  })
})
