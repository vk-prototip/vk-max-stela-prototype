import type { VkQuestion, VkTheme } from '../types/prototype'

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
    prompt: 'Идеальный вечер после работы – это...',
    options: [
      {
        id: 'family-sofa',
        label: 'Диван, плед и вся семья рядом',
        plusTwo: 'Сериалы и кино',
        plusOne: 'Смотрим всей семьёй',
      },
      {
        id: 'friends',
        label: 'Собрать друзей, будет шумно',
        plusTwo: 'Юмор и стендап',
        plusOne: 'Спорт',
      },
      {
        id: 'trip',
        label: 'Спланировать следующую поездку',
        plusTwo: 'Путешествия и еда',
        plusOne: 'Подкасты и интервью',
      },
      {
        id: 'training',
        label: 'Тренировка или матч',
        plusTwo: 'Спорт',
        plusOne: 'Музыка и концерты',
      },
    ],
  },
  {
    id: 'good-video',
    prompt: 'Хорошее видео – это когда...',
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
        label: '«Ого, я не знал!»',
        plusTwo: 'Наука и технологии',
        plusOne: 'Подкасты и интервью',
      },
    ],
  },
  {
    id: 'watch',
    prompt: 'На экране вам интереснее всего следить...',
    options: [
      {
        id: 'family-stories',
        label: 'За историями, которые цепляют и взрослых, и детей',
        plusTwo: 'Смотрим всей семьёй',
        plusOne: 'Наука и технологии',
      },
      {
        id: 'bright-people',
        label: 'За яркими людьми в неожиданных ситуациях',
        plusTwo: 'Шоу и реалити',
        plusOne: 'Сериалы и кино',
      },
      {
        id: 'experience',
        label: 'За теми, кто делится опытом и мнением',
        plusTwo: 'Подкасты и интервью',
        plusOne: 'Наука и технологии',
      },
      {
        id: 'change',
        label: 'За теми, кто меняет себя и свою жизнь',
        plusTwo: 'Лайфстайл и саморазвитие',
        plusOne: 'Путешествия и еда',
      },
    ],
  },
  {
    id: 'place',
    prompt: 'Удобнее всего смотреть видео...',
    options: [
      {
        id: 'road',
        label: 'В дороге, в наушниках',
        plusTwo: 'Подкасты и интервью',
        plusOne: 'Музыка и концерты',
      },
      {
        id: 'big-screen',
        label: 'На большом экране, с попкорном',
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
    prompt: 'Discovery хочет вас удивить. Пусть покажет...',
    options: [
      {
        id: 'trending',
        label: 'Что сейчас все обсуждают',
        plusTwo: 'Шоу и реалити',
        plusOne: 'Юмор и стендап',
      },
      {
        id: 'future',
        label: 'Каким будет будущее',
        plusTwo: 'Наука и технологии',
        plusOne: 'Сериалы и кино',
      },
      {
        id: 'concert',
        label: 'Живой концерт из первого ряда',
        plusTwo: 'Музыка и концерты',
        plusOne: 'Юмор и стендап',
      },
      {
        id: 'hobby',
        label: 'Что-то захватывающее',
        plusTwo: 'Лайфстайл и саморазвитие',
        plusOne: 'Путешествия и еда',
      },
    ],
  },
]
