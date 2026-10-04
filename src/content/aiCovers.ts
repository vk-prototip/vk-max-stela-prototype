import type { AiCoverGenre, VkTheme } from '../types/prototype'

// client-verbatim: Google Doc "VK Видео_Стелла", final AI-cover scoring tables.
// MUSICLE appears in the scoring tables; MUSICAL is the canonical mapping ID.
export const aiCoverGenreAliases = { MUSICLE: 'MUSICAL' } as const

export const aiCoverGenres: AiCoverGenre[] = [
  'SCI FI',
  'HISTORY',
  'COMEDY',
  'MUSICAL',
  'BOEVIK',
  'DRAMA',
  'HORROR',
  'DETECTIVE',
  'FANTASY',
  'ADVENTURE',
]

export const aiCoverGenresByTheme: Record<VkTheme, AiCoverGenre[]> = {
  Наука: ['SCI FI'],
  'Культура и образование': ['HISTORY'],
  'Медиа и шоу': ['COMEDY'],
  Музыка: ['MUSICAL'],
  'Игры и авто': ['BOEVIK'],
  Спорт: ['DRAMA', 'HORROR'],
  'Новости и бизнес': ['DETECTIVE'],
  Кино: ['FANTASY', 'ADVENTURE'],
}

type SourceGenre = AiCoverGenre | keyof typeof aiCoverGenreAliases

interface AiCoverAnswerWeights {
  plusTwo: SourceGenre[]
  plusOne: SourceGenre[]
}

// IDs are the prototype's stable IDs, not labels from the source document.
export const aiCoverAnswerWeights: Record<string, Record<string, AiCoverAnswerWeights>> = {
  evening: {
    series: { plusTwo: ['FANTASY'], plusOne: ['HORROR'] },
    standup: { plusTwo: ['COMEDY'], plusOne: ['BOEVIK', 'MUSICLE'] },
    interview: { plusTwo: ['HISTORY'], plusOne: ['DRAMA'] },
    science: { plusTwo: ['SCI FI'], plusOne: ['ADVENTURE', 'DETECTIVE'] },
  },
  'ideal-content': {
    drive: { plusTwo: ['BOEVIK', 'ADVENTURE'], plusOne: [] },
    heroes: { plusTwo: ['DRAMA', 'HORROR'], plusOne: [] },
    learn: { plusTwo: ['DETECTIVE'], plusOne: ['HISTORY', 'SCI FI'] },
    rest: { plusTwo: ['MUSICLE'], plusOne: ['FANTASY', 'COMEDY'] },
  },
}

export function normalizeAiCoverGenre(genre: string): AiCoverGenre {
  const canonical = genre === 'MUSICLE' ? aiCoverGenreAliases.MUSICLE : genre
  if (!aiCoverGenres.includes(canonical as AiCoverGenre)) {
    throw new Error(`Unknown AI cover genre: ${genre}`)
  }
  return canonical as AiCoverGenre
}
