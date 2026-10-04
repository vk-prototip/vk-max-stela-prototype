import type { AnswerOption, VkQuestion, VkTheme, WeightedOption } from '../types/prototype'

// client-verbatim: Google Doc "VK Видео_Стелла", scenario and recommendation rules.
// Metadata: Google Sheets, VK Video!B2:F14 (gid=797280843), checked 2026-10-03.
// Score weights: Google Sheets, VK Video_Themes (gid=829829883); photo skip is overridden by direct user instruction.
export const vkCopy = {
  digitizeQuestion: 'Сделаем фото?',
  digitizeDescription: 'На его основе превратим\nтебя в главного героя твоей\nперсональной подборки',
  digitizeAccept: 'Да, давайте',
  digitizeSkip: 'Пропустить',
  // The consent notice intentionally retains the approved formal address.
  digitizeNoticePrefix: 'Отвечая «Да, давайте», вы принимаете ',
  digitizeNoticeAction: 'условия использования персональных данных',
  digitizeTermsTitle: 'Условия использования персональных данных',
  // Demonstration filler requested by the user; not legal terms.
  digitizeTermsPlaceholder: 'здесь будут условия использования персональных данных.',
  // client-verbatim: activation screen in Google Doc "VK Видео_Стелла".
  discoveryActivationTitle: 'Технологии Discovery активированы',
  discoveryActivationDescription: 'Технологии персонализации Discovery уже начали собирать подборку.',
  finalDirection: 'Пройди к левой панели\nVK Видео – там твоя подборка оживёт вокруг тебя',
  finalQrCaption: 'Узнай больше о Discovery',
}

export const vkThemes: VkTheme[] = [
  'Кино',
  'Медиа и шоу',
  'Наука',
  'Культура и образование',
  'Игры и авто',
  'Спорт',
  'Новости и бизнес',
  'Музыка',
]

export const vkQuestions: [VkQuestion<WeightedOption>, VkQuestion<WeightedOption>, VkQuestion] = [
  {
    id: 'evening',
    prompt: 'У тебя внезапно освободился вечер. Что включаем?',
    options: [
      { id: 'series', label: 'новый сериал, который все обсуждают', metadata: ['обсуждения', 'сериал', 'премьера', 'популярное'], plusTwo: 'Кино', plusOne: 'Музыка' },
      { id: 'standup', label: 'стендап или что-нибудь смешное', metadata: ['шоу', 'стендап', 'юмор', 'комедия'], plusTwo: 'Медиа и шоу', plusOne: 'Игры и авто' },
      { id: 'interview', label: 'интервью с интересным человеком', metadata: ['подкаст', 'новости', 'интервью', 'люди'], plusTwo: 'Культура и образование', plusOne: 'Новости и бизнес' },
      { id: 'science', label: 'документалку или научпоп', metadata: ['наука', 'знания', 'документальное кино', 'научпоп'], plusTwo: 'Наука', plusOne: 'Спорт' },
    ],
  },
  {
    id: 'ideal-content',
    prompt: 'Каким должен быть идеальный контент на вечер?',
    options: [
      { id: 'drive', label: 'чтобы был драйв и азарт', metadata: ['драйв', 'азарт', 'игры', 'авто'], plusTwo: 'Игры и авто', plusOne: 'Кино' },
      { id: 'heroes', label: 'чтобы переживать за героев', metadata: ['переживания', 'чувства', 'герои', 'эмоции'], plusTwo: 'Спорт', plusOne: 'Культура и образование' },
      { id: 'learn', label: 'чтобы узнать что-то новое', metadata: ['культура', 'обучение', 'культура', 'факты'], plusTwo: 'Новости и бизнес', plusOne: 'Наука' },
      { id: 'rest', label: 'чтобы отключить голову и отдохнуть', metadata: ['музыка', 'медиа', 'отдых', 'лёгкий контент'], plusTwo: 'Музыка', plusOne: 'Медиа и шоу' },
    ],
  },
  {
    id: 'discovery',
    prompt: 'Рекомендации Discovery решили немного тебя удивить. Что показывать?',
    options: [
      { id: 'familiar', label: 'что-то похожее на то, что я уже люблю', metadata: ['рекомендации', 'для меня', 'персонализация', 'увлечения'] },
      { id: 'new', label: 'новое, но по теме моих интересов', metadata: ['новинки', 'лайки', 'интересы', 'темы'] },
      { id: 'hero', label: 'хочу стать героем VK Видео', metadata: ['образ', 'VK Видео', 'главный герой', 'роль'] },
      { id: 'popular', label: 'то, чем прямо сейчас увлечены все', metadata: ['тренды', 'яркое', 'все', 'топ-5'] },
    ],
  },
]

export const vkPhotoOptions: Array<AnswerOption<'accept' | 'skip'>> = [
  { id: 'accept', label: vkCopy.digitizeAccept, metadata: ['ракурс', 'освещение', 'композиция', 'обработка'] },
  { id: 'skip', label: vkCopy.digitizeSkip, metadata: [] },
]

export const discoveryRules: Record<string, string> = {
  familiar: 'По одному видео из Топ 2 тематик для пользователя',
  new: 'Дополнительное видео из тематики 3 или 4',
  hero: 'Формируется пул обложек с учетом выбранных тематик, на которых размещен образ пользователя',
  popular: 'Самое популярное видео за последние 7 дней из каталога согласованных видео',
}
