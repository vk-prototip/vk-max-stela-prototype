import { describe, expect, it } from 'vitest'
import { getSpeechText, selectRussianVoice } from './speech'

describe('basic Russian narration', () => {
  it('normalizes line breaks and product pronunciation without changing screen copy', () => {
    expect(getSpeechText('VK Видео\nMAX Discovery ID')).toBe('Ви Кей Видео Макс Дискавери ай ди')
  })

  it('prefers a local Russian voice, never an unrelated language', () => {
    const voice = (lang: string, localService: boolean) => ({ lang, localService }) as SpeechSynthesisVoice
    const english = voice('en-US', true)
    const remote = voice('ru-RU', false)
    const local = voice('ru_RU', true)
    expect(selectRussianVoice([english, remote, local])).toBe(local)
    expect(selectRussianVoice([english, remote])).toBe(remote)
    expect(selectRussianVoice([english])).toBeUndefined()
  })
})
