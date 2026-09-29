import { useCallback, useEffect, useRef, useState } from 'react'
import { getSpeechText, selectRussianVoice } from './speech'

export function useSpeech(text: string) {
  const supported = typeof window !== 'undefined'
    && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  const [enabled, setEnabled] = useState(false)
  const [error, setError] = useState<'no-voice' | 'failed' | null>(null)
  const enabledRef = useRef(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const stop = useCallback(() => {
    utteranceRef.current = null
    if (supported) window.speechSynthesis.cancel()
  }, [supported])

  const speak = useCallback((copy: string) => {
    stop()
    if (!supported || !copy) return
    const voice = selectRussianVoice(window.speechSynthesis.getVoices())
    if (!voice) {
      enabledRef.current = false
      setEnabled(false)
      setError('no-voice')
      return
    }
    const utterance = new SpeechSynthesisUtterance(getSpeechText(copy))
    utterance.lang = 'ru-RU'
    utterance.rate = 1
    utterance.voice = voice
    utterance.onerror = (event) => {
      if (utteranceRef.current !== utterance || event.error === 'canceled' || event.error === 'interrupted') return
      enabledRef.current = false
      utteranceRef.current = null
      setEnabled(false)
      setError('failed')
    }
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [stop, supported])

  useEffect(() => {
    if (enabledRef.current) speak(text)
    return stop
  }, [text, speak, stop])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) stop()
    }
    const onVoicesChanged = () => {
      if (selectRussianVoice(window.speechSynthesis.getVoices())) setError(null)
    }
    if (supported) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      if (supported) window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
    }
  }, [stop, supported])

  const toggle = () => {
    if (!supported) return
    const next = !enabledRef.current
    enabledRef.current = next
    setEnabled(next)
    setError(null)
    // Start in the user gesture, required by mobile browsers for audio.
    if (next) speak(text)
    else stop()
  }

  return { enabled, supported, error, toggle, dismissError: () => setError(null) }
}
