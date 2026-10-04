import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isValidElement, type ReactElement } from 'react'
import { MaxAnswerReveal, MaxFlowQuestion, MaxFlowResult } from '../../components/MaxFlowScreen'
import { OnboardingScreen } from '../../components/OnboardingScreen'
import { VkFlowQuestion, VkDiscoveryActivation } from '../../components/VkFlowScreen'
import { Prototype } from './Prototype'
import type { StelaEvent } from './events'

// Audit harness: execute the real Prototype callbacks/effects with controlled hooks.
// It checks state transitions and transport calls, not DOM events or browser layout.
const hooks = vi.hoisted(() => ({
  cursor: 0,
  values: [] as unknown[],
  effects: [] as Array<{ dependencies?: readonly unknown[]; cleanup?: () => void }>,
  pending: [] as Array<() => void>,
}))

vi.mock('react', async importOriginal => ({
  ...await importOriginal<typeof import('react')>(),
  useState: (initial: unknown) => {
    const slot = hooks.cursor++
    if (!(slot in hooks.values)) hooks.values[slot] = typeof initial === 'function' ? initial() : initial
    return [hooks.values[slot], (value: unknown) => {
      hooks.values[slot] = typeof value === 'function' ? value(hooks.values[slot]) : value
    }]
  },
  useRef: (initial: unknown) => {
    const slot = hooks.cursor++
    if (!(slot in hooks.values)) hooks.values[slot] = { current: initial }
    return hooks.values[slot]
  },
  useLayoutEffect: () => { hooks.cursor++ },
  useEffect: (effect: () => (() => void) | void, dependencies?: readonly unknown[]) => {
    const slot = hooks.cursor++
    const previous = hooks.effects[slot]
    if (previous && dependencies && previous.dependencies && dependencies.every((value, index) => Object.is(value, previous.dependencies![index]))) return
    hooks.pending.push(() => {
      previous?.cleanup?.()
      hooks.effects[slot] = { dependencies, cleanup: effect() || undefined }
    })
  },
}))

type Node = ReactElement<Record<string, unknown>>
let tree: ReactElement
let local: StelaEvent[]
let broadcast: StelaEvent[]

function render() {
  hooks.cursor = 0
  tree = Prototype()
  for (const effect of hooks.pending.splice(0)) effect()
}

function nodes(value: unknown): Node[] {
  if (Array.isArray(value)) return value.flatMap(nodes)
  if (!isValidElement<Record<string, unknown>>(value)) return []
  return [value, ...nodes(value.props.children)]
}

function node(type: unknown) {
  const found = nodes(tree).find(element => element.type === type)
  if (!found) throw new Error(`Missing component ${String(type)}`)
  return found
}

function call(element: Node, property: string, ...args: unknown[]) {
  const action = element.props[property]
  if (typeof action !== 'function') throw new Error(`Missing callback ${property}`)
  action(...args)
  render()
}

function advance(milliseconds: number) {
  vi.advanceTimersByTime(milliseconds)
  render()
}

function start(product: 'MAX' | 'VK Видео') {
  call(nodes(tree).find(element => element.props['aria-label'] === product)!, 'onClick')
  expect(local).toHaveLength(1)
  advance(1200)
  call(node(OnboardingScreen), 'onStart')
}

function chooseVk(id: string) {
  call(node(VkFlowQuestion), 'onSelect', id)
  advance(2300)
}

function verifyDelivery() {
  expect(broadcast).toEqual(local)
  expect(new Set(local.map(event => `${event.sessionId}/${event.sequence}`)).size).toBe(local.length)
  expect(local.map(event => event.sequence)).toEqual(local.map((_, index) => index + 1))
}

beforeEach(() => {
  vi.useFakeTimers()
  hooks.cursor = 0
  hooks.values = []
  hooks.effects = []
  hooks.pending = []
  local = []
  broadcast = []
  vi.stubGlobal('window', {
    setTimeout, clearTimeout,
    dispatchEvent: (event: CustomEvent<StelaEvent>) => { local.push(structuredClone(event.detail)); return true },
  })
  vi.stubGlobal('BroadcastChannel', class {
    postMessage(event: StelaEvent) { broadcast.push(structuredClone(event)) }
  })
  render()
})

