import { maxMissionLabels } from '../../content/max'
import {
  aiCoverAnswerWeights,
  aiCoverGenres,
  aiCoverGenresByTheme,
  normalizeAiCoverGenre,
} from '../../content/aiCovers'
import { vkQuestions, vkThemes } from '../../content/vkVideo'
import type {
  AiCoverAllocation,
  AiCoverGenre,
  AiCoverScore,
  MaxAudience,
  MaxGoal,
  MaxMission,
  ThemeScore,
  VkContentPlan,
  VkDiscoveryInstruction,
  VkPhotoMode,
  VkTheme,
} from '../../types/prototype'

export function getMaxMission(
  audience: MaxAudience,
  goal: MaxGoal,
): MaxMission {
  if (audience === 'business') return 'business-promotion'
  if (goal === 'access') return 'digital-id'
  if (goal === 'connection') return 'communication'
  return 'blogger'
}

export function getMaxMissionLabel(
  audience: MaxAudience,
  goal: MaxGoal,
) {
  return maxMissionLabels[getMaxMission(audience, goal)]
}

function shuffled<T>(items: T[], random: () => number) {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [
      result[swapIndex],
      result[index],
    ]
  }

  return result
}

export function calculateThemeScores(answerIds: string[]): ThemeScore[] {
  if (answerIds.length !== 2) throw new Error('VK theme scoring requires two answers')
  const scores = new Map<VkTheme, number>(
    vkThemes.map((theme) => [theme, 0]),
  )

  answerIds.forEach((answerId, questionIndex) => {
    const question = questionIndex === 0 ? vkQuestions[0] : vkQuestions[1]
    const option = question.options.find(
      ({ id }) => id === answerId,
    )
    if (!option) throw new Error(`Unknown VK answer: ${answerId}`)

    scores.set(option.plusTwo, (scores.get(option.plusTwo) ?? 0) + 2)
    scores.set(option.plusOne, (scores.get(option.plusOne) ?? 0) + 1)
  })

  return vkThemes.map((theme) => ({ theme, score: scores.get(theme) ?? 0 }))
}

export function rankThemes(
  answerIds: string[],
  random: () => number = Math.random,
): VkTheme[] {
  const scores = calculateThemeScores(answerIds)
  const scoreLevels = [...new Set(scores.map(({ score }) => score))].sort(
    (left, right) => right - left,
  )
  const selected: VkTheme[] = []

  for (const score of scoreLevels) {
    const tiedThemes = scores
      .filter((item) => item.score === score)
      .map((item) => item.theme)
    selected.push(...(tiedThemes.length === 1 ? tiedThemes : shuffled(tiedThemes, random)))
  }

  return selected
}

export function selectTopThemes(
  answerIds: string[],
  random: () => number = Math.random,
): VkTheme[] {
  return rankThemes(answerIds, random).slice(0, 3)
}

export function getAiCoverDelta(
  questionId: string,
  answerId: string,
): Partial<Record<AiCoverGenre, number>> {
  const weights = aiCoverAnswerWeights[questionId]?.[answerId]
  if (!weights) throw new Error(`Unknown AI cover answer: ${questionId}/${answerId}`)
  const delta: Partial<Record<AiCoverGenre, number>> = {}
  for (const genre of weights.plusTwo) {
    const canonical = normalizeAiCoverGenre(genre)
    delta[canonical] = (delta[canonical] ?? 0) + 2
  }
  for (const genre of weights.plusOne) {
    const canonical = normalizeAiCoverGenre(genre)
    delta[canonical] = (delta[canonical] ?? 0) + 1
  }
  return delta
}

export function calculateAiCoverScores(answerIds: string[]): AiCoverScore[] {
  if (answerIds.length !== 2) throw new Error('AI cover scoring requires two answers')
  const scores: Record<AiCoverGenre, number> = Object.fromEntries(
    aiCoverGenres.map(genre => [genre, 0]),
  ) as Record<AiCoverGenre, number>
  for (const [index, questionId] of ['evening', 'ideal-content'].entries()) {
    for (const [genre, delta] of Object.entries(getAiCoverDelta(questionId, answerIds[index]))) {
      scores[genre as AiCoverGenre] += delta
    }
  }
  return aiCoverGenres.map(genre => ({ genre, score: scores[genre] }))
}

