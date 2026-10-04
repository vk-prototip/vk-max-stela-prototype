import type { Product } from '../types/prototype'

// user-approved: Google Docs, «ТЕКСТ основной», refreshed 2026-09-29.
// Spoken greeting is distinct from the on-screen introduction.
export const onboardingCopy = {
  homeQuestion: 'ЧТО ТЕБЕ\nСЕЙЧАС БЛИЖЕ?',
  spokenGreeting: 'Добро пожаловать в экосистему VK. Здесь лента подстраивается под тебя.',
  voice: 'Со мной можно говорить своими словами.\nСкажи, например, «ПОЕХАЛИ»',
  // MAX line breaks and start label: Figma MAX, checked 2026-10-03.
  maxVoice: 'Со мной можно говорить своими словами.\nСкажи, например, «ПОЕХАЛИ»',
  maxStart: 'Начать',
  touch: 'или просто нажми',
  start: 'НАЧАТЬ',
}

export const onboardingIntroductions: Record<Product, {
  title: string
  steps: string[]
}> = {
  max: {
    // Historical title retained as copy only; hidden per the onboarding comment, 2026-10-03.
    title: 'Исследуй свои\nвозможности с MAX!',
    steps: [
      'Ответь на пару\nвопросов',
      'Получи персональную\nмиссию',
      'Узнай больше\nо возможностях MAX\nдля тебя',
    ],
  },
  'vk-video': {
    title: 'Исследуй мир\nвместе с VK Видео',
    steps: [
      'Расскажи, какой\nконтент ты любишь',
      'Получи персональную\nподборку от технологий\nDiscovery',
    ],
  },
}
