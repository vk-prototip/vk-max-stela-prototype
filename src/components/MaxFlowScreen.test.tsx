import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MaxAnswerReveal, MaxFlowQuestion, MaxFlowResult } from './MaxFlowScreen'
import { maxAudienceOptions, maxGoalOptions, maxMissionDescriptions, maxMissionLabels } from '../content/max'
import type { MaxMission } from '../types/prototype'

describe('MAX final design', () => {
  it('renders two audience cards and three goal cards with live labels', () => {
    const audience = renderToStaticMarkup(<MaxFlowQuestion kind="audience" onSelect={() => {}} onBack={() => {}} />)
    const goals = renderToStaticMarkup(<MaxFlowQuestion kind="goal" onSelect={() => {}} onBack={() => {}} />)
    expect(audience.match(/class="max-flow-card /g)).toHaveLength(2)
    expect(goals.match(/class="max-flow-card /g)).toHaveLength(3)
    for (const option of maxAudienceOptions) expect(audience).toContain(option.label)
    for (const option of maxGoalOptions) expect(goals).toContain(option.label)
    expect(audience).toContain('audience-badge')
    expect(goals).not.toContain('audience-badge')
  })

  it.each(Object.keys(maxMissionLabels) as MaxMission[])('keeps %s content, Thanks and full-screen reset', mission => {
    const html = renderToStaticMarkup(<MaxFlowResult mission={mission} onReset={() => {}} />)
    expect(html).toContain(maxMissionLabels[mission])
    expect(html.replace(/<[^>]+>/g, '')).toContain(maxMissionDescriptions[mission])
    expect(html).toContain('max-flow-button--thanks')
    expect(html).toContain('<span>Спасибо</span>')
    expect(html).toContain('thanks.webp')
    expect(html).toContain('class="max-flow-reset"')
    expect(html).toContain('aria-label="Вернуться к выбору VK Видео или MAX"')
    expect(html).toContain('tabindex="-1"')
    expect(html).not.toContain('Подобрать другую миссию')
    expect(html).toContain('Пройди к правой панели, чтобы начать')
  })

  it.each([
    ...maxAudienceOptions.map(option => ({ kind: 'audience' as const, option })),
    ...maxGoalOptions.map(option => ({ kind: 'goal' as const, option })),
  ])('reveals only the $option.id card and all its tags', ({ kind, option }) => {
    const html = renderToStaticMarkup(<MaxAnswerReveal kind={kind} answerId={option.id} metadata={option.metadata} />)
    expect(html.match(/class="max-flow-card /g)).toHaveLength(1)
    expect(html).toContain(`max-flow-card--${option.id}`)
    expect(html).toContain(option.label)
    expect(html).not.toContain('<button')
    expect(html).not.toContain('<h1')
    expect(html.match(/class="vk-metadata-tag /g)).toHaveLength(option.metadata.length)
    for (const tag of option.metadata) expect(html).toContain(`<span>${tag}</span>`)
    expect(html.includes('audience-badge')).toBe(option.id === 'personal')
  })
})