// Equal scores keep the source table order; this ordering is not a tie selection policy.
export function rankAiCoverGenres(answerIds: string[]): AiCoverGenre[] {
  return calculateAiCoverScores(answerIds)
    .sort((left, right) => right.score - left.score)
    .map(({ genre }) => genre)
}

export function createAiCoverAllocation(
  answerIds: string[],
  themes: VkTheme[],
  random: () => number = Math.random,
): AiCoverAllocation {
  if (new Set(themes).size !== themes.length) throw new Error('AI cover themes must be unique')
  const scores = calculateAiCoverScores(answerIds)
  const scoreByGenre = new Map(scores.map(({ genre, score }) => [genre, score]))
  return {
    scores,
    rankedGenres: [...scores].sort((left, right) => right.score - left.score).map(({ genre }) => genre),
    themeSelections: themes.map(theme => {
      const candidates = [...aiCoverGenresByTheme[theme]]
      const highestScore = Math.max(...candidates.map(genre => scoreByGenre.get(genre)!))
      const highestScoringGenres = candidates.filter(genre => scoreByGenre.get(genre) === highestScore)
      const selectedGenre = highestScoringGenres.length === 1
        ? highestScoringGenres[0]
        : highestScoringGenres[Math.floor(random() * highestScoringGenres.length)]
      return { theme, candidates, highestScoringGenres, selectedGenre }
    }),
    selectionPolicy: 'highest-score-random-tie',
  }
}

export function createVkContentPlan(
  coverAllocation: AiCoverAllocation,
  photoMode: VkPhotoMode,
): VkContentPlan {
  if (coverAllocation.themeSelections.length === 0 || coverAllocation.themeSelections.length > 4) {
    throw new Error('VK content plan requires one to four selected themes')
  }
  const perTheme: VkContentPlan['perTheme'] = coverAllocation.themeSelections.map(selection => ({
    theme: selection.theme,
    videoCount: 2,
    generationCount: photoMode === 'included' ? 1 : 0,
    coverGenre: photoMode === 'included' ? selection.selectedGenre : null,
  }))
  const videoCount = perTheme.length * 2
  const generationCount = photoMode === 'included' ? perTheme.length : 0
  return { kind: 'producer-base-plan', perTheme, videoCount, generationCount, total: videoCount + generationCount, limit: 12 }
}

export function createDiscoveryInstruction(
  discoveryAnswerId: string,
  rankedThemes: VkTheme[],
  coverAllocation: AiCoverAllocation,
  photoMode: VkPhotoMode,
  themeScores: ThemeScore[],
): VkDiscoveryInstruction {
  const relationToContentPlan = 'unconfirmed' as const
  const positiveScores = new Set(themeScores.filter(({ score }) => score > 0).map(({ theme }) => theme))
  const positiveRankedThemes = rankedThemes.filter(theme => positiveScores.has(theme))
  switch (discoveryAnswerId) {
    case 'familiar':
      return {
        kind: 'familiar', themeCandidates: positiveRankedThemes.slice(0, 2),
        videoCountPerTheme: 1, status: 'external-catalog-required', relationToContentPlan,
      }
    case 'new':
      return {
        kind: 'new', themeCandidates: positiveRankedThemes.slice(2, 4),
        videoCount: 1, themeChoice: 'rank-3-or-4',
        status: 'external-catalog-required', relationToContentPlan,
      }
    case 'popular':
      return {
        kind: 'popular', videoCount: 1, windowDays: 7,
        selection: 'most-popular-from-agreed-catalog',
        status: 'external-catalog-required', relationToContentPlan,
      }
    case 'hero':
      return {
        kind: 'hero',
        coverSelections: photoMode === 'included'
          ? coverAllocation.themeSelections.map(({ theme, selectedGenre }) => ({ theme, genre: selectedGenre }))
          : [],
        generationCountPerTheme: photoMode === 'included' ? 1 : 0,
        status: photoMode === 'included' ? 'external-generator-required' : 'photo-not-included',
        relationToContentPlan,
      }
    default:
      throw new Error(`Unknown Discovery answer: ${discoveryAnswerId}`)
  }
}