afterEach(() => {
  for (const effect of hooks.effects) effect?.cleanup?.()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

// Fresh Google Sheets export 2026-10-04: MAX C4:J9, read independently.
const maxCases = [
  ['personal', 'access', 'digital-id', ['Цифровой ID', 'идентификация', 'удобство', 'документы', 'доступ', 'льготы', 'данные', 'надежность']],
  ['personal', 'connection', 'communication', ['чаты', 'видеозвонки', 'аудиозвонки', 'голосовые', 'стикеры', 'видеосообщения', 'истории', 'публикации']],
  ['personal', 'visibility', 'blogger', ['узнаваемость', 'аудитория', 'канал', 'комментарии', 'возможности', 'рост', 'инструменты', 'статистика']],
  ['business', 'access', 'business-promotion', ['идентификация', 'удобство', 'верификация', 'документы', 'доступ', 'профиль', 'данные', 'надежность']],
  ['business', 'connection', 'business-promotion', ['чат-бот', 'канал', 'быстрые ответы', 'сбор заказов', 'аудитория', 'поддержка', 'возможности', 'обратная связь']],
  ['business', 'visibility', 'business-promotion', ['узнаваемость', 'аудитория', 'канал', 'мини-приложение', 'новости', 'рост', 'продвижение', 'акции']],
] as const

describe('independent audit of actual Prototype event call sites', () => {
  it.each(maxCases)('MAX %s/%s publishes contextual tags once and assigns %s', (audience, goal, mission, tags) => {
    start('MAX')
    call(node(MaxFlowQuestion), 'onSelect', audience)
    expect(node(MaxAnswerReveal).props.answerId).toBe(audience)
    expect(local).toHaveLength(2)
    advance(2299)
    expect(node(MaxAnswerReveal).props.answerId).toBe(audience)
    advance(1)
    call(node(MaxFlowQuestion), 'onSelect', goal)
    expect(local[2]).toMatchObject({ type: 'answer', questionId: 'goal', answerId: goal, metadata: tags })
    expect(node(MaxAnswerReveal).props.metadata).toEqual(tags)
    advance(2300)
    expect(node(MaxFlowResult).props.mission).toBe(mission)
    advance(60000)
    expect(node(MaxFlowResult).props.mission).toBe(mission)
    expect(local).toHaveLength(3)
    verifyDelivery()
  })

  it('MAX clears audience on return, uses replacement context and resets session identity', () => {
    start('MAX')
    call(node(MaxFlowQuestion), 'onSelect', 'personal')
    advance(2300)
    call(node(MaxFlowQuestion), 'onBack')
    expect(local[2]).toMatchObject({ type: 'answer-cleared', questionId: 'audience' })
    call(node(MaxFlowQuestion), 'onSelect', 'business')
    advance(2300)
    call(node(MaxFlowQuestion), 'onSelect', 'connection')
    expect(local[4]).toMatchObject({ metadata: ['чат-бот', 'канал', 'быстрые ответы', 'сбор заказов', 'аудитория', 'поддержка', 'возможности', 'обратная связь'] })
    advance(2300)
    const previousId = local[0].sessionId
    call(node(MaxFlowResult), 'onReset')
    call(nodes(tree).find(element => element.props['aria-label'] === 'MAX')!, 'onClick')
    expect(local[5]).toMatchObject({ type: 'session-start', sequence: 1 })
    expect(local[5].sessionId).not.toBe(previousId)
    expect(broadcast).toEqual(local)
  })

  it.each(['familiar', 'new', 'popular', 'accept', 'skip'])('VK %s publishes one recommendation across all timed transitions', finalChoice => {
    start('VK Видео')
    chooseVk('series')
    chooseVk('learn')
    expect(local[2]).toMatchObject({ metadata: ['культура', 'обучение', 'культура', 'факты'] })
    const photo = finalChoice === 'accept' || finalChoice === 'skip'
    chooseVk(photo ? 'hero' : finalChoice)
    if (photo) {
      expect(local).toHaveLength(4)
      call(nodes(tree).find(element => element.props['aria-label'] === (finalChoice === 'accept' ? 'Да, давайте' : 'Пропустить'))!, 'onClick')
      expect(local[4]).toMatchObject({ type: 'answer', questionId: 'photo', metadata: finalChoice === 'accept' ? ['ракурс', 'освещение', 'композиция', 'обработка'] : [] })
      advance(finalChoice === 'accept' ? 2300 : 650)
      if (finalChoice === 'accept') { advance(1800); advance(2400) }
    }
    node(VkDiscoveryActivation)
    const recommendation = local.find(event => event.type === 'vk-recommendation')!
    expect(recommendation).toMatchObject({ photoMode: photo ? finalChoice === 'accept' ? 'included' : 'skipped' : 'not-requested' })
    const snapshot = structuredClone(recommendation)
    advance(3200)
    advance(60000)
    expect(nodes(tree).some(element => element.props.className === 'screen screen--vk-final')).toBe(true)
    expect(local.filter(event => event.type === 'vk-recommendation')).toEqual([snapshot])
    expect(local).toHaveLength(photo ? 6 : 5)
    verifyDelivery()
  })

  it('VK clears discarded choices and recalculates only from the new two answers', () => {
    start('VK Видео')
    chooseVk('series')
    chooseVk('drive')
    call(node(VkFlowQuestion), 'onBack')
    call(node(VkFlowQuestion), 'onBack')
    expect(local.slice(3)).toMatchObject([{ type: 'answer-cleared', questionId: 'ideal-content' }, { type: 'answer-cleared', questionId: 'evening' }])
    chooseVk('science')
    chooseVk('heroes')
    chooseVk('familiar')
    const recommendation = local.find(event => event.type === 'vk-recommendation')!
    expect(recommendation.type).toBe('vk-recommendation')
    if (recommendation.type !== 'vk-recommendation') return
    // Fresh VK Видео_Темы!C5: Спорт 3, Наука 2, Культура 1.
    expect(recommendation.scores.filter(score => score.score > 0)).toEqual([
      { theme: 'Наука', score: 2 }, { theme: 'Культура и образование', score: 1 }, { theme: 'Спорт', score: 3 },
    ])
    expect(recommendation.selectedThemes).toEqual(['Спорт', 'Наука', 'Культура и образование'])
    expect(Object.fromEntries(recommendation.coverAllocation.scores.filter(score => score.score > 0).map(({ genre, score }) => [genre, score]))).toEqual({
      'SCI FI': 2, DETECTIVE: 1, DRAMA: 2, HORROR: 2, ADVENTURE: 1,
    })
    verifyDelivery()
  })
})
