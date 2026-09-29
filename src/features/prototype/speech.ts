export function getSpeechText(text: string): string {
  return text
    .replace(/\bVK\b/g, 'Ви Кей')
    .replace(/\bMAX\b/g, 'Макс')
    .replace(/\bDiscovery\b/g, 'Дискавери')
    .replace(/\bID\b/g, 'ай ди')
    .replace(/\s+/g, ' ')
    .trim()
}

export function selectRussianVoice(voices: SpeechSynthesisVoice[]) {
  const russian = voices.filter((voice) => /^ru(?:[-_]|$)/i.test(voice.lang))
  return russian.find((voice) => voice.localService) ?? russian[0]
}
