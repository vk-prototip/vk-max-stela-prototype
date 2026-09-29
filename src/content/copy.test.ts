import { describe, expect, it } from 'vitest'
import { onboardingCopy, onboardingIntroductions } from './onboarding'
import { vkCopy, vkQuestions } from './vkVideo'
import { maxTransitionPrompt } from './max'

describe('approved September 29 copy', () => {
  it('separates the spoken greeting from the on-screen steps', () => {
    expect(onboardingCopy.spokenGreeting).toBe('Добро пожаловать в экосистему VK. Здесь лента подстраивается под тебя.')
    expect(onboardingIntroductions.max.steps).toHaveLength(3)
    expect(onboardingIntroductions['vk-video'].steps.map(step => step.replace(/\s+/g, ' '))).toEqual([
      'Расскажи, какой контент ты любишь',
      'Получи персональную подборку от технологии Discovery',
    ])
    expect(vkCopy.digitizeDescription.replace(/\s+/g, ' ')).toBe('На его основе превратим тебя в главного героя твоей персональной подборки')
  })

  it('has four answers in every VK question including the restored sports answer', () => {
    expect(vkQuestions.map(({ options }) => options.length)).toEqual([4, 4, 4, 4, 4])
    expect(vkQuestions[0].options[3].label).toBe('Спорт в любом формате')
  })

  it('keeps the start invitation and sends each branch to its panel', () => {
    expect(onboardingCopy.voice).toBe('Со мной можно говорить своими словами. Скажи, например, «поехали»')
    expect(maxTransitionPrompt).toBe('Пройди к правой панели,\nчтобы начать')
    expect(vkCopy.finalDirection).toBe('Пройди к левой панели,\nчтобы посмотреть подборку')
  })
})
