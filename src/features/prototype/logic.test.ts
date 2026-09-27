import { describe, expect, it } from 'vitest'
import { getMaxMission, selectTopThemes } from './logic'

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

  it('randomly limits a seven-theme tie to four themes', () => {
    const tiedAnswers = [
      'training',
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
    expect(first).not.toEqual(second)
  })
})
