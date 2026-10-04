export type Product = 'max' | 'vk-video'

export type MaxAudience = 'personal' | 'business'

export type MaxGoal = 'access' | 'connection' | 'visibility'

export type MaxMission =
  | 'digital-id'
  | 'communication'
  | 'blogger'
  | 'business-promotion'

export type VkTheme =
  | 'Кино'
  | 'Медиа и шоу'
  | 'Наука'
  | 'Культура и образование'
  | 'Игры и авто'
  | 'Спорт'
  | 'Новости и бизнес'
  | 'Музыка'

export type AiCoverGenre =
  | 'SCI FI'
  | 'HISTORY'
  | 'COMEDY'
  | 'MUSICAL'
  | 'BOEVIK'
  | 'DRAMA'
  | 'HORROR'
  | 'DETECTIVE'
  | 'FANTASY'
  | 'ADVENTURE'

export interface AiCoverScore {
  genre: AiCoverGenre
  score: number
}

export interface AiCoverThemeSelection {
  theme: VkTheme
  candidates: AiCoverGenre[]
  highestScoringGenres: AiCoverGenre[]
  selectedGenre: AiCoverGenre
}

export interface AiCoverAllocation {
  scores: AiCoverScore[]
  rankedGenres: AiCoverGenre[]
  themeSelections: AiCoverThemeSelection[]
  selectionPolicy: 'highest-score-random-tie'
}

export type VkPhotoMode = 'included' | 'skipped' | 'not-requested'

export interface VkContentPlan {
  kind: 'producer-base-plan'
  perTheme: Array<{
    theme: VkTheme
    videoCount: 2
    generationCount: 0 | 1
    coverGenre: AiCoverGenre | null
  }>
  videoCount: number
  generationCount: number
  total: number
  limit: 12
}

interface DiscoveryPlanBase {
  relationToContentPlan: 'unconfirmed'
}

export type VkDiscoveryInstruction = DiscoveryPlanBase & (
  | {
    kind: 'familiar'
    themeCandidates: VkTheme[]
    videoCountPerTheme: 1
    status: 'external-catalog-required'
  }
  | {
    kind: 'new'
    themeCandidates: VkTheme[]
    videoCount: 1
    themeChoice: 'rank-3-or-4'
    status: 'external-catalog-required'
  }
  | {
    kind: 'popular'
    videoCount: 1
    windowDays: 7
    selection: 'most-popular-from-agreed-catalog'
    status: 'external-catalog-required'
  }
  | {
    kind: 'hero'
    coverSelections: Array<{ theme: VkTheme; genre: AiCoverGenre }>
    generationCountPerTheme: 0 | 1
    status: 'external-generator-required' | 'photo-not-included'
  }
)

export interface AnswerOption<T extends string = string> {
  id: T
  label: string
  metadata: string[]
}

export interface WeightedOption extends AnswerOption {
  plusTwo: VkTheme
  plusOne: VkTheme
}

export interface VkQuestion<T extends AnswerOption = AnswerOption> {
  id: string
  prompt: string
  options: T[]
}

export interface ThemeScore {
  theme: VkTheme
  score: number
}
