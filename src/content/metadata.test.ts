import { describe, expect, it } from 'vitest'
import type { MaxAudience, MaxGoal } from '../types/prototype'
import { getMaxGoalOption, maxAudienceOptions, maxGoalOptions } from './max'
import * as vkContent from './vkVideo'

// Independent fixtures copied from the source spreadsheet on 2026-10-03.
const maxSourceRows: Record<MaxAudience, {
  audience: string[]
  goals: Record<MaxGoal, string[]>
}> = {
  business: {
    audience: ['бизнес', 'MAX для бизнеса', 'бизнес-аккаунт', 'заказы', 'коммуникация', 'клиенты', 'автоматизация', 'возможности'],
    goals: {
      access: ['идентификация', 'удобство', 'верификация', 'документы', 'доступ', 'профиль', 'данные', 'надежность'],
      connection: ['чат-бот', 'канал', 'быстрые ответы', 'сбор заказов', 'аудитория', 'поддержка', 'возможности', 'обратная связь'],
      visibility: ['узнаваемость', 'аудитория', 'канал', 'мини-приложение', 'новости', 'рост', 'продвижение', 'акции'],
    },
  },
  personal: {
    audience: ['аудитория', 'повседневность', 'связь', 'коммуникация', 'стабильность', 'близкие', 'эмоции', 'безопасность'],
    goals: {
      access: ['Цифровой ID', 'идентификация', 'удобство', 'документы', 'доступ', 'льготы', 'данные', 'надежность'],
      connection: ['чаты', 'видеозвонки', 'аудиозвонки', 'голосовые', 'стикеры', 'видеосообщения', 'истории', 'публикации'],
      visibility: ['узнаваемость', 'аудитория', 'канал', 'комментарии', 'возможности', 'рост', 'инструменты', 'статистика'],
    },
  },
}

const vkSourceRows: Record<string, string[]> = {
  series: ['обсуждения', 'сериал', 'премьера', 'популярное'],
  standup: ['шоу', 'стендап', 'юмор', 'комедия'],
  interview: ['подкаст', 'новости', 'интервью', 'люди'],
  science: ['наука', 'знания', 'документальное кино', 'научпоп'],
  drive: ['драйв', 'азарт', 'игры', 'авто'],
  heroes: ['переживания', 'чувства', 'герои', 'эмоции'],
  learn: ['культура', 'обучение', 'культура', 'факты'],
  rest: ['музыка', 'медиа', 'отдых', 'лёгкий контент'],
  familiar: ['рекомендации', 'для меня', 'персонализация', 'увлечения'],
  new: ['новинки', 'лайки', 'интересы', 'темы'],
  hero: ['образ', 'VK Видео', 'главный герой', 'роль'],
  popular: ['тренды', 'яркое', 'все', 'топ-5'],
  accept: ['ракурс', 'освещение', 'композиция', 'обработка'],
  skip: [],
}

describe('source spreadsheet metadata', () => {
  for (const audience of ['business', 'personal'] as const) {
    it(`preserves all eight MAX ${audience} audience tags`, () => {
      expect(maxAudienceOptions.find(option => option.id === audience)?.metadata).toEqual(maxSourceRows[audience].audience)
    })

    for (const goal of ['access', 'connection', 'visibility'] as const) {
      it(`selects the exact tags for MAX ${audience}/${goal}`, () => {
        const option = getMaxGoalOption(audience, goal)
        const visibleOption = maxGoalOptions.find(candidate => candidate.id === goal)
        expect(option.metadata).toEqual(maxSourceRows[audience].goals[goal])
        expect(option.id).toBe(goal)
        expect(option.label).toBe(visibleOption?.label)
        expect(option.metadata).toHaveLength(8)
      })
    }
  }

  it('returns independent MAX tag arrays without leaking data between audiences', () => {
    const first = getMaxGoalOption('business', 'connection')
    first.metadata.splice(0, first.metadata.length)
    expect(getMaxGoalOption('business', 'connection').metadata).toEqual(maxSourceRows.business.goals.connection)
    expect(getMaxGoalOption('personal', 'connection').metadata).toEqual(maxSourceRows.personal.goals.connection)
  })

  it('matches all VK answer and photo rows without deduplication or extra tags', () => {
    const options = [...vkContent.vkQuestions.flatMap(question => question.options), ...vkContent.vkPhotoOptions]
    expect(options.map(option => option.id)).toEqual(Object.keys(vkSourceRows))
    for (const option of options) expect(option.metadata).toEqual(vkSourceRows[option.id])
    expect(options.find(option => option.id === 'learn')?.metadata.filter(tag => tag === 'культура')).toHaveLength(2)
    expect(options.flatMap(option => option.metadata)).not.toContain('универсально')
  })

  it('does not expose a gender screen or gender options', () => {
    expect(vkContent).not.toHaveProperty('vkGenderOptions')
    expect(vkContent.vkCopy).not.toHaveProperty('genderPrompt')
  })
})
