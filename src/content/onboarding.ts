import type { Product } from '../types/prototype'

// user-approved: Google Docs, «ТЕКСТ основной», refreshed 2026-09-29.
// Spoken greeting is distinct from the on-screen introduction.
export const onboardingCopy = {
  homeQuestion: 'Что тебе сейчас ближе?',
  spokenGreeting: 'Добро пожаловать в экосистему VK. Здесь лента подстраивается под тебя.',
  voice: 'Со мной можно говорить своими словами. Скажи, например, «поехали»',
  touch: 'или просто нажми',
  start: 'НАЧАТЬ',
}

export const onboardingIntroductions: Record<Product, {
  title: string
  steps: string[]
}> = {
  max: {
    title: 'Исследуй свои\nвозможности с MAX!',
    steps: [
      'Ответь на пару вопросов',
      'Получи персональную миссию',
      'Узнай больше о\u00a0пользе MAX\u00a0для\u00a0тебя',
    ],
  },
  'vk-video': {
    title: 'Исследуй мир\nвместе с VK Видео!',
    steps: [
      'Расскажи, какой контент ты любишь',
      'Получи персональную подборку от\u00a0технологии\u00a0Discovery',
    ],
  },
}
