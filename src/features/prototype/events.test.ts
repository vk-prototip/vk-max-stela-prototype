import { describe, expect, it } from 'vitest'
import { maxAudienceOptions, maxGoalOptions } from '../../content/max'
import { discoveryRules, vkPhotoOptions, vkQuestions } from '../../content/vkVideo'
import type { AnswerOption, VkPhotoMode } from '../../types/prototype'
import { calculateThemeScores, createAiCoverAllocation, getAiCoverDelta, rankThemes } from './logic'
import { createEventPublisher, type StelaEvent } from './events'

describe('version 2 answer event contract', () => {
  it('publishes all 19 answer definitions exactly once, without any gender answer', () => {
    const events: StelaEvent[] = []
    const publisher = createEventPublisher('session-1', { send: event => events.push(event) })
    publisher.start('max')
    for (const option of maxAudienceOptions) publisher.answer('max', 'audience', option)
    for (const option of maxGoalOptions) publisher.answer('max', 'goal', option)
    for (const question of vkQuestions) {
      for (const option of question.options) publisher.answer('vk-video', question.id, option)
    }
    for (const option of vkPhotoOptions) publisher.answer('vk-video', 'photo', option)

    const answers = events.filter(event => event.type === 'answer')
    expect(answers).toHaveLength(19)
    expect(answers.every(event => event.version === 2)).toBe(true)
    expect(answers.filter(event => event.answerId !== 'skip').every(event => event.metadata.length > 0)).toBe(true)
    expect(answers.map(event => event.sequence)).toEqual(Array.from({ length: 19 }, (_, index) => index + 2))
    expect(answers.find(event => event.answerId === 'skip')?.metadata).toEqual([])
    expect(answers.some(event => event.questionId === 'gender')).toBe(false)
    for (const option of [...maxAudienceOptions, ...maxGoalOptions, ...vkQuestions.flatMap(question => question.options), ...vkPhotoOptions]) {
      expect(answers.find(event => event.answerId === option.id)?.metadata).toEqual(option.metadata)
    }
  })

  const deltaCases = [
    ['evening', 'series', { FANTASY: 2, HORROR: 1 }],
    ['evening', 'standup', { COMEDY: 2, BOEVIK: 1, MUSICAL: 1 }],
    ['evening', 'interview', { HISTORY: 2, DRAMA: 1 }],
    ['evening', 'science', { 'SCI FI': 2, ADVENTURE: 1, DETECTIVE: 1 }],
    ['ideal-content', 'drive', { BOEVIK: 2, ADVENTURE: 2 }],
    ['ideal-content', 'heroes', { DRAMA: 2, HORROR: 2 }],
    ['ideal-content', 'learn', { DETECTIVE: 2, HISTORY: 1, 'SCI FI': 1 }],
    ['ideal-content', 'rest', { MUSICAL: 2, FANTASY: 1, COMEDY: 1 }],
  ] as const

  it.each(deltaCases)('publishes the canonical cover delta for %s/%s', (questionId, answerId, expected) => {
    const events: StelaEvent[] = []
    const publisher = createEventPublisher('session-delta', { send: event => events.push(event) })
    const option = vkQuestions.find(question => question.id === questionId)!.options.find(answer => answer.id === answerId)!
    publisher.answer('vk-video', questionId, option, undefined, getAiCoverDelta(questionId, answerId))
    expect(events[0]).toMatchObject({ version: 2, type: 'answer', questionId, answerId, coverDelta: expected })
    expect(events[0]).not.toHaveProperty('themeDelta')
  })

  it.each(['included', 'skipped', 'not-requested'] as VkPhotoMode[])('includes a separate allocation and correct content counts for %s', photoMode => {
    const events: StelaEvent[] = []
    const publisher = createEventPublisher('session-plan', { send: event => events.push(event) })
    const answers = ['series', 'drive']
    const ranked = rankThemes(answers, () => 0)
    const allocation = createAiCoverAllocation(answers, ['Кино', 'Игры и авто', 'Музыка'], () => 0)
    publisher.recommendation(calculateThemeScores(answers), ranked, 'hero', discoveryRules.hero, photoMode, allocation)
    const recommendation = events[0]
    expect(recommendation.type).toBe('vk-recommendation')
    if (recommendation.type !== 'vk-recommendation') return
    expect(recommendation.selectedThemes).toEqual(['Кино', 'Игры и авто', 'Музыка'])
    expect(recommendation.coverAllocation.themeSelections.map(({ selectedGenre }) => selectedGenre)).toEqual(['FANTASY', 'BOEVIK', 'MUSICAL'])
    expect(recommendation.coverAllocation.scores.filter(({ score }) => score > 0)).toEqual([
      { genre: 'BOEVIK', score: 2 }, { genre: 'HORROR', score: 1 },
      { genre: 'FANTASY', score: 2 }, { genre: 'ADVENTURE', score: 2 },
    ])
    expect(recommendation.coverAllocation.rankedGenres).toHaveLength(10)
    expect(recommendation.contentPlan.videoCount).toBe(6)
    expect(recommendation.contentPlan.generationCount).toBe(photoMode === 'included' ? 3 : 0)
    expect(recommendation.contentPlan.total).toBe(photoMode === 'included' ? 9 : 6)
    expect(recommendation.contentPlan.perTheme.map(({ generationCount }) => generationCount)).toEqual(Array.from({ length: 3 }, () => photoMode === 'included' ? 1 : 0))
    expect(recommendation).not.toHaveProperty('gender')
    expect(recommendation.discoveryInstruction).toMatchObject({
      kind: 'hero', relationToContentPlan: 'unconfirmed',
      status: photoMode === 'included' ? 'external-generator-required' : 'photo-not-included',
    })
  })

  it('uses the explicit allocation themes rather than secretly truncating to three', () => {
    const events: StelaEvent[] = []
    const publisher = createEventPublisher('session-four', { send: event => events.push(event) })
    const answers = ['series', 'heroes']
    const allocation = createAiCoverAllocation(answers, ['Кино', 'Спорт', 'Музыка', 'Культура и образование'], () => 0)
    publisher.recommendation(calculateThemeScores(answers), rankThemes(answers, () => 0), 'hero', discoveryRules.hero, 'included', allocation)
    expect(events[0]).toMatchObject({
      selectedThemes: ['Кино', 'Спорт', 'Музыка', 'Культура и образование'],
      contentPlan: { videoCount: 8, generationCount: 4, total: 12, limit: 12 },
    })
  })

  it('copies caller-owned values so later edits cannot corrupt sent snapshots', () => {
    const events: StelaEvent[] = []
    const publisher = createEventPublisher('session-snapshot', { send: event => events.push(event) })
    const option: AnswerOption = { id: 'sample', label: 'Sample', metadata: ['tag'] }
    const themeDelta = { Кино: 2 }
    const coverDelta = { FANTASY: 2 }
    publisher.answer('vk-video', 'evening', option, themeDelta, coverDelta)
    const answers = ['series', 'drive']
    const scores = calculateThemeScores(answers)
    const ranked = rankThemes(answers, () => 0)
    const allocation = createAiCoverAllocation(answers, ['Кино'], () => 0)
    publisher.recommendation(scores, ranked, 'hero', discoveryRules.hero, 'included', allocation)
    option.metadata[0] = 'changed'
    themeDelta.Кино = 100
    coverDelta.FANTASY = 100
    scores[0].score = 100
    ranked.splice(0)
    allocation.scores[0].score = 100
    allocation.rankedGenres.splice(0)
    allocation.themeSelections[0].candidates.splice(0)
    allocation.themeSelections[0].highestScoringGenres.splice(0)
    allocation.themeSelections[0].selectedGenre = 'ADVENTURE'
    expect(events[0]).toMatchObject({ metadata: ['tag'], themeDelta: { Кино: 2 }, coverDelta: { FANTASY: 2 } })
    const recommendation = events[1]
    if (recommendation.type !== 'vk-recommendation') throw new Error('Missing recommendation')
    expect(recommendation.scores[0].score).toBe(3)
    expect(recommendation.rankedThemes).toHaveLength(8)
    expect(recommendation.coverAllocation.scores[0].score).toBe(0)
    expect(recommendation.coverAllocation.rankedGenres).toHaveLength(10)
    expect(recommendation.coverAllocation.themeSelections[0]).toEqual({
      theme: 'Кино', candidates: ['FANTASY', 'ADVENTURE'], highestScoringGenres: ['FANTASY', 'ADVENTURE'], selectedGenre: 'FANTASY',
    })
    expect(recommendation.contentPlan.perTheme[0].coverGenre).toBe('FANTASY')
    expect(recommendation.discoveryInstruction).toMatchObject({ coverSelections: [{ theme: 'Кино', genre: 'FANTASY' }] })
  })

  it.each(['familiar', 'new', 'popular', 'hero'])('publishes the separate %s instruction without increasing the producer plan', discoveryAnswerId => {
    const events: StelaEvent[] = []
    const publisher = createEventPublisher('session-discovery', { send: event => events.push(event) })
    const answers = ['series', 'heroes']
    const ranked = rankThemes(answers, () => 0)
    const allocation = createAiCoverAllocation(answers, ranked.slice(0, 3), () => 0)
    publisher.recommendation(calculateThemeScores(answers), ranked, discoveryAnswerId, discoveryRules[discoveryAnswerId], 'not-requested', allocation)
    expect(events[0]).toMatchObject({
      discoveryInstruction: { kind: discoveryAnswerId, relationToContentPlan: 'unconfirmed' },
      contentPlan: { kind: 'producer-base-plan', videoCount: 6, generationCount: 0, total: 6 },
    })
    expect(events[0]).not.toHaveProperty('videoIds')
  })

  it('does not publish a randomly ranked zero-point fourth theme as a Discovery candidate', () => {
    const events: StelaEvent[] = []
    const publisher = createEventPublisher('session-three-positive', { send: event => events.push(event) })
    const answers = ['series', 'drive']
    const scores = calculateThemeScores(answers)
    const ranked = rankThemes(answers, () => 0)
    const allocation = createAiCoverAllocation(answers, ranked.slice(0, 3), () => 0)
    publisher.recommendation(scores, ranked, 'new', discoveryRules.new, 'not-requested', allocation)
    expect(events[0]).toMatchObject({
      selectedThemes: ['Кино', 'Игры и авто', 'Музыка'],
      discoveryInstruction: { kind: 'new', themeCandidates: ['Музыка'], videoCount: 1 },
    })
    const recommendation = events[0]
    if (recommendation.type !== 'vk-recommendation') throw new Error('Missing recommendation')
    expect(recommendation.rankedThemes).toHaveLength(8)
    expect(scores.find(({ theme }) => theme === recommendation.rankedThemes[3])!.score).toBe(0)
  })

  it('sends both score systems separately and keeps monotonic event identities', () => {
    const events: StelaEvent[] = []
    const publisher = createEventPublisher('session-sequence', { send: event => events.push(event) })
    publisher.start('vk-video')
    publisher.answer('vk-video', 'evening', vkQuestions[0].options[0], { Кино: 2, Музыка: 1 }, getAiCoverDelta('evening', 'series'))
    publisher.clear('vk-video', 'evening')
    publisher.answer('vk-video', 'evening', vkQuestions[0].options[1], { 'Медиа и шоу': 2, 'Игры и авто': 1 }, getAiCoverDelta('evening', 'standup'))
    expect(events.map(event => event.type)).toEqual(['session-start', 'answer', 'answer-cleared', 'answer'])
    expect(events.map(event => event.sequence)).toEqual([1, 2, 3, 4])
    expect(events.every(event => event.sessionId === 'session-sequence' && event.version === 2)).toBe(true)
    expect(events[1]).toMatchObject({ themeDelta: { Кино: 2, Музыка: 1 }, coverDelta: { FANTASY: 2, HORROR: 1 } })
    expect(events[3]).toMatchObject({ themeDelta: { 'Медиа и шоу': 2, 'Игры и авто': 1 }, coverDelta: { COMEDY: 2, BOEVIK: 1, MUSICAL: 1 } })
  })
})
