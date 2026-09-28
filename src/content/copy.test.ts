import { describe, expect, it } from 'vitest'
import { onboardingCopy, onboardingDescriptions } from './onboarding'
import { vkCopy, vkQuestions } from './vkVideo'
import { maxTransitionPrompt } from './max'

describe('approved September 27 copy', () => {
  it('keeps the two alternatives explicitly selected by the user', () => {
    expect(onboardingDescriptions['vk-video']).toBe('Исследуй мир вместе с VK Видео! Расскажи, какой контент ты любишь, и Discovery сформирует персональную подборку')
    expect(vkCopy.digitizeDescription).toBe('Создадим твой цифровой образ – и ты станешь героем своей персональной подборки')
  })

  it('has four answers in every VK question including the restored sports answer', () => {
    expect(vkQuestions.map(({ options }) => options.length)).toEqual([4, 4, 4, 4, 4])
    expect(vkQuestions[0].options[3].label).toBe('Спорт в любом формате')
  })

  it('keeps the start invitation and sends each branch to its panel', () => {
    expect(onboardingCopy.voice).toBe('Со мной можно говорить своими словами. Скажи, например, «поехали»')
    expect(maxTransitionPrompt).toBe('Пройди к правой панели, чтобы начать')
    expect(vkCopy.finalDirection).toBe('Пройди к левой панели, чтобы посмотреть подборку')
  })
})
