import { describe, expect, it } from 'vitest'
import {
  calculateAiCoverScores,
  calculateThemeScores,
  createAiCoverAllocation,
  createDiscoveryInstruction,
  createVkContentPlan,
  getAiCoverDelta,
  getMaxMission,
  rankAiCoverGenres,
  rankThemes,
  selectTopThemes,
} from './logic'
import { vkQuestions, vkThemes } from '../../content/vkVideo'

describe('MAX mission routing', () => {
  it('sends every business goal to business promotion', () => {
    expect(getMaxMission('business', 'access')).toBe('business-promotion')
    expect(getMaxMission('business', 'connection')).toBe('business-promotion')
    expect(getMaxMission('business', 'visibility')).toBe('business-promotion')
  })

  it('keeps the personal goals distinct', () => {
    expect(getMaxMission('personal', 'access')).toBe('digital-id')
    expect(getMaxMission('personal', 'connection')).toBe('communication')
    expect(getMaxMission('personal', 'visibility')).toBe('blogger')
  })
})

describe('independent AI cover scoring', () => {
  const combinations = [
    ['series', 'drive', { FANTASY: 2, BOEVIK: 2, ADVENTURE: 2, HORROR: 1 }],
    ['series', 'heroes', { HORROR: 3, FANTASY: 2, DRAMA: 2 }],
    ['series', 'learn', { FANTASY: 2, DETECTIVE: 2, HORROR: 1, HISTORY: 1, 'SCI FI': 1 }],
    ['series', 'rest', { FANTASY: 3, MUSICAL: 2, HORROR: 1, COMEDY: 1 }],
    ['standup', 'drive', { BOEVIK: 3, COMEDY: 2, ADVENTURE: 2, MUSICAL: 1 }],
    ['standup', 'heroes', { COMEDY: 2, DRAMA: 2, HORROR: 2, BOEVIK: 1, MUSICAL: 1 }],
    ['standup', 'learn', { COMEDY: 2, DETECTIVE: 2, BOEVIK: 1, MUSICAL: 1, HISTORY: 1, 'SCI FI': 1 }],
    ['standup', 'rest', { COMEDY: 3, MUSICAL: 3, BOEVIK: 1, FANTASY: 1 }],
    ['interview', 'drive', { HISTORY: 2, BOEVIK: 2, ADVENTURE: 2, DRAMA: 1 }],
    ['interview', 'heroes', { DRAMA: 3, HISTORY: 2, HORROR: 2 }],
    ['interview', 'learn', { HISTORY: 3, DETECTIVE: 2, DRAMA: 1, 'SCI FI': 1 }],
    ['interview', 'rest', { HISTORY: 2, MUSICAL: 2, DRAMA: 1, FANTASY: 1, COMEDY: 1 }],
    ['science', 'drive', { ADVENTURE: 3, 'SCI FI': 2, BOEVIK: 2, DETECTIVE: 1 }],
    ['science', 'heroes', { 'SCI FI': 2, DRAMA: 2, HORROR: 2, ADVENTURE: 1, DETECTIVE: 1 }],
    ['science', 'learn', { 'SCI FI': 3, DETECTIVE: 3, ADVENTURE: 1, HISTORY: 1 }],
    ['science', 'rest', { 'SCI FI': 2, MUSICAL: 2, ADVENTURE: 1, DETECTIVE: 1, FANTASY: 1, COMEDY: 1 }],
  ] as const

  it.each(combinations)('matches the source matrix %s + %s', (first, second, expected) => {
    const scores = calculateAiCoverScores([first, second])
    expect(scores).toHaveLength(10)
    expect(new Set(scores.map(({ genre }) => genre)).size).toBe(10)
    expect(Object.fromEntries(scores.filter(({ score }) => score > 0).map(({ genre, score }) => [genre, score]))).toEqual(expected)
    expect(scores.reduce((total, { score }) => total + score, 0)).toBe(Object.values(expected).reduce<number>((total, score) => total + score, 0))
    const ranked = rankAiCoverGenres([first, second])
    expect(new Set(ranked).size).toBe(10)
    const scoreMap = new Map(scores.map(({ genre, score }) => [genre, score]))
    const rankedScores = ranked.map(genre => scoreMap.get(genre)!)
    expect(rankedScores).toEqual([...rankedScores].sort((left, right) => right - left))
    expect(ranked).not.toContain('MUSICLE')
  })

  it('adds each +2/+1 to every listed genre, independently of video-theme points', () => {
    expect(getAiCoverDelta('evening', 'standup')).toEqual({ COMEDY: 2, BOEVIK: 1, MUSICAL: 1 })
    expect(getAiCoverDelta('ideal-content', 'drive')).toEqual({ BOEVIK: 2, ADVENTURE: 2 })
    expect(getAiCoverDelta('ideal-content', 'rest')).toEqual({ MUSICAL: 2, FANTASY: 1, COMEDY: 1 })
    expect(calculateThemeScores(['standup', 'drive']).reduce((sum, item) => sum + item.score, 0)).toBe(6)
    expect(calculateAiCoverScores(['standup', 'drive']).reduce((sum, item) => sum + item.score, 0)).toBe(8)
  })

  it('keeps ranking in table order but selects exactly one tied genre with the injected RNG', () => {
    expect(rankAiCoverGenres(['standup', 'heroes']).slice(0, 3)).toEqual(['COMEDY', 'DRAMA', 'HORROR'])
    const allocation = createAiCoverAllocation(['standup', 'heroes'], ['Спорт', 'Кино', 'Музыка'], () => 0)
    expect(allocation.selectionPolicy).toBe('highest-score-random-tie')
    expect(allocation.themeSelections).toEqual([
      { theme: 'Спорт', candidates: ['DRAMA', 'HORROR'], highestScoringGenres: ['DRAMA', 'HORROR'], selectedGenre: 'DRAMA' },
      { theme: 'Кино', candidates: ['FANTASY', 'ADVENTURE'], highestScoringGenres: ['FANTASY', 'ADVENTURE'], selectedGenre: 'FANTASY' },
      { theme: 'Музыка', candidates: ['MUSICAL'], highestScoringGenres: ['MUSICAL'], selectedGenre: 'MUSICAL' },
    ])
    expect(createAiCoverAllocation(['standup', 'heroes'], ['Спорт', 'Кино'], () => 0.999).themeSelections.map(({ selectedGenre }) => selectedGenre)).toEqual(['HORROR', 'ADVENTURE'])
  })

  it('selects the highest score within the theme mapping without consulting the RNG', () => {
    const forbiddenRandom = () => { throw new Error('RNG called without a tie') }
    expect(createAiCoverAllocation(['series', 'heroes'], ['Спорт', 'Кино', 'Музыка'], forbiddenRandom).themeSelections).toEqual([
      { theme: 'Спорт', candidates: ['DRAMA', 'HORROR'], highestScoringGenres: ['HORROR'], selectedGenre: 'HORROR' },
      { theme: 'Кино', candidates: ['FANTASY', 'ADVENTURE'], highestScoringGenres: ['FANTASY'], selectedGenre: 'FANTASY' },
      { theme: 'Музыка', candidates: ['MUSICAL'], highestScoringGenres: ['MUSICAL'], selectedGenre: 'MUSICAL' },
    ])
  })

  it('does not assign a final pool size and handles only the provided theme selection', () => {
    expect(createAiCoverAllocation(['series', 'drive'], []).themeSelections).toEqual([])
    expect(createAiCoverAllocation(['series', 'drive'], ['Музыка', 'Наука', 'Медиа и шоу', 'Новости и бизнес']).themeSelections).toHaveLength(4)
    expect(() => createAiCoverAllocation(['series', 'drive'], ['Кино', 'Кино'])).toThrow('must be unique')
  })

  it('plans two catalog videos and one generation per theme only when the photo is included', () => {
    const allocation = createAiCoverAllocation(['series', 'heroes'], ['Кино', 'Музыка', 'Спорт', 'Наука'], () => 0)
    const plan = createVkContentPlan(allocation, 'included')
    expect(plan).toEqual({
      kind: 'producer-base-plan',
      perTheme: [
        { theme: 'Кино', videoCount: 2, generationCount: 1, coverGenre: 'FANTASY' },
        { theme: 'Музыка', videoCount: 2, generationCount: 1, coverGenre: 'MUSICAL' },
        { theme: 'Спорт', videoCount: 2, generationCount: 1, coverGenre: 'HORROR' },
        { theme: 'Наука', videoCount: 2, generationCount: 1, coverGenre: 'SCI FI' },
      ],
      videoCount: 8, generationCount: 4, total: 12, limit: 12,
    })
    for (const photoMode of ['skipped', 'not-requested'] as const) {
      const withoutPhoto = createVkContentPlan(allocation, photoMode)
      expect(withoutPhoto.videoCount).toBe(8)
      expect(withoutPhoto.generationCount).toBe(0)
      expect(withoutPhoto.total).toBe(8)
      expect(withoutPhoto.perTheme.every(({ generationCount, coverGenre }) => generationCount === 0 && coverGenre === null)).toBe(true)
    }
    expect(() => createVkContentPlan(createAiCoverAllocation(['series', 'heroes'], []), 'included')).toThrow('one to four')
    expect(() => createVkContentPlan(createAiCoverAllocation(['series', 'heroes'], ['Кино', 'Музыка', 'Спорт', 'Наука', 'Медиа и шоу']), 'included')).toThrow('one to four')
  })

  it('rejects missing, extra, reversed and unknown answers', () => {
    expect(() => calculateAiCoverScores(['series'])).toThrow('requires two answers')
    expect(() => calculateAiCoverScores(['series', 'drive', 'hero'])).toThrow('requires two answers')
    expect(() => calculateAiCoverScores(['drive', 'series'])).toThrow('Unknown AI cover answer')
    expect(() => calculateAiCoverScores(['series', 'unknown'])).toThrow('Unknown AI cover answer')
    expect(() => getAiCoverDelta('discovery', 'hero')).toThrow('Unknown AI cover answer')
  })
})

