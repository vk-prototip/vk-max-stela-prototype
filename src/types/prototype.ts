export type Product = 'max' | 'vk-video'

export type MaxAudience = 'personal' | 'business'

export type MaxGoal = 'access' | 'connection' | 'visibility'

export type MaxMission =
  | 'digital-id'
  | 'communication'
  | 'blogger'
  | 'business-promotion'

export type VkTheme =
  | 'Сериалы и кино'
  | 'Юмор и стендап'
  | 'Шоу и реалити'
  | 'Спорт'
  | 'Смотрим всей семьёй'
  | 'Наука и технологии'
  | 'Подкасты и интервью'
  | 'Музыка и концерты'
  | 'Путешествия и еда'
  | 'Лайфстайл и саморазвитие'

export interface WeightedOption {
  id: string
  label: string
  plusTwo: VkTheme
  plusOne: VkTheme
}

export interface VkQuestion {
  id: string
  prompt: string
  options: WeightedOption[]
}

export interface ThemeScore {
  theme: VkTheme
  score: number
}
