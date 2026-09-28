import type { MaxAudience, MaxGoal, MaxMission } from '../types/prototype'

// user-approved: Google Docs, «ТЕКСТ основной», 2026-09-27.
export const maxPrompts = {
  audience: 'Какие возможности ты хочешь освоить?',
  goal: 'Какой цели хочешь достичь?',
}

export const maxAudienceOptions: Array<{
  id: MaxAudience
  label: string
}> = [
  { id: 'business', label: 'Для бизнеса' },
  { id: 'personal', label: 'Для личного пользования' },
]

export const maxGoalOptions: Array<{
  id: MaxGoal
  label: string
}> = [
  {
    id: 'access',
    label: 'Упростить идентификацию',
  },
  { id: 'connection', label: 'Быть на связи 24/7' },
  { id: 'visibility', label: 'Повысить узнаваемость' },
]

export const maxMissionLabels: Record<MaxMission, string> = {
  'digital-id': 'Все возможности\nс Цифровым ID',
  communication: 'Общение\nна максимум',
  blogger: 'Стать блогером',
  'business-promotion': 'Продвижение бизнеса',
}

export const maxMissionDescriptions: Record<MaxMission, string> = {
  'digital-id': 'Узнай, как Цифровой ID в MAX упрощает жизнь',
  communication: 'Попробуй все возможности общения в MAX',
  blogger: 'Развивай канал в MAX и\u00a0смотри, как растёт аудитория',
  'business-promotion': 'Попробуй инструменты MAX для бизнеса',
}

// user-approved: direct copy and line-break correction, 2026-09-28.
export const maxTransitionPrompt = 'Пройди к правой панели,\nчтобы начать'
export const maxChooseAnotherMission = 'Подобрать другую миссию'