describe('structured Discovery instructions', () => {
  const answers = ['series', 'drive']
  const scores = calculateThemeScores(answers)
  const ranked = ['Кино', 'Игры и авто', 'Музыка', 'Спорт', 'Наука', 'Культура и образование', 'Медиа и шоу', 'Новости и бизнес'] as const

  it('keeps the familiar rule as one video from each of the first two ranked themes', () => {
    const allocation = createAiCoverAllocation(answers, ['Кино', 'Игры и авто', 'Музыка'], () => 0)
    expect(createDiscoveryInstruction('familiar', [...ranked], allocation, 'not-requested', scores)).toEqual({
      kind: 'familiar', themeCandidates: ['Кино', 'Игры и авто'],
      videoCountPerTheme: 1, status: 'external-catalog-required', relationToContentPlan: 'unconfirmed',
    })
  })

  it('uses only the third positive theme when the source matrix has three themes', () => {
    const allocation = createAiCoverAllocation(answers, ['Кино', 'Игры и авто', 'Музыка'], () => 0)
    expect(createDiscoveryInstruction('new', [...ranked], allocation, 'not-requested', scores)).toEqual({
      kind: 'new', themeCandidates: ['Музыка'], videoCount: 1,
      themeChoice: 'rank-3-or-4', status: 'external-catalog-required', relationToContentPlan: 'unconfirmed',
    })
    expect(createVkContentPlan(allocation, 'not-requested').total).toBe(6)
  })

  it('keeps both positive one-point themes as third/fourth candidates when the matrix has four', () => {
    const fourAnswers = ['series', 'heroes']
    const fourRanked = rankThemes(fourAnswers, () => 0)
    const fourScores = calculateThemeScores(fourAnswers)
    const allocation = createAiCoverAllocation(fourAnswers, fourRanked.slice(0, 3), () => 0)
    const instruction = createDiscoveryInstruction('new', fourRanked, allocation, 'not-requested', fourScores)
    if (instruction.kind !== 'new') throw new Error('Incorrect Discovery kind')
    expect(new Set(instruction.themeCandidates)).toEqual(new Set(['Музыка', 'Культура и образование']))
    expect(instruction.videoCount).toBe(1)
    expect(instruction.themeCandidates).not.toContain('Наука')
  })

  it('never inserts a zero-point Discovery candidate in any of the sixteen source combinations', () => {
    for (const first of ['series', 'standup', 'interview', 'science']) {
      for (const second of ['drive', 'heroes', 'learn', 'rest']) {
        const matrixAnswers = [first, second]
        const matrixScores = calculateThemeScores(matrixAnswers)
        const matrixRanked = rankThemes(matrixAnswers, () => 0)
        const allocation = createAiCoverAllocation(matrixAnswers, matrixRanked.slice(0, 3), () => 0)
        const instruction = createDiscoveryInstruction('new', matrixRanked, allocation, 'not-requested', matrixScores)
        if (instruction.kind !== 'new') throw new Error('Incorrect Discovery kind')
        const positiveCount = matrixScores.filter(({ score }) => score > 0).length
        expect(instruction.themeCandidates).toHaveLength(positiveCount - 2)
        expect(instruction.themeCandidates.every(theme => matrixScores.find(score => score.theme === theme)!.score > 0)).toBe(true)
      }
    }
  })

  it('describes the most popular video over seven days from the agreed external catalog', () => {
    const allocation = createAiCoverAllocation(answers, ['Кино', 'Игры и авто', 'Музыка'], () => 0)
    expect(createDiscoveryInstruction('popular', [...ranked], allocation, 'not-requested', scores)).toEqual({
      kind: 'popular', videoCount: 1, windowDays: 7,
      selection: 'most-popular-from-agreed-catalog', status: 'external-catalog-required', relationToContentPlan: 'unconfirmed',
    })
  })

  it('passes fixed hero genres to a future generator only when the photo is included', () => {
    const allocation = createAiCoverAllocation(answers, ['Кино', 'Игры и авто', 'Музыка'], () => 0)
    expect(createDiscoveryInstruction('hero', [...ranked], allocation, 'included', scores)).toEqual({
      kind: 'hero',
      coverSelections: [
        { theme: 'Кино', genre: 'FANTASY' }, { theme: 'Игры и авто', genre: 'BOEVIK' }, { theme: 'Музыка', genre: 'MUSICAL' },
      ],
      generationCountPerTheme: 1, status: 'external-generator-required', relationToContentPlan: 'unconfirmed',
    })
    expect(createDiscoveryInstruction('hero', [...ranked], allocation, 'skipped', scores)).toEqual({
      kind: 'hero', coverSelections: [], generationCountPerTheme: 0,
      status: 'photo-not-included', relationToContentPlan: 'unconfirmed',
    })
    expect(() => createDiscoveryInstruction('unknown', [...ranked], allocation, 'included', scores)).toThrow('Unknown Discovery answer')
  })
})

