import type { VkQuestion, VkTheme } from '../types/prototype'

// user-approved: Google Docs, «ТЕКСТ основной», 2026-09-27.
// Existing answer IDs and topic weights are preserved from the agreed CJM.
export const vkCopy = {
  digitizeQuestion: 'Хочешь, мы тебя оцифруем?',
  digitizeDescription: 'Создадим твой цифровой образ – и ты станешь героем своей персональной подборки',
  digitizeAccept: 'Да, давайте',
  digitizeSkip: 'Пропустить',
  finalTitle: 'Технология Discovery активирована',
  finalDirection: 'Пройди к левой панели, чтобы посмотреть подборку',
  // user-approved in the earlier direct request; unchanged by the new document.
  thanks: 'спасибо',
}

export const vkThemes: VkTheme[] = [
  'Сериалы и кино',
  'Юмор и стендап',
  'Шоу и реалити',
  'Спорт',
  'Смотрим всей семьёй',
  'Наука и технологии',
  'Подкасты и интервью',
  'Музыка и концерты',
  'Путешествия и еда',
  'Лайфстайл и саморазвитие',
]

export const vkQuestions: VkQuestion[] = [
  {
    id: 'evening',
    prompt: 'Идеальный вечер после работы – это…',
    options: [
      {
        id: 'family-sofa',
        label: 'Диван, плед и вся семья рядом',
        plusTwo: 'Сериалы и кино',
        plusOne: 'Смотрим всей семьёй',
      },
      {
        id: 'friends',
        label: 'Друзья, шум и веселье',
        plusTwo: 'Юмор и стендап',
        plusOne: 'Спорт',
      },
      {
        id: 'trip',
        label: 'Строить планы на отпуск',
        plusTwo: 'Путешествия и еда',
        plusOne: 'Подкасты и интервью',
      },
      {
        id: 'training',
        // user-approved: direct request, 2026-09-28; original CJM weights.
        label: 'Спорт в любом формате',
        plusTwo: 'Спорт',
        plusOne: 'Музыка и концерты',
      },
    ],
  },
  {
    id: 'good-video',
    prompt: 'Хорошее видео – это когда…',
    options: [
      {
        id: 'drive',
        label: 'Азарт и драйв',
        plusTwo: 'Спорт',
        plusOne: 'Шоу и реалити',
      },
      {
        id: 'laugh',
        label: 'Смеёшься до слёз',
        plusTwo: 'Юмор и стендап',
        plusOne: 'Смотрим всей семьёй',
      },
      {
        id: 'inspiration',
        label: 'Вдохновение и мурашки',
        plusTwo: 'Музыка и концерты',
        plusOne: 'Лайфстайл и саморазвитие',
      },
      {
        id: 'discovery',
        label: 'Узнаёшь что-то новое',
        plusTwo: 'Наука и технологии',
        plusOne: 'Подкасты и интервью',
      },
    ],
  },
  {
    id: 'watch',
    prompt: 'На экране интереснее всего следить…',
    options: [
      {
        id: 'family-stories',
        label: 'За историями, которые цепляют',
        plusTwo: 'Смотрим всей семьёй',
        plusOne: 'Наука и технологии',
      },
      {
        id: 'bright-people',
        label: 'За людьми в неожиданных ситуациях',
        plusTwo: 'Шоу и реалити',
        plusOne: 'Сериалы и кино',
      },
      {
        id: 'experience',
        label: 'За теми, кто делится опытом',
        plusTwo: 'Подкасты и интервью',
        plusOne: 'Наука и технологии',
      },
      {
        id: 'change',
        label: 'За теми, кто меняет свою жизнь',
        plusTwo: 'Лайфстайл и саморазвитие',
        plusOne: 'Путешествия и еда',
      },
    ],
  },
  {
    id: 'place',
    prompt: 'Удобнее всего смотреть видео…',
    options: [
      {
        id: 'road',
        label: 'В дороге и в наушниках',
        plusTwo: 'Подкасты и интервью',
        plusOne: 'Музыка и концерты',
      },
      {
        id: 'big-screen',
        label: 'На большом экране и с попкорном',
        plusTwo: 'Сериалы и кино',
        plusOne: 'Спорт',
      },
      {
        id: 'kitchen',
        label: 'На кухне, пока готовится ужин',
        plusTwo: 'Путешествия и еда',
        plusOne: 'Шоу и реалити',
      },
      {
        id: 'weekend',
        label: 'В выходной, когда все дома',
        plusTwo: 'Смотрим всей семьёй',
        plusOne: 'Лайфстайл и саморазвитие',
      },
    ],
  },
  {
    id: 'surprise',
    prompt: 'Discovery хочет тебя удивить. Что звучит интригующе?',
    options: [
      {
        id: 'trending',
        label: 'Новости и слухи',
        plusTwo: 'Шоу и реалити',
        plusOne: 'Юмор и стендап',
      },
      {
        id: 'future',
        label: 'Мир будущего',
        plusTwo: 'Наука и технологии',
        plusOne: 'Сериалы и кино',
      },
      {
        id: 'concert',
        label: 'Сцена и музыка',
        plusTwo: 'Музыка и концерты',
        plusOne: 'Юмор и стендап',
      },
      {
        id: 'hobby',
        label: 'Необычное хобби',
        plusTwo: 'Лайфстайл и саморазвитие',
        plusOne: 'Путешествия и еда',
      },
    ],
  },
]
