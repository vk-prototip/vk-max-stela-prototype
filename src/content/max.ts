import type { AnswerOption, MaxAudience, MaxGoal, MaxMission } from '../types/prototype'

// client-verbatim: Figma MAX, frames 4435:248505 and 4435:80421, 2026-10-03.
export const maxPrompts = {
  audience: 'Какие возможности\nты хочешь освоить?',
  goal: 'Какой цели хочешь\nдостичь?',
}

// Metadata: Google Sheets, MAX!B2:J9 (gid=1446064538), checked 2026-10-03.
// Visible labels: Figma MAX, 4435:248505 / 4435:80421, 2026-10-03.
export const maxAudienceOptions: Array<AnswerOption<MaxAudience>> = [
  {
    id: 'business', label: 'Для\nбизнеса',
    metadata: ['бизнес', 'MAX для бизнеса', 'бизнес-аккаунт', 'заказы', 'коммуникация', 'клиенты', 'автоматизация', 'возможности'],
  },
  {
    id: 'personal', label: 'Для личного\nпользования',
    metadata: ['аудитория', 'повседневность', 'связь', 'коммуникация', 'стабильность', 'близкие', 'эмоции', 'безопасность'],
  },
]

const maxGoalMetadata: Record<MaxAudience, Record<MaxGoal, string[]>> = {
  personal: {
    access: ['Цифровой ID', 'идентификация', 'удобство', 'документы', 'доступ', 'льготы', 'данные', 'надежность'],
    connection: ['чаты', 'видеозвонки', 'аудиозвонки', 'голосовые', 'стикеры', 'видеосообщения', 'истории', 'публикации'],
    visibility: ['узнаваемость', 'аудитория', 'канал', 'комментарии', 'возможности', 'рост', 'инструменты', 'статистика'],
  },
  business: {
    access: ['идентификация', 'удобство', 'верификация', 'документы', 'доступ', 'профиль', 'данные', 'надежность'],
    connection: ['чат-бот', 'канал', 'быстрые ответы', 'сбор заказов', 'аудитория', 'поддержка', 'возможности', 'обратная связь'],
    visibility: ['узнаваемость', 'аудитория', 'канал', 'мини-приложение', 'новости', 'рост', 'продвижение', 'акции'],
  },
}

export const maxGoalOptions: Array<AnswerOption<MaxGoal>> = [
  {
    id: 'access',
    label: 'Упростить\nидентификацию',
    metadata: maxGoalMetadata.personal.access,
  },
  {
    id: 'connection', label: 'Общаться\nна максимум',
    metadata: maxGoalMetadata.personal.connection,
  },
  {
    id: 'visibility', label: 'Повысить\nузнаваемость',
    metadata: maxGoalMetadata.personal.visibility,
  },
]

export function getMaxGoalOption(audience: MaxAudience, goal: MaxGoal): AnswerOption<MaxGoal> {
  const option = maxGoalOptions.find(({ id }) => id === goal)
  if (!option) throw new Error(`Unknown MAX goal: ${goal}`)

  return { ...option, metadata: [...maxGoalMetadata[audience][goal]] }
}

export const maxMissionLabels: Record<MaxMission, string> = {
  'digital-id': 'Все возможности\nс Цифровым ID',
  communication: 'Общение\nна максимум',
  blogger: 'Стать блогером',
  'business-promotion': 'Продвижение бизнеса',
}

export const maxMissionDescriptions: Record<MaxMission, string> = {
  'digital-id': 'Узнай, какие возможности\nоткрывает Цифровой ID\nв повседневной жизни',
  communication: 'Попробуй все возможности общения в MAX',
  blogger: 'Развивай канал в MAX и\u00a0смотри, как растёт аудитория',
  'business-promotion': 'Попробуй инструменты MAX для бизнеса',
}

// user-approved: copy preserved; native one-line layout restored, 2026-10-04.
export const maxTransitionPrompt = 'Пройди к правой панели, чтобы начать'
// user-approved: whole final screen returns to the first screen, 2026-10-03.
export const maxReturnToStart = 'Вернуться к выбору VK Видео или MAX'
// user-approved: restore the visible final button, 2026-10-03.
export const maxThanks = 'Спасибо'
export const maxBack = 'Назад'
export const maxMissionHeading = 'Миссия'