describe('VK theme scoring', () => {
  it('matches the documented 1.1 + 2.1 result', () => {
    const scores = calculateThemeScores(['series', 'drive'])
    expect(scores.filter(({ score }) => score > 0)).toEqual([
      { theme: 'Кино', score: 3 },
      { theme: 'Игры и авто', score: 2 },
      { theme: 'Музыка', score: 1 },
    ])
    expect(selectTopThemes(['series', 'drive'], () => 0)).toEqual(['Кино', 'Игры и авто', 'Музыка'])
  })

  it('matches the documented 1.3 + 2.3 result', () => {
    expect(calculateThemeScores(['interview', 'learn']).filter(({ score }) => score > 0)).toEqual([
      { theme: 'Наука', score: 1 },
      { theme: 'Культура и образование', score: 2 },
      { theme: 'Новости и бизнес', score: 3 },
    ])
  })

  it('chooses the third theme randomly when two one-point themes tie', () => {
    const answers = ['series', 'heroes']
    const first = selectTopThemes(answers, () => 0)
    const second = selectTopThemes(answers, () => 0.999)
    expect(new Set(first.slice(0, 2))).toEqual(new Set(['Кино', 'Спорт']))
    expect(new Set(second.slice(0, 2))).toEqual(new Set(['Кино', 'Спорт']))
    expect(new Set([first[2], second[2]])).toEqual(new Set(['Музыка', 'Культура и образование']))
    expect(rankThemes(answers, () => 0)).toHaveLength(8)
  })

  it('covers all 16 source combinations with exactly six points each', () => {
    const expected = [
      [
        { Кино: 3, 'Игры и авто': 2, Музыка: 1 },
        { Кино: 2, Спорт: 2, Музыка: 1, 'Культура и образование': 1 },
        { Кино: 2, 'Новости и бизнес': 2, Музыка: 1, Наука: 1 },
        { Музыка: 3, Кино: 2, 'Медиа и шоу': 1 },
      ],
      [
        { 'Игры и авто': 3, 'Медиа и шоу': 2, Кино: 1 },
        { 'Медиа и шоу': 2, Спорт: 2, 'Игры и авто': 1, 'Культура и образование': 1 },
        { 'Медиа и шоу': 2, 'Новости и бизнес': 2, 'Игры и авто': 1, Наука: 1 },
        { 'Медиа и шоу': 3, Музыка: 2, 'Игры и авто': 1 },
      ],
      [
        { 'Культура и образование': 2, 'Игры и авто': 2, 'Новости и бизнес': 1, Кино: 1 },
        { 'Культура и образование': 3, Спорт: 2, 'Новости и бизнес': 1 },
        { 'Новости и бизнес': 3, 'Культура и образование': 2, Наука: 1 },
        { 'Культура и образование': 2, Музыка: 2, 'Новости и бизнес': 1, 'Медиа и шоу': 1 },
      ],
      [
        { Наука: 2, 'Игры и авто': 2, Спорт: 1, Кино: 1 },
        { Спорт: 3, Наука: 2, 'Культура и образование': 1 },
        { Наука: 3, 'Новости и бизнес': 2, Спорт: 1 },
        { Наука: 2, Музыка: 2, Спорт: 1, 'Медиа и шоу': 1 },
      ],
    ]
    for (const [firstIndex, first] of vkQuestions[0].options.entries()) {
      for (const [secondIndex, second] of vkQuestions[1].options.entries()) {
        const answers = [first.id, second.id]
        const scores = calculateThemeScores(answers)
        expect(scores).toHaveLength(vkThemes.length)
        expect(scores.reduce((sum, item) => sum + item.score, 0)).toBe(6)
        expect(Object.fromEntries(scores.filter(item => item.score > 0).map(item => [item.theme, item.score]))).toEqual(expected[firstIndex][secondIndex])
        expect(new Set(selectTopThemes(answers))).toHaveProperty('size', 3)
      }
    }
  })

  it('rejects incomplete or unknown answer sequences', () => {
    expect(() => calculateThemeScores(['series'])).toThrow()
    expect(() => calculateThemeScores(['series', 'unknown'])).toThrow()
  })
})
