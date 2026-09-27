import { describe, expect, it } from 'vitest'
import { calculateThemeScores, getMaxMission, selectTopThemes } from './logic'
import { vkQuestions } from '../../content/vkVideo'

describe('getMaxMission', () => {
  it('routes shared goals to the same missions', () => {
    expect(getMaxMission('personal', 'access')).toBe('digital-id')
    expect(getMaxMission('business', 'access')).toBe('digital-id')
    expect(getMaxMission('personal', 'connection')).toBe('communication')
    expect(getMaxMission('business', 'connection')).toBe('communication')
  })

  it('uses the audience to resolve the visibility goal', () => {
    expect(getMaxMission('personal', 'visibility')).toBe('blogger')
    expect(getMaxMission('business', 'visibility')).toBe(
      'business-promotion',
    )
  })
})

describe('selectTopThemes', () => {
  it('returns exactly four unique themes', () => {
    const result = selectTopThemes([
      'family-sofa',
      'drive',
      'experience',
      'kitchen',
      'future',
    ])

    expect(result).toHaveLength(4)
    expect(new Set(result).size).toBe(4)
  })

  it('randomly resolves a five-theme tie below the leading theme', () => {
    const tiedAnswers = [
      'trip',
      'laugh',
      'bright-people',
      'road',
      'future',
    ]
    const first = selectTopThemes(tiedAnswers, () => 0)
    const second = selectTopThemes(tiedAnswers, () => 0.999)

    expect(first).toHaveLength(4)
    expect(second).toHaveLength(4)
    expect(new Set(first).size).toBe(4)
    expect(new Set(second).size).toBe(4)
    expect(first[0]).toBe('Подкасты и интервью')
    expect(second[0]).toBe('Подкасты и интервью')
    expect(calculateThemeScores(tiedAnswers).filter(({ score }) => score === 2)).toHaveLength(5)
    expect(first).not.toEqual(second)
  })

  it('scores every current answer without losing any weights', () => {
    for (let questionIndex = 0; questionIndex < vkQuestions.length; questionIndex += 1) {
      for (const option of vkQuestions[questionIndex].options) {
        const answers = vkQuestions.map((question, index) =>
          index === questionIndex ? option.id : question.options[0].id,
        )
        expect(calculateThemeScores(answers).reduce((sum, item) => sum + item.score, 0)).toBe(15)
        expect(new Set(selectTopThemes(answers)).size).toBe(4)
      }
    }
  })
})
