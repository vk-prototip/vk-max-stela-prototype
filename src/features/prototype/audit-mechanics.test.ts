import { describe, expect, it } from 'vitest'
import {
  calculateAiCoverScores, calculateThemeScores, createAiCoverAllocation,
  createDiscoveryInstruction, createVkContentPlan, rankThemes,
} from './logic'
import type { AiCoverGenre, VkTheme } from '../../types/prototype'

// Independent audit, 2026-10-04. Fixtures transcribed from fresh primary exports:
// Google Doc 1ycQkS7hNhyWWG0AOPb6BhfpWThWD7FTD0b46i_ONRAE, both 16-outcome tables;
// Google Sheet 1JE-MQeTXiBlKInWSYCGn6kkeukDq1Dd3wq9B_Epyvc8, VK Видео_Темы!B2:E5.
// These expected values do not import or derive from application content arrays.
const themes: VkTheme[] = ['Кино', 'Медиа и шоу', 'Наука', 'Культура и образование', 'Игры и авто', 'Спорт', 'Новости и бизнес', 'Музыка']
const genres: AiCoverGenre[] = ['SCI FI', 'HISTORY', 'COMEDY', 'MUSICAL', 'BOEVIK', 'DRAMA', 'HORROR', 'DETECTIVE', 'FANTASY', 'ADVENTURE']
const mapping: Record<VkTheme, AiCoverGenre[]> = {
  'Кино': ['FANTASY', 'ADVENTURE'], 'Медиа и шоу': ['COMEDY'], 'Наука': ['SCI FI'],
  'Культура и образование': ['HISTORY'], 'Игры и авто': ['BOEVIK'], 'Спорт': ['DRAMA', 'HORROR'],
  'Новости и бизнес': ['DETECTIVE'], 'Музыка': ['MUSICAL'],
}
// Each digit refers to the independently declared theme/genre order above.
const matrix = [
  ['series', 'drive',     '30002001', '0000201022'],
  ['series', 'heroes',    '20010201', '0000023020'],
  ['series', 'learn',     '20100021', '1100001220'],
  ['series', 'rest',      '21000003', '0012001030'],
  ['standup', 'drive',    '12003000', '0021300002'],
  ['standup', 'heroes',   '02011200', '0021122000'],
  ['standup', 'learn',    '02101020', '1121100200'],
  ['standup', 'rest',     '03001002', '0033100010'],
  ['interview', 'drive',  '10022010', '0200210002'],
  ['interview', 'heroes', '00030210', '0200032000'],
  ['interview', 'learn',  '00120030', '1300010200'],
  ['interview', 'rest',   '01020012', '0212010010'],
  ['science', 'drive',    '10202100', '2000200103'],
  ['science', 'heroes',   '00210300', '2000022101'],
  ['science', 'learn',    '00300120', '3100000301'],
  ['science', 'rest',     '01200102', '2012000111'],
] as const

describe('fresh-source independent mechanics audit', () => {
  it.each(matrix)('%s + %s: complete scores, all tie endpoints and all Discovery rules', (first, second, themeDigits, genreDigits) => {
    const answers = [first, second]
    const expectedThemes = Object.fromEntries(themes.map((theme, i) => [theme, Number(themeDigits[i])])) as Record<VkTheme, number>
    const expectedGenres = Object.fromEntries(genres.map((genre, i) => [genre, Number(genreDigits[i])])) as Record<AiCoverGenre, number>
    const actualScores = calculateThemeScores(answers)
    expect(Object.fromEntries(actualScores.map(({ theme, score }) => [theme, score]))).toEqual(expectedThemes)
    expect(Object.fromEntries(calculateAiCoverScores(answers).map(({ genre, score }) => [genre, score]))).toEqual(expectedGenres)
    const positive = themes.filter(theme => expectedThemes[theme] > 0)
    expect(positive.length === 3 || positive.length === 4).toBe(true)
    const seenThird = new Set<VkTheme>()

    for (const value of [0, 0.25, 0.5, 0.75, 0.999999]) {
      const ranked = rankThemes(answers, () => value)
      expect(new Set(ranked)).toEqual(new Set(themes))
      expect(ranked.map(theme => expectedThemes[theme])).toEqual(Object.values(expectedThemes).sort((a, b) => b - a))
      const selected = ranked.slice(0, 3)
      expect(selected).toHaveLength(3)
      expect(selected.every(theme => positive.includes(theme))).toBe(true)
      expect(selected.filter(theme => expectedThemes[theme] >= 2)).toHaveLength(2)
      seenThird.add(selected[2])

      // Check every theme, including zero-point single genres and dual-genre ties.
      const allAllocation = createAiCoverAllocation(answers, themes, () => value)
      for (const actual of allAllocation.themeSelections) {
        const candidates = mapping[actual.theme]
        const best = Math.max(...candidates.map(genre => expectedGenres[genre]))
        const winners = candidates.filter(genre => expectedGenres[genre] === best)
        expect(actual.candidates).toEqual(candidates)
        expect(actual.highestScoringGenres).toEqual(winners)
        expect(actual.selectedGenre).toBe(winners[Math.floor(value * winners.length)])
      }
      const allocation = createAiCoverAllocation(answers, selected, () => value)
      const snapshot = JSON.stringify(allocation)
      const familiar = createDiscoveryInstruction('familiar', ranked, allocation, 'not-requested', actualScores)
      expect(familiar).toEqual({ kind: 'familiar', themeCandidates: ranked.slice(0, 2), videoCountPerTheme: 1, status: 'external-catalog-required', relationToContentPlan: 'unconfirmed' })
      const discoveryNew = createDiscoveryInstruction('new', ranked, allocation, 'not-requested', actualScores)
      expect(discoveryNew).toEqual({ kind: 'new', themeCandidates: ranked.filter(theme => positive.includes(theme)).slice(2, 4), videoCount: 1, themeChoice: 'rank-3-or-4', status: 'external-catalog-required', relationToContentPlan: 'unconfirmed' })
      expect(createDiscoveryInstruction('popular', ranked, allocation, 'not-requested', actualScores)).toEqual({ kind: 'popular', videoCount: 1, windowDays: 7, selection: 'most-popular-from-agreed-catalog', status: 'external-catalog-required', relationToContentPlan: 'unconfirmed' })
      for (const photo of ['included', 'skipped', 'not-requested'] as const) {
        const hero = createDiscoveryInstruction('hero', ranked, allocation, photo, actualScores)
        expect(hero).toEqual({ kind: 'hero', coverSelections: photo === 'included' ? allocation.themeSelections.map(({ theme, selectedGenre }) => ({ theme, genre: selectedGenre })) : [], generationCountPerTheme: photo === 'included' ? 1 : 0, status: photo === 'included' ? 'external-generator-required' : 'photo-not-included', relationToContentPlan: 'unconfirmed' })
        // Producer base counts are separately recorded in D-058/AI_COVERS.md;
        // the original producer message was not available for this audit.
        const plan = createVkContentPlan(allocation, photo)
        expect(plan.videoCount).toBe(6)
        expect(plan.generationCount).toBe(photo === 'included' ? 3 : 0)
        expect(plan.total).toBe(photo === 'included' ? 9 : 6)
        expect(plan.total).toBeLessThanOrEqual(12)
        expect(plan.perTheme.map(item => item.coverGenre)).toEqual(photo === 'included' ? allocation.themeSelections.map(item => item.selectedGenre) : [null, null, null])
      }
      expect(JSON.stringify(allocation)).toBe(snapshot)
    }
    expect(seenThird).toEqual(new Set(positive.filter(theme => expectedThemes[theme] === 1)))
  })
})
