import { describe, expect, it } from 'vitest'
import { aiCoverGenres, aiCoverGenresByTheme, normalizeAiCoverGenre } from './aiCovers'

describe('AI cover source mapping', () => {
  it('contains the ten canonical genre IDs, in the source mapping order', () => {
    expect(aiCoverGenres).toEqual([
      'SCI FI', 'HISTORY', 'COMEDY', 'MUSICAL', 'BOEVIK',
      'DRAMA', 'HORROR', 'DETECTIVE', 'FANTASY', 'ADVENTURE',
    ])
    expect(new Set(aiCoverGenres).size).toBe(10)
  })

  it('preserves every documented theme mapping, including both dual-genre themes', () => {
    expect(aiCoverGenresByTheme).toEqual({
      Наука: ['SCI FI'],
      'Культура и образование': ['HISTORY'],
      'Медиа и шоу': ['COMEDY'],
      Музыка: ['MUSICAL'],
      'Игры и авто': ['BOEVIK'],
      Спорт: ['DRAMA', 'HORROR'],
      'Новости и бизнес': ['DETECTIVE'],
      Кино: ['FANTASY', 'ADVENTURE'],
    })
  })

  it('normalizes only the documented MUSICLE typo and rejects invented genres', () => {
    expect(normalizeAiCoverGenre('MUSICLE')).toBe('MUSICAL')
    expect(normalizeAiCoverGenre('MUSICAL')).toBe('MUSICAL')
    expect(normalizeAiCoverGenre('SCI FI')).toBe('SCI FI')
    expect(() => normalizeAiCoverGenre('SCI-FI')).toThrow('Unknown AI cover genre')
    expect(() => normalizeAiCoverGenre('UNKNOWN')).toThrow('Unknown AI cover genre')
  })
})
