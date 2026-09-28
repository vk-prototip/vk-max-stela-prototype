import type { Product } from '../types/prototype'

// user-approved: Google Docs, «ТЕКСТ основной», 2026-09-27;
// VK Видео description selected explicitly by the user.
// Punctuation and MAX line break updated by direct user request, 2026-09-28.
export const onboardingCopy = {
  homeQuestion: 'Что тебе сейчас ближе?',
  welcome: 'Добро пожаловать\nв экосистему VK',
  headline: 'Здесь лента подстраивается под тебя',
  voice: 'Со мной можно говорить своими словами. Скажи, например, «поехали»',
  touch: 'или просто нажми',
  start: 'НАЧАТЬ',
}

export const onboardingDescriptions: Record<Product, string> = {
  max: 'Ответь на пару вопросов,\nполучи персональную миссию в MAX\nи узнай больше о своих возможностях',
  'vk-video': 'Исследуй мир вместе с VK Видео!\nРасскажи, какой контент ты любишь, и Discovery сформирует персональную\u00a0подборку',
}
