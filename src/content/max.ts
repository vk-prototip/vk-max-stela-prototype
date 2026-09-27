import type { MaxAudience, MaxGoal, MaxMission } from '../types/prototype'

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
  'digital-id': 'Все возможности с Цифровым ID',
  communication: 'Общение без границ',
  blogger: 'Стать блогером',
  'business-promotion': 'Продвижение бизнеса',
}

export const maxMissionDescriptions: Record<MaxMission, string> = {
  'digital-id': 'Узнай, как Цифровой ID упрощает жизнь',
  communication: 'Попробуй все возможности общения в МАХ',
  blogger: 'Развивай канал и смотри, как растет аудитория',
  'business-promotion': 'Попробуй инструменты МАХ для бизнеса',
}

export const maxTransitionPrompt = 'Пройди к правой стене, чтобы начать'
